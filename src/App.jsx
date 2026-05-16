import { useState } from 'react';
import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userData, setUserData] = useState(null); // Guardará los datos si el login es exitoso

  // Funciones de navegación
  const goToLogin = () => setCurrentView('login');
  const goToHome = () => setCurrentView('home');
  const handleLoginSuccess = (data) => {
    setUserData(data);
    setCurrentView('dashboard'); // Redirige al dashboard [cite: 56]
  };
  const handleLogout = () => {
    setUserData(null);
    setCurrentView('home');
  };

  return (
    <>
      {currentView === 'home' && <Home onNavigateToLogin={goToLogin} />}
      {currentView === 'login' && <Login onNavigateToHome={goToHome} onLoginSuccess={handleLoginSuccess} />}
      {currentView === 'dashboard' && <Dashboard user={userData} onLogout={handleLogout} />}
    </>
  );
}

export default App;