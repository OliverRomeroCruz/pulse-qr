import React, { useRef, useEffect, useState } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  ExternalLink, 
  Printer, 
  Sparkles, 
  Layers, 
  Share2,
  ChevronDown
} from 'lucide-react';
import { 
  renderQrToCanvas, 
  createHighResCanvas, 
  generateQrSvg, 
  downloadCanvas, 
  downloadSvg, 
  copyCanvasToClipboard 
} from '../utils/qrHelper';

export default function QrDisplay({
  qr,
  encodedUrl,
  customization,
  onOpenCardModal,
  onTestScan,
  isLiveSaved = false
}) {
  const canvasRef = useRef(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloadDropdown, setDownloadDropdown] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  // Redraw canvas whenever encodedUrl or customization changes
  useEffect(() => {
    if (!canvasRef.current || !encodedUrl) return;

    renderQrToCanvas(canvasRef.current, encodedUrl, {
      fgColor: customization.fgColor || '#000000',
      bgColor: customization.bgColor || '#ffffff',
      errorLevel: customization.errorLevel || 'H',
      margin: customization.margin || 2,
      size: 400,
      logo: customization.logo || null,
    });
  }, [encodedUrl, customization]);

  // Handle Download PNG
  const handleDownloadPng = async (res = 1024) => {
    setIsRendering(true);
    try {
      const highRes = await createHighResCanvas(encodedUrl, customization, res);
      const filename = `qr-${qr?.code || 'pulse'}-${res}px.png`;
      downloadCanvas(highRes, filename);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRendering(false);
      setDownloadDropdown(false);
    }
  };

  // Handle Download SVG
  const handleDownloadSvg = async () => {
    const svg = await generateQrSvg(encodedUrl, customization);
    if (svg) {
      downloadSvg(svg, `qr-${qr?.code || 'pulse'}.svg`);
    }
    setDownloadDropdown(false);
  };

  // Copy Short Link
  const handleCopyLink = async () => {
    if (!encodedUrl) return;
    try {
      await navigator.clipboard.writeText(encodedUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    const success = await copyCanvasToClipboard(canvasRef.current);
    if (success) {
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center shadow-xl backdrop-blur-md relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className="absolute -top-24 -left-24 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Dynamic Tag */}
      <div className="w-full flex items-center justify-between mb-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          QR Inteligente con Rastreo
        </span>

        {qr?.code && (
          <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
            /{qr.code}
          </span>
        )}
      </div>

      {/* QR Code Canvas Container */}
      <div className="relative group p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner flex items-center justify-center transition-transform hover:scale-[1.01] duration-300">
        <div 
          className="p-3 rounded-xl shadow-2xl transition-all"
          style={{ backgroundColor: customization.bgColor || '#ffffff' }}
        >
          <canvas 
            ref={canvasRef} 
            width={320} 
            height={320} 
            className="w-64 h-64 sm:w-72 sm:h-72 block rounded-lg select-none"
          />
        </div>
      </div>

      {/* Title & Target Details */}
      <div className="w-full mt-4 text-center">
        <h3 className="font-semibold text-lg text-white truncate px-2">
          {qr?.title || 'Vista Previa del QR'}
        </h3>
        <p className="text-xs text-slate-400 truncate mt-0.5 max-w-sm mx-auto px-2" title={qr?.originalUrl}>
          Destino: <span className="text-cyan-400 hover:underline cursor-pointer">{qr?.originalUrl || encodedUrl}</span>
        </p>
      </div>

      {/* Quick URL Copy Bar */}
      <div className="w-full mt-4 flex items-center gap-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800">
        <input 
          type="text" 
          readOnly 
          value={encodedUrl} 
          className="bg-transparent text-xs text-slate-300 font-mono flex-1 outline-none px-2 select-all overflow-ellipsis"
        />
        <button
          onClick={handleCopyLink}
          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
          title="Copiar enlace directo"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>

      {/* Action Buttons: Downloads & Tools */}
      <div className="w-full mt-5 grid grid-cols-2 gap-2.5">
        
        {/* Main Download Dropdown */}
        <div className="relative col-span-2 sm:col-span-1">
          <button
            onClick={() => setDownloadDropdown(!downloadDropdown)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar QR</span>
            <ChevronDown className="w-3.5 h-3.5 ml-auto opacity-70" />
          </button>

          {/* Download Options Dropdown Menu */}
          {downloadDropdown && (
            <div className="absolute left-0 bottom-full mb-2 w-full bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-30 space-y-1">
              <button
                onClick={() => handleDownloadPng(1024)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 flex items-center justify-between"
              >
                <span className="font-medium">PNG Alta Definición (1024px)</span>
                <span className="text-[10px] text-slate-400">Recomendado</span>
              </button>
              <button
                onClick={() => handleDownloadPng(2048)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 flex items-center justify-between"
              >
                <span className="font-medium">PNG Ultra Impresión (2048px)</span>
                <span className="text-[10px] text-slate-400">Pósters / Lonas</span>
              </button>
              <button
                onClick={() => handleDownloadPng(512)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 flex items-center justify-between"
              >
                <span className="font-medium">PNG Estándar (512px)</span>
                <span className="text-[10px] text-slate-400">Web / Rápido</span>
              </button>
              <div className="border-t border-slate-800 my-1" />
              <button
                onClick={handleDownloadSvg}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 flex items-center justify-between"
              >
                <span className="font-medium flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  Formato SVG Vectorial
                </span>
                <span className="text-[10px] text-slate-400">Infinito</span>
              </button>
            </div>
          )}
        </div>

        {/* Copy Image Button */}
        <button
          onClick={handleCopyImage}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/70 transition-colors"
          title="Copiar imagen al portapapeles para pegar en WhatsApp, Photoshop, etc."
        >
          {copiedImage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
          <span>{copiedImage ? '¡Imagen Copiada!' : 'Copiar Imagen'}</span>
        </button>

        {/* Printable Card Modal Button */}
        <button
          onClick={onOpenCardModal}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/70 transition-colors"
          title="Generar cartel listo para imprimir de sobremesa / pared"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Cartel Imprimible</span>
        </button>

        {/* Test Direct Scan in Browser */}
        <a
          href={`${encodedUrl}?preview=1`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-800/60 transition-colors"
          title="Abre el enlace en una pestaña nueva para simular un escaneo real en el contador"
        >
          <ExternalLink className="w-4 h-4 text-cyan-400" />
          <span>Probar Escaneo</span>
        </a>

      </div>

    </div>
  );
}
