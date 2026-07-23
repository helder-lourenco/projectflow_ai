import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Plus, Calendar, Clock, ArrowRight, AlertCircle, 
  MoreVertical, CheckCircle2, AlertTriangle, PauseCircle, 
  XCircle, PlayCircle, ShieldAlert, RefreshCw, Send
} from 'lucide-react';

// Configuração das 7 colunas do Kanban com estilos visuais
const COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: 'border-slate-700 bg-slate-900/40 text-slate-300' },
  { id: 'em_andamento', label: 'Em Andamento', color: 'border-blue-500/40 bg-blue-950/20 text-blue-400' },
  { id: 'aguardando_terceiros', label: 'Aguardando Terceiros', color: 'border-amber-500/40 bg-amber-950/20 text-amber-400' },
  { id: 'teste', label: 'Em Teste', color: 'border-purple-500/40 bg-purple-950/20 text-purple-400' },
  { id: 'concluida', label: 'Concluída', color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400' },
  { id: 'pausada', label: 'Pausada', color: 'border-orange-500/40 bg-orange-950/20 text-orange-400' },
  { id: 'descontinuada', label: 'Descontinuada', color: 'border-rose-500/40 bg-rose-950/20 text-rose-400' },
];

export default function KanbanBoard({ userSession }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectForDate, setSelectedProjectForDate] = useState(null);
  const [newTargetDate, setNewTargetDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = userSession?.id;
  const userRole = userSession?.role?.toLowerCase() || 'dev';

  useEffect(() => {
    fetchKanbanProjects();
  }, [userId, userRole]);

  // Busca os projetos atribuídos ao Dev (ou todos para Perfis de Gestão)
  const fetchKanbanProjects = async () => {
    setLoading(true);
    try {
      let query = supabase.from('projects').select('*');

      if (['dev', 'po', 'scrum'].includes(userRole)) {
        query = query.or(`assigned_to.eq.${userId},created_by.eq.${userId}`);
      } else if (['coordenador', 'gestor'].includes(userRole)) {
        query = query.eq('department', userSession?.department || 'TI');
      }

      const { data, error } = await query;
      if (error) throw error;

      setProjects(data || []);
    } catch (err) {
      console.error('Erro ao buscar demandas para o Kanban:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Move o card para o próximo status
  const handleAdvanceStatus = async (project, currentStatus) => {
    const statusOrder = ['backlog', 'em_andamento', 'aguardando_terceiros', 'teste', 'concluida'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentIndex === -1 || currentIndex >= statusOrder.length - 1) return;

    const nextStatus = statusOrder[currentIndex + 1];

    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: nextStatus, updated_at: new Date() })
        .eq('id', project.id);

      if (error) throw error;

      // Atualiza o estado local imediatamente
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: nextStatus } : p));
    } catch (err) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  // Altera diretamente o status para qualquer estado selecionado
  const handleDirectStatusChange = async (projectId, newStatus) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus, updated_at: new Date() })
        .eq('id', projectId);

      if (error) throw error;

      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
    } catch (err) {
      alert('Erro ao alterar status: ' + err.message);
    }
  };

  // Submete pedido de alteração de data para aprovação
  const handleRequestDateChange = async (e) => {
    e.preventDefault();
    if (!selectedProjectForDate || !newTargetDate) return;

    setIsSubmitting(true);
    try {
      // 1. Cria a solicitação na tabela de solicitações
      const { error: reqError } = await supabase
        .from('project_approval_requests')
        .insert({
          project_id: selectedProjectForDate.id,
          requested_by: userId,
          request_type: 'date_change',
          old_value: selectedProjectForDate.target_date,
          new_value: newTargetDate,
          status: 'pending'
        });

      if (reqError) throw reqError;

      // 2. Marca a coluna pending_target_date no projeto para dar feedback visual na UI
      const { error: projError } = await supabase
        .from('projects')
        .update({ pending_target_date: newTargetDate })
        .eq('id', selectedProjectForDate.id);

      if (projError) throw projError;

      alert('Solicitação de alteração de data enviada para aprovação do Gestor/PMO!');
      
      // Atualiza o estado local
      setProjects(prev => prev.map(p => p.id === selectedProjectForDate.id ? { ...p, pending_target_date: newTargetDate } : p));
      
      setSelectedProjectForDate(null);
      setNewTargetDate('');
    } catch (err) {
      alert('Erro ao enviar solicitação: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Cabeçalho do Kanban */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Quadro Kanban de Demandas
          </h2>
          <p className="text-xs text-slate-400">
            Gerencie o ciclo de vida das suas entregas e solicite ajustes de prazo.
          </p>
        </div>

        <button 
          onClick={fetchKanbanProjects}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all border border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </button>
      </div>

      {/* PIPELINES DO KANBAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 overflow-x-auto pb-6">
        {COLUMNS.map((column) => {
          const columnProjects = projects.filter(p => (p.status || 'backlog') === column.id);

          return (
            <div 
              key={column.id} 
              className="flex flex-col min-w-[280px] bg-slate-900/80 rounded-2xl border border-slate-800/80 p-3 h-[75vh]"
            >
              {/* Header da Coluna */}
              <div className={`flex items-center justify-between p-2.5 rounded-xl border mb-3 ${column.color}`}>
                <span className="text-xs font-bold uppercase tracking-wider">{column.label}</span>
                <span className="text-[11px] font-mono font-extrabold bg-slate-950/60 px-2 py-0.5 rounded-md">
                  {columnProjects.length}
                </span>
              </div>

              {/* Lista de Cards */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {columnProjects.length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600 text-xs">
                    Sem demandas
                  </div>
                ) : (
                  columnProjects.map((project) => (
                    <div 
                      key={project.id}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 shadow-lg hover:shadow-cyan-500/5 transition-all group relative"
                    >
                      {/* Título & Descrição */}
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {project.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {project.description || 'Sem descrição cadastrada.'}
                        </p>
                      </div>

                      {/* Datas & Solicitação de Alteração */}
                      <div className="pt-2 border-t border-slate-900 flex flex-col gap-1.5 text-[10px]">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-cyan-400" /> Prazo:
                          </span>
                          <span className="font-mono text-slate-200">
                            {project.target_date ? new Date(project.target_date).toLocaleDateString('pt-BR') : 'Não definido'}
                          </span>
                        </div>

                        {/* Indicador de Alteração de Data Pendente */}
                        {project.pending_target_date && (
                          <div className="flex items-center gap-1 p-1.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <span>Alteração para <strong>{new Date(project.pending_target_date).toLocaleDateString('pt-BR')}</strong> em aprovação</span>
                          </div>
                        )}
                      </div>

                      {/* Ações do Card / Pipe */}
                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2">
                        {/* Botão de Solicitar Alteração de Data */}
                        <button
                          onClick={() => {
                            setSelectedProjectForDate(project);
                            setNewTargetDate(project.target_date || '');
                          }}
                          title="Solicitar nova data de entrega"
                          className="px-2 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 flex items-center gap-1 transition-colors"
                        >
                          <Calendar className="w-3 h-3 text-cyan-400" /> Reagendar
                        </button>

                        {/* Mover para Próximo Status */}
                        {['backlog', 'em_andamento', 'aguardando_terceiros', 'teste'].includes(project.status) && (
                          <button
                            onClick={() => handleAdvanceStatus(project, project.status)}
                            title="Avançar para a próxima coluna"
                            className="px-2 py-1 text-[10px] bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 rounded-lg flex items-center gap-1 font-semibold transition-all ml-auto"
                          >
                            Mover <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Menu de Alteração Direta de Status (Ações do Pipe) */}
                      <div className="mt-1">
                        <select
                          value={project.status || 'backlog'}
                          onChange={(e) => handleDirectStatusChange(project.id, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 rounded-lg p-1 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="backlog">Status: Backlog</option>
                          <option value="em_andamento">Status: Em Andamento</option>
                          <option value="aguardando_terceiros">Status: Aguardando Terceiros</option>
                          <option value="teste">Status: Em Teste</option>
                          <option value="concluida">Status: Concluída</option>
                          <option value="pausada">Status: Pausada</option>
                          <option value="descontinuada">Status: Descontinuada</option>
                        </select>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE SOLICITAÇÃO DE ALTERAÇÃO DE DATA */}
      {selectedProjectForDate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" /> Solicitar Alteração de Prazo
            </h3>

            <p className="text-xs text-slate-400">
              A alteração de prazo para a demanda <strong className="text-white">{selectedProjectForDate.title}</strong> será enviada para aprovação do Gestor/PMO.
            </p>

            <form onSubmit={handleRequestDateChange} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nova Data Alvo:</label>
                <input 
                  type="date"
                  required
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProjectForDate(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Enviando...' : 'Enviar para Aprovação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}