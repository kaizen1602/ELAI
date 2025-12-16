import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Users2 } from 'lucide-react';
import { Paciente, EntidadMedica } from '../types';
import { patientsService, CreatePatientData } from '../services/patientsService';
import { entitiesService } from '../services/entitiesService';
import { PatientCard } from '../components/patients/PatientCard';
import { PatientStats } from '../components/patients/PatientStats';
import { SkeletonCard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';

const tipoDocumentoOptions = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'RC', label: 'Registro Civil' },
];

const generoOptions = [
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMENINO', label: 'Femenino' },
  { value: 'OTRO', label: 'Otro' },
];

const PatientsPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Paciente | null>(null);
  const [formData, setFormData] = useState<CreatePatientData>({
    entidadMedicaId: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    genero: 'MASCULINO',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    departamento: '',
  });

  // Fetch pacientes con React Query
  const { data: patientsResponse, isLoading: loadingPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientsService.getAll(1, 100),
  });

  // Fetch entidades
  const { data: entitiesResponse } = useQuery({
    queryKey: ['entities'],
    queryFn: () => entitiesService.getAll(1, 100),
  });

  const patients = patientsResponse?.success ? patientsResponse.data : [];
  const entities = entitiesResponse?.success ? entitiesResponse.data : [];

  // Mutation para crear paciente
  const createMutation = useMutation({
    mutationFn: (data: CreatePatientData) => patientsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Paciente creado exitosamente');
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al crear paciente');
    },
  });

  // Mutation para actualizar paciente
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePatientData> }) =>
      patientsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Paciente actualizado exitosamente');
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al actualizar paciente');
    },
  });

  // Mutation para toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: (patient: Paciente) =>
      patientsService.update(patient.id, { activo: !patient.activo }),
    onSuccess: (_, patient) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success(`Paciente ${!patient.activo ? 'activado' : 'desactivado'} exitosamente`);
    },
    onError: () => {
      toast.error('Error al cambiar estado del paciente');
    },
  });

  const handleOpenModal = (patient?: Paciente) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        entidadMedicaId: patient.entidadMedicaId,
        tipoDocumento: patient.tipoDocumento,
        numeroDocumento: patient.numeroDocumento,
        nombres: patient.nombres,
        apellidos: patient.apellidos,
        fechaNacimiento: patient.fechaNacimiento.split('T')[0],
        genero: patient.genero,
        telefono: patient.telefono,
        email: patient.email || '',
        direccion: patient.direccion,
        ciudad: patient.ciudad,
        departamento: patient.departamento,
      });
    } else {
      setEditingPatient(null);
      setFormData({
        entidadMedicaId: entities[0]?.id || '',
        tipoDocumento: 'CC',
        numeroDocumento: '',
        nombres: '',
        apellidos: '',
        fechaNacimiento: '',
        genero: 'MASCULINO',
        telefono: '',
        email: '',
        direccion: '',
        ciudad: '',
        departamento: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPatient) {
      updateMutation.mutate({ id: editingPatient.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Users2 className="h-6 w-6 text-white" />
            </div>
            Gestión de Pacientes
          </h1>
          <p className="text-gray-600 mt-1">Administra los pacientes del sistema</p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Stats */}
      {!loadingPatients && patients.length > 0 && (
        <PatientStats pacientes={patients} />
      )}

      {/* Pacientes Grid */}
      {loadingPatients ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <EmptyState
          icon={<Users2 size={64} />}
          title="No hay pacientes registrados"
          description="Comienza agregando tu primer paciente al sistema"
          action={{
            label: 'Agregar Paciente',
            onClick: () => handleOpenModal(),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onEdit={handleOpenModal}
              onToggleStatus={(p) => toggleStatusMutation.mutate(p)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Entidad Médica"
              name="entidadMedicaId"
              value={formData.entidadMedicaId}
              onChange={handleInputChange}
              options={entities.map((e: EntidadMedica) => ({
                value: e.id,
                label: e.nombre,
              }))}
              required
            />

            <Select
              label="Tipo de Documento"
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleInputChange}
              options={tipoDocumentoOptions}
              required
            />

            <Input
              label="Número de Documento"
              name="numeroDocumento"
              value={formData.numeroDocumento}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Nombres"
              name="nombres"
              value={formData.nombres}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Apellidos"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Fecha de Nacimiento"
              name="fechaNacimiento"
              type="date"
              value={formData.fechaNacimiento}
              onChange={handleInputChange}
              required
            />

            <Select
              label="Género"
              name="genero"
              value={formData.genero}
              onChange={handleInputChange}
              options={generoOptions}
              required
            />

            <Input
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />

            <Input
              label="Dirección"
              name="direccion"
              value={formData.direccion}
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
              label="Departamento"
              name="departamento"
              value={formData.departamento}
              onChange={handleInputChange}
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
              variant="primary"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingPatient ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PatientsPage;