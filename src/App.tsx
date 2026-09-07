import React, { useState } from 'react';
import { SignConfig, GeneratedMeshBounds, TimeOfDay } from './types/fivem';
import { Header } from './components/Header';
import { ThreeSignCanvas } from './components/ThreeSignCanvas';
import { ConfigPanel } from './components/ConfigPanel';
import { ServerExportModal } from './components/ServerExportModal';
import { AssetInspectorModal } from './components/AssetInspectorModal';
import { createFiveMZip, sanitizePropName } from './utils/fivemGenerators';
import { Sparkles, Box, CheckCircle2, Shield, Info, ArrowRight } from 'lucide-react';

export default function App() {
  // Sign Configuration State
  const [config, setConfig] = useState<SignConfig>({
    mode: 'text',
    imageConfig: {
      dataUrl: null,
      fileName: '',
      badgeShape: 'shield',
      hasFrame: true,
      depth: 0.25,
      scale: 1.0,
      threshold: 15,
      glowRim: true,
      glowRimColor: '#f97316',
      glowRimIntensity: 3.0,
      reliefDepth: 0.05,
      invertAlpha: false,
      frameWidth: 0.06,
    },
    text: 'PazCity',
    subText: 'ROLEPLAY FIVEM',
    fontStyle: 'vinewood',
    scale: 1.25,
    depth: 0.9,
    bevel: 0.05,
    letterSpacing: -0.05,
    lineSpacing: 1.4,
    curveRadius: 0,
    materialType: 'neon',
    primaryColor: '#f97316', // Laranja vibrante
    secondaryColor: '#09090b', // Preto
    glowColor: '#ffffff', // Branco
    glowIntensity: 3.5,
    glowPulse: true,
    roughness: 0.2,
    metalness: 0.4,
    mountType: 'truss',
    mountColor: '#18181b', // Preto metálico
    mountHeight: 2.0,
    propName: 'prop_letreiro_pazcity',
    resourceName: 'letreiro_pazcity',
    categoryTag: 'faction',
    lodDist: 250,
    hasCollision: true,
    collisionMaterial: 'CONCRETE',
    coords: {
      x: 1660.12,
      y: 1.54,
      z: 166.12,
      heading: 120.0,
    },
  });

  // Mesh Bounding Box Dimensions
  const [bounds, setBounds] = useState<GeneratedMeshBounds>({
    minX: -2.5,
    maxX: 2.5,
    minY: 0,
    maxY: 1.8,
    minZ: -0.35,
    maxZ: 0.35,
    width: 5.0,
    height: 1.8,
    depth: 0.7,
    radius: 2.8,
    vertexCount: 2400,
    faceCount: 1600,
  });

  // Viewport Settings
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('midnight');
  const [showWireframe, setShowWireframe] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isInspectorModalOpen, setIsInspectorModalOpen] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);

  const handleConfigChange = (updated: Partial<SignConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleDownloadZip = async () => {
    try {
      setIsGeneratingZip(true);
      const blob = await createFiveMZip(config, bounds);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.resourceName || 'letreiro_3d'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erro ao gerar arquivo ZIP: ' + (err instanceof Error ? err.message : 'Falha desconhecida'));
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Navbar */}
      <Header
        onOpenServerExport={() => setIsExportModalOpen(true)}
        onOpenInspector={() => setIsInspectorModalOpen(true)}
        onDownloadZip={handleDownloadZip}
        isGeneratingZip={isGeneratingZip}
      />

      {/* Main Studio Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-3 md:p-4 gap-3 md:gap-4">
        {/* Left Column: Interactive 3D Viewport (60-65% width on desktop) */}
        <section className="flex-1 flex flex-col min-w-0 h-[45vh] lg:h-full gap-2">
          {/* 3D Canvas */}
          <div className="flex-1 min-h-0">
            <ThreeSignCanvas
              config={config}
              bounds={bounds}
              setBounds={setBounds}
              timeOfDay={timeOfDay}
              setTimeOfDay={setTimeOfDay}
              showWireframe={showWireframe}
              setShowWireframe={setShowWireframe}
              autoRotate={autoRotate}
              setAutoRotate={setAutoRotate}
            />
          </div>

          {/* Asset Telemetry Bar */}
          <div className="h-11 px-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Box className="w-4 h-4 text-orange-400" />
                <span>Asset: <strong className="text-white font-mono">{sanitizePropName(config.propName)}</strong></span>
              </span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span className="hidden sm:inline font-mono text-slate-400">
                Dimensões: <strong className="text-orange-400">{bounds.width}m</strong> × <strong className="text-orange-400">{bounds.height}m</strong> × <strong className="text-orange-400">{bounds.depth}m</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> .YDR + .YBN + .YTYP
              </span>
              <span className="hidden md:inline text-slate-500">
                Polígonos: {bounds.faceCount}
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: Configuration & Export Panel (35-40% width on desktop) */}
        <aside className="w-full lg:w-[420px] xl:w-[460px] h-[55vh] lg:h-full flex-shrink-0">
          <ConfigPanel
            config={config}
            onChange={handleConfigChange}
            onOpenServerExport={() => setIsExportModalOpen(true)}
            onOpenInspector={() => setIsInspectorModalOpen(true)}
            onDownloadZip={handleDownloadZip}
            isGeneratingZip={isGeneratingZip}
            bounds={bounds}
            showWireframe={showWireframe}
            setShowWireframe={setShowWireframe}
          />
        </aside>
      </main>

      {/* Server Export Modal */}
      <ServerExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        config={config}
        bounds={bounds}
      />

      {/* Asset Code & Files Inspector Modal */}
      <AssetInspectorModal
        isOpen={isInspectorModalOpen}
        onClose={() => setIsInspectorModalOpen(false)}
        config={config}
        bounds={bounds}
      />
    </div>
  );
}
