import React, { useEffect, useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Cita, Paciente, Agenda, Slot } from '../types';
import { citasService, CreateCitaData } from '../services/citasService';
import { patientsService } from '../services/patientsService';
import { agendasService, slotsService } from '../services/agendasService';
import { CitaCard } from '../components/citas/CitaCard';
import { EmptyState } from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';

const estadoColors: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  CONFIRMADA: 'bg-blue-100 text-blue-800',
  CANCELADA: 'bg-red-100 text-red-800',
  COMPLETADA: 'bg-green-100 text-green-800',
  NO_ASISTIO: 'bg-gray-100 text-gray-800',
};

const CitasPage: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [formData, setFormData] = useState<CreateCitaData>({
    slotId: '',
    pacienteId: '',
    motivoConsulta: '',
    sintomas: '',
  });
  const [selectedAgendaId, setSelectedAgendaId] = useState('');
  const [selectedFecha, setSelectedFecha] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchCitas = async (page = 1) => {
    setLoading(true);
    try {
      const response = await citasService.getAll(page, 10);
      if (response.success) {
        setCitas(response.data);
        setPagination({
          page: response.pagination.page,
          totalPages: response.pagination.totalPages,
          total: response.pagination.total,
        });
      }
    } catch (error) {
      console.error('Error fetching citas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPacientes = async () => {
    try {
      const response = await patientsService.getAll(1, 100);
      if (response.success) {
        setPacientes(response.data);
      }
    } catch (error) {
      console.error('Error fetching pacientes:', error);
    }
  };

  const fetchAgendas = async () => {
    try {
      const response = await agendasService.getAll(1, 100);
      if (response.success) {
        setAgendas(response.data);
      }
    } catch (error) {
      console.error('Error fetching agendas:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedAgendaId || !selectedFecha) return;
    setLoadingSlots(true);
    try {
      const response = await slotsService.getAvailable(selectedAgendaId, selectedFecha);
      if (response.success && response.data) {
        setAvailableSlots(response.data);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchCitas();
    fetchPacientes();
    fetchAgendas();
  }, []);

  useEffect(() => {
    if (selectedAgendaId && selectedFecha) {
      fetchAvailableSlots();
    }
  }, [selectedAgendaId, selectedFecha]);

  const handleOpenModal = () => {
    setFormData({
      slotId: '',
      pacienteId: pacientes[0]?.id || '',
      motivoConsulta: '',
      sintomas: '',
    });
    setSelectedAgendaId('');
    setSelectedFecha(new Date().toISOString().split('T')[0]);
    setAvailableSlots([]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleViewDetail = (cita: Cita) => {
    setSelectedCita(cita);
    setIsDetailOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slotId) {
      alert('Por favor seleccione un slot disponible');
      return;
    }
    setSaving(true);
    try {
      await citasService.create(formData);
      handleCloseModal();
      fetchCitas(pagination.page);
    } catch (error) {
      console.error('Error saving cita:', error);
      alert('Error al crear la cita');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async (cita: Cita) => {
    try {
      await citasService.confirm(cita.id);
      fetchCitas(pagination.page);
    } catch (error) {
      console.error('Error confirming cita:', error);
      alert('Error al confirmar la cita');
    }
  };

  const handleCancel = async (cita: Cita) => {
    if (confirm('¿Está seguro de cancelar esta cita?')) {
      try {
        await citasService.cancel(cita.id);
        fetchCitas(pagination.page);
      } catch (error) {
        console.error('Error canceling cita:', error);
        alert('Error al cancelar la cita');
      }
    }
  };

  const handleComplete = async (cita: Cita) => {
    try {
      await citasService.complete(cita.id);
      fetchCitas(pagination.page);
    } catch (error) {
      console.error('Error completing cita:', error);
      alert('Error al completar la cita');
    }
  };



  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/25">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Citas</h1>
              <p className="text-gray-500 text-sm">Gestión de citas médicas</p>
            </div>
          </div>
          <Button onClick={handleOpenModal}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cita
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : citas.length === 0 ? (
        <EmptyState
          icon={<Calendar size={64} />}
          title="No hay citas registradas"
          description="Comienza agendando tu primera cita médica"
          action={{
            label: 'Nueva Cita',
            onClick: handleOpenModal,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {citas.map((cita) => (
            <CitaCard
              key={cita.id}
              cita={cita}
              onViewDetail={handleViewDetail}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Nueva Cita"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Paciente"
              value={formData.pacienteId}
              onChange={(e) => setFormData({ ...formData, pacienteId: e.target.value })}
              options={pacientes.map((p) => ({ value: p.id, label: `${p.nombres} ${p.apellidos}` }))}
              required
            />
            <Select
              label="Agenda"
              value={selectedAgendaId}
              onChange={(e) => setSelectedAgendaId(e.target.value)}
              options={agendas.map((a) => ({ value: a.id, label: `${a.nombre} (${a.diaSemana})` }))}
              required
            />
            <Input
              label="Fecha"
              type="date"
              value={selectedFecha}
              onChange={(e) => setSelectedFecha(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slot Disponible <span className="text-red-500">*</span>
              </label>
              {loadingSlots ? (
                <div className="p-3 border rounded-lg bg-gray-50 text-gray-500">
                  Cargando slots...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-3 border rounded-lg bg-gray-50 text-gray-500">
                  {selectedAgendaId && selectedFecha ? 'No hay slots disponibles' : 'Seleccione agenda y fecha'}
                </div>
              ) : (
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.slotId}
                  onChange={(e) => setFormData({ ...formData, slotId: e.target.value })}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {availableSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.horaInicio} - {slot.horaFin}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <Input
            label="Motivo de Consulta"
            value={formData.motivoConsulta}
            onChange={(e) => setFormData({ ...formData, motivoConsulta: e.target.value })}
            placeholder="Describa el motivo de la consulta"
          />
          <Input
            label="Síntomas"
            value={formData.sintomas}
            onChange={(e) => setFormData({ ...formData, sintomas: e.target.value })}
            placeholder="Describa los síntomas"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Crear Cita
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detalle de Cita"
      >
        {selectedCita && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Paciente</p>
                <p className="font-medium">
                  {selectedCita.paciente ? `${selectedCita.paciente.nombres} ${selectedCita.paciente.apellidos}` : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span className={`px-2 py-1 text-xs rounded-full ${estadoColors[selectedCita.estado]}`}>
                  {selectedCita.estado}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-medium">
                  {selectedCita.slot?.fecha ? new Date(selectedCita.slot.fecha).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hora</p>
                <p className="font-medium">
                  {selectedCita.slot ? `${selectedCita.slot.horaInicio} - ${selectedCita.slot.horaFin}` : '-'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Motivo de Consulta</p>
              <p className="font-medium">{selectedCita.motivoConsulta || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Síntomas</p>
              <p className="font-medium">{selectedCita.sintomas || 'No especificados'}</p>
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CitasPage;
