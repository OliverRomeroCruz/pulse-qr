import React, { useState } from 'react';
import { Link2, Sparkles, Clipboard, Tag, Hash, ArrowRight, Check, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QrGenerator({ 
  onCreated, 
  serverInfo, 
  currentCustomization,
  user,
  token,
  onRequireAuth
}) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pastedFeedback, setPastedFeedback] = useState(false);

  // Paste from clipboard helper
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setPastedFeedback(true);
        setTimeout(() => setPastedFeedback(false), 1500);
      }
    } catch (e) {
      console.warn('Clipboard read failed:', e);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setErrorMsg('Por favor introduce un enlace o página web.');
      return;
    }

    // If user is not logged in, open Auth Modal
    if (!user || !token) {
      onRequireAuth('register');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/qrs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim() || undefined,
          customCode: customCode.trim() || undefined,
          customization: currentCustomization,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el código QR');
      }

      // Celebrate creation!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b']
      });

      // Clear form & notify parent
      setUrl('');
      setTitle('');
      setCustomCode('');
      onCreated(data);

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>Generar Nuevo Código QR</span>
          <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Pega cualquier enlace. Crearemos un QR inteligente con rastreo de escaneos y analíticas en tiempo real.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* URL Input */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Enlace de destino (Web, Instagram, Menú, etc.)</span>
            </span>
            <span className="text-[10px] text-red-400 font-medium">* Obligatorio</span>
          </label>

          <div className="relative flex items-center">
            <input
              type="text"
              required
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="https://tu-pagina.com o tuinstagram..."
              className="w-full pl-3.5 pr-24 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white placeholder-slate-500 transition-all outline-none font-mono"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1 transition-colors"
              title="Pegar enlace copiado"
            >
              {pastedFeedback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
              <span>{pastedFeedback ? 'Pegado' : 'Pegar'}</span>
            </button>
          </div>
        </div>

        {/* Title and Custom Alias */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Nombre o Título (Opcional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Menú Terraza, Instagram..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white placeholder-slate-500 transition-all outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              <span>Alias corto (Opcional)</span>
            </label>
            <div className="flex items-center rounded-xl bg-slate-950/80 border border-slate-700/80 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 px-3 py-1.5">
              <span className="text-xs text-slate-500 font-mono select-none">/r/</span>
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                placeholder="mi-carta"
                className="w-full py-1 text-sm text-white placeholder-slate-500 bg-transparent outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Auth notice if not logged in */}
        {!user && (
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>
              Inicia sesión o crea tu cuenta gratuita para guardar este QR en tu panel privado y ver sus analíticas.
            </span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{user ? 'Generar Código QR Inteligente' : 'Crear Cuenta y Generar QR'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
