import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { 
  FileText, Send, ArrowLeft, CheckCircle2, 
  AlertCircle, Sparkles, UploadCloud, Cpu, Loader2 
} from 'lucide-react';

export default function PublicForm({ onBack }) {
  // --- ESTADOS DO FORMULÁRIO MANUAL ---
  const [formData, setFormData] = useState({
    title: '',
    department: 'TI',
    description: '',
    contact_email: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // --- ESTADOS DA IA E UPLOAD ---
  const [file, setFile] = useState(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiLogs, setAiLogs] = useState([]);

  // Função para adicionar logs no terminal visual
  const addLog = (message, type = 'info') => {
    setAiLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message, type }]);
  };

  // --- SUBMISSÃO VIA IA (ORQUESTRAÇÃO DE AGENTES) ---
  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessingAI(true);
    setErrorMsg(null);
    setAiLogs([]);
    
    addLog(`Arquivo "${selectedFile.name}" carregado. Iniciando pipeline IA...`, 'info');

    try {
      // 1. Upload do arquivo para o Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-doc.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`ai-inputs/${fileName}`, selectedFile);

      if (uploadError) throw uploadError;

      // ----------------------------------------------------------------------
      // SIMULAÇÃO DA ORQUESTRAÇÃO DOS AGENTES
      // ----------------------------------------------------------------------
   /*   addLog('🤖 Agente 1: Iniciando extração e transcrição do conteúdo...', 'processing');
      await new Promise(r => setTimeout(r, 2000)); 
      addLog('✅ Agente 1: Transcrição concluída. 3.450 tokens extraídos.', 'success');

      addLog('🤖 Agente 2: Analisando regras de negócio e mapeando processo...', 'processing');
      await new Promise(r => setTimeout(r, 2500));
      addLog('✅ Agente 2: Processo compreendido. 4 fluxos principais identificados.', 'success');

      addLog('🤖 Agente 3: Desenhando solução arquitetural e escopo de execução...', 'processing');
      await new Promise(r => setTimeout(r, 3000));
      addLog('✅ Agente 3: Estrutura do projeto gerada com sucesso.', 'success');

      addLog('💾 Gravando dados estruturados e logs no banco...', 'processing');
     */
    
      // Substitua o bloco de simulação no React por isto:
const formData = new FormData();
formData.append('file', selectedFile);
formData.append('contact_email', 'usuario@empresa.com');

const response = await fetch('http://localhost:8000/api/v1/ai/orchestrate', {
  method: 'POST',
  body: formData,
});

const result = await response.json();

if (!response.ok) {
  throw new Error(result.detail?.error || 'Erro na orquestração');
}

// Atualize o terminal visual com os logs retornados pelo backend
setAiLogs(result.logs);
      // 2. Salvar os resultados estruturados no banco (project_public_forms)
      const { error: dbError } = await supabase
        .from('project_public_forms')
        .insert([{
          title: `[IA] Extração: ${selectedFile.name}`,
          description: 'Demanda estruturada automaticamente via pipeline de agentes autônomos a partir de documento.',
          department: 'TI', // O Agente 2 poderia definir isso dinamicamente no futuro
          contact_email: formData.contact_email || 'ia-pipeline@sistema.com',
          status: 'Pendente',
          // Se você criou as colunas de IA no banco conforme a etapa anterior, descomente abaixo:
          // raw_ai_log: JSON.stringify(aiLogs)
        }]);

      if (dbError) throw dbError;

      addLog('🚀 Processo finalizado! Demanda cadastrada com sucesso.', 'success');
      
      // Aguarda um momento para o usuário ler o log de sucesso e mostra a tela de conclusão
      setTimeout(() => setSubmitted(true), 1500);

    } catch (error) {
      addLog(`❌ Erro crítico: ${error.message}`, 'error');
      setErrorMsg(`Falha na IA: ${error.message}`);
    } finally {
      setIsProcessingAI(false);
    }
  };

  // --- SUBMISSÃO MANUAL ---
  const handleSubmitManual = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from('project_public_forms')
        .insert([{
          title: formData.title,
          department: formData.department,
          description: formData.description,
          contact_email: formData.contact_email,
          status: 'Pendente'
        }]);

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao enviar proposta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // --- TELA DE SUCESSO ---
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 animate-fadeIn">
        <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-2xl max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Ideia Submetida!</h2>
          <p className="text-slate-400 text-sm">
            Sua proposta foi registrada com sucesso e passará pela avaliação preditiva de governança.
          </p>
          <button
            onClick={onBack}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold rounded-lg border border-slate-700 transition-all text-sm cursor-pointer"
          >
            Voltar para a Home
          </button>
        </div>
      </div>
    );
  }

  // --- TELA PRINCIPAL (FORMULÁRIO + IA) ---
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Botão Voltar */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para a Home
        </button>

        {/* Cabeçalho */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 text-xs font-semibold border border-cyan-800">
            <Sparkles className="w-3.5 h-3.5" /> Met@sFlow.AI
          </div>
          <h1 className="text-3xl font-extrabold text-white">Cadastrar Nova Ideia ou Projeto</h1>
          <p className="text-slate-400 text-sm">
            Você pode nos enviar um documento com o projeto e deixar nossos agentes de IA estruturarem a demanda, ou preencher os dados manualmente.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-8 relative overflow-hidden">
          
          {/* ÁREA DE UPLOAD IA (TOPO) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" /> Processamento Inteligente
              </h3>
            </div>
            
            <div className="relative">
              <input 
                type="file" 
                id="ai-upload" 
                className="hidden" 
                accept=".ppt,.pptx,.doc,.docx,.xls,.xlsx,.pdf"
                onChange={handleFileUpload}
                disabled={isProcessingAI}
              />
              <label 
                htmlFor="ai-upload"
                className={`w-full py-4 flex flex-col justify-center items-center gap-2 font-semibold text-sm rounded-xl transition-all border border-dashed ${
                  isProcessingAI 
                    ? 'bg-slate-950/50 text-cyan-500 border-cyan-800/50 cursor-not-allowed'
                    : 'bg-slate-950/50 hover:bg-slate-950 text-slate-300 border-slate-700 hover:border-cyan-500 hover:text-cyan-400 cursor-pointer'
                }`}
              >
                {isProcessingAI ? (
                  <><Loader2 className="w-6 h-6 animate-spin text-cyan-500 mb-1" /> Processando através da Orquestração de Agentes...</>
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 mb-1" /> 
                    Clique para fazer Upload de Documentação (IA)
                    <span className="text-[10px] font-normal text-slate-500">.PPT, .DOC, .XLS ou .PDF</span>
                  </>
                )}
              </label>
            </div>

            {/* TERMINAL DE LOGS DA IA */}
            {(file || aiLogs.length > 0) && (
              <div className="bg-black border border-slate-800 rounded-xl p-4 font-mono text-[11px] h-48 overflow-y-auto space-y-2 relative shadow-inner">
                <div className="absolute top-2 right-3 flex items-center gap-2 text-slate-600">
                  <Cpu className="w-3 h-3" /> Pipeline Ativo
                </div>
                
                {aiLogs.map((log, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="text-slate-500 shrink-0">[{log.time}]</span>
                    <span className={`${
                      log.type === 'processing' ? 'text-cyan-400' :
                      log.type === 'success' ? 'text-emerald-400 font-bold' :
                      log.type === 'error' ? 'text-rose-500 font-bold' :
                      'text-slate-300'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))}
                {isProcessingAI && (
                  <div className="flex gap-3 animate-pulse">
                    <span className="text-slate-500 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                    <span className="text-cyan-600">Aguardando resposta do LLM...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {!isProcessingAI && (
            <>
              <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-slate-800 flex-1"></div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Ou preencha manualmente</span>
                <div className="h-px bg-slate-800 flex-1"></div>
              </div>

              {/* FORMULÁRIO MANUAL */}
              <form onSubmit={handleSubmitManual} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Título da Proposta
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex: Sistema Preditivo de Manutenção de Frotas"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Setor Solicitante
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                    >
                      <option value="TI">TI / Inovação</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="RH">Recursos Humanos</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operações">Operações</option>
                      <option value="Juridico">Jurídico</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      E-mail de Contato
                    </label>
                    <input 
                      type="email"
                      required
                      placeholder="seu.email@empresa.com"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Descrição Detalhada do Problema / Oportunidade
                  </label>
                  <textarea 
                    rows={5}
                    required
                    placeholder="Explique o contexto atual, qual problema essa ideia resolve e quais benefícios trará para a empresa..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  {loading ? 'Submetendo Proposta...' : <><Send className="w-4 h-4" /> Enviar Proposta para Avaliação</>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}