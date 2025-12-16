import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService, DashboardStats } from '../services/dashboardService';
import { Users, Building2, Calendar, Activity, Stethoscope, Clock, ArrowUpRight } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardService.getStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Define stats visibility by role
  const roleStatsVisibility: Record<string, string[]> = {
    SUPERADMIN: ['Total Pacientes', 'Entidades Médicas', 'Total Citas', 'Agendas Activas', 'Médicos Activos', 'Citas Hoy'],
    ADMIN_ENTIDAD: ['Total Pacientes', 'Total Citas', 'Agendas Activas', 'Médicos Activos', 'Citas Hoy'],
    MEDICO: ['Citas Hoy', 'Total Citas'], // Medico sees filtered view
    PACIENTE: [], // Paciente dashboard not yet implemented
  };

  const statCards = [
    {
      label: 'Total Pacientes',
      value: stats?.totalPacientes ?? 0,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-500/25',
      description: 'Pacientes registrados',
    },
    {
      label: 'Entidades Médicas',
      value: stats?.totalEntidades ?? 0,
      icon: Building2,
      gradient: 'from-emerald-500 to-green-600',
      shadowColor: 'shadow-green-500/25',
      description: 'Centros de salud activos',
    },
    {
      label: 'Total Citas',
      value: stats?.totalCitas ?? 0,
      icon: Calendar,
      gradient: 'from-purple-500 to-violet-600',
      shadowColor: 'shadow-purple-500/25',
      description: 'Citas programadas',
    },
    {
      label: 'Agendas Activas',
      value: stats?.totalAgendas ?? 0,
      icon: Activity,
      gradient: 'from-orange-500 to-amber-600',
      shadowColor: 'shadow-orange-500/25',
      description: 'Calendarios médicos',
    },
    {
      label: 'Médicos Activos',
      value: stats?.totalMedicos ?? 0,
      icon: Stethoscope,
      gradient: 'from-red-500 to-rose-600',
      shadowColor: 'shadow-red-500/25',
      description: 'Profesionales de salud',
    },
    {
      label: 'Citas Hoy',
      value: stats?.citasHoy ?? 0,
      icon: Clock,
      gradient: 'from-indigo-500 to-blue-600',
      shadowColor: 'shadow-indigo-500/25',
      description: 'Programadas para hoy',
    },
  ].filter(card => user?.rol && roleStatsVisibility[user.rol]?.includes(card.label));

  const citasStatusCards = [
    {
      label: 'Pendientes',
      value: stats?.citasPendientes ?? 0,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    {
      label: 'Confirmadas',
      value: stats?.citasConfirmadas ?? 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Completadas',
      value: stats?.citasCompletadas ?? 0,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      label: 'Canceladas',
      value: stats?.citasCanceladas ?? 0,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      label: 'Slots Disponibles Hoy',
      value: stats?.slotsDisponiblesHoy ?? 0,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Bienvenido de vuelta, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{user?.username}</span>
            </h1>
            <p className="text-gray-500 mt-2">
              Aquí tienes un resumen de la actividad de tu plataforma médica.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">{user?.rol}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={stat.label}
              className={`bg-white rounded-2xl shadow-lg ${stat.shadowColor} border border-gray-100 p-6
                transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in cursor-pointer group`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-gray-500 text-sm mt-1 font-medium">{stat.label}</p>
                <p className="text-gray-400 text-xs mt-1">{stat.description}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">Ver detalles</span>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Citas Status Summary */}
      {!loading && stats && user?.rol !== 'MEDICO' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Estado de Citas</h2>
            <p className="text-purple-100 text-sm mt-1">Resumen general del sistema</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {citasStatusCards.map((item, index) => (
                <div
                  key={item.label}
                  className={`p-4 rounded-xl border-2 ${item.borderColor} ${item.bgColor} hover:shadow-md transition-all duration-300`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Info Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in" style={{ animationDelay: '0.7s' }}>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Información del Usuario</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Usuario</p>
              <p className="font-semibold text-gray-900">{user?.username}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Email</p>
              <p className="font-semibold text-gray-900">{user?.email}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Rol</p>
              <p className="font-semibold text-gray-900">{user?.rol}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Teléfono</p>
              <p className="font-semibold text-gray-900">{user?.telefono || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
