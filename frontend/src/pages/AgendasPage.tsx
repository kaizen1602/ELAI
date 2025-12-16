import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { Agenda, Medico, EntidadMedica } from '../types';
import { agendasService, CreateAgendaData, UpdateAgendaData } from '../services/agendasService';
import { medicosService } from '../services/medicosService';
import { entitiesService } from '../services/entitiesService';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';

const diasSemanaOptions = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' },
];

const AgendasPage: React.FC = () => {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [entities, setEntities] = useState<EntidadMedica[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerateSlotsOpen, setIsGenerateSlotsOpen] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);
  const [formData, setFormData] = useState<CreateAgendaData>({
    medicoId: '',
    entidadMedicaId: '',
    nombre: '',
    diaSemana: 'LUNES',
    horaInicio: '08:00',
    horaFin: '17:00',
    duracionSlot: 30,
  });
  const [slotDates, setSlotDates] = useState({ fechaInicio: '', fechaFin: '' });
  const [saving, setSaving] = useState(false);
  const [generatingSlots, setGeneratingSlots] = useState(false);

  const fetchAgendas = async (page = 1) => {
    setLoading(true);
    try {
      const response = await agendasService.getAll(page, 10);
      if (response.success) {
        setAgendas(response.data);
        setPagination({
          page: response.pagination.page,
          totalPages: response.pagination.totalPages,
          total: response.pagination.total,
        });
      }
    } catch (error) {
      console.error('Error fetching agendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicos = async () => {
    try {
      const response = await medicosService.getAll();
      if (response.success && response.data) {
        setMedicos(response.data);
      }
    } catch (error) {
      console.error('Error fetching medicos:', error);
    }
  };

  const fetchEntities = async () => {
    try {
      const response = await entitiesService.getAll(1, 100);
      if (response.success) {
        setEntities(response.data);
      }
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  };

  useEffect(() => {
    fetchAgendas();
    fetchMedicos();
    fetchEntities();
  }, []);

  const handleOpenModal = (agenda?: Agenda) => {
    if (agenda) {
      setEditingAgenda(agenda);
      setFormData({
        medicoId: agenda.medicoId,
        entidadMedicaId: agenda.entidadMedicaId,
        nombre: agenda.nombre,
        diaSemana: agenda.diaSemana as CreateAgendaData['diaSemana'],
        horaInicio: agenda.horaInicio,
        horaFin: agenda.horaFin,
        duracionSlot: agenda.duracionSlot,
      });
    } else {
      setEditingAgenda(null);
      setFormData({
        medicoId: medicos[0]?.id || '',
        entidadMedicaId: entities[0]?.id || '',
        nombre: '',
        diaSemana: 'LUNES',
        horaInicio: '08:00',
        horaFin: '17:00',
        duracionSlot: 45, // Changed default from 30 to 45
      });
    }
    setIsModalOpen(true);
  };

  // Auto-update slot duration when medico changes
  const handleMedicoChange = (medicoId: string) => {
    const selectedMedico = medicos.find(m => m.id === medicoId);
    let duracionSlot = 45; // Default for specialties

    if (selectedMedico?.especialidad?.nombre?.toLowerCase().includes('general')) {
      duracionSlot = 30; // Medicina General gets 30 minutes
    }

    setFormData({
      ...formData,
      medicoId,
      duracionSlot
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAgenda(null);
  };

  const [autoGenerateSlots, setAutoGenerateSlots] = useState(false);

  const handleQuickSetup = () => {
    setFormData({
      ...formData,
      horaInicio: '08:00',
      horaFin: '17:00',
      duracionSlot: formData.duracionSlot || 45
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.medicoId || !formData.entidadMedicaId) {
      alert('Debe seleccionar un médico y una entidad médica');
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        ...formData,
        duracionSlot: Number(formData.duracionSlot) || 30,
      };

      let agendaId = '';
      if (editingAgenda) {
        await agendasService.update(editingAgenda.id, dataToSend as UpdateAgendaData);
        agendaId = editingAgenda.id;
      } else {
        const result = await agendasService.create(dataToSend);
        if (result.success && result.data) {
          agendaId = result.data.id;
        }
      }

      if (!editingAgenda && autoGenerateSlots && agendaId) {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        await agendasService.generateSlots(agendaId, today.toISOString().split('T')[0], nextMonth.toISOString().split('T')[0]);
      }

      handleCloseModal();
      fetchAgendas(pagination.page);
    } catch (error) {
      console.error('Error saving agenda:', error);
      alert('Error al guardar la agenda');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (agenda: Agenda) => {
    if (confirm(`¿Está seguro de eliminar la agenda "${agenda.nombre}"?`)) {
      try {
        await agendasService.delete(agenda.id);
        fetchAgendas(pagination.page);
      } catch (error) {
        console.error('Error deleting agenda:', error);
        alert('Error al eliminar la agenda');
      }
    }
  };

  const handleOpenGenerateSlots = (agenda: Agenda) => {
    setSelectedAgenda(agenda);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setSlotDates({
      fechaInicio: today,
      fechaFin: nextMonth.toISOString().split('T')[0],
    });
    setIsGenerateSlotsOpen(true);
  };

  const handleGenerateSlots = async () => {
    if (!selectedAgenda) return;
    setGeneratingSlots(true);
    try {
      await agendasService.generateSlots(selectedAgenda.id, slotDates.fechaInicio, slotDates.fechaFin);
      alert('Slots generados exitosamente');
      setIsGenerateSlotsOpen(false);
    } catch (error) {
      console.error('Error generating slots:', error);
      alert('Error al generar los slots');
    } finally {
      setGeneratingSlots(false);
    }
  };

  const columns = [
    { key: 'nombre', header: 'Nombre' },
    {
      key: 'diaSemana',
      header: 'Día',
      render: (agenda: Agenda) => (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
          {agenda.diaSemana}
        </span>
      ),
    },
    {
      key: 'horario',
      header: 'Horario',
      render: (agenda: Agenda) => `${agenda.horaInicio} - ${agenda.horaFin}`,
    },
    {
      key: 'duracionSlot',
      header: 'Duración',
      render: (agenda: Agenda) => `${agenda.duracionSlot} min`,
    },
    {
      key: 'activa',
      header: 'Estado',
      render: (agenda: Agenda) => (
        <span className={`px-2 py-1 text-xs rounded-full ${agenda.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {agenda.activa ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (agenda: Agenda) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenGenerateSlots(agenda); }}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Generar Slots"
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenModal(agenda); }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(agenda); }}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/25">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agendas</h1>
              <p className="text-gray-500 text-sm">Gestión de horarios de atención</p>
            </div>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Agenda
          </Button>
        </div>
      </div>

      <DataTable
        data={agendas}
        columns={columns}
        loading={loading}
        pagination={{
          ...pagination,
          onPageChange: fetchAgendas,
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAgenda ? 'Editar Agenda' : 'Nueva Agenda'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre de la Agenda"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Consulta General Mañana"
              required
            />
            <Select
              label="Entidad Médica"
              value={formData.entidadMedicaId}
              onChange={(e) => setFormData({ ...formData, entidadMedicaId: e.target.value })}
              options={entities.map((e) => ({ value: e.id, label: e.nombre }))}
              required
            />
            <Select
              label="Médico"
              value={formData.medicoId}
              onChange={(e) => handleMedicoChange(e.target.value)}
              options={medicos.map((m) => ({ value: m.id, label: m.user?.username || m.id }))}
              required
            />
            <Select
              label="Día de la Semana"
              value={formData.diaSemana}
              onChange={(e) => setFormData({ ...formData, diaSemana: e.target.value as CreateAgendaData['diaSemana'] })}
              options={diasSemanaOptions}
              required
            />

            {/* Quick Setup Button */}
            <div className="md:col-span-2 flex justify-end -mt-2 mb-2">
              <Button type="button" variant="secondary" onClick={handleQuickSetup} size="sm">
                <Clock className="w-4 h-4 mr-2" />
                Configuración Rápida (8h - Oficina)
              </Button>
            </div>

            <Input
              label="Hora de Inicio"
              type="time"
              value={formData.horaInicio}
              onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
              required
            />
            <Input
              label="Hora de Fin"
              type="time"
              value={formData.horaFin}
              onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
              required
            />

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer bg-blue-50 p-3 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-4 w-4"
                  checked={autoGenerateSlots}
                  onChange={(e) => setAutoGenerateSlots(e.target.checked)}
                />
                <span className="font-medium text-blue-900">Generar slots automáticamente para el próximo mes</span>
              </label>
            </div>
            <div>
              <Input
                label="Duración del Slot (minutos)"
                type="number"
                value={formData.duracionSlot}
                onChange={(e) => setFormData({ ...formData, duracionSlot: parseInt(e.target.value) || 45 })}
                min={10}
                max={120}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto: 30 min (Medicina General), 45 min (Especialidades)
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingAgenda ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isGenerateSlotsOpen}
        onClose={() => setIsGenerateSlotsOpen(false)}
        title="Generar Slots de Citas"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Genera slots de citas para la agenda <strong>{selectedAgenda?.nombre}</strong>
          </p>

          {/* Quick Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                setSlotDates({
                  fechaInicio: today.toISOString().split('T')[0],
                  fechaFin: nextWeek.toISOString().split('T')[0],
                });
              }}
              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Próxima Semana
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const nextMonth = new Date();
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                setSlotDates({
                  fechaInicio: today.toISOString().split('T')[0],
                  fechaFin: nextMonth.toISOString().split('T')[0],
                });
              }}
              className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              Próximo Mes
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const threeMonths = new Date();
                threeMonths.setMonth(threeMonths.getMonth() + 3);
                setSlotDates({
                  fechaInicio: today.toISOString().split('T')[0],
                  fechaFin: threeMonths.toISOString().split('T')[0],
                });
              }}
              className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              Próximos 3 Meses
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha Inicio"
              type="date"
              value={slotDates.fechaInicio}
              onChange={(e) => setSlotDates({ ...slotDates, fechaInicio: e.target.value })}
              required
            />
            <Input
              label="Fecha Fin"
              type="date"
              value={slotDates.fechaFin}
              onChange={(e) => setSlotDates({ ...slotDates, fechaFin: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsGenerateSlotsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerateSlots} loading={generatingSlots}>
              Generar Slots
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AgendasPage;
