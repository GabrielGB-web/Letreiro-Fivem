import React, { useState, useRef } from 'react';
import {
  SignConfig,
  FontStyle,
  MaterialType,
  MountType,
  CollisionMaterial,
  BadgeShape,
  ModeType,
  GeneratedMeshBounds,
} from '../types/fivem';
import { MAP_PRESETS, STYLE_PRESETS } from '../data/presets';
import { calculateJoaat, sanitizePropName, hexToRgb, rgbToHex } from '../utils/fivemGenerators';
import { AVAILABLE_FONTS } from '../utils/text3dEngine';
import { SAMPLE_IMAGE_PRESETS, svgToDataUrl } from '../utils/image3dEngine';
import {
  Type,
  Image as ImageIcon,
  Palette,
  Hammer,
  FileCode,
  MapPin,
  Sparkles,
  Sliders,
  CheckCircle2,
  HelpCircle,
  FolderDown,
  Server,
  Zap,
  Upload,
  X,
  Layers,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

interface ConfigPanelProps {
  config: SignConfig;
  onChange: (updated: Partial<SignConfig>) => void;
  onOpenServerExport: () => void;
  onOpenInspector: () => void;
  onDownloadZip: () => void;
  isGeneratingZip: boolean;
  bounds?: GeneratedMeshBounds;
  showWireframe?: boolean;
  setShowWireframe?: (v: boolean) => void;
}

type TabType = 'text' | 'image' | 'material' | 'mount' | 'fivem' | 'map' | 'presets';

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onChange,
  onOpenServerExport,
  onOpenInspector,
  onDownloadZip,
  isGeneratingZip,
  bounds,
  showWireframe,
  setShowWireframe,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('text');

  const modelHash = calculateJoaat(sanitizePropName(config.propName));

  const COLOR_PRESETS = [
    { name: 'Ciano Neon', hex: '#06b6d4' },
    { name: 'Rosa Choque', hex: '#ec4899' },
    { name: 'Dourado', hex: '#eab308' },
    { name: 'Vermelho Sangue', hex: '#ef4444' },
    { name: 'Verde Esmeralda', hex: '#10b981' },
    { name: 'Roxo Deep', hex: '#8b5cf6' },
    { name: 'Laranja Sunset', hex: '#f97316' },
    { name: 'Branco Vinewood', hex: '#f8fafc' },
    { name: 'Cinza Metal', hex: '#64748b' },
    { name: 'Preto Carbono', hex: '#18181b' },
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [fontFilter, setFontFilter] = useState<string>('all');

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onChange({
        mode: config.mode === 'text' ? 'image' : config.mode,
        imageConfig: {
          ...config.imageConfig,
          dataUrl,
          fileName: file.name,
        },
        propName: `prop_logo_${file.name.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15)}`,
      });
      setActiveTab('image');
    };
    reader.readAsDataURL(file);
  };

  // Synchronized RGB Color Channels (0 - 255)
  const currentRgb = hexToRgb(config.primaryColor);

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
    const updatedRgb = {
      ...currentRgb,
      [channel]: clamped,
    };
    const newHex = rgbToHex(updatedRgb.r, updatedRgb.g, updatedRgb.b);
    onChange({
      primaryColor: newHex,
      ...(config.materialType === 'neon' ? { glowColor: newHex } : {}),
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Top Mode Selector */}
      <div className="p-2.5 bg-slate-950/80 border-b border-slate-800/80">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 px-0.5 flex items-center justify-between">
          <span>Modo de Criação FiveM</span>
          <span className="text-orange-400 font-mono text-[9px] bg-orange-950/60 border border-orange-800/50 px-1.5 py-0.5 rounded">
            {config.mode === 'image' ? 'LOGO 3D' : config.mode === 'hybrid' ? 'HÍBRIDO' : 'TEXTO 3D'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => {
              onChange({ mode: 'text' });
              setActiveTab('text');
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
              config.mode === 'text'
                ? 'bg-orange-500 text-slate-950 font-bold shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Texto 3D</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onChange({ mode: 'image' });
              setActiveTab('image');
              // If no image loaded yet, load default BOPE skull preset
              if (!config.imageConfig?.dataUrl) {
                const preset = SAMPLE_IMAGE_PRESETS[0];
                onChange({
                  mode: 'image',
                  imageConfig: {
                    ...config.imageConfig,
                    dataUrl: svgToDataUrl(preset.svg),
                    fileName: `${preset.id}.svg`,
                    badgeShape: preset.badgeShape,
                    glowRimColor: preset.glowColor,
                  },
                });
              }
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
              config.mode === 'image'
                ? 'bg-orange-500 text-slate-950 font-bold shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Logo 3D</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onChange({ mode: 'hybrid' });
              if (!config.imageConfig?.dataUrl) {
                const preset = SAMPLE_IMAGE_PRESETS[0];
                onChange({
                  mode: 'hybrid',
                  imageConfig: {
                    ...config.imageConfig,
                    dataUrl: svgToDataUrl(preset.svg),
                    fileName: `${preset.id}.svg`,
                    badgeShape: preset.badgeShape,
                    glowRimColor: preset.glowColor,
                  },
                });
              }
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
              config.mode === 'hybrid'
                ? 'bg-orange-500 text-slate-950 font-bold shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Híbrido</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-2 py-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'text'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Texto</span>
        </button>

        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'image'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Imagem / Logo</span>
          {config.imageConfig?.dataUrl && (
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('material')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'material'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Material</span>
        </button>

        <button
          onClick={() => setActiveTab('mount')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'mount'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Hammer className="w-3.5 h-3.5" />
          <span>Suporte</span>
        </button>

        <button
          onClick={() => setActiveTab('fivem')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'fivem'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>FiveM .YDR/.YBN</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'map'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Mapa .YMAP</span>
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'presets'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Presets</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* TAB 1: TEXT & TYPOGRAPHY */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Texto Principal do Letreiro (3D)
              </label>
              <input
                type="text"
                value={config.text}
                maxLength={32}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  onChange({
                    text: val,
                    propName: `prop_letreiro_${val.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15)}`,
                  });
                }}
                placeholder="EX: COMPLEXO, BOPE, BAHAMA..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Tamanho máximo recomendado para FiveM: 32 caracteres.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Subtítulo / Linha Secundária (Opcional)
              </label>
              <input
                type="text"
                value={config.subText}
                maxLength={40}
                onChange={(e) => onChange({ subText: e.target.value.toUpperCase() })}
                placeholder="EX: TROPA DO RIO, VIP CLUB, RESGATE..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* SELETOR DE COR DO TEXTO EM RGB */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-orange-400" />
                  <span>Cor do Texto em RGB (0 - 255)</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm"
                    style={{ backgroundColor: config.primaryColor }}
                  />
                  <span className="text-[11px] font-mono text-orange-400 font-bold">
                    {config.primaryColor.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* RGB Quick Preview Bar & Color Picker Trigger */}
              <div className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/90">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange({
                      primaryColor: val,
                      ...(config.materialType === 'neon' ? { glowColor: val } : {}),
                    });
                  }}
                  className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer flex-shrink-0"
                  title="Clique para abrir seletor visual de cores"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-white flex items-center gap-1.5 truncate">
                    <span className="text-slate-400 text-[11px]">RGB:</span>
                    <span className="font-bold text-orange-400">
                      rgb({currentRgb.r}, {currentRgb.g}, {currentRgb.b})
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                    <span className="text-slate-500">FiveM Float:</span>
                    <span className="text-slate-300">
                      {(currentRgb.r / 255).toFixed(2)}, {(currentRgb.g / 255).toFixed(2)}, {(currentRgb.b / 255).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sliders & Numeric Inputs for R, G, B */}
              <div className="space-y-2.5 pt-1">
                {/* Canal R - Vermelho */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-red-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                      R (Vermelho / Red)
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={currentRgb.r}
                        onChange={(e) => handleRgbChange('r', parseInt(e.target.value) || 0)}
                        className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-center font-mono text-white focus:outline-none focus:border-red-500"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">/ 255</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={currentRgb.r}
                    onChange={(e) => handleRgbChange('r', parseInt(e.target.value))}
                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Canal G - Verde */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                      G (Verde / Green)
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={currentRgb.g}
                        onChange={(e) => handleRgbChange('g', parseInt(e.target.value) || 0)}
                        className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-center font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">/ 255</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={currentRgb.g}
                    onChange={(e) => handleRgbChange('g', parseInt(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Canal B - Azul */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-blue-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                      B (Azul / Blue)
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={currentRgb.b}
                        onChange={(e) => handleRgbChange('b', parseInt(e.target.value) || 0)}
                        className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-center font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">/ 255</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={currentRgb.b}
                    onChange={(e) => handleRgbChange('b', parseInt(e.target.value))}
                    className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Botões Rápidos de Cores RGB mais usadas */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[10px] text-slate-400 mb-1.5 font-medium">Paleta Rápida FiveM:</div>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: 'Laranja PazCity', r: 249, g: 115, b: 22 },
                    { label: 'Dourado', r: 234, g: 179, b: 8 },
                    { label: 'Vermelho', r: 239, g: 68, b: 68 },
                    { label: 'Verde Neon', r: 34, g: 197, b: 94 },
                    { label: 'Roxo Deep', r: 139, g: 92, b: 246 },
                    { label: 'Azul Eletric', r: 14, g: 165, b: 233 },
                    { label: 'Branco Puro', r: 248, g: 250, b: 252 },
                    { label: 'Preto Carbono', r: 24, g: 24, b: 27 },
                  ].map((p) => {
                    const hex = rgbToHex(p.r, p.g, p.b);
                    const isSelected = config.primaryColor.toLowerCase() === hex.toLowerCase();
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          onChange({
                            primaryColor: hex,
                            ...(config.materialType === 'neon' ? { glowColor: hex } : {}),
                          });
                        }}
                        className={`px-1.5 py-1 rounded text-[10px] font-medium border flex items-center gap-1 transition-all ${
                          isSelected
                            ? 'border-orange-400 bg-orange-500/20 text-white font-bold'
                            : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full border border-white/20 flex-shrink-0"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="truncate">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Expanded 12-Font Library */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Estilo de Fonte / Tipografia 3D ({AVAILABLE_FONTS.length} fontes)
                </label>
                <span className="text-[10px] text-orange-400 font-mono">
                  {AVAILABLE_FONTS.find((f) => f.id === config.fontStyle)?.category}
                </span>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 'gta', label: 'GTA Clássico' },
                  { id: 'modern', label: 'Moderno' },
                  { id: 'faction', label: 'Facção / BOPE' },
                  { id: 'creative', label: 'Tuning / Retrô' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFontFilter(cat.id)}
                    className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                      fontFilter === cat.id
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-semibold'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {AVAILABLE_FONTS.filter((f) => {
                  if (fontFilter === 'gta') return f.id === 'vinewood' || f.id === 'bold_sans';
                  if (fontFilter === 'modern') return f.id === 'condensed' || f.id === 'neon_tube' || f.id === 'serif';
                  if (fontFilter === 'faction') return f.id === 'gothic' || f.id === 'stencil';
                  if (fontFilter === 'creative') return f.id === 'cyber' || f.id === 'arcade' || f.id === 'script' || f.id === 'western' || f.id === 'brush';
                  return true;
                }).map((f) => {
                  const isSelected = config.fontStyle === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onChange({ fontStyle: f.id })}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500/10 text-orange-300 shadow-sm shadow-orange-500/10'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{f.name}</span>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-orange-400" />}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{f.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sliders: Depth (Grossura), Kerning/Letter Spacing, Arch */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              {/* Controlo de Profundidade / Grossura 3D do Nome */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-200">
                      Profundidade / Grossura do 3D (Extrusão)
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${
                      config.depth <= 0.35
                        ? 'bg-slate-800 text-slate-300'
                        : config.depth <= 0.85
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : config.depth <= 1.6
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : config.depth <= 2.5
                        ? 'bg-orange-600/30 text-orange-200 border border-orange-500/50'
                        : 'bg-orange-500/40 text-white border border-orange-400'
                    }`}>
                      {config.depth <= 0.35
                        ? 'Fino'
                        : config.depth <= 0.85
                        ? 'Padrão'
                        : config.depth <= 1.6
                        ? 'Grosso'
                        : config.depth <= 2.5
                        ? 'Ultra Grosso'
                        : 'Maciço 3D'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0.05"
                      max="4.00"
                      step="0.05"
                      value={config.depth}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          onChange({ depth: Math.max(0.05, Math.min(4.0, val)) });
                        }
                      }}
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-center font-mono text-orange-400 font-bold focus:outline-none focus:border-orange-400"
                    />
                    <span className="text-[10px] font-mono text-slate-400">m</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0.05"
                  max="3.50"
                  step="0.05"
                  value={config.depth}
                  onChange={(e) => onChange({ depth: parseFloat(e.target.value) })}
                  className="w-full accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />

                {/* Botões Rápidos de Grossura do Texto */}
                <div className="grid grid-cols-5 gap-1 pt-0.5">
                  {[
                    { label: 'Fino', val: 0.25 },
                    { label: 'Normal', val: 0.60 },
                    { label: 'Grosso', val: 1.20 },
                    { label: 'Extra', val: 2.00 },
                    { label: 'Maciço', val: 3.00 },
                  ].map((btn) => {
                    const isSelected = Math.abs(config.depth - btn.val) < 0.05;
                    return (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => onChange({ depth: btn.val })}
                        className={`py-1 px-1 rounded text-[10px] font-medium border text-center transition-all ${
                          isSelected
                            ? 'border-orange-400 bg-orange-500/20 text-orange-200 font-bold'
                            : 'border-slate-800 bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div>{btn.label}</div>
                        <div className="text-[9px] font-mono opacity-80">{btn.val.toFixed(2)}m</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Improved Letter Spacing with Negative Kerning & Presets */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
                  <span className="font-medium">Espaçamento entre Letras (Kerning)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-orange-400">
                      {config.letterSpacing >= 0 ? `+${config.letterSpacing.toFixed(2)}` : config.letterSpacing.toFixed(2)}m
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      config.letterSpacing <= -0.15
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : config.letterSpacing <= 0.05
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    }`}>
                      {config.letterSpacing <= -0.15
                        ? 'Coladas'
                        : config.letterSpacing <= 0.05
                        ? 'Justas'
                        : 'Espaçadas'}
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min="-0.35"
                  max="0.80"
                  step="0.01"
                  value={config.letterSpacing}
                  onChange={(e) => onChange({ letterSpacing: parseFloat(e.target.value) })}
                  className="w-full accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />

                {/* Kerning Preset Buttons */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onChange({ letterSpacing: -0.25 })}
                    className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                      config.letterSpacing <= -0.2
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Super Coladas (-0.25m)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ letterSpacing: -0.10 })}
                    className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                      config.letterSpacing > -0.2 && config.letterSpacing < -0.04
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Ultra Justas (-0.10m)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ letterSpacing: 0.0 })}
                    className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                      Math.abs(config.letterSpacing) <= 0.03
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Padrão Justo (0.00m)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ letterSpacing: 0.25 })}
                    className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                      config.letterSpacing >= 0.2
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Espaçadas (+0.25m)
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5">
                  Valores negativos aproximam as letras até se conectarem perfeitamente no 3D.
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Curvatura / Arco (Hollywood Sign)</span>
                  <span className="font-mono text-orange-400">
                    {config.curveRadius === 0 ? 'Reto' : `${config.curveRadius.toFixed(1)}m`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="2"
                  value={config.curveRadius}
                  onChange={(e) => onChange({ curveRadius: parseFloat(e.target.value) })}
                  className="w-full accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 1.5: IMAGE / LOGO 3D */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            {/* Upload Area (Supports Drag & Drop and manual selection via click) */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Importar Imagem / Logo (PNG, JPG, SVG, WEBP)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageFile(e.target.files[0]);
                  }
                }}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleImageFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  isDraggingFile
                    ? 'border-orange-400 bg-orange-500/10'
                    : config.imageConfig?.dataUrl
                    ? 'border-orange-500/40 bg-slate-950'
                    : 'border-slate-700 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-950'
                }`}
              >
                {config.imageConfig?.dataUrl ? (
                  <div className="flex flex-col items-center">
                    <div className="relative mb-3">
                      <img
                        src={config.imageConfig.dataUrl}
                        alt="Logo Preview"
                        className="w-20 h-20 object-contain rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange({
                            imageConfig: {
                              ...config.imageConfig,
                              dataUrl: null,
                              fileName: '',
                            },
                            mode: 'text',
                          });
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors shadow"
                        title="Remover imagem"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-xs font-semibold text-orange-400">
                      {config.imageConfig.fileName || 'Imagem Carregada'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Clique ou arraste outro arquivo para substituir
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-medium text-slate-200">
                      Clique para selecionar ou arraste uma imagem aqui
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      PNG transparente recomendado (ideal para brasões, facções e logos)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick 1-Click Popular FiveM Logo Presets */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Logos Prontos do FiveM (1-Clique para Testar)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_IMAGE_PRESETS.map((preset) => {
                  const isCurrent =
                    config.imageConfig?.fileName === `${preset.id}.svg`;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onChange({
                          mode: config.mode === 'text' ? 'image' : config.mode,
                          imageConfig: {
                            ...config.imageConfig,
                            dataUrl: svgToDataUrl(preset.svg),
                            fileName: `${preset.id}.svg`,
                            badgeShape: preset.badgeShape,
                            glowRimColor: preset.glowColor,
                          },
                          propName: `prop_logo_${preset.id}`,
                        });
                      }}
                      className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2.5 ${
                        isCurrent
                          ? 'border-orange-500 bg-orange-500/10 text-orange-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded border border-slate-700 bg-slate-900 p-0.5 flex-shrink-0"
                        dangerouslySetInnerHTML={{ __html: preset.svg }}
                      />
                      <div className="overflow-hidden">
                        <div className="text-xs font-semibold truncate text-slate-200">
                          {preset.name.split(' (')[0]}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {preset.category}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seletor de Moldura / Base 3D com Opção Sem Moldura */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-200">
                  Moldura / Base 3D da Imagem
                </label>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border transition-colors ${
                    config.imageConfig?.hasFrame === false || config.imageConfig?.badgeShape === 'none'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      : 'bg-orange-500/15 text-orange-300 border-orange-500/40'
                  }`}
                >
                  {config.imageConfig?.hasFrame === false || config.imageConfig?.badgeShape === 'none'
                    ? 'SEM MOLDURA'
                    : 'COM MOLDURA'}
                </span>
              </div>

              {/* Botões Principais: Sem Moldura vs Com Moldura */}
              <div className="grid grid-cols-2 gap-2 mb-2.5">
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      imageConfig: {
                        ...config.imageConfig,
                        hasFrame: false,
                        badgeShape: 'none',
                        glowRim: false,
                      },
                    })
                  }
                  className={`py-2 px-2.5 rounded-lg border text-center text-xs transition-all flex items-center justify-center gap-1.5 ${
                    config.imageConfig?.hasFrame === false || config.imageConfig?.badgeShape === 'none'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold shadow-sm shadow-amber-500/10'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <X className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sem Moldura (Apenas Logo)</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      imageConfig: {
                        ...config.imageConfig,
                        hasFrame: true,
                        badgeShape: config.imageConfig?.badgeShape === 'none' ? 'shield' : config.imageConfig?.badgeShape || 'shield',
                      },
                    })
                  }
                  className={`py-2 px-2.5 rounded-lg border text-center text-xs transition-all flex items-center justify-center gap-1.5 ${
                    config.imageConfig?.hasFrame !== false && config.imageConfig?.badgeShape !== 'none'
                      ? 'border-orange-500 bg-orange-500/15 text-orange-300 font-bold shadow-sm shadow-orange-500/10'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>Com Moldura / Placa 3D</span>
                </button>
              </div>

              {/* Formatos de Moldura (Exibidos se Com Moldura ou Seleção Direta) */}
              {config.imageConfig?.hasFrame !== false && config.imageConfig?.badgeShape !== 'none' ? (
                <div>
                  <div className="text-[11px] text-slate-400 mb-1.5">Escolha o Formato da Placa / Moldura:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'shield', label: 'Escudo / Brasão' },
                      { id: 'circle', label: 'Círculo / Moeda' },
                      { id: 'rectangle', label: 'Retângulo / Placa' },
                      { id: 'hexagon', label: 'Hexágono Tático' },
                      { id: 'diamond', label: 'Losango VIP' },
                      { id: 'contour', label: 'Borda Arredondada' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          onChange({
                            imageConfig: {
                              ...config.imageConfig,
                              hasFrame: true,
                              badgeShape: s.id as BadgeShape,
                            },
                          })
                        }
                        className={`py-2 px-2 rounded-lg border text-center text-xs transition-all ${
                          config.imageConfig?.badgeShape === s.id
                            ? 'border-orange-500 bg-orange-500/10 text-orange-300 font-semibold'
                            : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-orange-950/20 border border-orange-900/40 text-[11px] text-orange-300/90 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-orange-300">Modo Sem Moldura (Apenas Logo):</span> O 3D e a colisão são calculados diretamente e exclusivamente no contorno da imagem. Não há placa quadrada nem bordas extras de fundo.
                  </div>
                </div>
              )}
            </div>

            {/* 3D Depth & Scale Sliders */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              {/* Controlo de Profundidade / Grossura 3D da Imagem (Habilitado sempre: com ou sem moldura) */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-200">
                      Profundidade / Grossura 3D da Imagem
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${
                      (config.imageConfig?.depth || 0.25) <= 0.35
                        ? 'bg-slate-800 text-slate-300'
                        : (config.imageConfig?.depth || 0.25) <= 0.85
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : (config.imageConfig?.depth || 0.25) <= 1.6
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : (config.imageConfig?.depth || 0.25) <= 2.5
                        ? 'bg-orange-600/30 text-orange-200 border border-orange-500/50'
                        : 'bg-orange-500/40 text-white border border-orange-400'
                    }`}>
                      {(config.imageConfig?.depth || 0.25) <= 0.35
                        ? 'Fino'
                        : (config.imageConfig?.depth || 0.25) <= 0.85
                        ? 'Padrão'
                        : (config.imageConfig?.depth || 0.25) <= 1.6
                        ? 'Grosso'
                        : (config.imageConfig?.depth || 0.25) <= 2.5
                        ? 'Ultra Grosso'
                        : 'Maciço 3D'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0.05"
                      max="4.00"
                      step="0.05"
                      value={config.imageConfig?.depth || 0.25}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          onChange({
                            imageConfig: {
                              ...config.imageConfig,
                              depth: Math.max(0.05, Math.min(4.0, val)),
                            },
                          });
                        }
                      }}
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-center font-mono text-orange-400 font-bold focus:outline-none focus:border-orange-400"
                    />
                    <span className="text-[10px] font-mono text-slate-400">m</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0.05"
                  max="3.50"
                  step="0.05"
                  value={config.imageConfig?.depth || 0.25}
                  onChange={(e) =>
                    onChange({
                      imageConfig: {
                        ...config.imageConfig,
                        depth: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />

                {/* Botões Rápidos de Grossura da Imagem */}
                <div className="grid grid-cols-5 gap-1 pt-0.5">
                  {[
                    { label: 'Fino', val: 0.20 },
                    { label: 'Normal', val: 0.50 },
                    { label: 'Grosso', val: 1.20 },
                    { label: 'Extra', val: 2.00 },
                    { label: 'Maciço', val: 3.00 },
                  ].map((btn) => {
                    const isSelected = Math.abs((config.imageConfig?.depth || 0.25) - btn.val) < 0.05;
                    return (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() =>
                          onChange({
                            imageConfig: {
                              ...config.imageConfig,
                              depth: btn.val,
                            },
                          })
                        }
                        className={`py-1 px-1 rounded text-[10px] font-medium border text-center transition-all ${
                          isSelected
                            ? 'border-orange-400 bg-orange-500/20 text-orange-200 font-bold'
                            : 'border-slate-800 bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div>{btn.label}</div>
                        <div className="text-[9px] font-mono opacity-80">{btn.val.toFixed(2)}m</div>
                      </button>
                    );
                  })}
                </div>

                <div className="text-[10px] text-slate-400">
                  {config.imageConfig?.hasFrame === false || config.imageConfig?.badgeShape === 'none'
                    ? '💡 No modo sem moldura, o 3D e a colisão aumentam e diminuem juntos diretamente com esta grossura.'
                    : '💡 Ajusta a espessura da base/placa e da borda iluminada neon rim.'}
                </div>
              </div>

              {/* Controlo de Tamanho / Escala Geral do Emblema */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    Tamanho / Escala da Imagem
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0.2"
                      max="4.0"
                      step="0.1"
                      value={config.imageConfig?.scale || 1.0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          onChange({
                            imageConfig: {
                              ...config.imageConfig,
                              scale: Math.max(0.2, Math.min(4.0, val)),
                            },
                          });
                        }
                      }}
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-center font-mono text-orange-400 font-bold focus:outline-none focus:border-orange-400"
                    />
                    <span className="text-[10px] font-mono text-slate-400">x</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0.2"
                  max="3.5"
                  step="0.05"
                  value={config.imageConfig?.scale || 1.0}
                  onChange={(e) =>
                    onChange({
                      imageConfig: {
                        ...config.imageConfig,
                        scale: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />

                {/* Botões Rápidos de Escala */}
                <div className="grid grid-cols-5 gap-1 pt-0.5">
                  {[0.5, 0.8, 1.0, 1.5, 2.2].map((s) => {
                    const isSelected = Math.abs((config.imageConfig?.scale || 1.0) - s) < 0.05;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          onChange({
                            imageConfig: {
                              ...config.imageConfig,
                              scale: s,
                            },
                          })
                        }
                        className={`py-1 px-1 rounded text-[10px] font-medium border text-center transition-all ${
                          isSelected
                            ? 'border-orange-400 bg-orange-500/20 text-orange-200 font-bold'
                            : 'border-slate-800 bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        {s.toFixed(1)}x
                      </button>
                    );
                  })}
                </div>

                {/* Ajustes Livres de Proporção (Largura X / Altura Y) */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Ajuste Fino de Proporções (X/Y)</span>
                    {((config.imageConfig?.widthScale && config.imageConfig.widthScale !== 1.0) ||
                      (config.imageConfig?.heightScale && config.imageConfig.heightScale !== 1.0)) && (
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            imageConfig: {
                              ...config.imageConfig,
                              widthScale: 1.0,
                              heightScale: 1.0,
                            },
                          })
                        }
                        className="text-[10px] text-orange-400 hover:text-orange-300 underline"
                      >
                        Resetar 1:1
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                        <span>Largura (X)</span>
                        <span className="font-mono text-orange-400">
                          {(config.imageConfig?.widthScale || 1.0).toFixed(2)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.3"
                        max="2.5"
                        step="0.05"
                        value={config.imageConfig?.widthScale || 1.0}
                        onChange={(e) =>
                          onChange({
                            imageConfig: {
                              ...config.imageConfig,
                              widthScale: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-orange-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                        <span>Altura (Y)</span>
                        <span className="font-mono text-orange-400">
                          {(config.imageConfig?.heightScale || 1.0).toFixed(2)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.3"
                        max="2.5"
                        step="0.05"
                        value={config.imageConfig?.heightScale || 1.0}
                        onChange={(e) =>
                          onChange({
                            imageConfig: {
                              ...config.imageConfig,
                              heightScale: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-orange-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status da Colisão .YBN da Imagem em Tempo Real */}
              <div className="bg-slate-900/90 p-3 rounded-lg border border-orange-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-semibold text-white">
                      Colisão .YBN (Física FiveM)
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                    Auto 1:1
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-400">Dimensões da Colisão:</span>
                  <span className="text-orange-300 font-bold">
                    {bounds ? `${bounds.width}m × ${bounds.height}m × ${bounds.depth}m` : '0.00m × 0.00m × 0.00m'}
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed">
                  ✓ A caixa de colisão é ajustada exclusivamente à imagem. Conforme você aumenta ou diminui a escala e grossura, a colisão expande e encolhe junta.
                </p>

                {setShowWireframe && (
                  <button
                    type="button"
                    onClick={() => setShowWireframe(!showWireframe)}
                    className={`w-full py-1.5 px-2.5 rounded text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      showWireframe
                        ? 'border-orange-500 bg-orange-500/20 text-orange-200'
                        : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-orange-400" />
                    <span>
                      {showWireframe
                        ? 'Ocultar Hitbox de Colisão no 3D'
                        : 'Visualizar Hitbox de Colisão no 3D'}
                    </span>
                  </button>
                )}
              </div>

              {/* Neon Rim Light Frame (somente se tiver moldura) */}
              {config.imageConfig?.hasFrame !== false && config.imageConfig?.badgeShape !== 'none' ? (
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">
                      Moldura com Neon Rim Light (Borda Iluminada)
                    </span>
                    <input
                      type="checkbox"
                      checked={config.imageConfig?.glowRim || false}
                      onChange={(e) =>
                        onChange({
                          imageConfig: {
                            ...config.imageConfig,
                            glowRim: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
                    />
                  </div>

                  {config.imageConfig?.glowRim && (
                    <div className="space-y-2 pt-1 border-t border-slate-800/60">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Cor do Neon da Moldura</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={config.imageConfig?.glowRimColor || config.glowColor}
                            onChange={(e) =>
                              onChange({
                                imageConfig: {
                                  ...config.imageConfig,
                                  glowRimColor: e.target.value,
                                },
                              })
                            }
                            className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                          />
                          <span className="text-[10px] font-mono text-slate-400">
                            {config.imageConfig?.glowRimColor || config.glowColor}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Intensidade do Brilho Neon</span>
                          <span className="font-mono text-orange-400">
                            {(config.imageConfig?.glowRimIntensity || 3).toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="8"
                          step="0.5"
                          value={config.imageConfig?.glowRimIntensity || 3}
                          onChange={(e) =>
                            onChange({
                              imageConfig: {
                                ...config.imageConfig,
                                glowRimIntensity: parseFloat(e.target.value),
                              },
                            })
                          }
                          className="w-full accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* TAB 2: MATERIAL & SHADERS */}
        {activeTab === 'material' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Tipo de Material (Shaders GTA V)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'neon', label: 'Neon / LED Emissivo', desc: 'gta_emissive.sps' },
                  { id: 'metal', label: 'Metal Cromado', desc: 'gta_normal_spec.sps' },
                  { id: 'concrete', label: 'Concreto Vinewood', desc: 'gta_default.sps' },
                  { id: 'gold', label: 'Ouro Dourado', desc: 'gta_normal_spec.sps' },
                  { id: 'carbon', label: 'Fibra de Carbono', desc: 'gta_normal_spec.sps' },
                  { id: 'matte', label: 'Acrílico Fosco', desc: 'gta_default.sps' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onChange({ materialType: m.id as MaterialType })}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      config.materialType === m.id
                        ? 'border-orange-500 bg-orange-500/10 text-orange-300 font-semibold'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-medium">{m.label}</div>
                    <div className="text-[10px] font-mono text-slate-500">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Pickers with RGB Support */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Cor Primária do Letreiro (Hex / RGB)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange({
                      primaryColor: val,
                      ...(config.materialType === 'neon' ? { glowColor: val } : {}),
                    });
                  }}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChange({
                        primaryColor: val,
                        ...(config.materialType === 'neon' ? { glowColor: val } : {}),
                      });
                    }}
                    className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white font-mono"
                  />
                  <div className="text-[11px] font-mono text-orange-400 mt-1">
                    rgb({currentRgb.r}, {currentRgb.g}, {currentRgb.b})
                  </div>
                </div>
              </div>

              {/* Mini RGB Sliders in Material tab */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-red-400 font-mono">
                    <span>R</span>
                    <span>{currentRgb.r}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={currentRgb.r}
                    onChange={(e) => handleRgbChange('r', parseInt(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-emerald-400 font-mono">
                    <span>G</span>
                    <span>{currentRgb.g}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={currentRgb.g}
                    onChange={(e) => handleRgbChange('g', parseInt(e.target.value))}
                    className="w-full accent-emerald-500 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-blue-400 font-mono">
                    <span>B</span>
                    <span>{currentRgb.b}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={currentRgb.b}
                    onChange={(e) => handleRgbChange('b', parseInt(e.target.value))}
                    className="w-full accent-blue-500 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Quick Colors */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => onChange({ primaryColor: c.hex, glowColor: c.hex })}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                    className="w-5 h-5 rounded-full border border-slate-700 hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            </div>

            {/* Neon specific parameters */}
            {config.materialType === 'neon' && (
              <div className="p-3.5 rounded-lg bg-orange-950/20 border border-orange-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-orange-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-orange-400" />
                    Propriedades do Neon FiveM
                  </span>
                  <label className="flex items-center gap-2 text-xs text-orange-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.glowPulse}
                      onChange={(e) => onChange({ glowPulse: e.target.checked })}
                      className="accent-orange-500 rounded"
                    />
                    Efeito de Pulso
                  </label>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Intensidade do Brilho (Emissive)</span>
                    <span className="font-mono text-orange-400">{config.glowIntensity.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.2"
                    value={config.glowIntensity}
                    onChange={(e) => onChange({ glowIntensity: parseFloat(e.target.value) })}
                    className="w-full accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Cor do Brilho Emissivo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.glowColor}
                      onChange={(e) => onChange({ glowColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border border-slate-700"
                    />
                    <input
                      type="text"
                      value={config.glowColor}
                      onChange={(e) => onChange({ glowColor: e.target.value })}
                      className="w-24 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MOUNT / SUPPORT STRUCTURE */}
        {activeTab === 'mount' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Estrutura de Sustentação do Prop
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'none',
                    label: 'Flutuante / Parede (Sem Suporte)',
                    desc: 'Ideal para fixar em fachadas de prédios, outdoors existentes ou entradas.',
                  },
                  {
                    id: 'poles',
                    label: 'Postes de Aço (Chão)',
                    desc: '2 pilares de aço cilíndricos com travas de sustentação até o piso.',
                  },
                  {
                    id: 'backplate',
                    label: 'Placa Traseira / Lightbox',
                    desc: 'Painel acrílico/metálico de fundo conectando todo o letreiro.',
                  },
                  {
                    id: 'truss',
                    label: 'Treliça Industrial (Scaffolding)',
                    desc: 'Estrutura metálica tubular de palco/evento e shows.',
                  },
                  {
                    id: 'pedestal',
                    label: 'Pedestais de Concreto',
                    desc: 'Bases de concreto individuais sob as letras estilo Vinewood.',
                  },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onChange({ mountType: m.id as MountType })}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      config.mountType === m.id
                        ? 'border-orange-500 bg-orange-500/10 text-orange-300'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-semibold">{m.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {config.mountType !== 'none' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Cor do Suporte / Estrutura
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.mountColor}
                    onChange={(e) => onChange({ mountColor: e.target.value })}
                    className="w-9 h-9 rounded cursor-pointer bg-transparent border border-slate-700"
                  />
                  <input
                    type="text"
                    value={config.mountColor}
                    onChange={(e) => onChange({ mountColor: e.target.value })}
                    className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FIVEM METADATA & COLLISION */}
        {activeTab === 'fivem' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nome do Prop GTA V (.ydr / .ytyp)
              </label>
              <input
                type="text"
                value={config.propName}
                onChange={(e) => onChange({ propName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-orange-500"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-1">
                <span>Sanitizado: {sanitizePropName(config.propName)}</span>
                <span className="text-orange-400">Hash: {modelHash}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nome da Pasta da Resource FiveM
              </label>
              <input
                type="text"
                value={config.resourceName}
                onChange={(e) => onChange({ resourceName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-orange-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Comando no server.cfg: <code className="text-emerald-400 font-mono">ensure {config.resourceName || 'letreiro_3d'}</code>
              </span>
            </div>

            {/* Collision Toggle */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-200">
                    Gerar Arquivo de Colisão (.YBN)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Jogadores, projéteis e veículos colidem com o letreiro
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.hasCollision}
                  onChange={(e) => onChange({ hasCollision: e.target.checked })}
                  className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                />
              </div>

              {config.hasCollision && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Material da Colisão (Física de Impacto GTA V)
                  </label>
                  <select
                    value={config.collisionMaterial}
                    onChange={(e) =>
                      onChange({ collisionMaterial: e.target.value as CollisionMaterial })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  >
                    <option value="CONCRETE">CONCRETE (Concreto rígido / Faíscas)</option>
                    <option value="METAL_LIGHT">METAL_LIGHT (Metal leve / Chapa oca)</option>
                    <option value="METAL_HEAVY">METAL_HEAVY (Aço maciço)</option>
                    <option value="GLASS">GLASS (Vidro / Acrílico)</option>
                    <option value="WOOD">WOOD (Madeira sólida)</option>
                    <option value="PLASTIC">PLASTIC (Plástico / PVC)</option>
                  </select>
                </div>
              )}
            </div>

            {/* LOD Distance */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Distância de LOD (Renderização no GTA V)</span>
                <span className="font-mono text-orange-400">{config.lodDist} metros</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={config.lodDist}
                onChange={(e) => onChange({ lodDist: parseInt(e.target.value) })}
                className="w-full accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Valor padrão para letreiros visíveis a longa distância: 250m - 350m.
              </span>
            </div>
          </div>
        )}

        {/* TAB 5: MAP COORDINATES & YMAP */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400 leading-relaxed">
              O gerador cria automaticamente o arquivo <span className="text-orange-400 font-mono">.ymap</span> para fixar o letreiro permanentemente nas coordenadas do seu servidor.
            </div>

            {/* Quick Coordinate Presets */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Locais Famosos de Los Santos (FiveM)
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {MAP_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() =>
                      onChange({
                        coords: { x: p.x, y: p.y, z: p.z, heading: p.heading },
                      })
                    }
                    className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-200">{p.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        X: {p.x}, Y: {p.y}, Z: {p.z} | H: {p.heading}°
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-orange-400 font-medium">
                      {p.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Coords Inputs */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Coord X</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.coords.x}
                  onChange={(e) =>
                    onChange({
                      coords: { ...config.coords, x: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Coord Y</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.coords.y}
                  onChange={(e) =>
                    onChange({
                      coords: { ...config.coords, y: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Coord Z (Altura)</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.coords.z}
                  onChange={(e) =>
                    onChange({
                      coords: { ...config.coords, z: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Heading (Rotação °)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="360"
                  value={config.coords.heading}
                  onChange={(e) =>
                    onChange({
                      coords: { ...config.coords, heading: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PRESETS */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400">
              Escolha um estilo pronto para carregar instantaneamente configurações de texto, materiais, shaders e suportes:
            </div>

            <div className="space-y-2">
              {STYLE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => onChange(p)}
                  className="w-full p-3 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-slate-700 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                      {p.text}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-mono">
                      {p.materialType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{p.subText}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Download ZIP */}
          <button
            id="btn-download-resource-zip"
            onClick={onDownloadZip}
            disabled={isGeneratingZip}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50 shadow-md"
          >
            <FolderDown className="w-4 h-4 text-orange-400" />
            <span>{isGeneratingZip ? 'Empacotando...' : 'Baixar Resource .ZIP'}</span>
          </button>

          {/* Inspect Files */}
          <button
            id="btn-inspect-assets"
            onClick={onOpenInspector}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors shadow-md"
          >
            <FileCode className="w-4 h-4 text-orange-400" />
            <span>Ver Arquivos (.YDR/.YBN)</span>
          </button>
        </div>

        {/* Direct Server Export Button (Key User Request) */}
        <button
          id="btn-open-server-export"
          onClick={onOpenServerExport}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-[0.99]"
        >
          <Server className="w-4 h-4" />
          <span>EXPORTAR DIRETAMENTE PARA O SERVIDOR FIVEM</span>
        </button>
      </div>
    </div>
  );
};
