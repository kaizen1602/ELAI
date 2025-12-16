
import React from 'react';
import { Edit, Activity, Stethoscope, Calendar, Mail, Phone, Hash } from 'lucide-react';
import { Medico } from '../../types';
import { cn } from '../../utils/classNames';

interface MedicoCardProps {
    medico: Medico;
    onEdit: (medico: Medico) => void;
    onDelete: (medico: Medico) => void;
}

export const MedicoCard: React.FC<MedicoCardProps> = ({ medico, onEdit, onDelete }) => {
    // Estado colors
    const stateColors = medico.activo
        ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50'
        : 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50 opacity-75';

    const initials = medico.user?.username.substring(0, 2).toUpperCase() || 'DR';

    return (
        <div className={cn(
            'rounded-xl border-2 transition-all duration-200 hover:shadow-lg flex flex-col',
            stateColors
        )}>
            {/* Header con gradiente */}
            <div className={cn(
                'p-4 rounded-t-xl border-b',
                medico.activo
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500'
                    : 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-400'
            )}>
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-xl font-bold text-gray-700 shadow-md ring-2 ring-white/50">
                        {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white truncate">
                            {medico.user?.username || 'Sin Nombre'}
                        </h3>
                        <p className="text-sm text-blue-50 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {medico.user?.email}
                        </p>
                    </div>

                    <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-semibold shadow-sm',
                        medico.activo
                            ? 'bg-white text-blue-600'
                            : 'bg-white text-gray-600'
                    )}>
                        {medico.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4 flex-1 flex flex-col">
                {/* Badges de Especialidad y Licencia */}
                <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" />
                        {medico.especialidad?.nombre || 'General'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700 border border-cyan-200 flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        Lic: {medico.numeroLicencia}
                    </span>
                </div>

                {/* Info Grid */}
                <div className="space-y-3">
                    {medico.user?.telefono && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                                <Phone className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Teléfono</p>
                                <p className="font-medium">{medico.user.telefono}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
                            <Activity className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Entidad Médica</p>
                            <p className="font-medium text-gray-900 line-clamp-1">
                                {/* We don't have entity name directly in medico object usually, but if we did... 
                      Assuming strict type, I'll rely on what's available or simple placeholders 
                  */}
                                Clinica ELAI
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="mt-auto pt-3 border-t border-gray-100 grid grid-cols-1">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Agendas Activas
                        </span>
                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                            {medico._count?.agendas || 0}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={() => onEdit(medico)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                    >
                        <Edit className="w-4 h-4" />
                        Editar
                    </button>

                    <button
                        onClick={() => onDelete(medico)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium shadow-sm"
                        title="Eliminar"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};
