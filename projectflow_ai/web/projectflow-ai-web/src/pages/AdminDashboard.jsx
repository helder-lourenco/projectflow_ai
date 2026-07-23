import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Activity, Layers, ArrowUpRight, 
  Calendar, CheckCircle2, Clock, Sparkles, Building2,
  FileText, ArrowRight, UserPlus, ShieldAlert, X, Check, Search
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AdminDashboard({ userSession, metrics, projects, onRefresh }) {
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  // Form de novo usuário
  const [newUser, setNewUser] = useState({
    email: '',
    fullName: '',
    role: 'Desenvolvedor',
    department: 'TI'
  });
  const [userMsg, setUserMsg] = useState('');

  useEffect(() => {
    fetchPendingApprovals();
  }, [projects]);

  // Busca demandas pendentes para aprovação executiva
  const fetchPendingApprovals = () => {
    const pendings = projects.filter(p => ['Pendente', 'Em Análise'].includes(p.status));
    setPendingApprovals(pendings);
  };

  // Aprovar ou Rejeitar Projeto direto no Supabase
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

  // Cadastrar perfil no banco (Gera o convite/registro na tabela profiles)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserMsg('Processando...');
    try {
      // 1. Cria usuário via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: 'TempPassword@123', // Senha provisória
        options: {
          data: { full_name: newUser.fullName }
        }
      });

      if (authError) throw authError;

      if (authData?.user) {
        // 2. Insere/Atualiza na tabela profiles
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

  const ganttProjects = projects.slice(0, 4).map((p, idx) => ({
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
      
      {/* KPIS SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Demandas Submetidas</p>
              <h3 className="text-3xl font-black text-white mt-1">{metrics.totalProjects || 0}</h3>
            </div>
            <span className="p-2.5 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-800">
              <Layers className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-end justify-between">
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +14% no mês
            </span>
            <svg className="w-24 h-8 text-cyan-500" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M0 25 Q 15 5, 30 20 T 60 10 T 90 22 T 100 5" strokeLinecap="round" />
            </svg>
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
              className="text-xs text-cyan-400 hover:underline font-bold"
            >
              Resolver Agora &rarr;
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Concluídos</p>
              <h3 className="text-3xl font-black text-emerald-400 mt-1">{metrics.completed || 0}</h3>
            </div>
            <span className="p-2.5 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
              <Activity className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-end justify-between">
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Alta Produtividade
            </span>
            <svg className="w-24 h-8 text-emerald-400" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M0 20 Q 25 5, 50 18 T 75 8 T 100 15" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* PAINEL CENTRAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Atividade Padrão */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Atividade Recente do Sistema
            </h3>

            <div className="space-y-3">
              {projects.slice(0, 4).map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-white">{item.title}</p>
                    <p className="text-[10px] text-slate-400">{item.department || 'Geral'} • {item.status}</p>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                    Score: {item.ai_score || 80}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setShowUserModal(true)}
            className="w-full mt-4 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10"
          >
            <UserPlus className="w-4 h-4" /> Cadastrar Novo Usuário
          </button>
        </div>

        {/* ROADMAP GANTT */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" /> Roadmap Executivo (Gantt)
                </h3>
                <p className="text-xs text-slate-400">Cronograma sincronizado em tempo real com o Supabase.</p>
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

      {/* MODAL: APROVAÇÕES PENDENTES */}
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

      {/* MODAL: CADASTRO DE USUÁRIOS */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" /> Cadastrar Novo Usuário
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white">
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
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

    </div>
  );
}