import React from 'react';
import { motion } from 'framer-motion';

export const VisionSection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative flex min-h-[500px] flex-col gap-6 overflow-hidden rounded-3xl items-center justify-center p-8 bg-black">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-black opacity-90"></div>

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[100px] opacity-30"
          ></motion.div>

          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-[100px] opacity-20"
          ></motion.div>

          {/* Content */}
          <div className="relative z-10 flex flex-col gap-6 text-center max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white text-4xl font-black leading-tight tracking-tighter sm:text-5xl md:text-6xl"
            >
              EL FUTURO DE LA ATENCIÓN MÉDICA ES <span className="text-blue-400">INTELIGENTE</span>.
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-blue-100 text-lg sm:text-xl font-normal max-w-2xl mx-auto"
            >
              ELAI combina lo mejor de la tecnología con el cuidado humano para crear una experiencia de salud sin precedentes.
            </motion.h2>
          </div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="relative z-10 flex flex-wrap gap-4 justify-center mt-8"
          >
            <button className="rounded-full h-12 px-8 bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all transform hover:scale-105 shadow-lg shadow-blue-600/25">
              Solicitar demostración
            </button>
            <button className="rounded-full h-12 px-8 bg-white/10 backdrop-blur-md text-white font-bold hover:bg-white/20 transition-all border border-white/20">
              Más información
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
