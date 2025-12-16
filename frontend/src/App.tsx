import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import { PageLoader } from './components/ui/PageLoader';

// Lazy load de páginas para code-splitting
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const EntitiesPage = lazy(() => import('./pages/EntitiesPage'));
const PatientsPage = lazy(() => import('./pages/PatientsPage'));
const MedicosPage = lazy(() => import('./pages/MedicosPage'));
const AgendasPage = lazy(() => import('./pages/AgendasPage'));
const CitasPage = lazy(() => import('./pages/CitasPage'));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors expand={false} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/entities"
            element={
              <ProtectedRoute>
                <EntitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <PatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medicos"
            element={
              <ProtectedRoute>
                <MedicosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agendas"
            element={
              <ProtectedRoute>
                <AgendasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citas"
            element={
              <ProtectedRoute>
                <CitasPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
};

export default App;
