import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, UserPlus } from "lucide-react";

export default function UserModal({ open, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-[9999] w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-cyan-400" />
            <h2 className="text-white font-bold">Cadastrar Usuário</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-400">
            Funcionalidade em construção. O cadastro de usuários deve ser feito via backend com service role.
          </p>
          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}