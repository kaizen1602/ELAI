import { Request, Response } from 'express';
import { aiUsageService } from './ai-usage.service';
import {
  logUsageSchema,
  queryUsageSummarySchema,
  checkLimitsSchema,
  updateLimitsSchema,
  canUseAISchema,
} from './ai-usage.dto';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthenticatedRequest } from '../../types';

export class AIUsageController {
  /**
   * @route POST /api/v1/ai-usage/log
   * @desc Log AI usage (N8N - secret validated by middleware)
   * @access N8N Secret
   */
  logUsage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validated = logUsageSchema.parse(req.body);
    const log = await aiUsageService.logUsage(validated);

    res.status(200).json({
      success: true,
      data: log,
      message: 'Usage logged successfully',
    });
  });

  /**
   * @route POST /api/v1/ai-usage/can-use
   * @desc Check if entity can use AI (N8N - secret validated by middleware)
   * @access N8N Secret
   */
  canUseAI = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validated = canUseAISchema.parse(req.body);
    const result = await aiUsageService.canUseAI(
      validated.entidadMedicaId,
      validated.estimatedTokens
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * @route GET /api/v1/ai-usage/summary
   * @desc Get AI usage summary
   * @access Private
   */
  getUsageSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const validated = queryUsageSummarySchema.parse(req.query);
    const summary = await aiUsageService.getUsageSummary(validated.entidadMedicaId, validated.period);

    res.status(200).json({
      success: true,
      data: summary,
    });
  });

  /**
   * @route GET /api/v1/ai-usage/limits
   * @desc Check consumption limits
   * @access Private
   */
  checkLimits = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const validated = checkLimitsSchema.parse(req.query);
    const result = await aiUsageService.checkLimits(validated.entidadMedicaId);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * @route PUT /api/v1/ai-usage/limits
   * @desc Update consumption limits
   * @access Private (Admin)
   */
  updateLimits = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const validated = updateLimitsSchema.parse(req.body);
    const { entidadMedicaId, ...data } = validated;
    const limits = await aiUsageService.updateLimits(entidadMedicaId, data);

    res.status(200).json({
      success: true,
      data: limits,
      message: 'Limits updated successfully',
    });
  });

  /**
   * @route GET /api/v1/ai-usage/stats/:entidadMedicaId
   * @desc Get detailed usage statistics
   * @access Private
   */
  getDetailedStats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const stats = await aiUsageService.getDetailedStats(req.params.entidadMedicaId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });
}

export const aiUsageController = new AIUsageController();
