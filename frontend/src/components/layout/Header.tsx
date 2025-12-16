import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </button>

            {/* Search bar */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar pacientes, citas..."
                  className={`w-80 pl-12 pr-4 py-3 rounded-xl border transition-all duration-300 ${
                    isScrolled
                      ? 'bg-gray-50 border-gray-200 focus:bg-white'
                      : 'bg-white/80 backdrop-blur border-gray-100'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500`}
                />
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  isScrolled
                    ? 'bg-gray-100 hover:bg-gray-200'
                    : 'bg-white shadow-md hover:shadow-lg'
                }`}
              >
                <Bell className="h-5 w-5 text-gray-700" />
                <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white" />
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scale-in">
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <h3 className="font-semibold text-white">Notificaciones</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="p-4 border-b border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          Nueva cita programada
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Hace {i * 5} minutos
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-gray-50">
                    <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700">
                      Ver todas
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <button
              className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 ${
                isScrolled
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-white shadow-md hover:shadow-lg'
              }`}
            >
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.rol}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
