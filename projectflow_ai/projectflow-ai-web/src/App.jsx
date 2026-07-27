import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import PublicForm from './pages/PublicForm';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProjectSearch from './pages/ProjectSearch';
import { supabase } from './supabaseClient';

const ALLOWED_ROLES = ['administrador', 'desenvolvedor', 'po', 'scrum master', 'teste'];
const ADMIN_ROLES = ['administrador'];

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDeniedError, setAccessDeniedError] = useState('');
  const [currentScreen, setCurrentScreen] = useState('home');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        validateAndFetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        validateAndFetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
        setCurrentScreen('home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const validateAndFetchProfile = async (userId) => {
    try {
      setLoading(true);
      setAccessDeniedError('');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao consultar tabela profiles:', error.message);
        await handleUnauthorized('Erro ao validar permissões de acesso.');
        return;
      }

      if (!data) {
        await handleUnauthorized('Acesso negado: Perfil de usuário não encontrado no sistema.');
        return;
      }

      const userRole = data.role ? data.role.toLowerCase().trim() : '';
      const isRoleAllowed = ALLOWED_ROLES.includes(userRole);

      if (!isRoleAllowed) {
        await handleUnauthorized(`Acesso negado: O perfil "${data.role || 'Sem Perfil'}" não possui permissão para acessar o sistema.`);
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error('Falha na validação do perfil:', err);
      await handleUnauthorized('Falha na autenticação do perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnauthorized = async (message) => {
    setAccessDeniedError(message);
    setProfile(null);
    setSession(null);
    await supabase.auth.signOut();
  };

  const handleLogout = async () => {
    setAccessDeniedError('');
    await supabase.auth.signOut();
  };

  const handleLoginSuccess = (userSession) => {
    setAccessDeniedError('');
    setSession({ user: userSession.user });
    setProfile({
      id: userSession.user.id,
      role: userSession.role,
      full_name: userSession.fullName,
      email: userSession.user.email
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-cyan-400 flex flex-col items-center justify-center font-mono text-xs gap-3">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Verificando perfil e permissões de acesso...</span>
      </div>
    );
  }

  if (session && profile) {
    const currentUser = {
      id: session.user?.id || profile.id,
      email: session.user?.email || profile.email,
      fullName: profile.full_name || session.user?.email?.split('@')[0],
      role: profile.role,
      department: profile.department || 'Geral'
    };

    const userRole = (profile.role || '').toLowerCase().trim();
    const isAdmin = ADMIN_ROLES.includes(userRole);

    if (isAdmin) {
      return (
        <AdminDashboard
    /*      userSession={currentUser}
          profile={profile}
          onLogout={handleLogout}
          */
         userSession={session}
        />
      );
    }

    return (
      <Dashboard
        userSession={currentUser}
        profile={profile}
        onLogout={handleLogout}
      />
    );
  }

  if (currentScreen === 'login') {
    return (
      <div className="relative">
        {accessDeniedError && (
          <div className="bg-rose-950/90 border-b border-rose-800 text-rose-200 text-xs py-3 px-4 text-center font-semibold sticky top-0 z-50">
            {accessDeniedError}
          </div>
        )}
        <Login
          onBack={() => {
            setAccessDeniedError('');
            setCurrentScreen('home');
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  if (currentScreen === 'public_form') {
    return (
      <PublicForm
        onBack={() => setCurrentScreen('home')}
      />
    );
  }

  if (currentScreen === 'project_search') {
    return (
      <ProjectSearch
        onBack={() => setCurrentScreen('home')}
      />
    );
  }

  return (
    <Home
      onOpenLogin={() => {
        setAccessDeniedError('');
        setCurrentScreen('login');
      }}
      onOpenForm={() => setCurrentScreen('public_form')}
      onOpenProjectSearch={() => setCurrentScreen('project_search')}
    />
  );
}