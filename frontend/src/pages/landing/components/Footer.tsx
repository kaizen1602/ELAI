import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-5 py-10">
          <p className="text-slate-500 text-sm">
            © 2025 ELAI Healthcare. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors text-sm">Privacidad</a>
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors text-sm">Términos</a>
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors text-sm">Soporte</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
