import { Lightbulb, ChevronRight } from "lucide-react";

const PENDING_STATUSES = ["Pendente", "Em Análise", "Aguardando_Aprovacao"];

export default function IdeasList({ projects = [], onOpen }) {
  const ideas = projects.filter(
    (p) =>
      p.type === "Ideia" ||
      PENDING_STATUSES.includes(p.status)
  );

  return (
    <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <h2 className="font-bold text-white text-sm">Ideias & Demandas Pendentes</h2>
        <span className="ml-auto text-[10px] font-mono text-cyan-400">{ideas.length}</span>
      </div>

      <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-800/60">
        {ideas.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Nenhuma ideia pendente.</p>
        ) : (
          ideas.map((idea) => (
            <button
              key={idea.id}
              onClick={() => onOpen?.(idea)}
              className="w-full text-left p-4 hover:bg-slate-800/40 transition flex items-start gap-3 group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{idea.title}</p>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{idea.department || "—"}</p>
                <span className="inline-block mt-2 px-2 py-0.5 text-[10px] rounded-full bg-amber-950 text-amber-400 border border-amber-800">
                  {idea.status || "Pendente"}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 flex-shrink-0 mt-1" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}