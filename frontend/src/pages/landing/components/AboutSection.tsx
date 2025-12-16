import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  'Interfaz moderna y fácil de usar',
  'Accesible desde cualquier dispositivo',
  'Actualizaciones constantes',
  'Soporte técnico 24/7'
];

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:pr-8 lg:pt-4"
          >
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-blue-600">Sobre ELAI</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                La tecnología al servicio de tu salud
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                ELAI es una plataforma inteligente que conecta clínicas y pacientes, ofreciendo
                una experiencia de salud premium y personalizada.
                Nuestra tecnología de inteligencia artificial permite automatizar procesos,
                mejorar la comunicación y brindar atención médica de clase mundial.
              </p>

              <ul className="mt-8 space-y-4">
                {features.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex gap-x-3 items-center"
                  >
                    <CheckCircle2 className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                    <span className="text-gray-600">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gray-900 shadow-xl ring-1 ring-gray-400/10">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 mix-blend-multiply" />
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
                alt="App screenshot"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative floaty elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-xs"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Eficiencia +40%</p>
                  <p className="text-sm text-gray-500">En gestión administrativa</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
