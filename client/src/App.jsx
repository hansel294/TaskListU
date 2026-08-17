import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

function RutaPrivada({ children }) {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" />;
}

// Igual que RutaPrivada, pero además exige rol admin. Si un usuario normal
// intenta entrar a /admin escribiendo la URL a mano, lo manda a su dashboard.
function RutaAdmin({ children }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" />;
  if (usuario.rol !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

// Si ya iniciaste sesión, no tiene sentido ver login/registro/landing de nuevo:
// te manda directo al dashboard.
function RutaPublica({ children }) {
  const { usuario } = useAuth();
  return usuario ? <Navigate to="/dashboard" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RutaPublica><Landing /></RutaPublica>} />
      <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />
      <Route path="/registro" element={<RutaPublica><Register /></RutaPublica>} />
      <Route
        path="/dashboard"
        element={
          <RutaPrivada>
            <Dashboard />
          </RutaPrivada>
        }
      />
      <Route
        path="/admin"
        element={
          <RutaAdmin>
            <Admin />
          </RutaAdmin>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
