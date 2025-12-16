import React from 'react';
import {
  Building2,
  Users,
  Calendar,
  Activity,
  Stethoscope,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Building2,
    title: 'Gestión de Entidades',
    description: 'Administración centralizada de múltiples sedes, clínicas y consultorios desde un solo panel.'
  },
  {
    icon: Users,
    title: 'Portal de Pacientes',
    description: 'Permite a los usuarios gestionar sus citas, ver su historial y actualizar su información.'
  },
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description: 'Sistema de turnos automatizado que evita conflictos y optimiza la disponibilidad médica.'
  },
  {
    icon: Stethoscope,
    title: 'Gestión Médica',
    description: 'Perfiles detallados para especialistas, con control de horarios y tipos de consulta.'
  },
  {
    icon: Activity,
    title: 'Reportes en Tiempo Real',
    description: 'Dashboards interactivos con métricas clave para la toma de decisiones estratégicas.'
  },
  {
    icon: MessageSquare,
    title: 'Comunicación Fluida',
    description: 'Sistema de notificaciones y recordatorios para reducir el ausentismo en las citas.'
  }
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base font-semibold leading-7 text-blue-600"
          >
            Características Principales
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          >
            Todo lo que necesitas para tu centro médico
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-gray-600"
          >
            Nuestra plataforma unifica todas las herramientas necesarias para una gestión clínica moderna y eficiente.
          </motion.p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex flex-col items-start hover:bg-gray-50 p-6 rounded-2xl transition-colors duration-300"
              >
                <div className="rounded-xl bg-blue-50 p-3 ring-1 ring-blue-100 mb-4 group-hover:bg-blue-600 transition-colors">
                  <feature.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" aria-hidden="true" />
                </div>
                <dt className="text-xl font-semibold leading-7 text-gray-900">
                  {feature.title}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  {feature.description}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};
