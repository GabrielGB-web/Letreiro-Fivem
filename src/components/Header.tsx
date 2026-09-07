import React, { useState } from 'react';
import {
  Sparkles,
  Server,
  FolderDown,
  FileCode,
  HelpCircle,
  ExternalLink,
  BookOpen,
  X,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Eye,
} from 'lucide-react';

interface HeaderProps {
  onOpenServerExport: () => void;
  onOpenInspector: () => void;
  onDownloadZip: () => void;
  isGeneratingZip: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenServerExport,
  onOpenInspector,
  onDownloadZip,
  isGeneratingZip,
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showOpenIvModal, setShowOpenIvModal] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-slate-800 bg-slate-950 px-4 md:px-6 flex items-center justify-between z-20 flex-shrink-0">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25 text-white font-black text-lg border border-orange-400/30">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider text-white">
                Paz<span className="text-orange-500">City</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-mono px-2 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30 font-semibold">
                FiveM 3D Studio
              </span>
            </div>
            <h1 className="text-xs text-slate-400 font-medium hidden sm:block">
              Gerador de Letreiro 3D (.ybn, .ydr, .ytyp) & Exportador
            </h1>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOpenIvModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 text-xs font-semibold border border-amber-500/30 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Abrir no OpenIV</span>
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Como Funciona</span>
          </button>

          <button
            onClick={onOpenInspector}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 transition-colors"
          >
            <FileCode className="w-4 h-4 text-orange-400" />
            <span className="hidden md:inline">Inspecionar Arquivos</span>
          </button>

          <button
            onClick={onDownloadZip}
            disabled={isGeneratingZip}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            <FolderDown className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">Baixar .ZIP</span>
          </button>

          <button
            onClick={onOpenServerExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 active:scale-95"
          >
            <Server className="w-4 h-4" />
            <span>Exportar para o Servidor</span>
          </button>
        </div>
      </header>

      {/* OpenIV & CodeWalker Explanation Modal */}
      {showOpenIvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Por que o .YDR aparece &quot;bloqueado&quot; no OpenIV?
                  </h3>
                  <p className="text-xs text-slate-400">
                    Entenda a diferença entre o arquivo XML aberto e o binário do GTA V.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOpenIvModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              {/* Box 1: O Motivo */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <h4 className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <span>1. O Motivo do Arquivo Estar &quot;Bloqueado&quot; no OpenIV</span>
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  O <strong>OpenIV</strong> só consegue abrir e renderizar modelos 3D que estejam em formato{' '}
                  <strong className="text-white">binário compilado da Rockstar Games (RSC7)</strong>.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Softwares 3D e geradores web salvam o modelo em formato{' '}
                  <strong className="text-orange-400">XML de texto aberto (.ydr.xml)</strong>. Se você tentar
                  abrir um arquivo de texto XML diretamente no visualizador 3D do OpenIV, ele não encontra o código binário da Rockstar e exibe como bloqueado.
                </p>
              </div>

              {/* Box 2: Erro no CodeWalker */}
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                <h4 className="font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Erro no CodeWalker: &quot;Referência de objeto não definida para uma instância...&quot;?</span>
                </h4>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Esse erro no RPF Explorer acontece porque o CodeWalker (feito em C#) tenta ler buffers de vértices e esqueletos completos serializados que só o próprio CodeWalker ou o Sollumz geram internamente.
                </p>
              </div>

              {/* Box 3: Solução Definitiva com Blender Sollumz */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Solução 100% Garantida: Exportar via Blender (Plugin Sollumz)</span>
                </h4>
                <p className="text-slate-300 text-[11px]">
                  Esta é a forma oficial usada por todos os modeladores de FiveM:
                </p>
                <ol className="list-decimal list-inside text-slate-300 space-y-1.5 pl-1 text-[11px]">
                  <li>Abra o <strong>Blender</strong> com o plugin gratuito <strong>Sollumz</strong> instalado.</li>
                  <li>Vá em <code className="text-emerald-300 font-mono bg-slate-900 px-1 py-0.5 rounded">File &gt; Import &gt; Wavefront (.obj)</code> e selecione o arquivo <strong className="text-white">.obj</strong> gerado pelo nosso site.</li>
                  <li>Na aba lateral do Sollumz (tecla <strong>N</strong> no Blender), selecione o modelo e clique em <strong className="text-white">&quot;Convert to Drawable&quot;</strong>.</li>
                  <li>Vá em <code className="text-emerald-300 font-mono bg-slate-900 px-1 py-0.5 rounded">File &gt; Export &gt; RAGE Drawable (.ydr)</code>.</li>
                  <li><strong className="text-white">Pronto!</strong> O Sollumz gera o binário .ydr oficial perfeito. Ao abrir no OpenIV, ele abrirá o 3D imediatamente sem nenhum erro!</li>
                </ol>
              </div>

              {/* Box 4: Abrir direto o OBJ */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <h4 className="font-semibold text-sky-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>Opção Rápida: Visualizar a Malha 3D Real (.OBJ)</span>
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Não quer converter agora? O arquivo <code className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">prop_xxx.obj</code> incluso no ZIP contém a <strong>geometria 3D real completa</strong> com todas as letras, relevos e suportes.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Você pode abrir o arquivo <strong>.obj</strong> com 2 cliques no próprio <strong>Visualizador 3D do Windows</strong>, no Blender ou no 3ds Max sem precisar converter nada!
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowOpenIvModal(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
              >
                Entendi, fechar ajuda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-400" />
                Guia Completo: Criação e Instalação de Letreiros no FiveM
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="font-semibold text-orange-400">1. O que são os arquivos gerados?</h4>
                <ul className="list-disc list-inside text-slate-400 space-y-1 mt-1">
                  <li>
                    <strong className="text-white">.ydr (GTA V Drawable):</strong> O modelo 3D do letreiro com materiais, shaders neon ou metal e textura.
                  </li>
                  <li>
                    <strong className="text-white">.ybn (Bound Composite):</strong> A malha de colisão física para que jogadores e veículos não atravessem o letreiro.
                  </li>
                  <li>
                    <strong className="text-white">.ytyp (Archetype Definition):</strong> Registra o prop no motor do GTA V com distâncias de LOD e nome do asset.
                  </li>
                  <li>
                    <strong className="text-white">.ymap (Map Placement):</strong> Posiciona o letreiro de forma permanente nas coordenadas exatas de Los Santos.
                  </li>
                  <li>
                    <strong className="text-white">fxmanifest.lua:</strong> O manifesto padrão da resource FiveM que instrui o servidor a carregar os arquivos.
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="font-semibold text-emerald-400">2. Como colocar no servidor FiveM?</h4>
                <ol className="list-decimal list-inside text-slate-400 space-y-1 mt-1">
                  <li>Clique em <strong>Exportar para o Servidor</strong> ou <strong>Baixar Resource .ZIP</strong>.</li>
                  <li>Coloque a pasta gerada dentro do diretório <code className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">resources/</code> do seu servidor.</li>
                  <li>Abra o seu <code className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">server.cfg</code> e adicione: <code className="text-emerald-400 font-mono">ensure [nome_da_resource]</code>.</li>
                  <li>Reinicie o servidor ou execute no console txAdmin: <code className="text-orange-400 font-mono">refresh; ensure [nome]</code>.</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="font-semibold text-amber-400">3. Teste In-Game no GTA V</h4>
                <p className="text-slate-400">
                  O gerador inclui um script cliente nativo. Dentro do jogo, basta digitar:
                </p>
                <div className="p-2 bg-black rounded font-mono text-orange-400">
                  /spawnletreiro
                </div>
                <p className="text-slate-500 text-[11px]">
                  O letreiro surgirá na sua frente congelado no chão com as colisões ativas! Digite <code className="text-slate-300">/delletreiro</code> para remover.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
              >
                Entendi, vamos criar!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
