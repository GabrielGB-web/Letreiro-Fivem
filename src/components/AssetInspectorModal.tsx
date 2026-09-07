import React, { useState } from 'react';
import { SignConfig, GeneratedMeshBounds } from '../types/fivem';
import {
  generateFxmanifest,
  generateClientLua,
  generateYtypXml,
  generateYdrXml,
  generateYbnXml,
  generateYmapXml,
  generateReadme,
  generateOpenIvGuide,
  generateObjAndMtl,
  sanitizePropName,
} from '../utils/fivemGenerators';
import {
  X,
  FileCode,
  Copy,
  Check,
  Download,
  Box,
  Layers,
  Sparkles,
  MapPin,
  FileText,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

interface AssetInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SignConfig;
  bounds: GeneratedMeshBounds;
}

type FileTab =
  | 'ytyp'
  | 'ydr'
  | 'openiv'
  | 'ybn'
  | 'ymap'
  | 'fxmanifest'
  | 'client'
  | 'obj'
  | 'readme';

export const AssetInspectorModal: React.FC<AssetInspectorModalProps> = ({
  isOpen,
  onClose,
  config,
  bounds,
}) => {
  const [activeTab, setActiveTab] = useState<FileTab>('ytyp');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const propName = sanitizePropName(config.propName);
  const resourceName = config.resourceName || 'letreiro_3d';

  // Compute file contents
  const files: Record<FileTab, { name: string; content: string; language: string; badge: string }> = {
    ytyp: {
      name: `${propName}.ytyp.xml`,
      content: generateYtypXml(config, bounds),
      language: 'xml',
      badge: 'Archetype Definition',
    },
    ydr: {
      name: `${propName}.ydr.xml`,
      content: generateYdrXml(config, bounds),
      language: 'xml',
      badge: 'CodeWalker / Sollumz Drawable',
    },
    openiv: {
      name: 'COMO_ABRIR_NO_OPENIV.txt',
      content: generateOpenIvGuide(config),
      language: 'text',
      badge: 'Guia OpenIV & CodeWalker',
    },
    ybn: {
      name: `${propName}.ybn.xml`,
      content: config.hasCollision
        ? generateYbnXml(config, bounds)
        : '<!-- Colisão .YBN desativada nas configurações -->',
      language: 'xml',
      badge: 'Bound Composite Hitbox',
    },
    ymap: {
      name: `${resourceName}_map.ymap.xml`,
      content: generateYmapXml(config),
      language: 'xml',
      badge: 'Map Placement Entity',
    },
    fxmanifest: {
      name: 'fxmanifest.lua',
      content: generateFxmanifest(config),
      language: 'lua',
      badge: 'FiveM Manifest',
    },
    client: {
      name: 'client.lua',
      content: generateClientLua(config),
      language: 'lua',
      badge: 'In-Game Testing Script',
    },
    obj: {
      name: `${propName}.obj`,
      content: generateObjAndMtl(config, bounds).obj,
      language: 'text',
      badge: '3D Wavefront Mesh',
    },
    readme: {
      name: 'README.txt',
      content: generateReadme(config),
      language: 'text',
      badge: 'Manual de Instalação',
    },
  };

  const currentFile = files[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Inspetor de Código e Assets FiveM
              </h2>
              <p className="text-xs text-slate-400">
                Visualize os esquemas XML gerados para CodeWalker, Sollumz, OpenIV e FXServer.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 overflow-x-auto scrollbar-none gap-1 py-1.5">
          {(Object.keys(files) as FileTab[]).map((tabKey) => {
            const f = files[tabKey];
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === tabKey
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{f.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-bar with file details and copy/download */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono font-medium">{currentFile.name}</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-orange-400 font-medium">
              {currentFile.badge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
            </button>

            <button
              onClick={handleDownloadSingleFile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Arquivo</span>
            </button>
          </div>
        </div>

        {/* OpenIV notice banner */}
        {(activeTab === 'ydr' || activeTab === 'openiv') && (
          <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-amber-200">
                Por que o arquivo .ydr aparece &quot;bloqueado&quot; no OpenIV?
              </span>
              <p className="text-[11px] text-amber-300/80 leading-relaxed">
                O OpenIV exige arquivos <strong>binários compilados (RSC7)</strong>. O arquivo acima é o XML aberto do CodeWalker.
                Para abrir a visualização 3D no OpenIV, basta <strong>arrastar o .ydr.xml para o CodeWalker (com Edit Mode ativado)</strong> — ele gera o .ydr binário na hora em 5 segundos! Ou abra diretamente o arquivo <strong>.obj</strong> no Blender/Windows 3D.
              </p>
            </div>
          </div>
        )}

        {/* Code Editor Preview */}
        <div className="flex-1 bg-black p-4 overflow-auto font-mono text-xs leading-relaxed select-text">
          <pre className="text-slate-300">
            <code>{currentFile.content}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <span>
            {currentFile.content.split('\n').length} linhas | Padrão GTA V & FiveM Build 3095+
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
