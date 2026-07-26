import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Search, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function ProjectSearch({ onBack }) {
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmails, setShowEmails] = useState(false);
  const [showTitles, setShowTitles] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, insira um email válido.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: supaError } = await supabase
        .from('project_public_forms')
        .select('id, title, contact_email, status, department, created_at')
        .eq('contact_email', email.trim().toLowerCase())
        .order('created_at', { ascending: false });

      if (supaError) throw supaError;

      setProjects(data || []);
      setEmailSubmitted(true);
    } catch (err) {
      setError('Erro ao buscar projetos. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [user, domain] = email.split('@');
    if (!user || !domain) return email;
    const maskedUser = user.charAt(0) + '*'.repeat(Math.max(user.length - 1, 3));
    return `${maskedUser}@${domain}`;
  };

  const maskTitle = (title) => {
    if (!title) return '';
    if (title.length <= 3) return title.charAt(0) + '**';
    return title.charAt(0) + '*'.repeat(title.length - 2) + title.charAt(title.length - 1);
  };

  const getStatusStyle = (status) => {
    const map = {
      'Pendente': 'bg-amber-950/40 text-amber-400 border-amber-800',
      'Em_Analise_IA': 'bg-cyan-950/40 text-cyan-400 border-cyan-800',
      'Aprovado_PO': 'bg-emerald-950/40 text-emerald-400 border-emerald-800',
      'Rejeitado': 'bg-rose-950/40 text-rose-400 border-rose-800',
    };
    return map[status] || 'bg-slate-800 text-slate-400 border-slate-700';
  };

  const getStatusLabel = (status) => {
    const map = {
      'Pendente': 'Pendente',
      'Em_Analise_IA': 'Em Análise IA',
      'Aprovado_PO': 'Aprovado pelo PO',
      'Rejeitado': 'Rejeitado',
    };
    return map[status] || status;
  };

  // ─── TELA DE SOLICITAÇÃO DE EMAIL ───
  if (!emailSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
        {/* Header */}
        <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-lg text-slate-950 shadow-lg shadow-cyan-500/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
              <span className="font-bold text-white tracking-tight">
                ProjectFlow<span className="text-cyan-400">.AI</span>
              </span>
            </div>
            <div className="w-20" />
          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Consultar Meus Projetos</h1>
              <p className="text-slate-400 text-sm">
                Digite o email utilizado no cadastro para visualizar suas ideias e projetos.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email de Cadastro
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@empresa.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-950/30 border border-rose-800/50 rounded-lg text-rose-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Consultar Projetos
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-600 mt-6">
              Seus dados estão protegidos. Apenas você pode visualizar seus projetos.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ─── TELA DE RESULTADOS (TABELA) ───
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      {/* Header */}
      <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-lg text-slate-950 shadow-lg shadow-cyan-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
            </div>
            <span className="font-bold text-white tracking-tight">
              ProjectFlow<span className="text-cyan-400">.AI</span>
            </span>
          </div>
          <button
            onClick={() => {
              setEmailSubmitted(false);
              setEmail('');
              setProjects([]);
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Trocar Email
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Título e controles de privacidade */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-white">Meus Projetos e Ideias</h1>
              <p className="text-sm text-slate-400 mt-1">
                {projects.length} {projects.length === 1 ? 'registro encontrado' : 'registros encontrados'} para o email informado
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEmails(!showEmails)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  showEmails
                    ? 'bg-cyan-950/40 text-cyan-400 border-cyan-700'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                }`}
              >
                {showEmails ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                Email
              </button>
              <button
                onClick={() => setShowTitles(!showTitles)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  showTitles
                    ? 'bg-cyan-950/40 text-cyan-400 border-cyan-700'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                }`}
              >
                {showTitles ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                Projeto
              </button>
            </div>
          </div>

          {/* Tabela */}
          {projects.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-slate-500" />
              </div>
              <h3 className="text-slate-300 font-medium mb-1">Nenhum projeto encontrado</h3>
              <p className="text-slate-500 text-sm">
                Não há ideias ou projetos cadastrados com este email.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Protocolo
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Nome / Solicitante
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Projeto / Ideia
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Setor
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {projects.map((project) => (
                      <tr
                        key={project.id}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded-md border border-cyan-900/50">
                            {project.id?.slice(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-slate-300 font-medium">
                            {maskEmail(project.contact_email).split('@')[0]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono text-slate-400">
                            {showEmails ? project.contact_email : maskEmail(project.contact_email)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-slate-200 font-medium">
                            {showTitles ? project.title : maskTitle(project.title)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-slate-400">{project.department || '-'}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusStyle(project.status)}`}>
                            {getStatusLabel(project.status)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-slate-500 text-xs">
                            {project.created_at
                              ? new Date(project.created_at).toLocaleDateString('pt-BR')
                              : '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Legenda de privacidade */}
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
            <EyeOff className="w-3.5 h-3.5" />
            <span>
              Os campos de email e nome do projeto são mascarados por padrão para proteger sua privacidade.
              Use os botões acima da tabela para revelar os dados.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}