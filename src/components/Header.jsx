import React from 'react';
import { QrCode, Wifi, Plus, BarChart3, RefreshCw, Smartphone } from 'lucide-react';

export default function Header({ 
  serverInfo, 
  onNewQr, 
  activeTab, 
  setActiveTab, 
  totalQrs,
  onRefresh
}) {
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
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Analítica en Vivo
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Generador inteligente con rastreo de escaneos y descargas HD</p>
          </div>
        </div>

        {/* Network & Status Pills */}
        <div className="hidden md:flex items-center gap-3">
          {serverInfo?.localIp && (
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300"
              title="Tu móvil en la misma red Wi-Fi puede escanear y acceder a esta IP"
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Wi-Fi IP:</span>
              <span className="font-mono text-cyan-300 font-medium">{serverInfo.localIp}:{serverInfo.port}</span>
            </div>
          )}

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Refrescar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('creator')}
            className={`flex items-center gap-2 px-3.5 py-1.75 rounded-lg text-sm font-medium transition-all ${
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
            className={`flex items-center gap-2 px-3.5 py-1.75 rounded-lg text-sm font-medium transition-all ${
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
        </div>

      </div>
    </header>
  );
}
