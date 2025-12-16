import { useMemo } from 'react';
import { Paciente } from '../../types';
import { calculateAge, getAgeCategory } from '../../utils/dateUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PatientStatsProps {
  pacientes: Paciente[];
}

interface Stats {
  total_pacientes: number;
  pacientes_activos: number;
  pacientes_inactivos: number;
  por_genero: { [key: string]: number };
  por_edad: {
    menores: number;
    adultos: number;
    mayores: number;
  };
}

const COLORS = {
  gender: ['#3b82f6', '#ec4899', '#8b5cf6', '#64748b'],
  age: ['#10b981', '#3b82f6', '#f59e0b'],
  status: ['#10b981', '#ef4444']
};

export const PatientStats = ({ pacientes }: PatientStatsProps) => {
  const stats: Stats = useMemo(() => {
    const result: Stats = {
      total_pacientes: pacientes.length,
      pacientes_activos: 0,
      pacientes_inactivos: 0,
      por_genero: {},
      por_edad: {
        menores: 0,
        adultos: 0,
        mayores: 0
      }
    };

    pacientes.forEach(p => {
      // Estado
      if (p.activo) result.pacientes_activos++;
      else result.pacientes_inactivos++;

      // Género
      const genero = p.genero;
      result.por_genero[genero] = (result.por_genero[genero] || 0) + 1;

      // Edad
      const age = calculateAge(p.fechaNacimiento);
      const category = getAgeCategory(age);
      if (category === 'menor') result.por_edad.menores++;
      else if (category === 'mayor') result.por_edad.mayores++;
      else result.por_edad.adultos++;
    });

    return result;
  }, [pacientes]);

  // Data para gráfico de género
  const genderData = Object.entries(stats.por_genero).map(([key, value]) => ({
    name: key === 'M' || key === 'MASCULINO' ? 'Masculino' : 
          key === 'F' || key === 'FEMENINO' ? 'Femenino' : key,
    value
  }));

  // Data para gráfico de edad
  const ageData = [
    { name: 'Menores (< 18)', value: stats.por_edad.menores },
    { name: 'Adultos (18-64)', value: stats.por_edad.adultos },
    { name: 'Mayores (≥ 65)', value: stats.por_edad.mayores }
  ];

  // Data para gráfico de estado
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <p className="text-sm font-medium text-blue-600">Total Pacientes</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total_pacientes}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <p className="text-sm font-medium text-green-600">Activos</p>
          <p className="text-3xl font-bold text-green-900 mt-1">{stats.pacientes_activos}</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-100">
          <p className="text-sm font-medium text-red-600">Inactivos</p>
          <p className="text-3xl font-bold text-red-900 mt-1">{stats.pacientes_inactivos}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
          <p className="text-sm font-medium text-purple-600">% Activos</p>
          <p className="text-3xl font-bold text-purple-900 mt-1">
            {stats.total_pacientes > 0 
              ? Math.round((stats.pacientes_activos / stats.total_pacientes) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Género */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Género</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={genderData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por Edad */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Edad</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={ageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ageData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.age[index % COLORS.age.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla resumen */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Detallado</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.por_genero).map(([genero, count]) => (
            <div key={genero} className="text-center p-3 rounded-lg bg-gray-50">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600">
                {genero === 'M' || genero === 'MASCULINO' ? 'Masculino' :
                 genero === 'F' || genero === 'FEMENINO' ? 'Femenino' : genero}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};