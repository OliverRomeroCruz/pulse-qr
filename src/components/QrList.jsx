import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  ExternalLink, 
  Download, 
  Trash2, 
  Calendar, 
  QrCode, 
  TrendingUp,
  Plus,
  Copy,
  Check
} from 'lucide-react';
import { renderQrToCanvas, createHighResCanvas, downloadCanvas } from '../utils/qrHelper';

// Visual QR Code thumbnail rendered on canvas
function QrThumbnail({ encodedUrl, customization }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && encodedUrl) {
      renderQrToCanvas(canvasRef.current, encodedUrl, {
        fgColor: customization?.fgColor || '#000000',
        bgColor: customization?.bgColor || '#ffffff',
        errorLevel: customization?.errorLevel || 'M',
        margin: customization?.margin !== undefined ? customization.margin : 1,
        size: 160,
        logo: customization?.logo || null,
      });
    }
  }, [encodedUrl, customization]);

  return (
    <div 
      className="p-1.5 rounded-xl border border-slate-700/80 shadow-md shrink-0 flex items-center justify-center transition-transform hover:scale-105"
      style={{ backgroundColor: customization?.bgColor || '#ffffff' }}
    >
      <canvas 
        ref={canvasRef} 
        width={80} 
        height={80} 
        className="w-16 h-16 sm:w-20 sm:h-20 block rounded-md select-none"
      />
    </div>
  );
}

export default function QrList({
  qrs = [],
  activeQrId,
  onSelectQr,
  onNewQr,
  onDeleteQr,
  serverInfo
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filtered = qrs.filter(qr => {
    const q = searchTerm.toLowerCase();
    return (
      (qr.title && qr.title.toLowerCase().includes(q)) ||
      (qr.code && qr.code.toLowerCase().includes(q)) ||
      (qr.originalUrl && qr.originalUrl.toLowerCase().includes(q))
    );
  });

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  const handleCopyLink = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickDownload = async (qr, redirectUrl) => {
    try {
      const canvas = await createHighResCanvas(redirectUrl, qr.customization, 1024);
      downloadCanvas(canvas, `qr-${qr.code || 'pulse'}.png`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título o enlace..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
          />
        </div>

        <button
          onClick={onNewQr}
          className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-white flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-cyan-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nuevo QR</span>
        </button>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center">
          <QrCode className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No se encontraron códigos QR</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm ? 'No hay resultados para tu búsqueda.' : 'Crea tu primer código QR para empezar a recopilar estadísticas y rastrear visitas.'}
          </p>
          <button
            onClick={onNewQr}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-medium bg-cyan-500 text-white inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Código QR</span>
          </button>
        </div>
      ) : (
        /* Grid of QRs */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((qr) => {
            const redirectUrl = `${serverInfo?.localBaseUrl || window.location.origin}/r/${qr.code}`;

            return (
              <div
                key={qr.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    
                    {/* Visual QR code thumbnail */}
                    <QrThumbnail 
                      encodedUrl={redirectUrl} 
                      customization={qr.customization} 
                    />

                    {/* QR Details & Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate">
                          <h4 className="font-bold text-sm text-white truncate">{qr.title}</h4>
                          <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20 inline-block mt-0.5">
                            /{qr.code}
                          </span>
                        </div>

                        {/* Total Scans Pill */}
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-xs font-bold text-white">{qr.totalScans}</span>
                          <span className="text-[10px] text-slate-400">visitas</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 truncate mt-1.5" title={qr.originalUrl}>
                        Destino: <span className="text-slate-300 font-mono">{qr.originalUrl}</span>
                      </p>

                      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(qr.createdAt)}
                        </span>
                        <span>•</span>
                        <span>{qr.uniqueVisitors || 0} únicos</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  
                  {/* DETALLES button - takes directly to the QR specific page */}
                  <button
                    onClick={() => onSelectQr(qr.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.75 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-white transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detalles</span>
                  </button>

                  {/* Quick utility buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyLink(redirectUrl, qr.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Copiar enlace corto"
                    >
                      {copiedId === qr.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleQuickDownload(qr, redirectUrl)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                      title="Descargar imagen PNG"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={`${redirectUrl}?preview=1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                      title="Probar escaneo en navegador"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => onDeleteQr(qr.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      title="Eliminar QR"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
