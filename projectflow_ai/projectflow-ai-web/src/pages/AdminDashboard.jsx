import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Users, Activity, Layers, Calendar, 
  CheckCircle2, Clock, Sparkles, Building2, ShieldAlert, 
  X, Check, ArrowRight, ArrowUpDown, Filter, User, 
  AlertTriangle, ChevronRight, Eye, UserPlus
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AdminDashboard({ userSession, metrics, projects, onRefresh }) {
  // --- ESTADOS DE FILTRO PARA A LISTA DE IDEIAS ---
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState('ALL');

  // --- ESTADO DO DRAWER DE DETALHES DA IDEIA ---
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // --- ESTADOS DE MODAIS EXCLUSIVOS DO ADMIN ---
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  
  const [newUser, setNewUser] = useState({
    email: '',
    fullName: '',
    role: 'Desenvolvedor',
    department: 'TI'
  });
  const [userMsg, setUserMsg] = useState('');

  // Pendentes de aprovação
  const pendingApprovals = useMemo(() => {
    return (projects || []).filter(p => ['Pendente', 'Em Análise'].includes(p.status));
  }, [projects]);

  // Lista de usuários para o filtro de ideias
  const userList = useMemo(() => {
    const users = (projects || []).map(p => p.created_by_name || p.assigned_to_name || 'Usuário').filter(Boolean);
    return Array.from(new Set(users));
  }, [projects]);

  // Filtragem e ordenação do Top 10 Ideias
  const processedIdeas = useMemo(() => {
    let list = [...(projects || [])];

    if (selectedStatus !== 'ALL') {
      list = list.filter(item => item.status === selectedStatus);
    }

    if (selectedUser !== 'ALL') {
      list = list.filter(item => (item.created_by_name || item.assigned_to_name) === selectedUser);
    }

    list.sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || 0);
      const dateB = new Date(b.created_at || b.updated_at || 0);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return list.slice(0, 10);
  }, [projects, selectedStatus, selectedUser, sortOrder]);

  const handleOpenDrawer = (idea) => {
    setSelectedIdea(idea);
    setIsDrawerOpen(true);
    // Bloqueia scroll do body quando drawer abre
    document.body.style.overflow = 'hidden';
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    document.body.style.overflow = '';
    setTimeout(() => setSelectedIdea(null), 300);
  };

  const checkIfOverdue = (dueDate, status) => {
    if (!dueDate || status === 'Concluído') return false;
    return new Date(dueDate) < new Date();
  };

  // --- APROVAR/REJEITAR DIRETO DO DRAWER ---
  const handleDrawerAction = async (newStatus) => {
    if (!selectedIdea) return;
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus, updated_at: new Date() })
        .eq('id', selectedIdea.id);

      if (error) throw error;
      
      setSelectedIdea(prev => ({ ...prev, status: newStatus }));
      if (onRefresh) onRefresh();
      
      setTimeout(() => handleCloseDrawer(), 600);
    } catch (err) {
      console.error('Erro ao atualizar status:', err.message);
    }
  };

  // --- CADASTRO DE NOVO USUÁRIO ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserMsg('Processando...');
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: 'TempPassword@123',
        options: {
          data: { full_name: newUser.fullName }
        }
      });

      if (authError) throw authError;

      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            full_name: newUser.fullName,
            role: newUser.role,
            department: newUser.department,
            updated_at: new Date()
          });

        if (profileError) throw profileError;
      }

      setUserMsg('Usuário cadastrado com sucesso!');
      setNewUser({ email: '', fullName: '', role: 'Desenvolvedor', department: 'TI' });
      setTimeout(() => { setShowUserModal(false); setUserMsg(''); }, 1500);
    } catch (err) {
      setUserMsg(`Erro: ${err.message}`);
    }
  };

  const handleApproveProject = async (projectId, newStatus) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus, updated_at: new Date() })
        .eq('id', projectId);

      if (error) throw error;
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Erro ao atualizar status:', err.message);
    }
  };

  const ganttProjects = (projects || []).slice(0, 4).map((p, idx) => ({
    name: p.title || `Projeto ${idx + 1}`,
    dept: p.department || 'Geral',
    startCol: (idx % 3) + 1,
    spanCol: (idx % 4) + 3,
    status: p.status || 'Em Andamento',
    progress: p.status === 'Concluído' ? 100 : p.status === 'Em Andamento' ? 65 : 25,
    color: idx % 2 === 0 ? 'from-cyan-500 to-blue-600' : 'from-indigo-500 to-purple-600'
  }));

  return (
    <div className="space-y-8 animate-fadeIn relative">
      
      {/* CABEÇALHO COM AÇÕES DO ADMIN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" /> Painel Executivo
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Visão geral da governança, ideias submetidas e controle de acessos.</p>
        </div>

        {/* BOTAO EXCLUSIVO DO ADMIN PARA CADASTRO DE USUARIO */}
        <button
          onClick={() => setShowUserModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Cadastrar Usuário
        </button>
      </div>

      {/* 1. KPIS SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Demandas Submetidas</p>
              <h3 className="text-3xl font-black text-white mt-1">{(metrics || {}).totalProjects || 0}</h3>
            </div>
            <span className="p-2.5 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-800">
              <Layers className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-end justify-between">
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +14% no mês
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Em Análise / Pendentes</p>
              <h3 className="text-3xl font-black text-amber-400 mt-1">{pendingApprovals.length}</h3>
            </div>
            <span className="p-2.5 bg-amber-950 text-amber-400 rounded-xl border border-amber-800">
              <ShieldAlert className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-end justify-between">
            <span className="text-[11px] text-amber-300 font-semibold">Aprovações Pendentes</span>
            <button 
              onClick={() => setShowApprovalModal(true)}
              className="text-xs text-cyan-400 hover:underline font-bold cursor-pointer"
            >
              Resolver Agora &rarr;
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Concluídos</p>
              <h3 className="text-3xl font-black text-emerald-400 mt-1">{(metrics || {}).completed || 0}</h3>
            </div>
            <span className="p-2.5 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
              <Activity className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-end justify-between">
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Alta Produtividade
            </span>
          </div>
        </div>
      </div>

      {/* 2. PAINEL CENTRAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* IDEIAS & ATIVIDADES DO SISTEMA COM FILTROS NO TOPO */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-col space-y-3 mb-4 pb-3 border-b border-slate-800/80">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Atividades Recentes & Ideias
                </h3>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
                  Top 10
                </span>
              </div>

              {/* FILTROS E ORDENAÇÃO */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  title="Organizar por Data"
                  className="flex items-center justify-center gap-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-semibold text-slate-300 py-1.5 px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  {sortOrder === 'desc' ? 'Mais Novas' : 'Mais Antigas'}
                </button>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-[10px] font-semibold text-slate-300 py-1.5 px-2 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="ALL">Status</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Em Análise">Em Análise</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                </select>

                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-[10px] font-semibold text-slate-300 py-1.5 px-2 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer truncate"
                >
                  <option value="ALL">Usuário</option>
                  {userList.map((usr, i) => (
                    <option key={i} value={usr}>{usr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* LISTA DAS IDEIAS */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {processedIdeas.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-8">Nenhuma ideia encontrada.</p>
              ) : (
                processedIdeas.map((item) => {
                  const isOverdue = checkIfOverdue(item.due_date, item.status);
                  return (
                    <div 
                      key={item.id} 
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex justify-between items-center group"
                    >
                      <div className="overflow-hidden pr-2">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate">{item.title}</p>
                          {isOverdue && (
                            <span className="text-[9px] bg-rose-950 text-rose-400 border border-rose-800 px-1.5 py-0.5 rounded font-bold uppercase">
                              Atrasado
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            item.status === 'Concluído' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                            item.status === 'Em Andamento' ? 'bg-blue-950 text-blue-400 border-blue-800' :
                            'bg-amber-950 text-amber-400 border-amber-800'
                          }`}>
                            {item.status || 'Pendente'}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate">
                            {item.created_by_name || 'Autor Desconhecido'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenDrawer(item)}
                        title="Ver Detalhes da Ideia"
                        className="p-2 bg-slate-900 hover:bg-cyan-950 text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-cyan-800 rounded-lg transition-all flex-shrink-0 cursor-pointer shadow"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ROADMAP GANTT */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" /> Roadmap Executivo (Gantt)
                </h3>
                <p className="text-xs text-slate-400">Cronograma de acompanhamento macro.</p>
              </div>
            </div>

            <div className="space-y-4 overflow-x-auto pb-2">
              <div className="grid grid-cols-8 gap-2 min-w-[500px] border-b border-slate-800 pb-2 text-[10px] font-mono text-slate-400 uppercase text-center">
                <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span>
              </div>

              {ganttProjects.map((p, idx) => (
                <div key={idx} className="min-w-[500px] space-y-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.progress}%</span>
                  </div>
                  <div className="grid grid-cols-8 gap-2 h-7 bg-slate-950 rounded-lg p-1 border border-slate-800/80 items-center">
                    <div 
                      className={`h-full rounded-md bg-gradient-to-r ${p.color} shadow-md flex items-center px-2 text-[10px] font-bold text-slate-950 truncate`}
                      style={{ gridColumnStart: p.startCol, gridColumnEnd: `span ${p.spanCol}` }}
                    >
                      {p.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* DRAWER LATERAL - VERSÃO SIMPLIFICADA       */}
      {/* ========================================== */}
      {isDrawerOpen && selectedIdea && (
        <>
          {/* Overlay escuro - z-40 para ficar abaixo do drawer */}
          <div 
            className="fixed inset-0 bg-black/60 z-40"
            style={{ backdropFilter: 'blur(4px)' }}
            onClick={handleCloseDrawer}
          />
          
          {/* Painel lateral - z-50 para ficar acima de tudo */}
          <div 
            className="fixed inset-y-0 left-0 w-full max-w-md bg-slate-900 border-r border-slate-800 shadow-2xl z-50 flex flex-col"
            style={{ maxHeight: '100vh' }}
          >
            {/* Conteúdo scrollável */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* CABEÇALHO */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-cyan-950 text-cyan-400 rounded-lg border border-cyan-800">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-white">Detalhes da Demanda</h3>
                </div>
                <button 
                  onClick={handleCloseDrawer}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* TÍTULO E STATUS */}
              <div className="space-y-2">
                <h2 className="text-lg font-extrabold text-white leading-tight">{selectedIdea.title}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    selectedIdea.status === 'Concluído' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                    selectedIdea.status === 'Em Andamento' ? 'bg-blue-950 text-blue-400 border-blue-800' :
                    selectedIdea.status === 'Cancelado' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                    'bg-amber-950 text-amber-400 border-amber-800'
                  }`}>
                    {selectedIdea.status || 'Pendente'}
                  </span>

                  {checkIfOverdue(selectedIdea.due_date, selectedIdea.status) ? (
                    <span className="px-2.5 py-1 bg-rose-950 text-rose-400 border border-rose-800 text-xs font-bold rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Em Atraso
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-950 text-emerald-400 border border-slate-800 text-xs font-semibold rounded-full">
                      No Prazo
                    </span>
                  )}
                </div>
              </div>

              {/* DESCRIÇÃO */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Descrição</p>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedIdea.description || 'Sem descrição.'}
                </p>
              </div>

              {/* INFORMAÇÕES */}
              <div className="space-y-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Autor:</span>
                  <span className="text-xs font-semibold text-white">
                    {selectedIdea.created_by_name || selectedIdea.assigned_to_name || 'Não informado'}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Último Aprovador:</span>
                  <span className="text-xs font-bold text-cyan-400">
                    {selectedIdea.last_approver_name || selectedIdea.approved_by || 'Aguardando'}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Departamento:</span>
                  <span className="text-xs font-semibold text-white">
                    {selectedIdea.department || 'Geral'}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Data de Criação:</span>
                  <span className="text-xs font-mono text-slate-300">
                    {selectedIdea.created_at ? new Date(selectedIdea.created_at).toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
              </div>

              {/* ATIVIDADE KANBAN */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Última Atividade no Kanban
                </p>
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">
                    {selectedIdea.last_kanban_activity || 'Movido para análise'}
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    {selectedIdea.updated_at ? new Date(selectedIdea.updated_at).toLocaleString('pt-BR') : 'Recentemente'}
                  </span>
                </div>
              </div>
            </div>

            {/* BOTÕES DE AÇÃO - FIXOS NO RODAPÉ */}
            <div className="border-t border-slate-800 p-6 space-y-3 bg-slate-900">
              
              {/* Aprovar/Rejeitar só aparecem se ainda estiver pendente/em análise */}
              {(selectedIdea.status === 'Pendente' || selectedIdea.status === 'Em Análise') && (
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleDrawerAction('Em Andamento')}
                    className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Aprovar
                  </button>
                  <button 
                    onClick={() => handleDrawerAction('Cancelado')}
                    className="flex items-center justify-center gap-2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" /> Rejeitar
                  </button>
                </div>
              )}

              {/* Se já estiver concluído, mostra apenas reabrir */}
              {selectedIdea.status === 'Concluído' && (
                <button 
                  onClick={() => handleDrawerAction('Em Andamento')}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Reabrir Demanda
                </button>
              )}

              <button 
                onClick={handleCloseDrawer}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Fechar Painel
              </button>
            </div>

          </div>
        </>
      )}

      {/* MODAL: CADASTRO DE NOVO USUÁRIO (EXCLUSIVO ADMIN) */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" /> Cadastrar Novo Usuário
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">E-mail Corporativo</label>
                <input 
                  type="email" 
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Papel (Role)</label>
                  <select 
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Desenvolvedor">Desenvolvedor</option>
                    <option value="PO">PO</option>
                    <option value="Scrum Master">Scrum Master</option>
                    <option value="Teste">Teste</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Departamento</label>
                  <input 
                    type="text" 
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {userMsg && <p className="text-xs text-cyan-400 font-semibold text-center">{userMsg}</p>}

              <button 
                type="submit"
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Salvar Perfil no Supabase
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CENTRAL DE APROVAÇÕES */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" /> Central de Aprovações
              </h3>
              <button onClick={() => setShowApprovalModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {pendingApprovals.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-8">Nenhuma demanda pendente de aprovação.</p>
              ) : (
                pendingApprovals.map((p) => (
                  <div key={p.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-white">{p.title}</p>
                      <p className="text-[11px] text-slate-400">{p.description}</p>
                      <span className="text-[10px] text-cyan-400 font-mono mt-1 inline-block">Setor: {p.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleApproveProject(p.id, 'Em Andamento')}
                        className="p-2 bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Aprovar
                      </button>
                      <button 
                        onClick={() => handleApproveProject(p.id, 'Cancelado')}
                        className="p-2 bg-rose-950 text-rose-400 hover:bg-rose-900 border border-rose-800 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}