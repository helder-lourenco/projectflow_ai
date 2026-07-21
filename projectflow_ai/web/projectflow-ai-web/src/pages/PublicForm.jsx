import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { FileText, Send, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PublicForm({ onBack }) {
  const [formData, setFormData] = useState({
    title: '',
    department: 'TI',
    description: '',
    contact_email: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // Grava diretamente na tabela 'project_public_forms' no Supabase
      const { data, error } = await supabase
        .from('project_public_forms')
        .insert([
          {
            title: formData.title,
            department: formData.department,
            description: formData.description,
            contact_email: formData.contact_email,
            status: 'Pendente'
          }
        ])
        .select();

      if (error) throw error;

      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao enviar proposta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-2xl max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Ideia Submetida!</h2>
          <p className="text-slate-400 text-sm">
            Sua proposta foi registrada com sucesso e passará pela avaliação preditiva de governança via IA.
          </p>
          <button
            onClick={onBack}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold rounded-lg border border-slate-700 transition-all text-sm"
          >
            Voltar para a Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Botão Voltar */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para a Home
        </button>

        {/* Cabeçalho do Formulário */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 text-xs font-semibold border border-cyan-800">
            <FileText className="w-3.5 h-3.5" /> Submissão Descomplicada
          </div>
          <h1 className="text-3xl font-extrabold text-white">Cadastrar Nova Ideia ou Projeto</h1>
          <p className="text-slate-400 text-sm">
            Descreva a necessidade corporativa. Nossa Inteligência Artificial analisará a viabilidade e complexidade da demanda.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl space-y-5">
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
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
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
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-base shadow-lg shadow-cyan-500/20"
          >
            {loading ? 'Submetendo Proposta...' : <><Send className="w-4 h-4" /> Enviar Proposta para Avaliação</>}
          </button>
        </form>
      </div>
    </div>
  );
}