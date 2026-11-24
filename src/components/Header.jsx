import React from 'react';
import { QrCode, Plus, BarChart3, RefreshCw, LogOut, User, Crown, Sparkles } from 'lucide-react';

export default function Header({ 
  onNewQr, 
  activeTab, 
  setActiveTab, 
  totalQrs,
  onRefresh,
  user,
  onOpenAuth,
  onLogout,
  onOpenPricing
}) {
  const isPro = user?.plan === 'pro';

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">Pulse<span className="text-cyan-400">QR</span></span>
              {isPro ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Crown className="w-3 h-3" />
                  PRO
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Plan Gratuito
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Generador inteligente con rastreo de escaneos y descargas HD</p>
          </div>
        </div>

        {/* Plan Status & Upgrade Pill (Replaces Wi-Fi IP) */}
        <div className="hidden md:flex items-center gap-3">
          {user && (
            isPro ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-300">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Plan Pro Activo (QRs Ilimitados)</span>
              </div>
            ) : (
              <button
                onClick={onOpenPricing}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition-all group"
                title="Ver límites de tu cuenta y opciones para crear más QRs"
              >
                <span className="text-slate-400 font-medium">Uso:</span>
                <span className={`font-mono font-bold ${totalQrs >= 3 ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {totalQrs}/3 QRs Gratis
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                  <Sparkles className="w-3 h-3" />
                  Mejorar
                </span>
              </button>
            )
          )}

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Refrescar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation / Actions / Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setActiveTab('creator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'creator'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Crear QR</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'list' || activeTab === 'details'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Mis QRs</span>
            {totalQrs > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-xs font-semibold bg-slate-700 text-slate-200">
                {totalQrs}
              </span>
            )}
          </button>

          <button
            onClick={onOpenPricing}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Precios</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* User Profile or Login buttons */}
          {user ? (
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs text-white"
                title={`Conectado como ${user.email} (${user.plan === 'pro' ? 'Plan Pro' : 'Plan Gratis'})`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] text-white ${
                  isPro 
                    ? 'bg-gradient-to-tr from-amber-500 to-orange-600' 
                    : 'bg-gradient-to-tr from-cyan-500 to-blue-600'
                }`}>
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="font-medium max-w-[110px] truncate hidden md:inline-block">{user.name}</span>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-white shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              >
                Crear Cuenta
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
