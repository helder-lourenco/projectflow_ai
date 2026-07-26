import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Lightbulb, 
  Rocket, 
  Search, 
  LogIn, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  BarChart2, 
  ShieldCheck, 
  ArrowRight,
  Loader2
} from 'lucide-react';

export default function Home({ onOpenLogin, onOpenForm, onOpenProjectSearch }) {
  const [searchProtocol, setSearchProtocol] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Estados dinâmicos do banco
  const [metrics, setMetrics] = useState({ totalIdeas: 0, inProgress: 0 });
  const [topIdeas, setTopIdeas] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingIdeas, setLoadingIdeas] = useState(true);

  // Buscar métricas e top ideas ao montar o componente
  useEffect(() => {
    fetchMetrics();
    fetchTopIdeas();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Total de ideias (project_public_forms)
      const { count: totalIdeas, error: err1 } = await supabase
        .from('project_public_forms')
        .select('*', { count: 'exact', head: true });

      // Projetos em andamento
      const { count: inProgress, error: err2 } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Em_Andamento');

      if (err1) console.error('Erro ao buscar total de ideias:', err1);
      if (err2) console.error('Erro ao buscar projetos em andamento:', err2);

      setMetrics({
        totalIdeas: totalIdeas || 0,
        inProgress: inProgress || 0
      });
    } catch (err) {
      console.error('Erro nas métricas:', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchTopIdeas = async () => {
    try {
      // Busca os projetos/ideias mais recentes com dados do form vinculado
      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          department,
          type,
          complexity_score,
          status,
          created_at,
          project_public_forms(contact_email)
        `)
        .order('complexity_score', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Mapeia para o formato esperado pela UI
      const mapped = (projects || []).map((proj, idx) => ({
        id: proj.id?.slice(0, 8).toUpperCase() || `PROJ-${8000 + idx}`,
        title: proj.title || 'Sem título',
        department: proj.department || 'Geral',
        score: proj.complexity_score || 50,
        author: proj.project_public_forms?.contact_email?.split('@')[0] || 'Colaborador',
        status: proj.status || 'Em análise',
        description: proj.description || 'Projeto corporativo em avaliação pela governança de inovação.',
        type: proj.type || 'Ideia'
      }));

      setTopIdeas(mapped);
    } catch (err) {
      console.error('Erro ao buscar top ideas:', err);
      // Fallback vazio em caso de erro
      setTopIdeas([]);
    } finally {
      setLoadingIdeas(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchProtocol.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      setSearchResult({
        id: searchProtocol.toUpperCase(),
        title: 'Análise Preditiva para Manutenção de Equipamentos',
        status: 'Aprovado em Comitê',
        type: 'Projeto',
        complexity: 'Média (55/100)',
        updatedAt: '2026-03-28',
        poAssigned: 'Ana Paula (PO)'
      });
      setIsSearching(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900">

      {/* 1. NAVBAR / HEADER CORPORATIVO */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-lg text-slate-950">
            <Sparkles className="h-6 w-6 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
            ProjectFlow <span className="text-cyan-400">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Botão para Nova Ideia */}
          <button 
            onClick={onOpenForm}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 hover:border-cyan-500/50 rounded-lg transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Nova Ideia / Projeto
          </button>

          {/* Botão para Login */}
          <button 
            onClick={onOpenLogin}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Área Restrita (Login)
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-16">

        {/* HERO SECTION */}
        <section className="text-center py-8 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
            <TrendingUp className="w-3.5 h-3.5" />
            Transforme Ideias em Resultados Corporativos
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Sua ideia tem o poder de <br />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              revolucionar o nosso negócio.
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            O <strong>ProjectFlow AI</strong> utiliza Inteligência Artificial para avaliar, estruturar e acelerar suas propostas corporativas. Envie sua ideia e acompanhe a evolução do projeto em tempo real.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {/* Botão Principal no Hero */}
            <button 
              onClick={onOpenForm}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold rounded-lg shadow-xl shadow-cyan-500/15 transition-all text-base cursor-pointer"
            >
              <Lightbulb className="w-5 h-5 fill-slate-950" />
              Cadastrar Nova Ideia
            </button>

            {/* Botão Consultar Status — agora direciona para ProjectSearch */}
            <button 
              onClick={onOpenProjectSearch}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg font-medium transition-all text-base cursor-pointer"
            >
              <Search className="w-5 h-5 text-cyan-400" />
              Consultar Status
            </button>
          </div>
        </section>

        {/* METRICS SECTION — Dados dinâmicos do banco */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 p-8 rounded-xl relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Lightbulb className="w-32 h-32 text-cyan-400" />
            </div>
            <p className="text-sm font-semibold text-cyan-400 tracking-wider uppercase">Ideias Submetidas</p>
            <div className="flex items-baseline gap-4 mt-2">
              {loadingMetrics ? (
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              ) : (
                <span className="text-5xl font-black text-white">{metrics.totalIdeas}</span>
              )}
              <span className="text-xs text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Atualizado agora
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-3">Ideias registradas por colaboradores de todos os setores da empresa.</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 p-8 rounded-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Rocket className="w-32 h-32 text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-indigo-400 tracking-wider uppercase">Projetos em Andamento</p>
            <div className="flex items-baseline gap-4 mt-2">
              {loadingMetrics ? (
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              ) : (
                <span className="text-5xl font-black text-white">{metrics.inProgress}</span>
              )}
              <span className="text-xs text-indigo-300 font-medium bg-indigo-950/60 border border-indigo-800 px-2.5 py-1 rounded-full">
                Em execução ativa
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-3">Projetos aprovados e alocados com POs e desenvolvedores.</p>
          </div>
        </section>

        {/* GOVERNANCE SECTION */}
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 sm:p-10 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-cyan-400" />
              Como Funciona a Governança Inteligente
            </h2>
            <p className="text-slate-400 text-sm">
              Conheça o fluxo simplificado para submissão, análise preditiva por IA e acompanhamento.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-lg border border-cyan-800">
                1
              </div>
              <h3 className="font-semibold text-white text-base">Submissão Rápida</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Preencha o formulário simplificado detalhando a necessidade, o impacto esperado e o setor favorecido.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-800">
                2
              </div>
              <h3 className="font-semibold text-white text-base">Análise por IA (Gemini)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nossa IA classifica automaticamente entre Ideia ou Projeto, estimando prazo, complexidade e alocação.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-800">
                3
              </div>
              <h3 className="font-semibold text-white text-base">Aprovação & Execução</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Product Owners e Gestores revisam os pareceres gerados pela IA e acionam o início do desenvolvimento.
              </p>
            </div>
          </div>
        </section>

        {/* SEARCH SECTION — mantido como está, mas com busca real futura */}
        <section id="consultar" className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="max-w-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              Consultar Status de Ideia ou Projeto
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Insira o código do protocolo fornecido no momento do cadastro (ex: PROJ-8921).
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <input 
              type="text"
              placeholder="Digite o código (ex: PROJ-8921)..."
              value={searchProtocol}
              onChange={(e) => setSearchProtocol(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={isSearching}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSearching ? 'Buscando...' : 'Consultar'}
            </button>
          </form>

          {searchResult && (
            <div className="mt-4 p-5 bg-slate-950 border border-cyan-500/30 rounded-xl space-y-3 max-w-xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-cyan-400 font-semibold">{searchResult.id}</span>
                <span className="text-xs px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full font-medium">
                  {searchResult.status}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-white text-base">{searchResult.title}</h4>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-400">
                  <p><strong className="text-slate-300">Tipo:</strong> {searchResult.type}</p>
                  <p><strong className="text-slate-300">Complexidade IA:</strong> {searchResult.complexity}</p>
                  <p><strong className="text-slate-300">PO Responsável:</strong> {searchResult.poAssigned}</p>
                  <p><strong className="text-slate-300">Atualizado:</strong> {searchResult.updatedAt}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* HIGHLIGHTS SECTION — Dados dinâmicos do banco */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400" />
                Hall da Inovação: Ideias Destaque
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                As propostas corporativas com os maiores índices de viabilidade e impacto técnico gerados pela IA.
              </p>
            </div>
          </div>

          {loadingIdeas ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : topIdeas.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl">
              <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Nenhuma ideia em destaque no momento.</p>
              <p className="text-slate-600 text-xs mt-1">Seja o primeiro a cadastrar uma ideia!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topIdeas.map((idea) => (
                <div 
                  key={idea.id} 
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-6 flex flex-col justify-between transition-all hover:translate-y-[-2px]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">{idea.id}</span>
                      <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Score IA: {idea.score}/100
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-lg leading-snug">{idea.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{idea.description}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span>{idea.author} • <strong className="text-slate-400">{idea.department}</strong></span>
                    <span className="text-cyan-400 font-medium">{idea.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>© 2026 ProjectFlow AI. Governança Inteligente de Projetos & Innovation Center.</p>
      </footer>
    </div>
  );
}