import { Calendar, MapPin } from "lucide-react";

export default function Roadmap({ projects = [] }) {
  const active = projects.filter(
    (p) => !["Concluído", "Concluido", "Cancelado"].includes(p.status)
  );

  return (
    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-cyan-400" />
        <h2 className="font-bold text-white text-sm">Roadmap do Portfólio</h2>
      </div>

      <div className="p-5 space-y-3 max-h-[480px] overflow-y-auto">
        {active.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum projeto ativo no roadmap.</p>
        ) : (
          active.map((project) => (
            <div
              key={project.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{project.title}</p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {project.department || "—"}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-slate-500 uppercase">Prazo</p>
                <p className="text-xs text-slate-300 font-mono">
                  {project.end_date || project.target_date
                    ? new Date(project.end_date || project.target_date).toLocaleDateString("pt-BR")
                    : "—"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}