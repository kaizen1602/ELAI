import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Building2 } from 'lucide-react';
import { EntidadMedica } from '../types';
import { entitiesService } from '../services/entitiesService';
import { EntityCard } from '../components/entities/EntityCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';

const tipoEntidadOptions = [
  { value: 'HOSPITAL', label: 'Hospital' },
  { value: 'CLINICA', label: 'Clínica' },
  { value: 'IPS', label: 'IPS' },
  { value: 'CONSULTORIO', label: 'Consultorio' },
  { value: 'LABORATORIO', label: 'Laboratorio' },
];

interface EntityFormData {
  nombre: string;
  tipoEntidad: "HOSPITAL" | "CLINICA" | "IPS" | "CONSULTORIO" | "LABORATORIO";
  nitRut: string;
  direccion: string;
  ciudad: string;
  departamentoEstado: string;
  telefonoPrincipal: string;
  email: string;
}

const EntitiesPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<EntidadMedica | null>(null);
  const [formData, setFormData] = useState<EntityFormData>({
    nombre: '',
    tipoEntidad: 'CLINICA',
    nitRut: '',
    direccion: '',
    ciudad: '',
    departamentoEstado: '',
    telefonoPrincipal: '',
    email: '',
  });

  // Fetch entidades con React Query
  const { data: entitiesResponse, isLoading } = useQuery({
    queryKey: ['entities'],
    queryFn: () => entitiesService.getAll(1, 100),
  });

  const entities = entitiesResponse?.success ? entitiesResponse.data : [];

  // Mutation para crear
  const createMutation = useMutation({
    mutationFn: (data: EntityFormData) => entitiesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      toast.success('Entidad creada exitosamente');
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al crear entidad');
    },
  });

  // Mutation para actualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EntityFormData> }) =>
      entitiesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      toast.success('Entidad actualizada exitosamente');
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al actualizar entidad');
    },
  });

  // Mutation para toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: (entity: EntidadMedica) =>
      entitiesService.update(entity.id, { activa: !entity.activa }),
    onSuccess: (_, entity) => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      toast.success(`Entidad ${!entity.activa ? 'activada' : 'desactivada'} exitosamente`);
    },
    onError: () => {
      toast.error('Error al cambiar estado de la entidad');
    },
  });

  const handleOpenModal = (entity?: EntidadMedica) => {
    if (entity) {
      setEditingEntity(entity);
      setFormData({
        nombre: entity.nombre,
        tipoEntidad: entity.tipoEntidad,
        nitRut: entity.nitRut,
        direccion: entity.direccion,
        ciudad: entity.ciudad,
        departamentoEstado: entity.departamentoEstado,
        telefonoPrincipal: entity.telefonoPrincipal,
        email: entity.email,
      });
    } else {
      setEditingEntity(null);
      setFormData({
        nombre: '',
        tipoEntidad: 'CLINICA',
        nitRut: '',
        direccion: '',
        ciudad: '',
        departamentoEstado: '',
        telefonoPrincipal: '',
        email: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntity(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEntity) {
      updateMutation.mutate({ id: editingEntity.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calcular estadísticas
  const stats = {
    total: entities.length,
    activas: entities.filter((e: EntidadMedica) => e.activa).length,
    inactivas: entities.filter((e: EntidadMedica) => !e.activa).length,
    porTipo: entities.reduce((acc: any, e: EntidadMedica) => {
      acc[e.tipoEntidad] = (acc[e.tipoEntidad] || 0) + 1;
      return acc;
    }, {}),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            Gestión de Entidades
          </h1>
          <p className="text-gray-600 mt-1">Administra los centros médicos del sistema</p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="success">
          <Plus className="w-5 h-5 mr-2" />
          Nueva Entidad
        </Button>
      </div>

      {/* Stats KPIs */}
      {!isLoading && entities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm font-medium text-blue-600">Total Entidades</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <p className="text-sm font-medium text-green-600">Activas</p>
            <p className="text-3xl font-bold text-green-900 mt-1">{stats.activas}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-100">
            <p className="text-sm font-medium text-red-600">Inactivas</p>
            <p className="text-3xl font-bold text-red-900 mt-1">{stats.inactivas}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
            <p className="text-sm font-medium text-purple-600">Tipos</p>
            <p className="text-3xl font-bold text-purple-900 mt-1">
              {Object.keys(stats.porTipo).length}
            </p>
          </div>
        </div>
      )}

      {/* Entidades Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : entities.length === 0 ? (
        <EmptyState
          icon={<Building2 size={64} />}
          title="No hay entidades registradas"
          description="Comienza agregando tu primera entidad médica al sistema"
          action={{
            label: 'Agregar Entidad',
            onClick: () => handleOpenModal(),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entities.map((entity: EntidadMedica) => (
            <EntityCard
              key={entity.id}
              entity={entity}
              onEdit={handleOpenModal}
              onToggleStatus={(e) => toggleStatusMutation.mutate(e)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEntity ? 'Editar Entidad' : 'Nueva Entidad'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />

            <Select
              label="Tipo de Entidad"
              name="tipoEntidad"
              value={formData.tipoEntidad}
              onChange={handleInputChange}
              options={tipoEntidadOptions}
              required
            />

            <Input
              label="NIT/RUT"
              name="nitRut"
              value={formData.nitRut}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Teléfono Principal"
              name="telefonoPrincipal"
              value={formData.telefonoPrincipal}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Ciudad"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Departamento/Estado"
              name="departamentoEstado"
              value={formData.departamentoEstado}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              className="md:col-span-2"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="success"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingEntity ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EntitiesPage;