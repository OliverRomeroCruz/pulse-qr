import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import QrGenerator from './components/QrGenerator';
import QrDisplay from './components/QrDisplay';
import QrCustomizer from './components/QrCustomizer';
import AnalyticsPanel from './components/AnalyticsPanel';
import QrList from './components/QrList';
import EditUrlModal from './components/EditUrlModal';
import PrintableCardModal from './components/PrintableCardModal';
import { BarChart3, Plus, Sparkles, QrCode, Layers, RefreshCw, ArrowLeft } from 'lucide-react';

export default function App() {
  const [serverInfo, setServerInfo] = useState(null);
  const [qrs, setQrs] = useState([]);
  const [activeQrId, setActiveQrId] = useState(null);
  const [activeQrDetails, setActiveQrDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('creator'); // 'creator' | 'list'
  
  // Customization state: Default is Classic Black & White without emoji
  const [customization, setCustomization] = useState({
    fgColor: '#000000',
    bgColor: '#ffffff',
    errorLevel: 'M',
    margin: 2,
    logo: null,
  });

  const saveTimeoutRef = useRef(null);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [qrToEdit, setQrToEdit] = useState(null);

  // Auto-save customization when user tweaks colors or emoji
  const handleCustomizationChange = (newCustomization) => {
    setCustomization(newCustomization);

    // Update in-memory active QR details so preview updates immediately
    setActiveQrDetails(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        customization: newCustomization
      };
    });

    // Auto-save changes to the server database with debounce
    if (activeQrId) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await fetch(`/api/qrs/${activeQrId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customization: newCustomization })
          });
        } catch (e) {
          console.error('Error auto-saving customization:', e);
        }
      }, 350);
    }
  };

  // Fetch Server Info (IP, Ports, Host)
  const fetchServerInfo = async () => {
    try {
      const res = await fetch('/api/info');
      if (res.ok) {
        const data = await res.json();
        setServerInfo(data);
      }
    } catch (e) {
      console.warn('Could not fetch server info:', e);
    }
  };

  // Fetch list of all QRs
  const fetchQrs = useCallback(async () => {
    try {
      const res = await fetch('/api/qrs');
      if (res.ok) {
        const data = await res.json();
        setQrs(data);

        // If no active QR is selected and we have items, select the first
        if (!activeQrId && data.length > 0) {
          setActiveQrId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Error fetching QRs:', e);
    }
  }, [activeQrId]);

  // Load a QR when user clicks or changes QR (loads saved customization)
  const loadQrDetails = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/qrs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveQrDetails(data);
        if (data.customization) {
          setCustomization({
            fgColor: data.customization.fgColor || '#000000',
            bgColor: data.customization.bgColor || '#ffffff',
            errorLevel: data.customization.errorLevel || 'M',
            margin: data.customization.margin !== undefined ? data.customization.margin : 2,
            logo: data.customization.logo || null,
          });
        }
      }
    } catch (e) {
      console.error('Error loading QR details:', e);
    }
  }, []);

  // Background polling: ONLY updates scans and stats, NEVER overwrites customization!
  const pollStatsOnly = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/qrs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveQrDetails(prev => {
          if (!prev || prev.id !== id) return data;
          return {
            ...prev,
            stats: data.stats,
            recentScans: data.recentScans,
            totalScans: data.stats?.totalScans ?? prev.totalScans,
            uniqueVisitors: data.stats?.uniqueVisitors ?? prev.uniqueVisitors,
            // Keep local customization untouched during polling!
          };
        });
      }
    } catch (e) {
      console.error('Error polling stats:', e);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchServerInfo();
    fetchQrs();
  }, [fetchQrs]);

  // When activeQrId changes, load its full details
  useEffect(() => {
    if (activeQrId) {
      loadQrDetails(activeQrId);
    }
  }, [activeQrId, loadQrDetails]);

  // Auto-refresh stats every 4 seconds to catch scans from mobile in real-time without resetting customization
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeQrId && !document.hidden) {
        pollStatsOnly(activeQrId);
        fetchQrs();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeQrId, pollStatsOnly, fetchQrs]);

  // Handlers
  const handleQrCreated = (newQr) => {
    setQrs(prev => [newQr, ...prev]);
    setActiveQrId(newQr.id);
    setActiveQrDetails(newQr);
    setActiveTab('details'); // Take directly to the dedicated QR Details view
  };

  const handleSelectQr = (id) => {
    setActiveQrId(id);
    loadQrDetails(id);
    setActiveTab('details'); // Take directly to the dedicated QR Details view
  };

  const handleDeleteQr = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este código QR?')) return;
    try {
      const res = await fetch(`/api/qrs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const updated = qrs.filter(q => q.id !== id);
        setQrs(updated);
        if (activeQrId === id) {
          const next = updated.length > 0 ? updated[0].id : null;
          setActiveQrId(next);
          if (next) loadQrDetails(next);
          else setActiveQrDetails(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEditModal = (qr) => {
    setQrToEdit(qr);
    setIsEditModalOpen(true);
  };

  const handleSavedEdit = (updatedQr) => {
    setActiveQrDetails(updatedQr);
    setQrs(prev => prev.map(q => q.id === updatedQr.id ? { ...q, ...updatedQr } : q));
  };

  // Determine encoded redirect URL for active QR or preview URL
  const baseUrl = serverInfo?.localBaseUrl || window.location.origin;
  const currentEncodedUrl = activeQrDetails?.code 
    ? `${baseUrl}/r/${activeQrDetails.code}` 
    : `${baseUrl}/r/demo`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        serverInfo={serverInfo}
        onNewQr={() => {
          setActiveTab('creator');
          // Focus generator
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalQrs={qrs.length}
        onRefresh={() => {
          fetchServerInfo();
          fetchQrs();
          if (activeQrId) loadQrDetails(activeQrId);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: CREATOR (Crear nuevo QR) */}
        {activeTab === 'creator' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Form (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                <QrGenerator
                  onCreated={handleQrCreated}
                  serverInfo={serverInfo}
                  currentCustomization={customization}
                />

                <QrCustomizer
                  customization={customization}
                  onChange={handleCustomizationChange}
                />
              </div>

              {/* Right Column: Live QR Preview & Downloads (5 cols) */}
              <div className="lg:col-span-5 sticky top-20">
                <QrDisplay
                  qr={null}
                  encodedUrl={currentEncodedUrl}
                  customization={customization}
                  onOpenCardModal={() => setIsCardModalOpen(true)}
                  isLiveSaved={false}
                />
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: MIS QRs (Listado de todos los QRs con miniaturas) */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Todos tus Códigos QR</h2>
                <p className="text-xs text-slate-400">Administra tus enlaces dinámicos, revisa sus métricas y descárgalos</p>
              </div>
            </div>

            <QrList
              qrs={qrs}
              activeQrId={activeQrId}
              onSelectQr={handleSelectQr}
              onNewQr={() => setActiveTab('creator')}
              onDeleteQr={handleDeleteQr}
              serverInfo={serverInfo}
            />
          </div>
        )}

        {/* VIEW 3: DEDICATED QR DETAILS (Página específica del QR seleccionado) */}
        {activeTab === 'details' && activeQrDetails && (
          <div className="space-y-6">
            
            {/* Navigation & Breadcrumb Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('list')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700/80 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a Mis QRs</span>
                </button>

                <div className="h-4 w-px bg-slate-800 hidden sm:block" />

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">QR:</span>
                  <span className="text-sm font-bold text-white">{activeQrDetails.title}</span>
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    /{activeQrDetails.code}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('creator')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear otro QR</span>
                </button>
              </div>
            </div>

            {/* Content: QR Display & Full Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Visual QR, Downloads & Customizer (5 cols) */}
              <div className="lg:col-span-5 space-y-5 sticky top-20">
                <QrDisplay
                  qr={activeQrDetails}
                  encodedUrl={currentEncodedUrl}
                  customization={customization}
                  onOpenCardModal={() => setIsCardModalOpen(true)}
                  isLiveSaved={true}
                />

                <QrCustomizer
                  customization={customization}
                  onChange={handleCustomizationChange}
                />
              </div>

              {/* Right Column: Dedicated Analytics Dashboard (7 cols) */}
              <div className="lg:col-span-7">
                <AnalyticsPanel
                  qrDetails={activeQrDetails}
                  onRefreshDetails={() => loadQrDetails(activeQrId)}
                  onOpenEditModal={handleOpenEditModal}
                  onDeleteQr={handleDeleteQr}
                />
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <p>PulseQR • Generador dinámico con analítica de escaneos, detección de dispositivos y descargas vectoriales</p>
      </footer>

      {/* Modals */}
      <EditUrlModal
        qr={qrToEdit}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={handleSavedEdit}
      />

      <PrintableCardModal
        qr={activeQrDetails}
        encodedUrl={currentEncodedUrl}
        customization={customization}
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
      />

    </div>
  );
}
