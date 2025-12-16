
import { EntidadMedica } from '../../types';
import { cn } from '../../utils/classNames';
import { formatDate } from '../../utils/dateUtils';

interface EntityCardProps {
  entity: EntidadMedica;
  onEdit?: (entity: EntidadMedica) => void;
  onToggleStatus?: (entity: EntidadMedica) => void;
}

const TIPO_ENTITY_ICONS: { [key: string]: string } = {
  HOSPITAL: 'local_hospital',
  CLINICA: 'medical_services',
  IPS: 'health_and_safety',
  CONSULTORIO: 'stethoscope',
  LABORATORIO: 'biotech'
};

const TIPO_ENTITY_COLORS: { [key: string]: string } = {
  HOSPITAL: 'from-red-500 to-red-600',
  CLINICA: 'from-blue-500 to-blue-600',
  IPS: 'from-green-500 to-green-600',
  CONSULTORIO: 'from-purple-500 to-purple-600',
  LABORATORIO: 'from-orange-500 to-orange-600'
};

export const EntityCard = ({ entity, onEdit, onToggleStatus }: EntityCardProps) => {
  const icon = TIPO_ENTITY_ICONS[entity.tipoEntidad] || 'apartment';
  const gradient = TIPO_ENTITY_COLORS[entity.tipoEntidad] || 'from-gray-500 to-gray-600';

  return (
    <div
      className={cn(
        'rounded-xl border-2 transition-all duration-200 hover:shadow-xl',
        entity.activa
          ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50'
          : 'border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 opacity-75'
      )}
    >
      {/* Header con gradiente dinámico según tipo */}
      <div className={`p-6 rounded-t-xl border-b bg-gradient-to-r ${gradient}`}>
        <div className="flex items-center gap-4">
          {/* Icono circular */}
          <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-4xl">{icon}</span>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">
              {entity.nombre}
            </h3>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-white">
                {entity.tipoEntidad}
              </span>
              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold',
                entity.activa
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              )}>
                {entity.activa ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cuerpo de la card */}
      <div className="p-6 space-y-4">
        {/* Información fiscal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-lg">badge</span>
            <div>
              <p className="text-xs text-gray-600">NIT/RUT</p>
              <p className="text-sm font-semibold text-gray-900">{entity.nitRut}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-600 text-lg">calendar_today</span>
            <div>
              <p className="text-xs text-gray-600">Registro</p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(entity.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-green-600 text-lg">phone</span>
            <div>
              <p className="text-xs text-gray-600">Teléfono Principal</p>
              <p className="text-sm font-semibold text-gray-900">{entity.telefonoPrincipal}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-purple-600 text-lg">mail</span>
            <div>
              <p className="text-xs text-gray-600">Email</p>
              <p className="text-sm font-semibold text-gray-900">{entity.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-red-600 text-lg">location_on</span>
            <div>
              <p className="text-xs text-gray-600">Dirección</p>
              <p className="text-sm font-semibold text-gray-900">{entity.direccion}</p>
              <p className="text-xs text-gray-600">{entity.ciudad}, {entity.departamentoEstado}</p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          {onEdit && (
            <button
              onClick={() => onEdit(entity)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r ${gradient} hover:opacity-90 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium`}
            >
              <span className="material-symbols-outlined text-lg">edit</span>
              Editar
            </button>
          )}
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(entity)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium',
                entity.activa
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
              )}
            >
              <span className="material-symbols-outlined text-lg">
                {entity.activa ? 'toggle_off' : 'toggle_on'}
              </span>
              {entity.activa ? 'Desactivar' : 'Activar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};