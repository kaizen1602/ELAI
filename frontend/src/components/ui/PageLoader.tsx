export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center">
        <div className="relative">
          {/* Spinner animado */}
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          
          {/* Logo ELAI en el centro */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg opacity-50"></div>
          </div>
        </div>
        
        <p className="mt-6 text-gray-600 font-medium">Cargando...</p>
        <p className="mt-2 text-sm text-gray-400">Preparando el sistema</p>
      </div>
    </div>
  );
};