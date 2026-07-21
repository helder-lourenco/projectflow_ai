import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LogIn, ArrowLeft, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

export default function Login({ onBack, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Autentica no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Busca o papel (role) do usuário na tabela profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.warn("Perfil não encontrado, usando padrão 'user'");
      }

      const userSession = {
        user: authData.user,
        role: profile?.role || 'user',
        fullName: profile?.full_name || email
      };

      if (onLoginSuccess) {
        onLoginSuccess(userSession);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Falha na autenticação. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Elementos decorativos de fundo */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        
        {/* Botão Voltar */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para a Home
        </button>

        {/* Card do Login */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-xl text-slate-950 mb-2">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-bold text-white">ProjectFlow AI</h2>
            <p className="text-xs text-slate-400">Acesso Restrito para POs, Devs e Gestores</p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input 
                  type="email"
                  required
                  placeholder="usuario@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-cyan-500/20"
            >
              {loading ? 'Autenticando...' : <><LogIn className="w-4 h-4" /> Entrar no Painel</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}