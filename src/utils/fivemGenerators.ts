import JSZip from 'jszip';
import * as THREE from 'three';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { SignConfig, GeneratedMeshBounds } from '../types/fivem';
import { createLine3DMesh, createMountStructure } from './text3dEngine';
import { create3DImageEmblem } from './image3dEngine';

/**
 * GTA V Jenkins One-At-A-Time hash (joaat)
 * Calculates the exact 32-bit unsigned integer hash used by FiveM and GTA V engine.
 */
export function calculateJoaat(key: string): number {
  let hash = 0;
  const str = key.toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash += str.charCodeAt(i);
    hash += (hash << 10);
    hash ^= (hash >>> 6);
  }
  hash += (hash << 3);
  hash ^= (hash >>> 11);
  hash += (hash << 15);
  return hash >>> 0;
}

/**
 * Sanitizes string for GTA V prop naming conventions (lowercase, letters, numbers, underscores)
 */
export function sanitizePropName(name: string): string {
  const sanitized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
  
  const finalName = sanitized.length > 0 ? sanitized : 'letreiro_custom';
  return finalName.startsWith('prop_') ? finalName : `prop_${finalName}`;
}

/**
 * Convert hex color to RGB integers (0 - 255)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 6, g: 182, b: 212 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Convert RGB integers (0 - 255) to hex color string (#rrggbb)
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(Number(v) || 0)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert hex color to RGB floats (0.0 - 1.0)
 */
export function hexToRgbFloats(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: Number((((num >> 16) & 255) / 255).toFixed(4)),
    g: Number((((num >> 8) & 255) / 255).toFixed(4)),
    b: Number(((num & 255) / 255).toFixed(4)),
  };
}

/**
 * Converts heading (in degrees) to Quaternion (x, y, z, w) for GTA V entities
 */
export function headingToQuaternion(headingDeg: number): { x: number; y: number; z: number; w: number } {
  const rad = (headingDeg * Math.PI) / 180;
  return {
    x: 0,
    y: 0,
    z: Number(Math.sin(rad / 2).toFixed(6)),
    w: Number(Math.cos(rad / 2).toFixed(6)),
  };
}

/**
 * Generate .ytyp (GTA V Archetype definition XML)
 */
export function generateYtypXml(config: SignConfig, bounds: GeneratedMeshBounds): string {
  const propName = sanitizePropName(config.propName);
  const resourceName = config.resourceName || 'letreiro_3d';
  const halfW = (bounds.width / 2).toFixed(6);
  const halfH = (bounds.height / 2).toFixed(6);
  const halfD = (bounds.depth / 2).toFixed(6);
  const radius = bounds.radius.toFixed(6);

  return `<?xml version="1.0" encoding="UTF-8"?>
<CMapTypes>
  <extensions />
  <archetypes>
    <Item type="CBaseArchetypeDef">
      <lodDist value="${config.lodDist.toFixed(6)}" />
      <flags value="32" />
      <specialAttribute value="0" />
      <bbMin x="-${halfW}" y="-${halfD}" z="-${halfH}" />
      <bbMax x="${halfW}" y="${halfD}" z="${halfH}" />
      <bsCentre x="0.000000" y="0.000000" z="0.000000" />
      <bsRadius value="${radius}" />
      <hdTextureDist value="60.000000" />
      <name>${propName}</name>
      <textureDictionary>${propName}</textureDictionary>
      <clipDictionary />
      <drawableDictionary />
      <physicsDictionary>${config.hasCollision ? propName : ''}</physicsDictionary>
      <assetType>ASSET_TYPE_DRAWABLE</assetType>
      <assetName>${propName}</assetName>
      <extensions />
    </Item>
  </archetypes>
  <name>${resourceName}</name>
  <dependencies />
  <compositeEntityTypes />
</CMapTypes>
`;
}

/**
 * Generate .ybn (GTA V Bound Composite Collision XML)
 */
export function generateYbnXml(config: SignConfig, bounds: GeneratedMeshBounds): string {
  const halfW = (bounds.width / 2).toFixed(6);
  const halfH = (bounds.height / 2).toFixed(6);
  const halfD = (bounds.depth / 2).toFixed(6);
  const radius = bounds.radius.toFixed(6);

  return `<?xml version="1.0" encoding="UTF-8"?>
<Bounds>
  <Item type="phBoundComposite">
    <BoxMin x="-${halfW}" y="-${halfD}" z="-${halfH}" />
    <BoxMax x="${halfW}" y="${halfD}" z="${halfH}" />
    <BoxCenter x="0.000000" y="0.000000" z="0.000000" />
    <SphereRadius value="${radius}" />
    <Margin value="0.040000" />
    <TypeFlags value="0" />
    <Children>
      <Item type="phBoundBox">
        <BoxMin x="-${halfW}" y="-${halfD}" z="-${halfH}" />
        <BoxMax x="${halfW}" y="${halfD}" z="${halfH}" />
        <BoxCenter x="0.000000" y="0.000000" z="0.000000" />
        <SphereRadius value="${radius}" />
        <Margin value="0.040000" />
        <MaterialIndex value="0" />
        <MaterialName>${config.collisionMaterial}</MaterialName>
      </Item>
    </Children>
  </Item>
</Bounds>
`;
}

/**
 * Generate .ydr (GTA V Drawable XML - CodeWalker / Sollumz standard)
 */
export function generateYdrXml(config: SignConfig, bounds: GeneratedMeshBounds): string {
  const propName = sanitizePropName(config.propName);
  const halfW = (bounds.width / 2).toFixed(6);
  const halfH = (bounds.height / 2).toFixed(6);
  const halfD = (bounds.depth / 2).toFixed(6);
  const radius = bounds.radius.toFixed(6);
  const rgb = hexToRgbFloats(config.primaryColor);
  const isNeon = config.materialType === 'neon';
  const emissiveRgb = isNeon ? hexToRgbFloats(config.glowColor) : { r: 0, g: 0, b: 0 };

  return `<?xml version="1.0" encoding="UTF-8"?>
<rmcDrawable>
  <Name>${propName}</Name>
  <BoundingBoxMin x="-${halfW}" y="-${halfD}" z="-${halfH}" />
  <BoundingBoxMax x="${halfW}" y="${halfD}" z="${halfH}" />
  <BoundingSphereCenter x="0.000000" y="0.000000" z="0.000000" />
  <BoundingSphereRadius value="${radius}" />
  <LodDistances>
    <Item value="${config.lodDist.toFixed(6)}" />
    <Item value="${(config.lodDist * 1.5).toFixed(6)}" />
    <Item value="${(config.lodDist * 2.5).toFixed(6)}" />
    <Item value="9998.000000" />
  </LodDistances>
  <FlagsHigh value="0" />
  <ShaderGroup>
    <TextureDictionary>
      <Textures />
    </TextureDictionary>
    <Shaders>
      <Item>
        <Name>${isNeon ? 'gta_emissive' : 'gta_default'}</Name>
        <FileName>${isNeon ? 'gta_emissive.sps' : 'gta_normal_spec.sps'}</FileName>
        <RenderBucket value="0" />
        <Parameters>
          <Item name="DiffuseColor" type="Vector3" x="${rgb.r}" y="${rgb.g}" z="${rgb.b}" />
          <Item name="SpecularColor" type="Vector3" x="${config.metalness}" y="${config.metalness}" z="${config.metalness}" />
          <Item name="Roughness" type="Float" value="${config.roughness}" />
          ${isNeon ? `<Item name="EmissiveColor" type="Vector3" x="${emissiveRgb.r}" y="${emissiveRgb.g}" z="${emissiveRgb.b}" />
          <Item name="EmissiveIntensity" type="Float" value="${config.glowIntensity.toFixed(2)}" />` : ''}
        </Parameters>
      </Item>
    </Shaders>
  </ShaderGroup>
  <DrawableModelsHigh>
    <Item>
      <RenderMask value="255" />
      <Flags value="0" />
      <HasSkin value="false" />
      <BoneIndex value="0" />
      <Geometries>
        <Item>
          <ShaderIndex value="0" />
          <VertexCount value="${bounds.vertexCount}" />
          <FaceCount value="${bounds.faceCount}" />
        </Item>
      </Geometries>
    </Item>
  </DrawableModelsHigh>
</rmcDrawable>
`;
}

/**
 * Generate .ymap (GTA V Map placement XML)
 */
export function generateYmapXml(config: SignConfig): string {
  const propName = sanitizePropName(config.propName);
  const q = headingToQuaternion(config.coords.heading);
  const hash = calculateJoaat(propName);

  return `<?xml version="1.0" encoding="UTF-8"?>
<CMapData>
  <name>${config.resourceName}_map</name>
  <parent />
  <flags value="0" />
  <contentFlags value="65" />
  <streamingExtentsMin x="${(config.coords.x - 200).toFixed(6)}" y="${(config.coords.y - 200).toFixed(6)}" z="${(config.coords.z - 100).toFixed(6)}" />
  <streamingExtentsMax x="${(config.coords.x + 200).toFixed(6)}" y="${(config.coords.y + 200).toFixed(6)}" z="${(config.coords.z + 100).toFixed(6)}" />
  <entitiesExtentsMin x="${(config.coords.x - 25).toFixed(6)}" y="${(config.coords.y - 25).toFixed(6)}" z="${(config.coords.z - 25).toFixed(6)}" />
  <entitiesExtentsMax x="${(config.coords.x + 25).toFixed(6)}" y="${(config.coords.y + 25).toFixed(6)}" z="${(config.coords.z + 25).toFixed(6)}" />
  <entities>
    <Item type="CEntityDef">
      <archetypeName>${propName}</archetypeName>
      <flags value="1572864" />
      <guid value="${hash}" />
      <position x="${config.coords.x.toFixed(6)}" y="${config.coords.y.toFixed(6)}" z="${config.coords.z.toFixed(6)}" />
      <rotation x="${q.x.toFixed(6)}" y="${q.y.toFixed(6)}" z="${q.z.toFixed(6)}" w="${q.w.toFixed(6)}" />
      <scaleXY value="1.000000" />
      <scaleZ value="1.000000" />
      <parentIndex value="-1" />
      <lodDist value="${config.lodDist.toFixed(6)}" />
      <childLodDist value="0.000000" />
      <lodLevel>LODTYPES_DEPTH_HD</lodLevel>
      <numChildren value="0" />
      <priorityLevel>PRI_DEFAULT</priorityLevel>
      <ambientOcclusionMultiplier value="255" />
      <artificialAmbientOcclusion value="255" />
      <tintValue value="0" />
    </Item>
  </entities>
</CMapData>
`;
}

/**
 * Generate fxmanifest.lua
 */
export function generateFxmanifest(config: SignConfig): string {
  const propName = sanitizePropName(config.propName);
  const resourceName = config.resourceName || 'letreiro_3d';

  return `--[[
  Resource FiveM gerada por PazCity 3D Sign Creator
  Prop Name: ${propName}
  Texto: ${config.text} ${config.subText ? `(${config.subText})` : ''}
]]

fx_version 'cerulean'
game 'gta5'

name '${resourceName}'
author 'PazCity 3D Sign Creator'
description 'Letreiro 3D Customizado para FiveM - ${config.text}'
version '1.0.0'

-- Carrega arquivo de definicao de arquetipo (.ytyp)
data_file 'DLC_ITYP_REQUEST' 'stream/${propName}.ytyp'

-- Script cliente auxiliar para spawn/teste
client_script 'client.lua'
`;
}

/**
 * Generate client.lua (spawn helper & command for FiveM)
 */
export function generateClientLua(config: SignConfig): string {
  const propName = sanitizePropName(config.propName);
  const hash = calculateJoaat(propName);

  return `--[[
  Script de auxílio e spawn para o Letreiro 3D: ${propName}
  Comandos:
    /spawnletreiro - Spawna o letreiro na sua posição atual
    /delletreiro   - Deleta o letreiro de teste criado
    /coordsletreiro - Exibe as coordenadas exatas no console/chat
]]

local currentSignObj = nil
local propModel = \`${propName}\` -- Hash: ${hash}

-- Comando para spawnar o letreiro para teste in-game
RegisterCommand('spawnletreiro', function()
    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)
    local forward = GetEntityForwardVector(ped)
    local heading = GetEntityHeading(ped)
    
    -- Coloca 3 metros a frente do player
    local spawnX = coords.x + (forward.x * 3.0)
    local spawnY = coords.y + (forward.y * 3.0)
    local spawnZ = coords.z

    RequestModel(propModel)
    local timeout = 0
    while not HasModelLoaded(propModel) and timeout < 100 do
        Wait(50)
        timeout = timeout + 1
    end

    if not HasModelLoaded(propModel) then
        TriggerEvent('chat:addMessage', {
            color = {255, 50, 50},
            args = {'[Letreiro 3D]', 'Erro: Nao foi possivel carregar o modelo ' .. '${propName}' .. '. Verifique se a resource esta iniciada no server.cfg.'}
        })
        return
    end

    if DoesEntityExist(currentSignObj) then
        DeleteEntity(currentSignObj)
    end

    currentSignObj = CreateObject(propModel, spawnX, spawnY, spawnZ, true, false, false)
    SetEntityHeading(currentSignObj, heading)
    FreezeEntityPosition(currentSignObj, true)
    SetEntityInvincible(currentSignObj, true)

    TriggerEvent('chat:addMessage', {
        color = {50, 255, 120},
        args = {'[Letreiro 3D]', 'Letreiro spawnado com sucesso! Coords: X=' .. string.format('%.2f', spawnX) .. ' Y=' .. string.format('%.2f', spawnY) .. ' Z=' .. string.format('%.2f', spawnZ) .. ' H=' .. string.format('%.1f', heading)}
    })
end, false)

-- Comando para deletar o letreiro spawnado
RegisterCommand('delletreiro', function()
    if DoesEntityExist(currentSignObj) then
        DeleteEntity(currentSignObj)
        currentSignObj = nil
        TriggerEvent('chat:addMessage', {
            color = {255, 200, 50},
            args = {'[Letreiro 3D]', 'Letreiro removido com sucesso.'}
        })
    else
        TriggerEvent('chat:addMessage', {
            color = {255, 100, 100},
            args = {'[Letreiro 3D]', 'Nenhum letreiro ativo encontrado.'}
        })
    end
end, false)

-- Comando para copiar coordenadas para o .ymap
RegisterCommand('coordsletreiro', function()
    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)
    local heading = GetEntityHeading(ped)
    print(string.format('Coords para YMAP: X=%.4f, Y=%.4f, Z=%.4f, Heading=%.2f', coords.x, coords.y, coords.z, heading))
    TriggerEvent('chat:addMessage', {
        color = {100, 200, 255},
        args = {'[Coords]', string.format('X=%.4f, Y=%.4f, Z=%.4f, Heading=%.2f', coords.x, coords.y, coords.z, heading)}
    })
end, false)
`;
}

/**
 * Generate README.txt guide
 */
export function generateReadme(config: SignConfig): string {
  const propName = sanitizePropName(config.propName);
  const resourceName = config.resourceName || 'letreiro_3d';

  return `=====================================================
  LETREIRO 3D FIVEM - ${config.text.toUpperCase()}
=====================================================
Gerado via Criador de Letreiro 3D FiveM (PazCity Studio)

DADOS DO ASSET:
- Prop Name: ${propName}
- Model Hash (joaat): ${calculateJoaat(propName)}
- Resource Name: ${resourceName}
- Colisão (.ybn): ${config.hasCollision ? `Sim (${config.collisionMaterial})` : 'Não'}
- Arquivos: .ytyp, .ydr.xml, .ybn.xml, .ymap.xml, .obj, .mtl, fxmanifest.lua, client.lua

=====================================================
POR QUE O ARQUIVO .YDR APARECE BLOQUEADO NO OPENIV?
=====================================================
O OpenIV é um leitor de arquivos BINÁRIOS proprietários do motor do GTA V (RSC7).
Geradores externos geram arquivos de formato aberto XML (.ydr.xml) e 3D (.obj).
Ao tentar abrir um arquivo XML diretamente no OpenIV com a extensão .ydr, o OpenIV
não reconhece a assinatura binária da Rockstar e exibe como BLOQUEADO/CORROMPIDO.

=====================================================
ERRO NO CODEWALKER: "Referência de objeto não definida..."?
=====================================================
Se ao arrastar o .ydr.xml para o CodeWalker você receber o erro:
"Referencia de Objeto não definido para uma instância de objeto" (NullReferenceException),
é porque o CodeWalker requer buffers de vértices e esqueletos completos serializados
que só são gerados via modelador 3D.

COMO GERAR O .YDR CORRETO E VISUALIZAR NO OPENIV:
-----------------------------------------------------
SOLUÇÃO DEFINITIVA (VIA BLENDER COM SOLLUMZ - 1 MINUTO):
1. Abra o Blender com o plugin gratuito Sollumz instalado.
2. Vá em: File > Import > Wavefront (.obj) e selecione o arquivo "${propName}.obj".
   (O arquivo .obj já contém toda a malha 3D real completa das letras e suportes).
3. Na aba lateral do Sollumz (tecla N no Blender):
   - Selecione o objeto importado.
   - Clique em "Create Drawable" (Shader: default ou emissive para neon).
   - Opcional: crie a colisão clicando em "Create Composite Collision".
4. Vá em: File > Export > RAGE Drawable (.ydr).
5. PRONTO! O Sollumz compila o .ydr binário RSC7 oficial.
6. Ao abrir esse novo .ydr no OpenIV, a visualização 3D abrirá perfeitamente!

OPÇÃO RÁPIDA (VISUALIZAR O 3D DIRETO SEM CONVERTER):
- Abra o arquivo "${propName}.obj" diretamente com 2 cliques no Visualizador 3D do Windows!

COMO INSTALAR NO SEU SERVIDOR FIVEM:
-----------------------------------------------------
1. Copie a pasta "${resourceName}" para a pasta "resources/" do seu servidor FiveM:
   Exemplo: /server-data/resources/[letreiros]/${resourceName}

2. Abra o arquivo "server.cfg" do seu servidor e adicione a linha:
   ensure ${resourceName}

3. Reinicie seu servidor ou dê "refresh" e "ensure ${resourceName}" pelo console do txAdmin ou F8 in-game.

4. Para testar no jogo:
   Digite no chat: /spawnletreiro
   Para remover o teste: /delletreiro
=====================================================
`;
}

/**
 * Detailed guide for OpenIV & CodeWalker
 */
export function generateOpenIvGuide(config: SignConfig): string {
  const propName = sanitizePropName(config.propName);
  const resourceName = config.resourceName || 'letreiro_3d';

  return `================================================================================
  GUIA: COMO ABRIR O LETREIRO 3D NO OPENIV E CONVERTER EM .YDR BINÁRIO
================================================================================
Prop Name: ${propName}
Resource: ${resourceName}

1. POR QUE O ARQUIVO .YDR APARECE BLOQUEADO NO OPENIV?
--------------------------------------------------------------------------------
O OpenIV é um visualizador estrito de recursos BINÁRIOS compilados da Rockstar Games (RSC7).
Ferramentas de modelagem e geradores web criam arquivos de código aberto:
- ${propName}.ydr.xml (Descritor XML aberto)
- ${propName}.obj (Malha 3D universal aberta com todas as faces e vértices)

Se você tentar abrir um arquivo de texto XML diretamente no OpenIV com a extensão .ydr,
o OpenIV tenta ler como se fosse o código de máquina criptografado da Rockstar,
não encontra o cabeçalho RSC7 e exibe o arquivo como BLOQUEADO, INVÁLIDO ou CORROMPIDO.

--------------------------------------------------------------------------------
2. ERRO NO CODEWALKER: "Referência de objeto não definida para uma instância..."?
--------------------------------------------------------------------------------
Se você arrastou o .ydr.xml para o RPF Explorer do CodeWalker e apareceu a mensagem de erro:
"Referencia de Objeto não definido para uma instância de objeto" (NullReferenceException no .NET):

MOTIVO DO ERRO:
O CodeWalker foi feito em C# e, ao importar um .ydr.xml cru, seu leitor procura por buffers
binários de vértices serializados (<VertexBuffer>), esqueleto (<Skeleton>) e canais de cor
que só existem quando o próprio CodeWalker ou o Blender/Sollumz exportam o XML. Como esses
campos não estão pré-compilados no XML web, o leitor do CodeWalker encontra um valor nulo e trava.

--------------------------------------------------------------------------------
3. SOLUÇÃO DEFINITIVA: IMPORTAR O ARQUIVO .OBJ NO BLENDER (SOLLUMZ)
--------------------------------------------------------------------------------
Esta é a forma 100% oficial e garantida que todos os modeladores de FiveM usam:

1. Abra o Blender com o plugin Sollumz ativado (gratuito: sollumz.org).
2. Vá em: File > Import > Wavefront (.obj) e selecione "${propName}.obj".
   (O arquivo .obj incluso nesta pasta já tem a malha 3D real completa com as letras,
   relevos e suportes que você configurou no site!).
3. Na aba lateral do Sollumz (pressione 'N' no teclado dentro do Blender):
   - Selecione o modelo importado.
   - Clique em "Convert to Drawable" (Shader: default ou gta_emissive se for neon).
   - Para colisão: clique em "Create Composite Collision" (Box ou Mesh).
4. Vá em: File > Export > RAGE Drawable (.ydr).
5. O Sollumz compila o binário RSC7 oficial do GTA V sem nenhum erro de código!
6. Abra esse novo .ydr no OpenIV: o visualizador 3D abrirá 100% perfeito com materiais!

--------------------------------------------------------------------------------
4. SOLUÇÃO RÁPIDA: VISUALIZAR A MALHA 3D DIRETO NO WINDOWS
--------------------------------------------------------------------------------
Se você só quer ver o 3D agora sem instalar nada:
- Dê dois cliques no arquivo "${propName}.obj" incluído nesta pasta.
- Ele abre diretamente no Visualizador 3D nativo do Windows com iluminação e rotação!
================================================================================
`;
}

/**
 * Builds the complete Three.js Group matching the sign configuration
 */
export function buildCompleteSignGroup(
  config: SignConfig,
  bounds: GeneratedMeshBounds
): THREE.Group {
  const root = new THREE.Group();
  const mode = config.mode || 'text';

  if (mode === 'image') {
    const emblem = create3DImageEmblem(config, null);
    emblem.group.position.y = emblem.height / 2 + 0.1;
    root.add(emblem.group);
  } else if (mode === 'hybrid') {
    const emblem = create3DImageEmblem(config, null);
    emblem.group.position.y = 2.1;
    emblem.group.scale.set(0.85, 0.85, 0.85);
    root.add(emblem.group);

    const primary = createLine3DMesh(config.text || 'LETREIRO', config, false);
    primary.group.position.y = 0.65;
    root.add(primary.group);

    if (config.subText) {
      const secondary = createLine3DMesh(config.subText, config, true);
      secondary.group.position.y = 0.2;
      root.add(secondary.group);
    }
  } else {
    const primary = createLine3DMesh(config.text || 'LETREIRO', config, false);
    primary.group.position.y = config.subText ? 1.4 : 0.8;
    root.add(primary.group);

    if (config.subText) {
      const secondary = createLine3DMesh(config.subText, config, true);
      secondary.group.position.y = 0.65;
      root.add(secondary.group);
    }
  }

  if (config.mountType !== 'none') {
    const mounts = createMountStructure(config, bounds);
    root.add(mounts);
  }

  return root;
}

/**
 * Generate Wavefront OBJ & MTL files from real 3D mesh
 */
export function generateObjAndMtl(
  config: SignConfig,
  bounds: GeneratedMeshBounds
): { obj: string; mtl: string } {
  const propName = sanitizePropName(config.propName);
  const rgb = hexToRgbFloats(config.primaryColor);

  const hasImage = config.mode !== 'text' && Boolean(config.imageConfig?.dataUrl);

  const mtl = `# Material gerado para ${propName}
newmtl mat_letreiro_main
Ka ${rgb.r} ${rgb.g} ${rgb.b}
Kd ${rgb.r} ${rgb.g} ${rgb.b}
Ks ${config.metalness} ${config.metalness} ${config.metalness}
Ns ${(1 - config.roughness) * 100}
d 1.0
illum 2
${hasImage ? `map_Kd ${propName}.png\n` : ''}`;

  try {
    const group = buildCompleteSignGroup(config, bounds);
    const exporter = new OBJExporter();
    const parsedObj = exporter.parse(group);
    if (parsedObj && parsedObj.length > 50) {
      const fullObj = `# Wavefront OBJ para FiveM / GTA V
# Prop: ${propName}
# Texto: ${config.text}
# Gerado por PazCity 3D Sign Studio
mtllib ${propName}.mtl
o ${propName}

${parsedObj}
`;
      return { obj: fullObj, mtl };
    }
  } catch (err) {
    console.warn('Falha ao exportar malha real via OBJExporter, usando fallback:', err);
  }

  // Standard bounding box fallback if needed
  const halfW = bounds.width / 2;
  const halfH = bounds.height / 2;
  const halfD = bounds.depth / 2;

  const obj = `# Wavefront OBJ para FiveM
# Prop: ${propName}
# Texto: ${config.text}
mtllib ${propName}.mtl
o ${propName}

# Vertices
v -${halfW.toFixed(4)} -${halfH.toFixed(4)} -${halfD.toFixed(4)}
v ${halfW.toFixed(4)} -${halfH.toFixed(4)} -${halfD.toFixed(4)}
v ${halfW.toFixed(4)} ${halfH.toFixed(4)} -${halfD.toFixed(4)}
v -${halfW.toFixed(4)} ${halfH.toFixed(4)} -${halfD.toFixed(4)}
v -${halfW.toFixed(4)} -${halfH.toFixed(4)} ${halfD.toFixed(4)}
v ${halfW.toFixed(4)} -${halfH.toFixed(4)} ${halfD.toFixed(4)}
v ${halfW.toFixed(4)} ${halfH.toFixed(4)} ${halfD.toFixed(4)}
v -${halfW.toFixed(4)} ${halfH.toFixed(4)} ${halfD.toFixed(4)}

# Normals
vn 0.0 0.0 -1.0
vn 0.0 0.0 1.0
vn 0.0 -1.0 0.0
vn 0.0 1.0 0.0
vn -1.0 0.0 0.0
vn 1.0 0.0 0.0

# UVs
vt 0.0 0.0
vt 1.0 0.0
vt 1.0 1.0
vt 0.0 1.0

usemtl mat_letreiro_main
s 1
f 1/1/1 2/2/1 3/3/1 4/4/1
f 6/1/2 5/2/2 8/3/2 7/4/2
f 5/1/3 6/2/3 2/3/3 1/4/3
f 3/1/4 7/2/4 8/3/4 4/4/4
f 5/1/5 1/2/5 4/3/5 8/4/5
f 2/1/6 6/2/6 7/3/6 3/4/6
`;

  return { obj, mtl };
}

/**
 * Creates a complete FiveM resource ZIP bundle with all required files
 */
export async function createFiveMZip(
  config: SignConfig,
  bounds: GeneratedMeshBounds
): Promise<Blob> {
  const zip = new JSZip();
  const resourceName = config.resourceName || 'letreiro_3d';
  const propName = sanitizePropName(config.propName);

  const rootFolder = zip.folder(resourceName) || zip;
  const streamFolder = rootFolder.folder('stream');

  // Root files
  rootFolder.file('fxmanifest.lua', generateFxmanifest(config));
  rootFolder.file('client.lua', generateClientLua(config));
  rootFolder.file('README.txt', generateReadme(config));
  rootFolder.file('COMO_ABRIR_NO_OPENIV.txt', generateOpenIvGuide(config));

  // Stream files (FiveM reads .ytyp, .ydr, .ybn, .ymap in stream/)
  if (streamFolder) {
    // 1. Archetype .ytyp (both direct name and XML for CodeWalker)
    const ytypContent = generateYtypXml(config, bounds);
    streamFolder.file(`${propName}.ytyp`, ytypContent);
    streamFolder.file(`${propName}.ytyp.xml`, ytypContent);

    // 2. Drawable .ydr.xml (CodeWalker & Sollumz standard)
    const ydrContent = generateYdrXml(config, bounds);
    streamFolder.file(`${propName}.ydr.xml`, ydrContent);
    streamFolder.file(`${propName}.ydr`, ydrContent);

    // 3. Collision .ybn (if enabled)
    if (config.hasCollision) {
      const ybnContent = generateYbnXml(config, bounds);
      streamFolder.file(`${propName}.ybn`, ybnContent);
      streamFolder.file(`${propName}.ybn.xml`, ybnContent);
    }

    // 4. Map placement .ymap
    const ymapContent = generateYmapXml(config);
    streamFolder.file(`${resourceName}_map.ymap`, ymapContent);
    streamFolder.file(`${resourceName}_map.ymap.xml`, ymapContent);

    // 5. Real 3D Model OBJ & MTL
    const { obj, mtl } = generateObjAndMtl(config, bounds);
    streamFolder.file(`${propName}.obj`, obj);
    streamFolder.file(`${propName}.mtl`, mtl);

    // 6. Guia OpenIV dentro da stream também
    streamFolder.file('COMO_ABRIR_NO_OPENIV.txt', generateOpenIvGuide(config));

    // 7. Texture image for YTD texture dictionary (if imported image used)
    if (config.mode !== 'text' && config.imageConfig?.dataUrl) {
      const dataUrl = config.imageConfig.dataUrl;
      const commaIdx = dataUrl.indexOf(',');
      if (commaIdx !== -1) {
        const header = dataUrl.slice(0, commaIdx);
        const data = dataUrl.slice(commaIdx + 1);
        if (header.includes('base64')) {
          streamFolder.file(`${propName}.png`, data, { base64: true });
        } else if (header.includes('svg')) {
          streamFolder.file(`${propName}.svg`, decodeURIComponent(data));
        }
      }
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}
