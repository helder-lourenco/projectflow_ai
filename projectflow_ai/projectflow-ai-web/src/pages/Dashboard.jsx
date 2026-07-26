import React, { useState, useEffect } from 'react';
import KanbanBoard from './KanbanBoard';
import AdminDashboard from './AdminDashboard';
import { supabase } from '../supabaseClient';
import { 
  FolderKanban, CheckCircle2, Clock, AlertTriangle, 
  Search, LogOut, ChevronRight, Cpu, Building2,
  LayoutDashboard, Shield, RefreshCw, Menu, X, Sparkles,
  Bell, UserPlus, ShieldCheck
} from 'lucide-react';

export default function Dashboard({ userSession, profile, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ totalProjects: 0, inProgress: 0, pendingApproval: 0, completed: 0 });
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // NOTIFICAÇÕES (GLOBAL PARA TODOS OS DASHBOARDS)
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Nova demanda registrada no sistema', time: 'Há 10 min', unread: true },
    { id: 2, title: 'Seu perfil foi validado via Supabase Auth', time: 'Há 1h', unread: true },
    { id: 3, title: 'Atualização de status na fila de execução', time: 'Há 3h', unread: false },
  ]);

  const userId = userSession?.id;
  const userName = profile?.full_name || userSession?.fullName || 'Usuário';
  const userRole = (profile?.role || userSession?.role || 'desenvolvedor').toLowerCase().trim();
  const userDepartment = profile?.department || userSession?.department || 'TI';

  const isAdmin = userRole === 'administrador' || userRole === 'admin';

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId, userRole, userDepartment]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      let query = supabase.from('projects').select('*');

      if (!isAdmin) {
        if (['desenvolvedor', 'po', 'scrum master', 'teste'].includes(userRole)) {
          query = query.or(`assigned_to.eq.${userId},created_by.eq.${userId}`);
        } else if (['coordenador', 'gestor', 'diretor'].includes(userRole)) {
          query = query.eq('department', userDepartment);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      const projectList = data || [];

      setMetrics({
        totalProjects: projectList.length,
        inProgress: projectList.filter(p => p.status === 'Em Andamento').length,
        pendingApproval: projectList.filter(p => ['Pendente', 'Em Análise'].includes(p.status)).length,
        completed: projectList.filter(p => p.status === 'Concluído').length
      });

      setProjects(projectList);
    } catch (err) {
      console.error('Erro ao carregar dados:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex overflow-hidden">
      
      {/* SIDEBAR / DRAWER LATERAL */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900/95 border-r border-slate-800/80 transition-all duration-300 flex flex-col z-40 relative`}>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-xl text-slate-950 flex-shrink-0 shadow-lg shadow-cyan-500/20">
              <Cpu className="w-5 h-5 stroke-[2.5]" />
            </div>
            {sidebarOpen && (
              <span className="font-extrabold text-white text-base tracking-tight whitespace-nowrap">
                ProjectFlow<span className="text-cyan-400">.AI</span>
              </span>
            )}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden sm:block cursor-pointer"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* MENU COMPLETO */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {sidebarOpen && (
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Navegação
            </p>
          )}

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="truncate">{isAdmin ? 'Painel Executivo' : 'Painel Geral'}</span>}
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FolderKanban className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && (
              <div className="flex items-center justify-between w-full">
                <span className="truncate">Demandas</span>
                <span className="px-2 py-0.5 text-[10px] bg-slate-800 text-cyan-400 rounded-full font-mono">
                  {metrics.totalProjects}
                </span>
              </div>
            )}
          </button>

          {/* BOTÕES ADICIONAIS: EXCLUSIVOS APENAS DO PAINEL ADMINISTRADOR */}
          {isAdmin && (
            <>
              {sidebarOpen && (
                <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-4 mb-2">
                  Gestão Admin
                </p>
              )}

              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <UserPlus className="w-4 h-4 flex-shrink-0 text-cyan-400" />
                {sidebarOpen && <span className="truncate">Cadastrar Usuários</span>}
              </button>

              <button
                onClick={() => setActiveTab('approvals')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'approvals'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-amber-400" />
                {sidebarOpen && (
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">Aprovações</span>
                    {metrics.pendingApproval > 0 && (
                      <span className="px-2 py-0.5 text-[10px] bg-amber-950 text-amber-400 border border-amber-800 rounded-full font-mono font-bold">
                        {metrics.pendingApproval}
                      </span>
                    )}
                  </div>
                )}
              </button>
            </>
          )}
        </div>

        {/* PERFIL */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{userName}</p>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] font-bold text-cyan-400 uppercase truncate">{profile?.role || userRole}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* HEADER GLOBAL COM O SINO PARA TODOS OS DASHBOARDS */}
        <header className="h-16 w-full bg-slate-900/60 backdrop-blur border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Privilégio de Acesso:</span>
            <span className="px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 text-[11px] font-mono">
              {isAdmin ? 'Acesso Administrativo / Global' : `Atribuições de ${profile?.role || userRole}`}
            </span>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* SINO DE NOTIFICAÇÕES COM MODAL (VISÍVEL NOS DOIS DASHBOARDS) */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN DO SINO */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-white">Notificações</h4>
                    <span className="text-[10px] text-cyan-400 font-mono">{unreadCount} novas</span>
                  </div>

                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-2.5 rounded-xl text-xs border ${n.unread ? 'bg-slate-950 border-cyan-800/60' : 'bg-slate-900/40 border-slate-800 text-slate-400'}`}>
                        <p className="font-medium text-white">{n.title}</p>
                        <span className="text-[10px] text-slate-500 block mt-1">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={fetchDashboardData}
              title="Recarregar Dados"
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/30 border border-rose-900/50 rounded-xl transition-all font-semibold cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 px-6 lg:px-10 py-8 space-y-8 w-full max-w-[1800px] mx-auto">
          
          {activeTab === 'dashboard' ? (
            isAdmin ? (
              <AdminDashboard 
                userSession={userSession} 
                metrics={metrics} 
                projects={projects}
                onRefresh={fetchDashboardData}
              />
            ) : (
              /* VISÃO PADRÃO / OUTROS PERFIS */
              <>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
                        <Sparkles className="w-4 h-4" /> Visão Operacional Dinâmica
                      </span>
                      <h1 className="text-2xl font-bold text-white">Painel Geral, {userName}</h1>
                      <p className="text-xs text-slate-400 mt-1">Acompanhe e execute suas atribuições com perfil <strong className="text-cyan-400 uppercase">{profile?.role || userRole}</strong>.</p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-slate-300">Departamento: <strong className="text-white">{userDepartment}</strong></span>
                    </div>
                  </div>
                </div>

                {/* KPIS PADRÃO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                    <span className="text-xs font-semibold text-slate-400 uppercase block mb-2">Demandas Totais</span>
                    <h3 className="text-3xl font-extrabold text-white">{metrics.totalProjects}</h3>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                    <span className="text-xs font-semibold text-slate-400 uppercase block mb-2">Em Execução</span>
                    <h3 className="text-3xl font-extrabold text-blue-400">{metrics.inProgress}</h3>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                    <span className="text-xs font-semibold text-slate-400 uppercase block mb-2">Análise / Pendente</span>
                    <h3 className="text-3xl font-extrabold text-amber-400">{metrics.pendingApproval}</h3>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                    <span className="text-xs font-semibold text-slate-400 uppercase block mb-2">Finalizadas</span>
                    <h3 className="text-3xl font-extrabold text-emerald-400">{metrics.completed}</h3>
                  </div>
                </div>

                {/* TABELA DINÂMICA DE PROJETOS */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h2 className="font-bold text-white text-base">Minhas Demandas</h2>
                      <p className="text-xs text-slate-400">Projetos atribuídos diretamente ao seu perfil no banco.</p>
                    </div>

                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input 
                        type="text" 
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="py-4 px-6">Projeto</th>
                          <th className="py-4 px-6">Setor</th>
                          <th className="py-4 px-6">Status</th>
                          <th className="py-4 px-6">Score IA</th>
                          <th className="py-4 px-6 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredProjects.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-4 px-6">
                              <span className="font-semibold text-white block text-sm">{item.title}</span>
                              <span className="text-[11px] text-slate-400 block mt-0.5">{item.description}</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                                {item.department || 'TI'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                                item.status === 'Concluído' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                                item.status === 'Em Andamento' ? 'bg-blue-950 text-blue-400 border-blue-800' :
                                'bg-amber-950 text-amber-400 border-amber-800'
                              }`}>
                                {item.status || 'Pendente'}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-mono font-bold text-cyan-400">{item.ai_score ? `${item.ai_score}%` : 'N/A'}</td>
                            <td className="py-4 px-6 text-right">
                              <button className="p-2 hover:bg-cyan-950 text-slate-400 hover:text-cyan-400 rounded-xl border border-transparent hover:border-cyan-800 transition-all cursor-pointer">
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )
          ) : activeTab === 'projects' ? (
            <KanbanBoard userSession={userSession} profile={profile} />
          ) : (
            <AdminDashboard 
              userSession={userSession} 
              metrics={metrics} 
              projects={projects} 
              onRefresh={fetchDashboardData}
            />
          )}

        </main>
      </div>

    </div>
  );
}