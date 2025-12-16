
import React from 'react';
import { Calendar, Clock, User, Stethoscope, AlertCircle, Eye, Check, X, FileText } from 'lucide-react';
import { Cita } from '../../types';
import { cn } from '../../utils/classNames';

interface CitaCardProps {
    cita: Cita;
    onViewDetail: (cita: Cita) => void;
    onConfirm: (cita: Cita) => void;
    onCancel: (cita: Cita) => void;
    onComplete: (cita: Cita) => void;
}

const estadoInfo = {
    PENDIENTE: {
        bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200',
        badge: 'bg-yellow-100 text-yellow-800'
    },
    CONFIRMADA: {
        bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-800'
    },
    CANCELADA: {
        bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200',
        badge: 'bg-red-100 text-red-800'
    },
    COMPLETADA: {
        bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200',
        badge: 'bg-green-100 text-green-800'
    },
    NO_ASISTIO: {
        bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200',
        badge: 'bg-gray-100 text-gray-800'
    },
};

export const CitaCard: React.FC<CitaCardProps> = ({ cita, onViewDetail, onConfirm, onCancel, onComplete }) => {
    const status = estadoInfo[cita.estado] || estadoInfo.PENDIENTE;

    const paciente = cita.paciente;
    const medico = cita.slot?.agenda?.medico;
    const fecha = cita.slot?.fecha ? new Date(cita.slot.fecha).toLocaleDateString() : 'Fecha N/A';
    const hora = cita.slot ? `${cita.slot.horaInicio} - ${cita.slot.horaFin} ` : 'Hora N/A';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
            {/* Colored Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 border-b border-blue-500">
                <div className="flex justify-between items-start text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-lg leading-tight">{fecha}</p>
                            <div className="flex items-center gap-1.5 text-blue-100 text-sm mt-0.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="font-medium">{hora}</span>
                            </div>
                        </div>
                    </div>
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 shadow-sm', status.text)}>
                        {cita.estado}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 space-y-5">

                {/* Patient & Doctor Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {/* Paciente */}
                    <div className="flex items-start gap-3 relative">
                        <div className="absolute left-[19px] top-10 bottom-[-20px] w-0.5 bg-gray-100" />
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0 border border-emerald-200 shadow-sm z-10">
                            {paciente?.nombres?.charAt(0) || 'P'}
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Paciente</p>
                            <h4 className="font-bold text-gray-900 leading-tight">
                                {paciente ? `${paciente.nombres} ${paciente.apellidos} ` : 'Desconocido'}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium">
                                {paciente?.tipoDocumento} {paciente?.numeroDocumento}
                            </p>
                        </div>
                    </div>

                    {/* Doctor */}
                    <div className="flex items-start gap-3 z-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0 border border-indigo-200 shadow-sm">
                            {medico?.user?.username?.substring(0, 2).toUpperCase() || 'DR'}
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Especialista</p>
                            <h4 className="font-bold text-gray-900 leading-tight">Dr. {medico?.user?.username || 'No asignado'}</h4>
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">
                                <Stethoscope className="w-3 h-3" />
                                {medico?.especialidad?.nombre || 'General'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Clinical Info - Only show IF data exists */}
                {(cita.motivoConsulta || cita.sintomas) && (
                    <div className="bg-gray-50 rounded-xl p-3 space-y-3 border border-gray-100">
                        {cita.motivoConsulta && (
                            <div>
                                <div className="flex items-center gap-1.5 text-gray-700 mb-1">
                                    <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                                    <span className="text-xs font-bold uppercase">Motivo Consulta</span>
                                </div>
                                <p className="text-sm text-gray-600 pl-5 leading-relaxed">
                                    {cita.motivoConsulta}
                                </p>
                            </div>
                        )}

                        {cita.sintomas && (
                            <div>
                                <div className="flex items-center gap-1.5 text-gray-700 mb-1">
                                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="text-xs font-bold uppercase">Síntomas Reportados</span>
                                </div>
                                <p className="text-sm text-gray-600 pl-5 leading-relaxed">
                                    {cita.sintomas}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-4 pt-0 mt-auto flex gap-2 justify-end">
                <button
                    onClick={() => onViewDetail(cita)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Ver Detalles"
                >
                    <Eye className="w-4 h-4" />
                </button>

                {cita.estado === 'PENDIENTE' && (
                    <>
                        <button
                            onClick={() => onCancel(cita)}
                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center gap-1.5"
                        >
                            <X className="w-3.5 h-3.5" /> Cancelar
                        </button>
                        <button
                            onClick={() => onConfirm(cita)}
                            className="flex-1 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                            <Check className="w-3.5 h-3.5" /> Confirmar
                        </button>
                    </>
                )}

                {cita.estado === 'CONFIRMADA' && (
                    <button
                        onClick={() => onComplete(cita)}
                        className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                        <Check className="w-3.5 h-3.5" /> Completar Cita
                    </button>
                )}
            </div>
        </div>
    );
};

