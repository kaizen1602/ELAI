import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Stethoscope,
  Calendar,
  CalendarCheck,
  Settings,
  LogOut,
  X,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', allowedRoles: ['SUPERADMIN', 'ADMIN_ENTIDAD', 'MEDICO'] },
  { path: '/entities', icon: Building2, label: 'Entidades', allowedRoles: ['SUPERADMIN'] },
  { path: '/patients', icon: Users, label: 'Pacientes', allowedRoles: ['SUPERADMIN', 'ADMIN_ENTIDAD', 'MEDICO'] },
  { path: '/medicos', icon: Stethoscope, label: 'Médicos', allowedRoles: ['SUPERADMIN', 'ADMIN_ENTIDAD'] },
  { path: '/agendas', icon: Calendar, label: 'Agendas', allowedRoles: ['SUPERADMIN', 'ADMIN_ENTIDAD', 'MEDICO'] },
  { path: '/citas', icon: CalendarCheck, label: 'Citas', allowedRoles: ['SUPERADMIN', 'ADMIN_ENTIDAD', 'MEDICO'] },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl border-r border-gray-100
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    ELAI
                  </h1>
                  <p className="text-xs text-gray-500">Medical Platform</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Menú Principal
            </p>
            {menuItems
              .filter(item => user?.rol && item.allowedRoles.includes(user.rol))
              .map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 animate-slide-in
                    ${isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto h-2 w-2 bg-white rounded-full animate-pulse" />
                    )}
                  </NavLink>
                );
              })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.rol}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-all duration-200">
                <Settings className="h-5 w-5" />
                <span>Configuración</span>
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
