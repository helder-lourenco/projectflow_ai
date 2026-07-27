import { FolderKanban, Clock, CheckCircle2, AlertTriangle, UserPlus, ShieldCheck } from "lucide-react";

export default function KpiCards({ metrics = {}, onApproval, onUser }) {
  const cards = [
    { label: "Demandas Totais", value: metrics.totalProjects ?? 0, color: "text-white" },
    { label: "Em Execução", value: metrics.inProgress ?? 0, color: "text-blue-400" },
    { label: "Análise / Pendente", value: metrics.pendingApproval ?? 0, color: "text-amber-400" },
    { label: "Finalizadas", value: metrics.completed ?? 0, color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400">
            Painel Executivo
          </span>
          <h1 className="text-2xl font-bold text-white">Visão Global do Portfólio</h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onUser}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-900 border border-slate-700 rounded-xl text-slate-200 hover:border-cyan-500 transition"
          >
            <UserPlus className="w-4 h-4 text-cyan-400" />
            Cadastrar Usuário
          </button>
          <button
            onClick={onApproval}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-amber-950 border border-amber-800 rounded-xl text-amber-300 hover:bg-amber-900 transition"
          >
            <ShieldCheck className="w-4 h-4" />
            Aprovações
            {(metrics.pendingApproval ?? 0) > 0 && (
              <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full text-[10px] font-bold">
                {metrics.pendingApproval}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div key={card.label} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 uppercase block mb-2">
              {card.label}
            </span>
            <h3 className={`text-3xl font-extrabold ${card.color}`}>{card.value}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}