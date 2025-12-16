import React, { useEffect, useState } from 'react';
import { Plus, Stethoscope } from 'lucide-react';
import { Medico, EntidadMedica, Especialidad, User } from '../types';
import { medicosService, especialidadesService, CreateMedicoData, UpdateMedicoData } from '../services/medicosService';
import { entitiesService } from '../services/entitiesService';
import { MedicoCard } from '../components/medicos/MedicoCard';
import { EmptyState } from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';
import api from '../services/api';

const MedicosPage: React.FC = () => {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [entities, setEntities] = useState<EntidadMedica[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedico, setEditingMedico] = useState<Medico | null>(null);
  const [formData, setFormData] = useState<CreateMedicoData & { username?: string; email?: string; telefono?: string }>({
    userId: '',
    entidadMedicaId: '',
    especialidadId: '',
    numeroLicencia: '',
    username: '',
    email: '',
    telefono: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchMedicos = async () => {
    setLoading(true);
    try {
      const response = await medicosService.getAll();
      if (response.success && response.data) {
        setMedicos(response.data);
      }
    } catch (error) {
      console.error('Error fetching medicos:', error);
    } finally {
      setLoading(false);
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

  const fetchEspecialidades = async () => {
    try {
      const response = await especialidadesService.getAll();
      if (response.success && response.data) {
        setEspecialidades(response.data);
      }
    } catch (error) {
      console.error('Error fetching especialidades:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Get users with MEDICO role that don't have a medico record yet
      const response = await api.get('/auth/users', { params: { rol: 'MEDICO' } });
      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchMedicos();
    fetchEntities();
    fetchEspecialidades();
    fetchUsers();
  }, []);

  const handleOpenModal = (medico?: Medico) => {
    if (medico) {
      setEditingMedico(medico);
      setFormData({
        userId: medico.userId,
        entidadMedicaId: medico.entidadMedicaId,
        especialidadId: medico.especialidadId,
        numeroLicencia: medico.numeroLicencia,
        username: medico.user?.username || '',
        email: medico.user?.email || '',
        telefono: medico.user?.telefono || '',
      });
    } else {
      setEditingMedico(null);
      setFormData({
        userId: '',
        entidadMedicaId: entities[0]?.id || '',
        especialidadId: especialidades[0]?.id || '',
        numeroLicencia: '',
        username: '',
        email: '',
        telefono: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMedico(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingMedico) {
        const updateData: UpdateMedicoData = {
          entidadMedicaId: formData.entidadMedicaId,
          especialidadId: formData.especialidadId,
          numeroLicencia: formData.numeroLicencia,
          username: formData.username,
          email: formData.email,
          telefono: formData.telefono,
        };
        await medicosService.update(editingMedico.id, updateData);
      } else {
        await medicosService.create(formData);
      }
      handleCloseModal();
      fetchMedicos();
    } catch (error) {
      console.error('Error saving medico:', error);
      alert('Error al guardar el médico');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (medico: Medico) => {
    if (confirm(`¿Está seguro de eliminar al médico?`)) {
      try {
        await medicosService.delete(medico.id);
        fetchMedicos();
      } catch (error) {
        console.error('Error deleting medico:', error);
        alert('Error al eliminar el médico');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Médicos</h1>
              <p className="text-gray-500 text-sm">Gestión de médicos y especialistas</p>
            </div>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Médico
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : medicos.length === 0 ? (
        <EmptyState
          icon={<Stethoscope size={64} />}
          title="No hay médicos registrados"
          description="Comienza agregando tu primer médico al sistema"
          action={{
            label: 'Agregar Médico',
            onClick: () => handleOpenModal(),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicos.map((medico) => (
            <MedicoCard
              key={medico.id}
              medico={medico}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMedico ? 'Editar Médico' : 'Nuevo Médico'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!editingMedico && (
              <Select
                label="Usuario (debe tener rol MEDICO)"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                options={users.map((u) => ({ value: u.id, label: `${u.username} (${u.email})` }))}
                required
              />
            )}

            {editingMedico && (
              <>
                <Input
                  label="Nombre Completo"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Teléfono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </>
            )}

            <Select
              label="Entidad Médica"
              value={formData.entidadMedicaId}
              onChange={(e) => setFormData({ ...formData, entidadMedicaId: e.target.value })}
              options={entities.map((e) => ({ value: e.id, label: e.nombre }))}
              required
            />
            <Select
              label="Especialidad"
              value={formData.especialidadId}
              onChange={(e) => setFormData({ ...formData, especialidadId: e.target.value })}
              options={especialidades.map((e) => ({ value: e.id, label: e.nombre }))}
              required
            />
            <Input
              label="Número de Licencia"
              value={formData.numeroLicencia}
              onChange={(e) => setFormData({ ...formData, numeroLicencia: e.target.value })}
              required
            />
          </div>
          {!editingMedico && users.length === 0 && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
              No hay usuarios con rol MÉDICO disponibles. Primero debe crear un usuario con ese rol.
            </p>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving} disabled={!editingMedico && users.length === 0}>
              {editingMedico ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MedicosPage;
