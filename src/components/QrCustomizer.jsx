import React from 'react';
import { Palette, ShieldAlert, Sliders, Smile, Check } from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'Clásico Negro', fg: '#000000', bg: '#ffffff' },
  { name: 'Ciber Cyan', fg: '#06b6d4', bg: '#0b1120' },
  { name: 'Azul Real', fg: '#2563eb', bg: '#ffffff' },
  { name: 'Esmeralda', fg: '#059669', bg: '#ffffff' },
  { name: 'Violeta Neón', fg: '#8b5cf6', bg: '#ffffff' },
  { name: 'Carmesí', fg: '#e11d48', bg: '#ffffff' },
  { name: 'Oro / Ámbar', fg: '#d97706', bg: '#18181b' },
  { name: 'Dark Mode', fg: '#f8fafc', bg: '#0f172a' },
];

const EMOJI_ICONS = [
  { label: 'Sin icono', val: null },
  { label: 'Enlace', val: '🔗' },
  { label: 'Móvil', val: '📱' },
  { label: 'Comida', val: '🍽️' },
  { label: 'Foto', val: '📸' },
  { label: 'Tienda', val: '🛒' },
  { label: 'Web', val: '🌐' },
  { label: 'Café', val: '☕' },
  { label: 'Estrella', val: '⭐' },
  { label: 'Ubicación', val: '📍' },
  { label: 'Chat', val: '💬' },
  { label: 'Música', val: '🎵' },
  { label: 'Wi-Fi', val: '📶' },
];

export default function QrCustomizer({ customization, onChange }) {
  const update = (patch) => {
    onChange({ ...customization, ...patch });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Sliders className="w-4 h-4 text-cyan-400" />
        <h4 className="font-semibold text-sm text-slate-200">Personalización de Diseño</h4>
      </div>

      {/* Preset Palettes */}
      <div>
        <label className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-cyan-400" />
          <span>Paletas rápidas</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isSelected = customization.fgColor === preset.fg && customization.bgColor === preset.bg;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => update({ fgColor: preset.fg, bgColor: preset.bg })}
                className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all ${
                  isSelected 
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-sm shadow-cyan-500/20' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                }`}
                title={preset.name}
              >
                <div 
                  className="w-5 h-5 rounded-md border border-slate-700 flex items-center justify-center shrink-0"
                  style={{ backgroundColor: preset.bg }}
                >
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: preset.fg }} />
                </div>
                <span className="text-[11px] text-slate-300 truncate font-medium">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Pickers */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Color del QR (Módulos)</label>
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <input
              type="color"
              value={customization.fgColor || '#000000'}
              onChange={(e) => update({ fgColor: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={customization.fgColor || '#000000'}
              onChange={(e) => update({ fgColor: e.target.value })}
              className="text-xs font-mono text-slate-200 bg-transparent flex-1 outline-none uppercase"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Color de Fondo</label>
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <input
              type="color"
              value={customization.bgColor || '#ffffff'}
              onChange={(e) => update({ bgColor: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={customization.bgColor || '#ffffff'}
              onChange={(e) => update({ bgColor: e.target.value })}
              className="text-xs font-mono text-slate-200 bg-transparent flex-1 outline-none uppercase"
            />
          </div>
        </div>
      </div>

      {/* Center Icon / Emoji */}
      <div>
        <label className="text-xs font-medium text-slate-400 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-cyan-400" />
            <span>Icono central (Distintivo)</span>
          </span>
          <span className="text-[10px] text-slate-500">Se integra en el centro</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {EMOJI_ICONS.map((item) => {
            const isSelected = item.val === null 
              ? !customization.logo 
              : customization.logo === item.val;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (isSelected && item.val !== null) {
                    // Toggle off if already selected
                    update({ logo: null, errorLevel: 'M' });
                  } else {
                    update({ 
                      logo: item.val, 
                      ...(item.val ? { errorLevel: 'H' } : { errorLevel: 'M' }) 
                    });
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950/40 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
                title={item.label}
              >
                {item.val ? <span>{item.val}</span> : <span className="text-[11px] text-slate-400">Sin icono</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Margin and Error Correction */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Margen del marco</label>
          <div className="flex gap-1.5">
            {[1, 2, 4].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => update({ margin: m })}
                className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all ${
                  (customization.margin || 2) === m
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-950/40 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {m === 1 ? 'Mínimo' : m === 2 ? 'Normal' : 'Amplio'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Corrección de Error</span>
            <span className="text-[10px] text-slate-500 font-mono">
              {customization.errorLevel === 'H' ? '30%' : customization.errorLevel === 'Q' ? '25%' : '15%'}
            </span>
          </label>
          <div className="flex gap-1.5">
            {['M', 'Q', 'H'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => update({ errorLevel: lvl })}
                className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all ${
                  (customization.errorLevel || 'H') === lvl
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-950/40 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={`Nivel ${lvl} de tolerancia a manchas o daños`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
