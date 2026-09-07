import * as THREE from 'three';
import { SignConfig, ImageConfig, BadgeShape } from '../types/fivem';
import { createSignMaterial } from './text3dEngine';

/**
 * Creates 2D Three.js Shape based on the selected badge/placa geometry
 */
export function createBadgeShape(
  badgeType: BadgeShape,
  width: number,
  height: number,
  cornerRadius = 0.15
): THREE.Shape {
  const shape = new THREE.Shape();
  const halfW = width / 2;
  const halfH = height / 2;

  switch (badgeType) {
    case 'none': {
      // Clean rectangle matching dimensions when fallback needed
      shape.moveTo(-halfW, -halfH);
      shape.lineTo(halfW, -halfH);
      shape.lineTo(halfW, halfH);
      shape.lineTo(-halfW, halfH);
      shape.closePath();
      break;
    }

    case 'circle': {
      const radius = Math.min(halfW, halfH);
      shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
      break;
    }

    case 'shield': {
      // Classic police / heraldic badge
      const topW = halfW * 0.95;
      const midW = halfW;
      const topY = halfH;
      const midY = 0;
      const btmY = -halfH;

      shape.moveTo(-topW, topY);
      shape.lineTo(topW, topY);
      shape.quadraticCurveTo(midW, midY, halfW * 0.7, -halfH * 0.4);
      shape.quadraticCurveTo(halfW * 0.35, -halfH * 0.8, 0, btmY);
      shape.quadraticCurveTo(-halfW * 0.35, -halfH * 0.8, -halfW * 0.7, -halfH * 0.4);
      shape.quadraticCurveTo(-midW, midY, -topW, topY);
      break;
    }

    case 'hexagon': {
      const radius = Math.min(halfW, halfH);
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 + Math.PI / 6;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();
      break;
    }

    case 'diamond': {
      shape.moveTo(0, halfH);
      shape.lineTo(halfW, 0);
      shape.lineTo(0, -halfH);
      shape.lineTo(-halfW, 0);
      shape.closePath();
      break;
    }

    case 'rectangle':
    case 'contour':
    default: {
      // Rounded rectangle with smooth corners
      const r = Math.min(cornerRadius, halfW * 0.3, halfH * 0.3);
      shape.moveTo(-halfW + r, -halfH);
      shape.lineTo(halfW - r, -halfH);
      shape.quadraticCurveTo(halfW, -halfH, halfW, -halfH + r);
      shape.lineTo(halfW, halfH - r);
      shape.quadraticCurveTo(halfW, halfH, halfW - r, halfH);
      shape.lineTo(-halfW + r, halfH);
      shape.quadraticCurveTo(-halfW, halfH, -halfW, halfH - r);
      shape.lineTo(-halfW, -halfH + r);
      shape.quadraticCurveTo(-halfW, -halfH, -halfW + r, -halfH);
      break;
    }
  }

  return shape;
}

/**
 * Creates UV mapped texture plane & 3D Extruded Emblem Mesh from user image
 */
export function create3DImageEmblem(
  config: SignConfig,
  texture: THREE.Texture | null
): { group: THREE.Group; width: number; height: number; depth: number } {
  const emblemGroup = new THREE.Group();
  const imgCfg = config.imageConfig;

  // 1. Calculate genuine image aspect ratio and content bounds
  let imgNaturalW = 512;
  let imgNaturalH = 512;
  if (texture && texture.image) {
    const imgObj = texture.image as (HTMLImageElement | ImageBitmap | HTMLCanvasElement);
    imgNaturalW = (imgObj as HTMLImageElement).naturalWidth || imgObj.width || 512;
    imgNaturalH = (imgObj as HTMLImageElement).naturalHeight || imgObj.height || 512;
  }

  let aspect = imgNaturalW / (imgNaturalH || 1);

  // Attempt to scan alpha channel on offscreen canvas to get tight content bounds (ignore empty transparent padding)
  if (texture && texture.image && typeof document !== 'undefined') {
    try {
      const offCanvas = document.createElement('canvas');
      const maxScanDim = 96;
      const scanW = maxScanDim;
      const scanH = Math.max(16, Math.round(maxScanDim / (aspect || 1)));
      offCanvas.width = scanW;
      offCanvas.height = scanH;
      const ctx = offCanvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(texture.image as any, 0, 0, scanW, scanH);
        const imgData = ctx.getImageData(0, 0, scanW, scanH).data;
        let minX = scanW;
        let maxX = 0;
        let minY = scanH;
        let maxY = 0;
        let hasOpaque = false;

        for (let y = 0; y < scanH; y++) {
          for (let x = 0; x < scanW; x++) {
            const alpha = imgData[(y * scanW + x) * 4 + 3];
            if (alpha > 25) {
              hasOpaque = true;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (hasOpaque && maxX > minX && maxY > minY) {
          const contentW = maxX - minX + 1;
          const contentH = maxY - minY + 1;
          if (contentW > 4 && contentH > 4) {
            const tightAspect = (contentW / scanW * imgNaturalW) / ((contentH / scanH * imgNaturalH) || 1);
            if (!isNaN(tightAspect) && tightAspect > 0.05 && tightAspect < 20) {
              aspect = tightAspect;
            }
          }
        }
      }
    } catch {
      // Fallback cleanly to natural image aspect ratio
    }
  }

  const baseScale = imgCfg.scale || 1.0;
  const userWScale = imgCfg.widthScale || 1.0;
  const userHScale = imgCfg.heightScale || 1.0;

  // Responsive dimensions strictly respecting the image's proportions
  const baseDim = 2.4 * baseScale;
  let width = baseDim * userWScale;
  let height = baseDim * userHScale;

  if (aspect >= 1.0) {
    width = baseDim * userWScale;
    height = (baseDim / aspect) * userHScale;
  } else {
    height = baseDim * userHScale;
    width = (baseDim * aspect) * userWScale;
  }

  const depth = Math.max(0.04, (imgCfg.depth || 0.25) * baseScale);
  const bevel = 0.03 * baseScale;
  const hasFrame = imgCfg.hasFrame !== false && imgCfg.badgeShape !== 'none';

  if (hasFrame) {
    // 1. Create Badge Base Shape matching image aspect ratio
    const shape = createBadgeShape(imgCfg.badgeShape, width, height);

    // 2. Extrude settings for 3D body
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: depth,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: bevel,
      bevelThickness: bevel,
    };

    const bodyGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    bodyGeom.computeVertexNormals();

    // Materials: Sides & Back use the configured sign material (metal, carbon, gold, etc.)
    const bodyMaterial = createSignMaterial(config, false);

    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMaterial);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bodyMesh.position.z = -depth;
    emblemGroup.add(bodyMesh);

    // 4. Glowing Rim / Neon Contour Frame (if enabled)
    if (imgCfg.glowRim) {
      const rimShape = createBadgeShape(imgCfg.badgeShape, width + 0.08, height + 0.08);
      const rimHole = createBadgeShape(imgCfg.badgeShape, width - 0.06, height - 0.06);
      rimShape.holes.push(rimHole);

      const rimGeom = new THREE.ExtrudeGeometry(rimShape, {
        depth: depth * 1.15,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.02,
        bevelThickness: 0.02,
      });

      const rimMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(imgCfg.glowRimColor || config.glowColor),
        emissive: new THREE.Color(imgCfg.glowRimColor || config.glowColor),
        emissiveIntensity: imgCfg.glowRimIntensity || config.glowIntensity,
        roughness: 0.1,
        metalness: 0.1,
      });

      const rimMesh = new THREE.Mesh(rimGeom, rimMaterial);
      rimMesh.position.z = -depth;
      emblemGroup.add(rimMesh);
    }
  }

  // 3. Front Face & 3D Extrusion (Volumetric Continuous Layers in Frameless Mode)
  if (texture) {
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    const alphaCutoff = Math.max(0.02, (imgCfg.threshold || 15) / 255);

    const frontGeom = new THREE.PlaneGeometry(
      width * (hasFrame ? 0.94 : 1.0),
      height * (hasFrame ? 0.94 : 1.0),
      16,
      16
    );

    const frontMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      alphaTest: alphaCutoff,
      roughness: config.roughness ?? 0.2,
      metalness: config.materialType === 'metal' ? 0.7 : 0.1,
      emissive: config.materialType === 'neon' ? new THREE.Color(config.glowColor) : new THREE.Color(0x000000),
      emissiveIntensity: config.materialType === 'neon' ? config.glowIntensity * 0.6 : 0,
      emissiveMap: config.materialType === 'neon' ? texture : null,
      side: THREE.DoubleSide,
    });

    if (hasFrame) {
      // With 3D frame/plate: front mesh sits on front face of extruded body
      const frontMesh = new THREE.Mesh(frontGeom, frontMaterial);
      frontMesh.position.z = bevel + 0.005;
      frontMesh.castShadow = true;
      frontMesh.receiveShadow = true;
      emblemGroup.add(frontMesh);
    } else {
      // Frameless Mode (Apenas Logo):
      // The 3D is strictly formed on the visible pixels of the image!
      // No solid square box or opaque background plate around empty transparent pixels.
      // Densely spaced continuous volumetric layers give thick, maciça, continuous 3D depth from all angles.
      const numSlices = Math.min(32, Math.max(12, Math.round(depth * 35)));
      const stepZ = depth / numSlices;

      for (let i = 0; i <= numSlices; i++) {
        const sliceGeom = new THREE.PlaneGeometry(width, height, 1, 1);
        const zPos = -i * stepZ;

        // Front layer has full material; intermediate layers provide solid extruded body
        const sliceMat = i === 0 || i === numSlices
          ? frontMaterial
          : new THREE.MeshStandardMaterial({
              map: texture,
              transparent: true,
              alphaTest: alphaCutoff,
              roughness: 0.4,
              metalness: config.materialType === 'metal' ? 0.6 : 0.2,
              color: new THREE.Color(0xd4d4d8),
              side: THREE.DoubleSide,
            });

        const sliceMesh = new THREE.Mesh(sliceGeom, sliceMat);
        sliceMesh.position.z = zPos;
        sliceMesh.castShadow = i === 0;
        sliceMesh.receiveShadow = true;
        emblemGroup.add(sliceMesh);
      }

      // Optional Glowing Rim for frameless mode (tightly hugs the image dimensions)
      if (imgCfg.glowRim) {
        const rimWidth = width + 0.05;
        const rimHeight = height + 0.05;
        const rimHoleW = width - 0.03;
        const rimHoleH = height - 0.03;

        const rimShape = new THREE.Shape();
        rimShape.moveTo(-rimWidth / 2, -rimHeight / 2);
        rimShape.lineTo(rimWidth / 2, -rimHeight / 2);
        rimShape.lineTo(rimWidth / 2, rimHeight / 2);
        rimShape.lineTo(-rimWidth / 2, rimHeight / 2);
        rimShape.closePath();

        const rimHole = new THREE.Path();
        rimHole.moveTo(-rimHoleW / 2, -rimHoleH / 2);
        rimHole.lineTo(rimHoleW / 2, -rimHoleH / 2);
        rimHole.lineTo(rimHoleW / 2, rimHoleH / 2);
        rimHole.lineTo(-rimHoleW / 2, rimHoleH / 2);
        rimHole.closePath();
        rimShape.holes.push(rimHole);

        const rimGeom = new THREE.ExtrudeGeometry(rimShape, {
          depth: depth,
          bevelEnabled: false,
        });

        const rimMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(imgCfg.glowRimColor || config.glowColor),
          emissive: new THREE.Color(imgCfg.glowRimColor || config.glowColor),
          emissiveIntensity: imgCfg.glowRimIntensity || config.glowIntensity,
          roughness: 0.1,
          metalness: 0.1,
        });

        const rimMesh = new THREE.Mesh(rimGeom, rimMaterial);
        rimMesh.position.z = -depth;
        emblemGroup.add(rimMesh);
      }
    }
  }

  const finalW = width + (hasFrame ? bevel * 2 : 0);
  const finalH = height + (hasFrame ? bevel * 2 : 0);
  const finalD = hasFrame ? (depth + bevel * 2) : Math.max(depth, 0.04);

  return {
    group: emblemGroup,
    width: Number(finalW.toFixed(4)),
    height: Number(finalH.toFixed(4)),
    depth: Number(finalD.toFixed(4)),
  };
}

/**
 * Built-in Sample Logos for Instant Testing
 */
export const SAMPLE_IMAGE_PRESETS = [
  {
    id: 'bope_skull',
    name: 'BOPE / Caveira (Tático RJ)',
    category: 'Polícia / Tático',
    badgeShape: 'shield' as BadgeShape,
    glowColor: '#ef4444',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <radialGradient id="bgG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#020617"/>
        </radialGradient>
      </defs>
      <path d="M200,20 L360,60 L330,240 L200,380 L70,240 L40,60 Z" fill="url(#bgG)" stroke="#ef4444" stroke-width="8"/>
      <circle cx="200" cy="180" r="110" fill="#090d16" stroke="#475569" stroke-width="4"/>
      <!-- Knife -->
      <path d="M194,50 L206,50 L206,120 L212,120 L212,130 L188,130 L188,120 L194,120 Z" fill="#94a3b8"/>
      <path d="M197,130 L203,130 L200,310 Z" fill="#f1f5f9" stroke="#334155" stroke-width="2"/>
      <!-- Skull -->
      <path d="M150,140 C150,110 250,110 250,140 C250,165 240,185 235,210 L165,210 C160,185 150,165 150,140 Z" fill="#f8fafc"/>
      <circle cx="175" cy="165" r="16" fill="#090d16"/>
      <circle cx="225" cy="165" r="16" fill="#090d16"/>
      <path d="M195,185 L205,185 L200,200 Z" fill="#090d16"/>
      <!-- Teeth -->
      <path d="M170,225 L230,225 L225,245 L175,245 Z" fill="#f8fafc"/>
      <line x1="185" y1="225" x2="185" y2="245" stroke="#090d16" stroke-width="3"/>
      <line x1="200" y1="225" x2="200" y2="245" stroke="#090d16" stroke-width="3"/>
      <line x1="215" y1="225" x2="215" y2="245" stroke="#090d16" stroke-width="3"/>
      <text x="200" y="340" font-family="Arial Black, Impact" font-size="28" fill="#ef4444" text-anchor="middle" letter-spacing="4">B O P E</text>
    </svg>`,
  },
  {
    id: 'lspd_star',
    name: 'LSPD / Polícia Los Santos',
    category: 'Polícia Oficial',
    badgeShape: 'shield' as BadgeShape,
    glowColor: '#38bdf8',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <radialGradient id="starG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#0369a1"/>
        </radialGradient>
      </defs>
      <path d="M200,15 L365,55 L330,240 L200,385 L70,240 L35,55 Z" fill="#0b1329" stroke="#38bdf8" stroke-width="8"/>
      <!-- 7-point Police Star -->
      <polygon points="200,70 215,130 270,105 240,160 295,190 235,215 260,270 205,245 195,305 175,245 120,270 145,215 85,190 140,160 110,105 165,130" fill="#eab308" stroke="#ca8a04" stroke-width="3"/>
      <circle cx="200" cy="188" r="45" fill="#0f172a" stroke="#eab308" stroke-width="4"/>
      <text x="200" y="185" font-family="Arial Black, Impact" font-size="20" fill="#ffffff" text-anchor="middle">CITY OF</text>
      <text x="200" y="202" font-family="Arial Black, Impact" font-size="14" fill="#38bdf8" text-anchor="middle">LOS SANTOS</text>
      <text x="200" y="340" font-family="Arial Black, Impact" font-size="26" fill="#ffffff" text-anchor="middle" letter-spacing="3">POLICE</text>
    </svg>`,
  },
  {
    id: 'bahama_mamas',
    name: 'Bahama Mamas Club',
    category: 'Boates & Baladas',
    badgeShape: 'circle' as BadgeShape,
    glowColor: '#ec4899',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="neonG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ec4899"/>
          <stop offset="100%" stop-color="#06b6d4"/>
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="180" fill="#090514" stroke="url(#neonG)" stroke-width="10"/>
      <circle cx="200" cy="200" r="150" fill="none" stroke="#ec4899" stroke-width="3" stroke-dasharray="8 6"/>
      <!-- Flaming Flamingo / Exotic M -->
      <path d="M110,270 L140,120 L200,210 L260,120 L290,270 L260,270 L245,170 L200,240 L155,170 L140,270 Z" fill="url(#neonG)"/>
      <text x="200" y="315" font-family="Arial Black, Impact" font-size="22" fill="#38bdf8" text-anchor="middle" letter-spacing="4">BAHAMA MAMAS</text>
      <text x="200" y="338" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ec4899" text-anchor="middle" letter-spacing="6">NIGHTCLUB</text>
    </svg>`,
  },
  {
    id: 'faction_eagle',
    name: 'Águia de Ouro (Facção / Gangue)',
    category: 'Facção & Crime',
    badgeShape: 'hexagon' as BadgeShape,
    glowColor: '#eab308',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="50%" stop-color="#eab308"/>
          <stop offset="100%" stop-color="#854d0e"/>
        </linearGradient>
      </defs>
      <polygon points="200,20 360,110 360,290 200,380 40,290 40,110" fill="#0f172a" stroke="url(#goldG)" stroke-width="8"/>
      <!-- Eagle Wings -->
      <path d="M200,100 C150,80 80,120 70,220 C120,200 150,170 170,220 C175,200 190,160 200,140 C210,160 225,200 230,220 C250,170 280,200 330,220 C320,120 250,80 200,100 Z" fill="url(#goldG)"/>
      <polygon points="200,120 185,150 215,150" fill="#ffffff"/>
      <!-- Crown -->
      <path d="M165,85 L180,65 L200,80 L220,65 L235,85 Z" fill="url(#goldG)" stroke="#713f12" stroke-width="2"/>
      <text x="200" y="325" font-family="Arial Black, Impact" font-size="28" fill="#facc15" text-anchor="middle" letter-spacing="3">TROPA DO TOPO</text>
      <text x="200" y="348" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#94a3b8" text-anchor="middle" letter-spacing="5">RIO DE JANEIRO</text>
    </svg>`,
  },
  {
    id: 'vinewood_star',
    name: 'Estrela de Vinewood (VIP / Hall of Fame)',
    category: 'Vinewood & Luxo',
    badgeShape: 'diamond' as BadgeShape,
    glowColor: '#a855f7',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="purpleG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c084fc"/>
          <stop offset="100%" stop-color="#7e22ce"/>
        </linearGradient>
      </defs>
      <polygon points="200,20 380,200 200,380 20,200" fill="#110924" stroke="url(#purpleG)" stroke-width="8"/>
      <!-- Big Star -->
      <polygon points="200,75 228,145 305,145 245,190 268,260 200,220 132,260 155,190 95,145 172,145" fill="#f8fafc" stroke="#c084fc" stroke-width="4"/>
      <text x="200" y="310" font-family="Arial Black, Impact" font-size="24" fill="#ffffff" text-anchor="middle" letter-spacing="4">VINEWOOD</text>
      <text x="200" y="330" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#c084fc" text-anchor="middle" letter-spacing="5">LOS SANTOS</text>
    </svg>`,
  },
];

/**
 * Converts SVG string to Base64 Data URL
 */
export function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}
