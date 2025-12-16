import { prisma } from '../../config/database';
import { ModeloIA, TipoOperacionIA } from '@prisma/client';

export class AIUsageService {
  /**
   * Log AI usage (for N8N tracking)
   */
  async logUsage(data: {
    entidadMedicaId: string;
    conversacionId?: string;
    sessionId: string;
    modelo: ModeloIA;
    tipoOperacion: TipoOperacionIA;
    tokensPrompt: number;
    tokensCompletion: number;
    duracionMs?: number;
  }) {
    const tokensTotal = data.tokensPrompt + data.tokensCompletion;

    // Pricing (approximate for GPT-4o-mini)
    const costPerToken = 0.00000015; // $0.15 per 1M tokens (approx)
    const costoEstimado = tokensTotal * costPerToken;

    // Create log entry
    const log = await prisma.aIUsageLog.create({
      data: {
        ...data,
        tokensTotal,
        costoEstimado,
      },
    });

    // Aggregate daily usage
    await this.aggregateDailyUsage(
      data.entidadMedicaId,
      new Date(),
      data.modelo,
      data.tipoOperacion,
      tokensTotal,
      costoEstimado
    );

    return log;
  }

  /**
   * Aggregate daily usage
   */
  private async aggregateDailyUsage(
    entidadMedicaId: string,
    fecha: Date,
    modelo: ModeloIA,
    tipoOperacion: TipoOperacionIA,
    tokensTotal: number,
    costoTotal: number
  ) {
    const fechaDate = new Date(fecha.toISOString().split('T')[0]);

    await prisma.aIUsageDaily.upsert({
      where: {
        entidadMedicaId_fecha_modelo_tipoOperacion: {
          entidadMedicaId,
          fecha: fechaDate,
          modelo,
          tipoOperacion,
        },
      },
      create: {
        entidadMedicaId,
        fecha: fechaDate,
        modelo,
        tipoOperacion,
        totalLlamadas: 1,
        tokensTotal,
        costoTotal,
      },
      update: {
        totalLlamadas: { increment: 1 },
        tokensTotal: { increment: tokensTotal },
        costoTotal: { increment: costoTotal },
      },
    });
  }

  /**
   * Get usage summary for entity
   */
  async getUsageSummary(entidadMedicaId: string, period: 'daily' | 'weekly' | 'monthly') {
    if (period === 'daily') {
      return await prisma.aIUsageDaily.findMany({
        where: { entidadMedicaId },
        orderBy: { fecha: 'desc' },
        take: 30,
      });
    } else if (period === 'weekly') {
      return await prisma.aIUsageWeekly.findMany({
        where: { entidadMedicaId },
        orderBy: [{ anio: 'desc' }, { semana: 'desc' }],
        take: 12,
      });
    } else {
      return await prisma.aIUsageMonthly.findMany({
        where: { entidadMedicaId },
        orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
        take: 12,
      });
    }
  }

  /**
   * Check if entity is approaching limits
   */
  async checkLimits(entidadMedicaId: string) {
    const limits = await prisma.consumptionLimit.findUnique({
      where: { entidadMedicaId },
    });

    if (!limits) {
      return { withinLimits: true, alerts: [] };
    }

    const today = new Date();
    const dailyUsage = await prisma.aIUsageDaily.findMany({
      where: {
        entidadMedicaId,
        fecha: new Date(today.toISOString().split('T')[0]),
      },
    });

    const totalDaily = dailyUsage.reduce((sum, u) => sum + u.tokensTotal, 0);
    const dailyPercent = (totalDaily / limits.limiteTokensDiario) * 100;

    const alerts: Array<{ period: string; usage: number; limit: number; percent: number }> = [];
    if (dailyPercent >= limits.alertaUmbralPorcent) {
      alerts.push({
        period: 'daily',
        usage: totalDaily,
        limit: limits.limiteTokensDiario,
        percent: dailyPercent,
      });
    }

    return {
      withinLimits: dailyPercent < 100,
      alerts,
      currentUsage: { daily: totalDaily },
      limits: {
        daily: limits.limiteTokensDiario,
        weekly: limits.limiteTokensSemanal,
        monthly: limits.limiteTokensMensual,
      },
    };
  }

  /**
   * Check if entity can use AI (for N8N)
   */
  async canUseAI(entidadMedicaId: string, estimatedTokens: number = 0) {
    const limits = await this.checkLimits(entidadMedicaId);

    if (!limits.withinLimits) {
      return {
        canUse: false,
        reason: 'Daily limit exceeded',
        currentUsage: limits.currentUsage,
        limits: limits.limits,
      };
    }

    // Check if adding estimated tokens would exceed limit
    if (limits.limits && estimatedTokens > 0) {
      const projectedUsage = (limits.currentUsage?.daily || 0) + estimatedTokens;
      if (projectedUsage > limits.limits.daily) {
        return {
          canUse: false,
          reason: 'Operation would exceed daily limit',
          currentUsage: limits.currentUsage,
          limits: limits.limits,
        };
      }
    }

    return {
      canUse: true,
      currentUsage: limits.currentUsage,
      limits: limits.limits,
    };
  }

  /**
   * Update consumption limits for entity
   */
  async updateLimits(entidadMedicaId: string, data: {
    limiteTokensDiario?: number;
    limiteTokensSemanal?: number;
    limiteTokensMensual?: number;
    alertaUmbralPorcent?: number;
  }) {
    return await prisma.consumptionLimit.upsert({
      where: { entidadMedicaId },
      create: {
        entidadMedicaId,
        limiteTokensDiario: data.limiteTokensDiario || 10000,
        limiteTokensSemanal: data.limiteTokensSemanal || 50000,
        limiteTokensMensual: data.limiteTokensMensual || 150000,
        alertaUmbralPorcent: data.alertaUmbralPorcent || 80,
      },
      update: data,
    });
  }

  /**
   * Get detailed stats for entity
   */
  async getDetailedStats(entidadMedicaId: string, options: {
    startDate?: Date;
    endDate?: Date;
  } = {}) {
    const endDate = options.endDate || new Date();
    const startDate = options.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [dailyStats, limits, totalLogs] = await Promise.all([
      prisma.aIUsageDaily.findMany({
        where: {
          entidadMedicaId,
          fecha: { gte: startDate, lte: endDate },
        },
        orderBy: { fecha: 'asc' },
      }),
      prisma.consumptionLimit.findUnique({
        where: { entidadMedicaId },
      }),
      prisma.aIUsageLog.count({
        where: {
          entidadMedicaId,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    const totalTokens = dailyStats.reduce((sum, d) => sum + d.tokensTotal, 0);
    const totalCost = dailyStats.reduce((sum, d) => sum + d.costoTotal, 0);
    const totalCalls = dailyStats.reduce((sum, d) => sum + d.totalLlamadas, 0);

    return {
      period: { startDate, endDate },
      summary: {
        totalTokens,
        totalCost,
        totalCalls,
        averageTokensPerDay: dailyStats.length > 0 ? totalTokens / dailyStats.length : 0,
      },
      dailyBreakdown: dailyStats,
      limits,
      totalLogEntries: totalLogs,
    };
  }
}

export const aiUsageService = new AIUsageService();
