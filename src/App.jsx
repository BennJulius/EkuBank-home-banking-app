import { useState, useEffect } from 'react';
import Home from './components/cliente/Home';
import Login from './components/cliente/Login';
import Register from './components/cliente/Register';
import Dashboard from './components/cliente/Dashboard';
import LoginEmpleado from './components/asesor/LoginEmpleado';
import CoreDashboard from './components/asesor/CoreDashboard';
import TarjetaView from './components/cliente/TarjetaView';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userData, setUserData] = useState(null);
  const [empleadoData, setEmpleadoData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('ekubank_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserData(parsed);
        setCurrentView('dashboard_cliente');
      } catch { localStorage.removeItem('ekubank_session'); }
    }
  }, []);

  const goToHome = () => setCurrentView('home');
  const goToLogin = () => setCurrentView('login_cliente');
  const goToRegister = () => setCurrentView('register');
  const goToLoginEmpleado = () => setCurrentView('login_empleado');
  const goToTarjetaInfo = () => setCurrentView('tarjeta_info');
  const goToTarjetaSolicitud = () => setCurrentView('tarjeta_solicitud');

  const handleLoginSuccess = (data) => {
    setUserData(data);
    localStorage.setItem('ekubank_session', JSON.stringify(data));
    setCurrentView('dashboard_cliente');
  };

  const handleLogout = () => {
    if (userData?.token) {
      fetch('https://ekubank.ekubyte.net.pe/api/controllers/AuthController.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout', token: userData.token }),
      }).catch(() => {});
    }
    setUserData(null);
    localStorage.removeItem('ekubank_session');
    setCurrentView('home');
  };

  const handleEmpleadoLogin = (data) => {
    setEmpleadoData(data);
    setCurrentView('core_asesor');
  };

  const handleEmpleadoLogout = () => {
    if (empleadoData?.token) {
      fetch('https://ekubank.ekubyte.net.pe/api/controllers/AuthController.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout', token: empleadoData.token }),
      }).catch(() => {});
    }
    setEmpleadoData(null);
    setCurrentView('home');
  };

  return (
    <>
      {currentView === 'home' && (
        <Home
          onNavigateToLogin={goToLogin}
          onNavigateToEmpleado={goToLoginEmpleado}
          onNavigateToTarjetaInfo={goToTarjetaInfo}
          onNavigateToTarjetaSolicitud={goToTarjetaSolicitud}
        />
      )}
      {currentView === 'tarjeta_info' && (
        <TarjetaView mode="info" onNavigateToHome={goToHome} onNavigateToLogin={goToLogin} />
      )}
      {currentView === 'tarjeta_solicitud' && (
        <TarjetaView mode="solicitud" onNavigateToHome={goToHome} onNavigateToLogin={goToLogin} />
      )}
      {currentView === 'login_cliente' && (
        <Login onNavigateToHome={goToHome} onNavigateToRegister={goToRegister} onLoginSuccess={handleLoginSuccess} />
      )}
      {currentView === 'register' && (
        <Register onNavigateToLogin={goToLogin} />
      )}
      {currentView === 'dashboard_cliente' && (
        <Dashboard user={userData} onLogout={handleLogout} />
      )}
      {currentView === 'login_empleado' && (
        <LoginEmpleado onLoginSuccess={handleEmpleadoLogin} onNavigateToHome={goToHome} />
      )}
      {currentView === 'core_asesor' && (
        <CoreDashboard empleado={empleadoData} onLogout={handleEmpleadoLogout} />
      )}
    </>
  );
}

export default App;
