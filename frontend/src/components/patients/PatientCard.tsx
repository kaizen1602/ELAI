
import { Paciente } from '../../types';
import { cn } from '../../utils/classNames';
import { calculateAge, formatDate, getAgeCategory } from '../../utils/dateUtils';

interface PatientCardProps {
  patient: Paciente;
  onEdit?: (patient: Paciente) => void;
  onToggleStatus?: (patient: Paciente) => void;
}

export const PatientCard = ({ patient, onEdit, onToggleStatus }: PatientCardProps) => {
  const age = calculateAge(patient.fechaNacimiento);
  const ageCategory = getAgeCategory(age);

  // Colores por estado
  const stateColors = patient.activo
    ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50'
    : 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50 opacity-75';

  // Colores por género
  const genderColors = {
    M: 'text-blue-600 bg-blue-100',
    F: 'text-pink-600 bg-pink-100',
    MASCULINO: 'text-blue-600 bg-blue-100',
    FEMENINO: 'text-pink-600 bg-pink-100',
    default: 'text-purple-600 bg-purple-100'
  };

  const genderColor = genderColors[patient.genero as keyof typeof genderColors] || genderColors.default;

  // Colores por edad
  const ageColors = {
    menor: 'text-green-600 bg-green-100',
    adulto: 'text-blue-600 bg-blue-100',
    mayor: 'text-orange-600 bg-orange-100'
  };

  const ageColor = ageColors[ageCategory];

  // Iniciales para avatar
  const initials = `${patient.nombres.charAt(0)}${patient.apellidos.charAt(0)}`.toUpperCase();

  return (
    <div
      className={cn(
        'rounded-xl border-2 transition-all duration-200 hover:shadow-lg',
        stateColors
      )}
    >
      {/* Header con gradiente */}
      <div className={cn(
        'p-4 rounded-t-xl border-b',
        patient.activo
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400'
          : 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-400'
      )}>
        <div className="flex items-center gap-4">
          {/* Avatar circular */}
          <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-xl font-bold text-gray-700 shadow-md">
            {initials}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">
              {patient.nombres} {patient.apellidos}
            </h3>
            <p className="text-sm text-white/90">
              {patient.tipoDocumento} {patient.numeroDocumento}
            </p>
          </div>

          {/* Badge de estado */}
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-semibold',
            patient.activo
              ? 'bg-white text-green-600'
              : 'bg-white text-red-600'
          )}>
            {patient.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Cuerpo de la card */}
      <div className="p-4 space-y-3">
        {/* Badges de género y edad */}
        <div className="flex gap-2 flex-wrap">
          <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', genderColor)}>
            {patient.genero === 'M' || patient.genero === 'MASCULINO' ? 'Masculino' : 
             patient.genero === 'F' || patient.genero === 'FEMENINO' ? 'Femenino' : patient.genero}
          </span>
          <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', ageColor)}>
            {age} años
          </span>
        </div>

        {/* Información de contacto */}
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-600 text-lg">phone</span>
            <div>
              <p className="text-gray-600 text-xs">Teléfono</p>
              <p className="text-gray-900 font-medium">{patient.telefono}</p>
            </div>
          </div>

          {patient.email && (
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-purple-600 text-lg">mail</span>
              <div>
                <p className="text-gray-600 text-xs">Email</p>
                <p className="text-gray-900 font-medium">{patient.email}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-green-600 text-lg">location_on</span>
            <div>
              <p className="text-gray-600 text-xs">Dirección</p>
              <p className="text-gray-900 font-medium">{patient.direccion}</p>
              <p className="text-gray-600 text-xs">{patient.ciudad}, {patient.departamento}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-lg">cake</span>
            <div>
              <p className="text-gray-600 text-xs">Fecha de Nacimiento</p>
              <p className="text-gray-900 font-medium">{formatDate(patient.fechaNacimiento)}</p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          {onEdit && (
            <button
              onClick={() => onEdit(patient)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
              Editar
            </button>
          )}
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(patient)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium',
                patient.activo
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
              )}
            >
              <span className="material-symbols-outlined text-lg">
                {patient.activo ? 'toggle_off' : 'toggle_on'}
              </span>
              {patient.activo ? 'Desactivar' : 'Activar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};