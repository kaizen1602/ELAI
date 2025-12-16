import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Shield, Users } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const HeroSection = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-white">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 opacity-90" />

      {/* Animated shapes */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          rotate: [0, -15, 15, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />

      <motion.div
        style={{ scale, opacity }}
        className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 lg:pt-48"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6"
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-5xl sm:text-7xl font-extrabold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  ELAI
                </span>
              </div>
              Gestión Médica <br />
              <span className="text-blue-200">Inteligente y Eficiente</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-lg leading-8 text-blue-100"
            >
              La plataforma integral que transforma la administración de clínicas y consultorios.
              Simplifica procesos, optimiza tiempos y mejora la atención a tus pacientes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              <button
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="group rounded-full bg-white px-8 py-4 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-300 flex items-center gap-2"
              >
                Conoce más
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* Cards Floating */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-16 sm:mt-24 lg:mt-32 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8"
          >
            {[
              { icon: Activity, title: 'Control Total', desc: 'Gestión integral de tu centro médico' },
              { icon: Users, title: 'Pacientes', desc: 'Historias clínicas y seguimiento' },
              { icon: Shield, title: 'Seguridad', desc: 'Protección de datos garantizada' },
            ].map((item, index) => (
              <div key={index} className="rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:shadow-2xl hover:border-white/20">
                <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-blue-100" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-blue-100/80">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
