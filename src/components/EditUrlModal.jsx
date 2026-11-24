import React, { useState } from 'react';
import { X, Save, Edit3, Link2, Tag } from 'lucide-react';

export default function EditUrlModal({ qr, isOpen, onClose, onSaved, token }) {
  if (!isOpen || !qr) return null;

  const [title, setTitle] = useState(qr.title || '');
  const [url, setUrl] = useState(qr.originalUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setErrorMsg('La URL no puede estar vacía');
      return;
    }

    setIsSaving(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/qrs/${qr.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          title: title.trim(),
          originalUrl: url.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar');
      }

      onSaved(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Editar QR Dinámico</h3>
            <p className="text-xs text-slate-400">Puedes cambiar el destino sin tener que volver a imprimir el QR</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Título del QR</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Nuevo enlace de destino</span>
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:border-cyan-500 outline-none"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
              {errorMsg}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-white flex items-center gap-1.5 shadow-md shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
