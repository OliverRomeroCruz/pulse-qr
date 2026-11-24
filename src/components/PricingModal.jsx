import React, { useState } from 'react';
import { X, Check, Sparkles, Crown, Zap, Shield, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseJsonResponse } from '../utils/api';

export default function PricingModal({ isOpen, onClose, user, token, onUpgradeSuccess, onRequireAuth }) {
  if (!isOpen) return null;

  const [isUpgrading, setIsUpgrading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isPro = user?.plan === 'pro';

  const handleUpgrade = async () => {
    if (!user || !token) {
      onClose();
      onRequireAuth('register');
      return;
    }

    setIsUpgrading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await parseJsonResponse(res);

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#06b6d4', '#8b5cf6', '#10b981']
      });

      onUpgradeSuccess(data.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow effects */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
            <Crown className="w-3.5 h-3.5" />
            <span>Planes y Precios</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Crea 3 QRs Gratis o pásate a <span className="text-amber-400">Pro</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Empieza sin coste con 3 códigos QR dinámicos o desbloquea creaciones ilimitadas para tu negocio.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Plan Gratuito */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            !isPro 
              ? 'bg-slate-950/60 border-cyan-500/50 ring-1 ring-cyan-500/30' 
              : 'bg-slate-950/40 border-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Plan Básico</span>
                {!isPro && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Tu plan actual
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 my-2">
                <span className="text-3xl font-black text-white">0 €</span>
                <span className="text-xs text-slate-500">/ para siempre</span>
              </div>

              <p className="text-xs text-slate-400 mb-4">
                Ideal para proyectos puntuales o probar la herramienta.
              </p>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span><strong>Hasta 3 códigos QR</strong> dinámicos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Rastreo y contador en tiempo real</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Descargas PNG en Alta Definición</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Edición de URL de destino</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <span className="text-xs font-semibold text-slate-500">
                {!isPro ? '✓ Plan activo (3 QRs)' : 'Plan Básico'}
              </span>
            </div>
          </div>

          {/* Plan Pro */}
          <div className="p-5 rounded-2xl border-2 border-amber-500/60 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 flex flex-col justify-between shadow-xl relative">
            
            {/* Ribbon */}
            <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Ilimitado</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Plan Pro</span>
                </span>
                {isPro && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ✓ Activo
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 my-2">
                <span className="text-3xl font-black text-white">9,99 €</span>
                <span className="text-xs text-slate-400">/ mes</span>
              </div>

              <p className="text-xs text-slate-300 mb-4">
                Para negocios, restaurantes, marketing y creadores.
              </p>

              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong className="text-white">Códigos QR Ilimitados</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Analíticas avanzadas de dispositivos y horas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Descargas Ultra Impresión 4K y SVG</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Carteles imprimibles para mesas y locales</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Soporte prioritario 24/7</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              {errorMsg && (
                <p className="text-xs text-red-400 mb-2">{errorMsg}</p>
              )}

              {isPro ? (
                <div className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-center">
                  ✓ Ya tienes el Plan Pro Activo
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpgrading ? (
                    <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Activar Plan Pro (Probar Ilimitado)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
