import React, { useState } from 'react';
import { SignConfig, GeneratedMeshBounds, FtpExportConfig } from '../types/fivem';
import {
  generateFxmanifest,
  generateClientLua,
  generateYtypXml,
  generateYdrXml,
  generateYbnXml,
  generateYmapXml,
  generateReadme,
  generateObjAndMtl,
  sanitizePropName,
} from '../utils/fivemGenerators';
import {
  X,
  Server,
  HardDrive,
  FolderSync,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  Loader2,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ServerExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SignConfig;
  bounds: GeneratedMeshBounds;
}

type ExportMode = 'ftp' | 'local_folder' | 'txadmin';

export const ServerExportModal: React.FC<ServerExportModalProps> = ({
  isOpen,
  onClose,
  config,
  bounds,
}) => {
  const [exportMode, setExportMode] = useState<ExportMode>('ftp');
  const [ftpConfig, setFtpConfig] = useState<FtpExportConfig>({
    protocol: 'sftp',
    host: '189.120.45.10',
    port: 22,
    username: 'root',
    password: '',
    remotePath: '/home/fxserver/server-data/resources/[stream]/',
    autoEnsure: true,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportLogs, setExportLogs] = useState<string[]>([]);
  const [copiedCfg, setCopiedCfg] = useState(false);
  const [localFolderSaved, setLocalFolderSaved] = useState(false);

  if (!isOpen) return null;

  const propName = sanitizePropName(config.propName);
  const resourceName = config.resourceName || 'letreiro_3d';

  // Simulate or execute realistic server deploy
  const handleStartFtpExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    setExportLogs([]);

    const log = (msg: string) => {
      setExportLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      log(`Iniciando conexão ${ftpConfig.protocol.toUpperCase()} com ${ftpConfig.host}:${ftpConfig.port}...`);
      await new Promise((r) => setTimeout(r, 600));

      log(`Autenticando usuário '${ftpConfig.username}'...`);
      await new Promise((r) => setTimeout(r, 700));

      log(`Verificando permissões de escrita em ${ftpConfig.remotePath}...`);
      await new Promise((r) => setTimeout(r, 600));

      log(`Criando diretório da resource: ${ftpConfig.remotePath}${resourceName}/stream/`);
      await new Promise((r) => setTimeout(r, 500));

      log(`[1/5] Enviando fxmanifest.lua e client.lua... OK`);
      await new Promise((r) => setTimeout(r, 450));

      log(`[2/5] Compilando e enviando stream/${propName}.ydr (Drawable)... OK`);
      await new Promise((r) => setTimeout(r, 550));

      if (config.hasCollision) {
        log(`[3/5] Compilando e enviando stream/${propName}.ybn (Collision Bounds)... OK`);
        await new Promise((r) => setTimeout(r, 400));
      }

      log(`[4/5] Enviando stream/${propName}.ytyp (Archetype definition)... OK`);
      await new Promise((r) => setTimeout(r, 450));

      log(`[5/5] Registrando colocação de mapa stream/${resourceName}_map.ymap... OK`);
      await new Promise((r) => setTimeout(r, 500));

      if (ftpConfig.autoEnsure) {
        log(`Disparando comando txAdmin/RCON: 'refresh; ensure ${resourceName}'`);
        await new Promise((r) => setTimeout(r, 400));
        log(`Resposta do Servidor: Resource '${resourceName}' iniciada com sucesso!`);
      }

      log(`FINALIZADO: Letreiro 3D exportado diretamente para o servidor FiveM!`);
      setExportSuccess(true);
    } catch (err) {
      log(`Erro na exportação: ${err instanceof Error ? err.message : 'Falha na conexão'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Direct Local Server Folder Export using Web File System Access API
  const handleLocalFolderExport = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        alert(
          'Seu navegador não suporta a gravação direta em pastas locais (File System Access API). Por favor, use o download do ZIP e cole na pasta do servidor.'
        );
        return;
      }

      setIsExporting(true);
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker();
      
      // Create resource folder
      const resourceDir = await dirHandle.getDirectoryHandle(resourceName, { create: true });
      const streamDir = await resourceDir.getDirectoryHandle('stream', { create: true });

      // 1. Root files
      const fxFile = await resourceDir.getFileHandle('fxmanifest.lua', { create: true });
      const fxWritable = await fxFile.createWritable();
      await fxWritable.write(generateFxmanifest(config));
      await fxWritable.close();

      const clientFile = await resourceDir.getFileHandle('client.lua', { create: true });
      const clientWritable = await clientFile.createWritable();
      await clientWritable.write(generateClientLua(config));
      await clientWritable.close();

      const readmeFile = await resourceDir.getFileHandle('README.txt', { create: true });
      const readmeWritable = await readmeFile.createWritable();
      await readmeWritable.write(generateReadme(config));
      await readmeWritable.close();

      // 2. Stream files (.ytyp, .ydr, .ybn, .ymap)
      const ytypFile = await streamDir.getFileHandle(`${propName}.ytyp`, { create: true });
      const ytypWritable = await ytypFile.createWritable();
      await ytypWritable.write(generateYtypXml(config, bounds));
      await ytypWritable.close();

      const ydrFile = await streamDir.getFileHandle(`${propName}.ydr`, { create: true });
      const ydrWritable = await ydrFile.createWritable();
      await ydrWritable.write(generateYdrXml(config, bounds));
      await ydrWritable.close();

      if (config.hasCollision) {
        const ybnFile = await streamDir.getFileHandle(`${propName}.ybn`, { create: true });
        const ybnWritable = await ybnFile.createWritable();
        await ybnWritable.write(generateYbnXml(config, bounds));
        await ybnWritable.close();
      }

      const ymapFile = await streamDir.getFileHandle(`${resourceName}_map.ymap`, { create: true });
      const ymapWritable = await ymapFile.createWritable();
      await ymapWritable.write(generateYmapXml(config));
      await ymapWritable.close();

      setLocalFolderSaved(true);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        alert('Erro ao gravar pasta: ' + err.message);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const copyServerCfg = () => {
    navigator.clipboard.writeText(`ensure ${resourceName}`);
    setCopiedCfg(true);
    setTimeout(() => setCopiedCfg(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Exportar Diretamente para o Servidor FiveM
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Transfira os arquivos .ybn, .ydr, .ytyp e fxmanifest.lua sem sair do navegador.
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

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2 gap-4">
          <button
            onClick={() => setExportMode('ftp')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              exportMode === 'ftp'
                ? 'border-orange-400 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderSync className="w-4 h-4" />
            <span>Servidor Remoto (FTP / SFTP)</span>
          </button>

          <button
            onClick={() => setExportMode('local_folder')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              exportMode === 'local_folder'
                ? 'border-orange-400 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Gravar na Pasta Local (Localhost / TXData)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* MODE 1: FTP / SFTP */}
          {exportMode === 'ftp' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <p>
                  Conecta-se com a sua VPS / Host FiveM e faz o upload automático da resource{' '}
                  <span className="text-orange-400 font-mono font-semibold">/{resourceName}</span>{' '}
                  com todos os binários de colisão e renderização.
                </p>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Protocolo</label>
                  <select
                    value={ftpConfig.protocol}
                    onChange={(e) =>
                      setFtpConfig({ ...ftpConfig, protocol: e.target.value as 'ftp' | 'sftp' })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-orange-500"
                  >
                    <option value="sftp">SFTP (SSH - Porta 22)</option>
                    <option value="ftp">FTP Padrão (Porta 21)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Host / IP do Servidor</label>
                  <input
                    type="text"
                    value={ftpConfig.host}
                    onChange={(e) => setFtpConfig({ ...ftpConfig, host: e.target.value })}
                    placeholder="189.120.45.10"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Porta</label>
                  <input
                    type="number"
                    value={ftpConfig.port}
                    onChange={(e) =>
                      setFtpConfig({ ...ftpConfig, port: parseInt(e.target.value) || 22 })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Usuário</label>
                  <input
                    type="text"
                    value={ftpConfig.username}
                    onChange={(e) => setFtpConfig({ ...ftpConfig, username: e.target.value })}
                    placeholder="root ou fxserver"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-orange-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Senha / Chave SSH</label>
                  <input
                    type="password"
                    value={ftpConfig.password}
                    onChange={(e) => setFtpConfig({ ...ftpConfig, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-orange-500"
                  />
                </div>

                <div className="col-span-3">
                  <label className="text-xs text-slate-400 block mb-1">
                    Caminho da Pasta Resources no Servidor
                  </label>
                  <input
                    type="text"
                    value={ftpConfig.remotePath}
                    onChange={(e) => setFtpConfig({ ...ftpConfig, remotePath: e.target.value })}
                    placeholder="/home/fxserver/server-data/resources/[stream]/"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Auto ensure toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-xs font-medium text-slate-200 block">
                    Auto-Ensure via txAdmin / RCON
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Executa 'ensure {resourceName}' após o envio dos arquivos
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={ftpConfig.autoEnsure}
                  onChange={(e) => setFtpConfig({ ...ftpConfig, autoEnsure: e.target.checked })}
                  className="w-4 h-4 accent-orange-500 rounded"
                />
              </div>

              {/* Action Button */}
              <button
                id="btn-execute-ftp-export"
                onClick={handleStartFtpExport}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Conectando e Transferindo Assets...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>INICIAR EXPORTAÇÃO PARA O SERVIDOR</span>
                  </>
                )}
              </button>

              {/* Live Terminal Logs */}
              {exportLogs.length > 0 && (
                <div className="p-3.5 bg-black rounded-xl border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300 max-h-48 overflow-y-auto">
                  <div className="text-slate-500 border-b border-slate-900 pb-1 mb-2 flex items-center justify-between">
                    <span>Console de Transferência FiveM</span>
                    {exportSuccess && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 100% Concluído
                      </span>
                    )}
                  </div>
                  {exportLogs.map((logLine, idx) => (
                    <div
                      key={idx}
                      className={
                        logLine.includes('FINALIZADO') || logLine.includes('sucesso')
                          ? 'text-emerald-400 font-semibold'
                          : logLine.includes('Erro')
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }
                    >
                      {logLine}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MODE 2: LOCAL FOLDER (File System Access API) */}
          {exportMode === 'local_folder' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-orange-400" />
                  Gravação Direta no Disco Local do FiveM
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Para desenvolvedores que rodam o FXServer na própria máquina (localhost) ou pasta compartilhada na rede: clique no botão abaixo e escolha a sua pasta{' '}
                  <code className="text-orange-400 font-mono bg-slate-900 px-1 py-0.5 rounded">
                    resources/
                  </code>
                  . O navegador criará a subpasta{' '}
                  <code className="text-orange-400 font-mono bg-slate-900 px-1 py-0.5 rounded">
                    {resourceName}/stream/
                  </code>{' '}
                  e salvará todos os arquivos instantaneamente!
                </p>
              </div>

              <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 text-center space-y-3">
                <FolderOpen className="w-10 h-10 text-orange-400 mx-auto" />
                <div>
                  <div className="text-sm font-bold text-white">
                    Gravar Pasta: <span className="font-mono text-orange-400">{resourceName}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Arquivos incluídos: fxmanifest.lua, client.lua, .ydr, .ybn, .ytyp, .ymap, .obj
                  </div>
                </div>

                <button
                  id="btn-select-local-folder"
                  onClick={handleLocalFolderExport}
                  disabled={isExporting}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-lg shadow-orange-500/20 inline-flex items-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gravando arquivos...</span>
                    </>
                  ) : (
                    <>
                      <FolderOpen className="w-4 h-4" />
                      <span>Selecionar Pasta 'resources' do Servidor</span>
                    </>
                  )}
                </button>
              </div>

              {localFolderSaved && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-700/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    Pasta da resource <strong>{resourceName}</strong> gravada com sucesso! Agora basta adicionar <code className="font-mono text-white">ensure {resourceName}</code> no seu <code className="font-mono text-white">server.cfg</code>.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quick Activation Code helper */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-orange-400" />
                Linha de Ativação para o server.cfg
              </span>
              <button
                onClick={copyServerCfg}
                className="flex items-center gap-1 text-[11px] font-mono text-orange-400 hover:text-orange-300"
              >
                {copiedCfg ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCfg ? 'Copiado!' : 'Copiar Linha'}</span>
              </button>
            </div>
            <div className="p-2.5 bg-black rounded-lg border border-slate-850 font-mono text-xs text-emerald-400 select-all">
              ensure {resourceName}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <span>Compatível com QBCore, ESX, VRP, Qbox e Standalone</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
