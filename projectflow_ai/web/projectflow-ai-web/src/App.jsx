import React, { useState } from 'react';
import Home from './pages/Home';
import PublicForm from './pages/PublicForm';
import Login from './pages/Login';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [session, setSession] = useState(null);

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleLoginSuccess = (userSession) => {
    setSession(userSession);
    alert(`Bem-vindo, ${userSession.fullName}! Perfil: ${userSession.role.toUpperCase()}`);
    setCurrentPage('home'); // Redirecionará futuramente para o Dashboard
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {currentPage === 'home' && (
        <Home onNavigate={handleNavigate} userSession={session} />
      )}
      
      {currentPage === 'public-form' && (
        <PublicForm onBack={() => setCurrentPage('home')} />
      )}
      
      {currentPage === 'login' && (
        <Login 
          onBack={() => setCurrentPage('home')} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}