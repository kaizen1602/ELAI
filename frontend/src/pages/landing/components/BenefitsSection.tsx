import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const tiers = [
  {
    name: 'Para Consultorios',
    id: 'tier-consultorios',
    price: 'Gratis',
    description: 'Ideal para profesionales independientes que inician su práctica digital.',
    features: [
      'Hasta 50 citas mensuales',
      'Gestión de pacientes básica',
      'Agenda digital',
      'Recordatorios por email',
    ],
    mostPopular: false,
  },
  {
    name: 'Para Clínicas',
    id: 'tier-clinicas',
    price: '$29/mo',
    description: 'Gestión avanzada para clínicas en crecimiento y equipos médicos.',
    features: [
      'Citas ilimitadas',
      'Historias clínicas completas',
      'Múltiples agendas y especialistas',
      'Reportes avanzados y analíticas',
      'Soporte prioritario',
    ],
    mostPopular: true,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    price: 'Personalizado',
    description: 'Soluciones a medida para grandes instituciones de salud.',
    features: [
      'API y Webhooks',
      'Integraciones personalizadas',
      'SLA garantizado',
      'Gestor de cuenta dedicado',
      'Migración de datos asistida',
    ],
    mostPopular: false,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-24 bg-gray-900 relative isolate overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.900),theme(colors.gray.900))] opacity-50" />
      <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-gray-900 shadow-xl shadow-blue-600/10 ring-1 ring-blue-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base font-semibold leading-7 text-blue-400"
          >
            Planes y Precios
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            Elige el plan perfecto para tu crecimiento
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8"
        >
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={classNames(
                tier.mostPopular ? 'bg-white/5 ring-2 ring-blue-500' : 'ring-1 ring-white/10',
                'rounded-3xl p-8 xl:p-10 transition-transform duration-300 hover:scale-105'
              )}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id={tier.id}
                  className={classNames(
                    tier.mostPopular ? 'text-blue-400' : 'text-white',
                    'text-lg font-semibold leading-8'
                  )}
                >
                  {tier.name}
                </h3>
                {tier.mostPopular ? (
                  <p className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold leading-5 text-blue-400">
                    Más Popular
                  </p>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-300">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-white">{tier.price}</span>
              </p>
              <a
                href="#"
                aria-describedby={tier.id}
                className={classNames(
                  tier.mostPopular
                    ? 'bg-blue-500 text-white shadow-sm hover:bg-blue-400 focus-visible:outline-blue-500'
                    : 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white',
                  'mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
                )}
              >
                Empezar plan
              </a>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-300">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check className="h-6 w-5 flex-none text-blue-400" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
