import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ShieldCheck, Check, Loader2 } from "lucide-react";
import { updateProjectStatus } from "../../services/projectService";

const PENDING_STATUSES = ["Pendente", "Em Análise", "Aguardando_Aprovacao"];

export default function ApprovalModal({ open, onClose, projects = [], onRefresh }) {
  const [mounted, setMounted] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted || !open) return null;

  const pending = projects.filter((p) => PENDING_STATUSES.includes(p.status));

  async function handleApprove(id) {
    try {
      setLoadingId(id);
      await updateProjectStatus(id, "Em Andamento");
      await onRefresh?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-[9999] w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-bold">Aprovações Pendentes</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="p-5 max-h-80 overflow-y-auto space-y-3">
          {pending.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma aprovação pendente.</p>
          ) : (
            pending.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{p.title}</p>
                  <p className="text-[11px] text-slate-400">{p.department}</p>
                </div>
                <button
                  disabled={loadingId === p.id}
                  onClick={() => handleApprove(p.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-white"
                >
                  {loadingId === p.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                  Aprovar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}