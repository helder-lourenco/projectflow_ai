import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import PublicForm from './pages/PublicForm';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { supabase } from './supabaseClient';

// Roles autorizadas a acessar o Dashboard
const ALLOWED_ROLES = ['administrador', 'desenvolvedor', 'po', 'scrum master', 'teste'];

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDeniedError, setAccessDeniedError] = useState('');
  
  // NAVEGAÇÃO DESLOGADO: 'home', 'login' ou 'public_form'
  const [currentScreen, setCurrentScreen] = useState('home');

  useEffect(() => {
    // 1. Obtém sessão ativa ao carregar a aplicação
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        validateAndFetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Escuta mudanças na autenticação
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

  // Busca o profile no Supabase e valida as regras de privilégio/role
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

      // Regra 1: O registro na tabela 'profiles' precisa existir
      if (!data) {
        await handleUnauthorized('Acesso negado: Perfil de usuário não encontrado no sistema.');
        return;
      }

      // Regra 2: A coluna 'role' deve corresponder aos papéis permitidos
      const userRole = data.role ? data.role.toLowerCase().trim() : '';
      const isRoleAllowed = ALLOWED_ROLES.includes(userRole);

      if (!isRoleAllowed) {
        await handleUnauthorized(`Acesso negado: O perfil "${data.role || 'Sem Perfil'}" não possui permissão para acessar o sistema.`);
        return;
      }

      // Se passou em todas as validações, define o perfil ativo
      setProfile(data);
    } catch (err) {
      console.error('Falha na validação do perfil:', err);
      await handleUnauthorized('Falha na autenticação do perfil.');
    } finally {
      setLoading(false);
    }
  };

  // Função para deslogar e exibir mensagem de erro caso o perfil seja inválido
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

  // TELA DE CARREGAMENTO
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-cyan-400 flex flex-col items-center justify-center font-mono text-xs gap-3">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Verificando perfil e permissões de acesso...</span>
      </div>
    );
  }

  // USUÁRIO AUTENTICADO E COM ROLE VÁLIDA
  if (session && profile) {
    const currentUser = {
      id: session.user.id,
      email: session.user.email,
      fullName: profile.full_name || session.user.email.split('@')[0],
      role: profile.role,
      department: profile.department || 'Geral'
    };

    return (
      <Dashboard 
        userSession={currentUser} 
        profile={profile} 
        onLogout={handleLogout} 
      />
    );
  }

  // TELA DE LOGIN (Mostra mensagem caso tenha sido bloqueado por role)
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
          onLoginSuccess={(userSession) => {
            setAccessDeniedError('');
            setSession(userSession.user);
          }}
        />
      </div>
    );
  }

  // FORMULÁRIO PÚBLICO
  if (currentScreen === 'public_form') {
    return (
      <PublicForm 
        onBack={() => setCurrentScreen('home')} 
      />
    );
  }

  // HOME PADRÃO
  return (
    <Home 
      onOpenLogin={() => {
        setAccessDeniedError('');
        setCurrentScreen('login');
      }} 
      onOpenForm={() => setCurrentScreen('public_form')} 
    />
  );
}