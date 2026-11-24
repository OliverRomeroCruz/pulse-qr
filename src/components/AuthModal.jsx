import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const payload = mode === 'register' 
      ? { name: name.trim(), email: email.trim(), password }
      : { email: email.trim(), password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error en la autenticación.');
      }

      // Success celebration!
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#3b82f6', '#10b981']
      });

      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {mode === 'register' ? 'Crea tu Cuenta Gratis' : 'Iniciar Sesión'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'register'
              ? 'Administra tus QRs privados, analíticas de escaneo y descargas HD.'
              : 'Accede a tu panel para ver tus QRs y estadísticas en vivo.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'login'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'register'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Nombre o Negocio</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Oliver Romero o Mi Restaurante"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-cyan-500 outline-none transition-all"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Correo Electrónico</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-cyan-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Contraseña</span>
              </span>
              {mode === 'register' && (
                <span className="text-[10px] text-slate-500">Mínimo 6 caracteres</span>
              )}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-cyan-500 outline-none transition-all"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              ⚠️ {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'register' ? 'Registrarme y Empezar' : 'Acceder a mi Cuenta'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <p className="text-[11px] text-slate-500 text-center mt-4">
          {mode === 'register' ? (
            <>¿Ya tienes una cuenta? <button type="button" onClick={() => setMode('login')} className="text-cyan-400 font-medium hover:underline">Inicia sesión</button></>
          ) : (
            <>¿Aún no tienes cuenta? <button type="button" onClick={() => setMode('register')} className="text-cyan-400 font-medium hover:underline">Regístrate gratis</button></>
          )}
        </p>

      </div>
    </div>
  );
}
