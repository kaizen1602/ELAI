import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const CTASection = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-50/50 -z-10" />

      <div className="max-w-4xl mx-auto text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center gap-8"
        >
          <div className="flex flex-col gap-4 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Transforma la experiencia de <br />
              <span className="text-blue-600">tus pacientes hoy</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Únete a las clínicas que ya están revolucionando la atención médica con ELAI.
              Prueba gratis por 14 días, sin tarjeta de crédito.
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full h-14 px-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all"
            >
              Comenzar Ahora - Es Gratis
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
