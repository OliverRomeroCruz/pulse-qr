import React, { useRef, useEffect } from 'react';
import { X, Printer, Download, Sparkles } from 'lucide-react';
import { renderQrToCanvas, downloadCanvas } from '../utils/qrHelper';

export default function PrintableCardModal({ qr, encodedUrl, customization, isOpen, onClose }) {
  if (!isOpen || !qr) return null;

  const cardCanvasRef = useRef(null);
  const cardContainerRef = useRef(null);

  useEffect(() => {
    if (cardCanvasRef.current && encodedUrl) {
      renderQrToCanvas(cardCanvasRef.current, encodedUrl, {
        fgColor: customization.fgColor || '#000000',
        bgColor: '#ffffff', // Clean white background for printing
        errorLevel: 'H',
        margin: 1,
        size: 320,
        logo: customization.logo || null,
      });
    }
  }, [encodedUrl, customization]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCard = () => {
    // Download standard QR or print
    handlePrint();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Print CSS styles injected for perfect printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-card-area, #printable-card-area * {
            visibility: visible !important;
          }
          #printable-card-area {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 100% !important;
            max-width: 420px !important;
            box-shadow: none !important;
            border: 2px solid #000 !important;
            color: #000 !important;
            background: #fff !important;
            page-break-inside: avoid !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative flex flex-col items-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="no-print absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="no-print w-full text-center mb-4">
          <h3 className="font-bold text-base text-white flex items-center justify-center gap-1.5">
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Cartel Listo para Imprimir</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ideal para colocar en mesas, mostradores, escaparates o flyers
          </p>
        </div>

        {/* The Printable Card Content */}
        <div 
          id="printable-card-area"
          ref={cardContainerRef}
          className="w-full max-w-sm bg-white text-slate-900 rounded-2xl p-6 shadow-2xl border-4 border-slate-900 flex flex-col items-center text-center my-2"
        >
          <div className="w-full flex items-center justify-center gap-1.5 mb-2">
            <span className="text-xs font-black tracking-widest uppercase bg-slate-900 text-white px-3 py-1 rounded-full">
              ¡ESCANEA AQUÍ!
            </span>
          </div>

          <h2 className="text-xl font-black text-slate-950 mt-1 uppercase tracking-tight">
            {qr.title}
          </h2>

          <p className="text-xs font-medium text-slate-600 mt-1 mb-3">
            Apunta con la cámara de tu móvil para acceder al instante
          </p>

          {/* QR Canvas */}
          <div className="p-2 border-2 border-slate-950 rounded-xl bg-white shadow-sm inline-block">
            <canvas 
              ref={cardCanvasRef} 
              width={260} 
              height={260} 
              className="w-52 h-52 block rounded-lg"
            />
          </div>

          {/* Footer of Card */}
          <div className="mt-4 pt-3 border-t border-slate-200 w-full text-center">
            <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
              Enlace directo: {encodedUrl}
            </p>
            <p className="text-[9px] text-slate-400 mt-0.5">
              Sin descargar aplicaciones • Rápido y seguro
            </p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="no-print w-full mt-4 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cerrar
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-white flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Cartel / Guardar PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
}
