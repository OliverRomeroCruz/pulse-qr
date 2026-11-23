import React, { useState } from 'react';
import { 
  BarChart2, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Users, 
  Clock, 
  Play, 
  RotateCcw, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  Globe, 
  ShieldCheck,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AnalyticsPanel({
  qrDetails,
  onRefreshDetails,
  onOpenEditModal,
  onDeleteQr
}) {
  const [selectedDevice, setSelectedDevice] = useState('iphone');
  const [isSimulating, setIsSimulating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  if (!qrDetails) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
        <BarChart2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-slate-300 font-semibold">Selecciona o crea un QR</h3>
        <p className="text-xs text-slate-500 mt-1">Las analíticas y métricas en vivo aparecerán aquí.</p>
      </div>
    );
  }

  const { stats, recentScans = [] } = qrDetails;
  const totalScans = stats?.totalScans || 0;
  const uniqueVisitors = stats?.uniqueVisitors || 0;
  const devices = stats?.devices || { mobile: 0, desktop: 0, tablet: 0 };

  // Calculate percentages
  const mobilePct = totalScans > 0 ? Math.round((devices.mobile / totalScans) * 100) : 0;
  const desktopPct = totalScans > 0 ? Math.round((devices.desktop / totalScans) * 100) : 0;
  const tabletPct = totalScans > 0 ? Math.round((devices.tablet / totalScans) * 100) : 0;

  // Format date helper
  const formatDate = (isoStr) => {
    if (!isoStr) return 'Sin escaneos aún';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  // Simulate a scan
  const handleSimulateScan = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch(`/api/qrs/${qrDetails.id}/simulate-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devicePreset: selectedDevice }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg(`+1 Escaneo registrado (${selectedDevice.toUpperCase()})`);
        confetti({
          particleCount: 50,
          spread: 45,
          origin: { y: 0.7 },
          colors: ['#06b6d4', '#10b981', '#6366f1']
        });
        setTimeout(() => setFeedbackMsg(''), 3000);
        onRefreshDetails();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  // Reset scan counts
  const handleReset = async () => {
    if (!window.confirm('¿Seguro que deseas reiniciar el contador de este código QR a cero?')) {
      return;
    }
    try {
      await fetch(`/api/qrs/${qrDetails.id}/reset`, { method: 'POST' });
      onRefreshDetails();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">{qrDetails.title}</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              /{qrDetails.code}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 truncate max-w-md">
            <span>Destino:</span>
            <a 
              href={qrDetails.originalUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-cyan-400 hover:underline flex items-center gap-1 truncate"
            >
              <span className="truncate">{qrDetails.originalUrl}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenEditModal(qrDetails)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Cambiar la URL a donde apunta este QR"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Editar Destino</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
            title="Reiniciar contador a cero"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDeleteQr(qrDetails.id)}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
            title="Eliminar este código QR"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        
        {/* Total Scans Card */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-900/60 border border-cyan-500/30 rounded-2xl p-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Escaneos</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{totalScans}</span>
            <span className="text-xs font-medium text-emerald-400">visitas</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Veces que se ha abierto el QR</p>
        </div>

        {/* Unique Visitors */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Personas Únicas</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{uniqueVisitors}</span>
            <span className="text-xs font-medium text-indigo-400">únicos</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Dispositivos diferentes</p>
        </div>

        {/* Last Scan Time */}
        <div className="col-span-2 sm:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Último Escaneo</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-semibold text-slate-200 mt-1 truncate">
            {formatDate(stats?.lastScannedAt)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Actualizado en tiempo real</p>
        </div>

      </div>

      {/* Interactive Scan Simulator Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Probar y Simular Escaneo</h4>
              <p className="text-[11px] text-slate-400">Comprueba el contador instantáneamente sin necesitar otro móvil</p>
            </div>
          </div>
          
          {feedbackMsg && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 animate-bounce">
              {feedbackMsg}
            </span>
          )}
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none"
          >
            <option value="iphone">📱 Apple iPhone 15 Pro (iOS Safari)</option>
            <option value="android">🤖 Samsung Galaxy S24 (Android Chrome)</option>
            <option value="ipad">📱 iPad Air (iPadOS Safari)</option>
            <option value="desktop_mac">💻 MacBook Pro (macOS)</option>
            <option value="desktop_win">🖥️ PC Sobremesa (Windows 11)</option>
          </select>

          <button
            onClick={handleSimulateScan}
            disabled={isSimulating}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'Simulando...' : 'Simular Escaneo (+1)'}</span>
          </button>
        </div>
      </div>

      {/* Device & Platform Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Devices bar breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Distribución por Dispositivo</span>
          </h4>

          <div className="space-y-2.5">
            {/* Mobile */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> Móviles (Smartphones)
                </span>
                <span className="font-semibold text-white">{devices.mobile} ({mobilePct}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500" 
                  style={{ width: `${mobilePct}%` }} 
                />
              </div>
            </div>

            {/* Desktop */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-indigo-400" /> Ordenadores (PC / Mac)
                </span>
                <span className="font-semibold text-white">{devices.desktop} ({desktopPct}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                  style={{ width: `${desktopPct}%` }} 
                />
              </div>
            </div>

            {/* Tablet */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Tablet className="w-3.5 h-3.5 text-amber-400" /> Tablets (iPads, etc.)
                </span>
                <span className="font-semibold text-white">{devices.tablet} ({tabletPct}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${tabletPct}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* OS & Browsers summary */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Sistemas y Navegadores</span>
          </h4>

          {/* OS Breakdown badges */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5">Sistemas Operativos:</span>
            <div className="flex flex-wrap gap-1.5">
              {stats?.osBreakdown && Object.keys(stats.osBreakdown).length > 0 ? (
                Object.entries(stats.osBreakdown).map(([osName, count]) => (
                  <span 
                    key={osName} 
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 border border-slate-700 text-slate-200 flex items-center gap-1"
                  >
                    <span>{osName}:</span>
                    <span className="font-bold text-cyan-400">{count}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Sin datos registrados</span>
              )}
            </div>
          </div>

          {/* Browser breakdown badges */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1.5">Navegadores:</span>
            <div className="flex flex-wrap gap-1.5">
              {stats?.browserBreakdown && Object.keys(stats.browserBreakdown).length > 0 ? (
                Object.entries(stats.browserBreakdown).map(([bName, count]) => (
                  <span 
                    key={bName} 
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 border border-slate-700 text-slate-200 flex items-center gap-1"
                  >
                    <span>{bName}:</span>
                    <span className="font-bold text-indigo-400">{count}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Sin datos registrados</span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Recent Scans Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Historial Reciente de Escaneos ({recentScans.length})</span>
          </h4>
          <span className="text-[11px] text-slate-500">Últimos accesos</span>
        </div>

        {recentScans.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800/60">
            Aún nadie ha escaneado este código QR. Escanéalo con tu cámara o pulsa en <b>"Simular Escaneo"</b> arriba para ver los registros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Fecha y Hora</th>
                  <th className="py-2 px-3">Dispositivo</th>
                  <th className="py-2 px-3">Sistema / Navegador</th>
                  <th className="py-2 px-3">Origen</th>
                  <th className="py-2 px-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono text-[11px]">
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                      {formatDate(scan.timestamp)}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-200">
                      <div className="flex items-center gap-1.5 font-sans">
                        {scan.deviceType === 'mobile' ? (
                          <Smartphone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        ) : scan.deviceType === 'tablet' ? (
                          <Tablet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <Laptop className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        )}
                        <span>{scan.deviceModel || scan.deviceVendor || scan.deviceType}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 font-sans">
                      <span className="text-slate-200">{scan.os}</span>
                      <span className="text-slate-500 text-[10px] ml-1">({scan.browser})</span>
                    </td>
                    <td className="py-2 px-3 text-slate-400 truncate max-w-[120px] font-sans">
                      {scan.referer || 'Directo'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
                        ✓ Redirigido
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
