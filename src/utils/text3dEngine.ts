import * as THREE from 'three';
import { SignConfig, GeneratedMeshBounds, FontStyle } from '../types/fivem';

interface GlyphDef {
  width: number;
  shapes: Array<{
    outer: Array<[number, number]>;
    holes?: Array<Array<[number, number]>>;
  }>;
}

/**
 * Geometric Vector glyph definitions for letters A-Z, 0-9 and common symbols.
 * Scaled on a 10x14 unit grid for crisp, clean extrusion in Three.js.
 */
function getGlyphDefinition(char: string, style: FontStyle): GlyphDef {
  const c = char.toUpperCase();
  const w = 10;
  const h = 14;

  // Generic fallback if space
  if (c === ' ') {
    return { width: 6, shapes: [] };
  }

  // Predefined vector paths for letters
  switch (c) {
    case 'A':
      return {
        width: 10,
        shapes: [
          {
            outer: [[1, 0], [4, 14], [6, 14], [9, 0], [7, 0], [5.8, 5], [4.2, 5], [3, 0]],
            holes: [[[5, 11], [4.4, 7], [5.6, 7]]]
          }
        ]
      };
    case 'B':
      return {
        width: 10,
        shapes: [
          {
            outer: [[1, 0], [1, 14], [7, 14], [9, 11], [7, 7.5], [9, 3.5], [7, 0]],
            holes: [
              [[3, 8.5], [6, 8.5], [7, 10.5], [6, 12.5], [3, 12.5]],
              [[3, 1.5], [6, 1.5], [7, 3.5], [6, 6], [3, 6]]
            ]
          }
        ]
      };
    case 'C':
      return {
        width: 10,
        shapes: [
          {
            outer: [[9, 12], [7, 14], [3, 14], [1, 11], [1, 3], [3, 0], [7, 0], [9, 2], [7.5, 3.5], [6, 2], [3.5, 2], [3, 4], [3, 10], [3.5, 12], [6, 12], [7.5, 10.5]]
          }
        ]
      };
    case 'D':
      return {
        width: 10,
        shapes: [
          {
            outer: [[1, 0], [1, 14], [6, 14], [9, 10], [9, 4], [6, 0]],
            holes: [
              [[3, 2], [5.5, 2], [7, 5], [7, 9], [5.5, 12], [3, 12]]
            ]
          }
        ]
      };
    case 'E':
      return {
        width: 9,
        shapes: [
          {
            outer: [[1, 0], [1, 14], [8, 14], [8, 11.5], [3.5, 11.5], [3.5, 8.5], [7.5, 8.5], [7.5, 6], [3.5, 6], [3.5, 2.5], [8, 2.5], [8, 0]]
          }
        ]
      };
    case 'F':
      return {
        width: 9,
        shapes: [
          {
            outer: [[1, 0], [1, 14], [8, 14], [8, 11.5], [3.5, 11.5], [3.5, 8.5], [7.5, 8.5], [7.5, 6], [3.5, 6], [3.5, 0]]
          }
        ]
      };
    case 'G':
      return {
        width: 10,
        shapes: [
          {
            outer: [[9, 12], [7, 14], [3, 14], [1, 11], [1, 3], [3, 0], [7.5, 0], [9, 2], [9, 7], [5.5, 7], [5.5, 5], [7, 5], [7, 2.5], [3.5, 2.5], [3, 4], [3, 10], [3.5, 11.5], [6.5, 11.5], [7.5, 10.5]]
          }
        ]
      };
    case 'H':
      return {
        width: 10,
        shapes: [
          {
            outer: [[1, 0], [1, 14], [3.5, 14], [3.5, 8.5], [6.5, 8.5], [6.5, 14], [9, 14], [9, 0], [6.5, 0], [6.5, 6], [3.5, 6], [3.5, 0]]
          }
        ]
      };
    case 'I':
      return {
        width: style === 'vinewood' ? 7 : 5,
        shapes: [
          {
            outer: style === 'vinewood' 
              ? [[1, 0], [1, 2.5], [2.5, 2.5], [2.5, 11.5], [1, 11.5], [1, 14], [6, 14], [6, 11.5], [4.5, 11.5], [4.5, 2.5], [6, 2.5], [6, 0]]
              : [[1, 0], [1, 14], [4, 14], [4, 0]]
          }
        ]
      };
    case 'J':
      return {
        width: 8,
        shapes: [
          {
            outer: [[1, 4], [2.5, 2], [5, 2], [5, 14], [7.5, 14], [7.5, 1.5], [5, 0], [2, 0], [0.5, 2.5], [1.5, 4.5]]
          }
        ]
      };
    case 'K':
      return {
        width: 10,
        shapes: [
          {
            outer: [[1, 0], [1, 14], [3.5, 14], [3.5, 8], [6.5, 14], [9.5, 14], [5.5, 6.5], [9.5, 0], [6.5, 0], [3.5, 5], [3.5, 0]]
          }
        ]
      };
    case 'L':
      return {
        width: 9,
        shapes: [
          {
            outer: [[1, 0], [1, 14], [3.5, 14], [3.5, 2.5], [8.5, 2.5], [8.5, 0]]
          }
        ]
      };
    case 'M':
      return {
        width: 12,
        shapes: [
          {
            outer: [[1, 0], [1, 14], [4, 14], [6, 7], [8, 14], [11, 14], [11, 0], [8.5, 0], [8.5, 9], [6.5, 2.5], [5.5, 2.5], [3.5, 9], [3.5, 0]]
          }
        ]
      };
    case 'N':
      return {
        width: 10,
        shapes: [
          {
            outer: [[1, 0], [1, 14], [4, 14], [7, 5], [7, 14], [9.5, 14], [9.5, 0], [6.5, 0], [3.5, 9], [3.5, 0]]
          }
        ]
      };
    case 'O':
      return {
        width: 10,
        shapes: [
          {
            outer: [[3, 0], [1, 3], [1, 11], [3, 14], [7, 14], [9, 11], [9, 3], [7, 0]],
            holes: [
              [[4, 2.5], [6, 2.5], [7, 4.5], [7, 9.5], [6, 11.5], [4, 11.5], [3, 9.5], [3, 4.5]]
            ]
          }
        ]
      };
    case 'P':
      return {
        width: 9.5,
        shapes: [
          {
            outer: [[1, 0], [1, 14], [6.5, 14], [8.5, 11.5], [8.5, 7.5], [6.5, 5], [3.5, 5], [3.5, 0]],
            holes: [
              [[3.5, 7.5], [5.5, 7.5], [6.5, 9], [5.5, 11.5], [3.5, 11.5]]
            ]
          }
        ]
      };
    case 'Q':
      return {
        width: 10,
        shapes: [
          {
            outer: [[3, 0], [1, 3], [1, 11], [3, 14], [7, 14], [9, 11], [9, 3], [7, 0], [8, -1.5], [6.5, -1.5], [5.5, 0]],
            holes: [
              [[4, 2.5], [6, 2.5], [7, 4.5], [7, 9.5], [6, 11.5], [4, 11.5], [3, 9.5], [3, 4.5]]
            ]
          }
        ]
      };
    case 'R':
      return {
        width: 10,
        shapes: [
          {
            outer: [[1, 0], [1, 14], [6.5, 14], [8.5, 11.5], [8.5, 8], [6.5, 6], [8.8, 0], [6.2, 0], [4.5, 5.5], [3.5, 5.5], [3.5, 0]],
            holes: [
              [[3.5, 8.5], [5.5, 8.5], [6.5, 10], [5.5, 11.5], [3.5, 11.5]]
            ]
          }
        ]
      };
    case 'S':
      return {
        width: 9.5,
        shapes: [
          {
            outer: [[1.5, 2.5], [3, 0], [7, 0], [8.5, 2], [8.5, 5], [6, 7], [2.5, 8.5], [2, 11], [3.5, 12], [6.5, 12], [7.5, 10.5], [8.5, 12], [7, 14], [3, 14], [1, 11.5], [1, 9], [3.5, 7], [7, 5.5], [7, 3], [5.5, 2], [3.5, 2], [2.5, 3]]
          }
        ]
      };
    case 'T':
      return {
        width: 10,
        shapes: [
          {
            outer: [[3.5, 0], [3.5, 11.5], [0.5, 11.5], [0.5, 14], [9.5, 14], [9.5, 11.5], [6.5, 11.5], [6.5, 0]]
          }
        ]
      };
    case 'U':
      return {
        width: 10,
        shapes: [
          {
            outer: [[1, 14], [3.5, 14], [3.5, 4], [4.5, 2], [5.5, 2], [6.5, 4], [6.5, 14], [9, 14], [9, 3], [7, 0], [3, 0], [1, 3]]
          }
        ]
      };
    case 'V':
      return {
        width: 10,
        shapes: [
          {
            outer: [[0.5, 14], [3.5, 14], [5, 4], [6.5, 14], [9.5, 14], [6.5, 0], [3.5, 0]]
          }
        ]
      };
    case 'W':
      return {
        width: 13,
        shapes: [
          {
            outer: [[0.5, 14], [3, 14], [4.5, 4], [6, 11], [7, 11], [8.5, 4], [10, 14], [12.5, 14], [10, 0], [7.5, 0], [6.5, 5.5], [5.5, 0], [3, 0]]
          }
        ]
      };
    case 'X':
      return {
        width: 10,
        shapes: [
          {
            outer: [[1, 14], [3.5, 14], [5, 9], [6.5, 14], [9, 14], [6.5, 7], [9, 0], [6.5, 0], [5, 5], [3.5, 0], [1, 0], [3.5, 7]]
          }
        ]
      };
    case 'Y':
      return {
        width: 10,
        shapes: [
          {
            outer: [[1, 14], [3.5, 14], [5, 8], [6.5, 14], [9, 14], [6.5, 7], [6.5, 0], [3.5, 0], [3.5, 7]]
          }
        ]
      };
    case 'Z':
      return {
        width: 9.5,
        shapes: [
          {
            outer: [[1, 14], [8.5, 14], [8.5, 11.5], [3.5, 2.5], [8.5, 2.5], [8.5, 0], [1, 0], [1, 2.5], [6, 11.5], [1, 11.5]]
          }
        ]
      };
    case '0':
      return {
        width: 9,
        shapes: [
          {
            outer: [[2.5, 0], [1, 3], [1, 11], [2.5, 14], [6.5, 14], [8, 11], [8, 3], [6.5, 0]],
            holes: [
              [[3.5, 2.5], [5.5, 2.5], [6, 5], [6, 9], [5.5, 11.5], [3.5, 11.5], [3, 9], [3, 5]]
            ]
          }
        ]
      };
    case '1':
      return {
        width: 7,
        shapes: [
          {
            outer: [[1, 9.5], [3.5, 14], [5.5, 14], [5.5, 0], [2.5, 0], [2.5, 2], [3.5, 2], [3.5, 11], [2, 9.5]]
          }
        ]
      };
    case '2':
      return {
        width: 9,
        shapes: [
          {
            outer: [[1.5, 10.5], [3, 14], [6.5, 14], [8, 11.5], [8, 9], [3.5, 2.5], [8, 2.5], [8, 0], [1, 0], [1, 2.5], [5.5, 8], [6, 10], [5, 11.5], [3.5, 11.5], [2.5, 10]]
          }
        ]
      };
    case '3':
      return {
        width: 9,
        shapes: [
          {
            outer: [[1.5, 12], [3, 14], [6.5, 14], [8, 11.5], [8, 8.5], [6, 7], [8, 5.5], [8, 2], [6.5, 0], [2.5, 0], [1, 2], [2.5, 2.5], [4.5, 2], [6, 3], [6, 5.5], [4, 6], [4, 8], [6, 8.5], [6, 11], [4.5, 12], [2.5, 11]]
          }
        ]
      };
    case '4':
      return {
        width: 9.5,
        shapes: [
          {
            outer: [[6, 14], [1, 5], [1, 3], [6, 3], [6, 0], [8.5, 0], [8.5, 3], [9.5, 3], [9.5, 5], [8.5, 5], [8.5, 14]],
            holes: [
              [[6, 5.5], [3, 5.5], [6, 10.5]]
            ]
          }
        ]
      };
    case '5':
      return {
        width: 9,
        shapes: [
          {
            outer: [[2, 14], [8, 14], [8, 11.5], [3.5, 11.5], [3, 8], [6.5, 8], [8, 6], [8, 2], [6.5, 0], [2, 0], [1, 2], [2.5, 2.5], [4.5, 2], [6, 3], [6, 5.5], [4, 6], [2, 6]]
          }
        ]
      };
    case '6':
      return {
        width: 9,
        shapes: [
          {
            outer: [[6.5, 14], [3, 11], [1, 5], [1, 3], [2.5, 0], [6.5, 0], [8, 3], [8, 5], [6.5, 7.5], [3, 7.5], [3, 9.5], [4.5, 11.5], [6.5, 11.5]],
            holes: [
              [[3, 2.5], [5.5, 2.5], [6, 4], [5.5, 5.5], [3, 5.5]]
            ]
          }
        ]
      };
    case '7':
      return {
        width: 9,
        shapes: [
          {
            outer: [[1, 14], [8.5, 14], [8.5, 11.5], [4.5, 0], [2, 0], [6, 11.5], [1, 11.5]]
          }
        ]
      };
    case '8':
      return {
        width: 9,
        shapes: [
          {
            outer: [[3, 0], [1, 2], [1, 5], [2.5, 7], [1, 9], [1, 12], [3, 14], [6, 14], [8, 12], [8, 9], [6.5, 7], [8, 5], [8, 2], [6, 0]],
            holes: [
              [[3, 8.5], [6, 8.5], [6, 11.5], [3, 11.5]],
              [[3, 2], [6, 2], [6, 5.5], [3, 5.5]]
            ]
          }
        ]
      };
    case '9':
      return {
        width: 9,
        shapes: [
          {
            outer: [[2.5, 0], [6, 3], [8, 9], [8, 11], [6.5, 14], [2.5, 14], [1, 11], [1, 9], [2.5, 6.5], [6, 6.5], [6, 4.5], [4.5, 2.5], [2.5, 2.5]],
            holes: [
              [[3.5, 8.5], [5.5, 8.5], [6, 10], [5.5, 11.5], [3.5, 11.5]]
            ]
          }
        ]
      };
    case '-':
    case '_':
      return {
        width: 7,
        shapes: [{ outer: [[1, 5.5], [1, 7.5], [6, 7.5], [6, 5.5]] }]
      };
    case '.':
      return {
        width: 4,
        shapes: [{ outer: [[1, 0], [1, 2.5], [3, 2.5], [3, 0]] }]
      };
    case '!':
      return {
        width: 4,
        shapes: [
          { outer: [[1, 4], [1, 14], [3, 14], [3, 4]] },
          { outer: [[1, 0], [1, 2.5], [3, 2.5], [3, 0]] }
        ]
      };
    case '&':
    case '+':
      return {
        width: 8,
        shapes: [
          { outer: [[3, 2], [3, 12], [5, 12], [5, 2]] },
          { outer: [[1, 6], [1, 8], [7, 8], [7, 6]] }
        ]
      };
    default:
      // Default block representation
      return {
        width: 8,
        shapes: [
          { outer: [[1, 0], [1, 14], [7, 14], [7, 0]], holes: [[[2.5, 2], [5.5, 2], [5.5, 12], [2.5, 12]]] }
        ]
      };
  }
}

/**
 * Font metadata and previews
 */
export const AVAILABLE_FONTS: Array<{
  id: FontStyle;
  name: string;
  category: string;
  description: string;
}> = [
  { id: 'vinewood', name: 'Vinewood Sign', category: 'GTA V Clássico', description: 'O clássico letreiro de Vinewood com serifa e presença' },
  { id: 'bold_sans', name: 'Bold Sans (Impact)', category: 'Moderno / Pesado', description: 'Letras grossas, retas e com alto impacto visual' },
  { id: 'condensed', name: 'Condensed Luxo', category: 'Moderno / Alto', description: 'Tipografia alta, estreita e sofisticada para prédios e baladas' },
  { id: 'neon_tube', name: 'Neon Tubular', category: 'Noturno / Glow', description: 'Traços contínuos estilizados para tubos de neon' },
  { id: 'gothic', name: 'Gothic / Facção', category: 'Facção & Gangue', description: 'Estilo gótico germânico/chicano com pontas afiadas' },
  { id: 'stencil', name: 'Militar / Stencil', category: 'Tático / BOPE', description: 'Cortes vazados militares para bases policiais e armazéns' },
  { id: 'cyber', name: 'Cyberpunk 2077', category: 'Futurista', description: 'Cantos chanfrados em 45 graus e visual tech de alta performance' },
  { id: 'arcade', name: 'Arcade Pixel 8-Bit', category: 'Retrô & Games', description: 'Geometria pixelada retrô inspirada em fliperamas' },
  { id: 'script', name: 'Dynamic Script (Itálico)', category: 'Velocidade & Tuning', description: 'Itálico inclinado dinâmico para oficinas, garagens e pistas' },
  { id: 'serif', name: 'Serif Clássico Nobre', category: 'Clássico & Nobre', description: 'Serifas refinadas de alta patente para mansões, bancos e prefeituras' },
  { id: 'western', name: 'Velho Oeste / Sheriff', category: 'Rústico / Blaine County', description: 'Pontas afiadas estilo xerife e tavernas de Sandy Shores' },
  { id: 'brush', name: 'Street Graffiti', category: 'Urbano / Rua', description: 'Traços angulares urbanos inspirados em murais de rua' },
];

/**
 * Transforms glyph points according to selected font style
 */
function transformPointsForStyle(
  pts: Array<[number, number]>,
  style: FontStyle,
  isHole = false
): Array<[number, number]> {
  switch (style) {
    case 'condensed':
      // Narrow X, slightly taller Y
      return pts.map(([x, y]) => [x * 0.72, y * 1.05]);

    case 'script':
      // Dynamic forward italic slant
      return pts.map(([x, y]) => [x * 0.92 + (y / 14) * 2.2, y]);

    case 'cyber':
      // 45-degree cyber chamfers
      return pts.map(([x, y]) => {
        let nx = x;
        let ny = y;
        if (x > 8.5 && y > 12) { nx = 8.2; ny = 12.8; }
        if (x < 1.5 && y < 2) { nx = 1.8; ny = 1.2; }
        return [nx, ny];
      });

    case 'arcade':
      // Pixel / blocky snapping
      return pts.map(([x, y]) => [Math.round(x * 1.1) / 1.1, Math.round(y * 1.1) / 1.1]);

    case 'western':
      // Flared serif spikes on extremes
      return pts.map(([x, y]) => {
        let nx = x;
        if (!isHole) {
          if (y <= 1.5) nx = x < 5 ? x - 0.6 : x + 0.6;
          if (y >= 12.5) nx = x < 5 ? x - 0.5 : x + 0.5;
        }
        return [nx, y];
      });

    case 'gothic':
      // Angular peaked Gothic silhouette
      return pts.map(([x, y]) => {
        let ny = y;
        let nx = x;
        if (y > 12 && !isHole) { ny = y + (x > 4 && x < 7 ? 0.8 : 0); }
        return [nx, ny];
      });

    case 'brush':
      // Angled street dynamic cut
      return pts.map(([x, y]) => [x + (Math.sin(y * 0.5) * 0.25), y]);

    case 'serif':
    case 'vinewood':
      // Traditional bracketed serifs handled in glyph def or natural
      return pts.map(([x, y]) => [x * 1.02, y]);

    case 'bold_sans':
    case 'neon_tube':
    case 'stencil':
    default:
      return pts;
  }
}

/**
 * Width scaling multiplier for font styles
 */
function getFontWidthMultiplier(style: FontStyle): number {
  switch (style) {
    case 'condensed':
      return 0.72;
    case 'script':
      return 0.94;
    case 'western':
      return 1.12;
    case 'bold_sans':
      return 1.05;
    case 'cyber':
      return 1.02;
    case 'arcade':
      return 0.95;
    default:
      return 1.0;
  }
}

/**
 * Creates 3D extruded mesh group for text line
 */
export function createLine3DMesh(
  text: string,
  config: SignConfig,
  isSecondary = false
): { group: THREE.Group; totalWidth: number } {
  const lineGroup = new THREE.Group();
  const scaleMultiplier = isSecondary ? 0.6 : 1.0;
  const depth = config.depth * scaleMultiplier;
  const bevel = Math.min(config.bevel, depth * 0.4);

  // User letterSpacing: 0 = tight snug kerning; negative = overlapping/touching; positive = spacious
  const spacingOffset = (config.letterSpacing || 0) * scaleMultiplier;
  const styleMult = getFontWidthMultiplier(config.fontStyle);

  const glyphs: Array<{ shapes: THREE.Shape[]; width: number }> = [];

  // 1. Build shapes for each character
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const def = getGlyphDefinition(char, config.fontStyle);
    const charShapes: THREE.Shape[] = [];

    // Space character handled naturally
    if (char === ' ') {
      glyphs.push({ shapes: [], width: 4.5 * 0.1 * styleMult * scaleMultiplier });
      continue;
    }

    for (const part of def.shapes) {
      const shape = new THREE.Shape();
      if (part.outer.length > 0) {
        // Apply font style points transformation
        const transformedOuter = transformPointsForStyle(part.outer, config.fontStyle, false);

        shape.moveTo(
          transformedOuter[0][0] * 0.1 * styleMult * scaleMultiplier,
          transformedOuter[0][1] * 0.1 * scaleMultiplier
        );
        for (let ptIdx = 1; ptIdx < transformedOuter.length; ptIdx++) {
          shape.lineTo(
            transformedOuter[ptIdx][0] * 0.1 * styleMult * scaleMultiplier,
            transformedOuter[ptIdx][1] * 0.1 * scaleMultiplier
          );
        }
        shape.closePath();

        if (part.holes) {
          for (const holePts of part.holes) {
            const transformedHole = transformPointsForStyle(holePts, config.fontStyle, true);
            const holePath = new THREE.Path();
            holePath.moveTo(
              transformedHole[0][0] * 0.1 * styleMult * scaleMultiplier,
              transformedHole[0][1] * 0.1 * scaleMultiplier
            );
            for (let hIdx = 1; hIdx < transformedHole.length; hIdx++) {
              holePath.lineTo(
                transformedHole[hIdx][0] * 0.1 * styleMult * scaleMultiplier,
                transformedHole[hIdx][1] * 0.1 * scaleMultiplier
              );
            }
            holePath.closePath();
            shape.holes.push(holePath);
          }
        }
        charShapes.push(shape);
      }
    }

    // Natural letter advance with user spacing offset (no artificial +1.2 gap!)
    const baseGlyphAdvance = (def.width * 0.1 * styleMult) * scaleMultiplier;
    // Base natural gap is just 0.04m, plus user spacing which can go negative down to -0.35m
    const charWidth = Math.max(0.08, baseGlyphAdvance + (0.04 * scaleMultiplier) + spacingOffset);
    glyphs.push({ shapes: charShapes, width: charWidth });
  }

  // Calculate total width to center line
  const totalWidth = glyphs.reduce((acc, g) => acc + g.width, 0);
  let startX = -totalWidth / 2;

  // Extrude options
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: depth,
    bevelEnabled: bevel > 0,
    bevelSegments: 3,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel,
  };

  // Material setup
  const mainMaterial = createSignMaterial(config, isSecondary);

  // 2. Extrude each glyph and position
  for (let i = 0; i < glyphs.length; i++) {
    const { shapes, width } = glyphs[i];
    if (shapes.length > 0) {
      const geom = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
      geom.computeVertexNormals();

      const letterMesh = new THREE.Mesh(geom, mainMaterial);
      letterMesh.castShadow = true;
      letterMesh.receiveShadow = true;

      // Handle arch / curve if enabled
      if (config.curveRadius > 0) {
        const angle = (startX / config.curveRadius);
        letterMesh.position.x = Math.sin(angle) * config.curveRadius;
        letterMesh.position.z = (1 - Math.cos(angle)) * config.curveRadius;
        letterMesh.rotation.y = angle;
      } else {
        letterMesh.position.x = startX;
      }

      lineGroup.add(letterMesh);
    }
    startX += width;
  }

  return { group: lineGroup, totalWidth };
}

/**
 * Creates Three.js Material matching user configuration
 */
export function createSignMaterial(config: SignConfig, isSecondary = false): THREE.Material {
  const colorHex = isSecondary ? config.secondaryColor : config.primaryColor;
  const isNeon = config.materialType === 'neon';

  switch (config.materialType) {
    case 'neon':
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        emissive: new THREE.Color(config.glowColor),
        emissiveIntensity: config.glowIntensity,
        roughness: 0.1,
        metalness: 0.2,
      });

    case 'metal':
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        metalness: 0.9,
        roughness: 0.2,
      });

    case 'gold':
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color('#eab308'),
        metalness: 0.95,
        roughness: 0.15,
      });

    case 'rust':
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color('#9a3412'),
        metalness: 0.3,
        roughness: 0.9,
      });

    case 'concrete':
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        metalness: 0.05,
        roughness: 0.85,
      });

    case 'carbon':
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color('#18181b'),
        metalness: 0.6,
        roughness: 0.4,
      });

    case 'wood':
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color('#78350f'),
        metalness: 0.0,
        roughness: 0.8,
      });

    case 'matte':
    default:
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        metalness: config.metalness || 0.1,
        roughness: config.roughness || 0.6,
      });
  }
}

/**
 * Build support structures (poles, backplate, truss, pedestal)
 */
export function createMountStructure(
  config: SignConfig,
  bounds: GeneratedMeshBounds
): THREE.Group {
  const mountGroup = new THREE.Group();
  const mountColor = new THREE.Color(config.mountColor);

  const mountMaterial = new THREE.MeshStandardMaterial({
    color: mountColor,
    metalness: config.mountType === 'pedestal' ? 0.1 : 0.85,
    roughness: config.mountType === 'pedestal' ? 0.9 : 0.3,
  });

  const w = bounds.width;
  const h = bounds.height;
  const d = bounds.depth;

  switch (config.mountType) {
    case 'poles': {
      // Two cylindrical steel support legs
      const poleRadius = 0.08;
      const poleHeight = 2.4;
      const poleGeom = new THREE.CylinderGeometry(poleRadius, poleRadius, poleHeight, 16);

      const leftPole = new THREE.Mesh(poleGeom, mountMaterial);
      leftPole.position.set(-w * 0.35, -poleHeight / 2 + h * 0.2, -d * 0.2);
      leftPole.castShadow = true;

      const rightPole = new THREE.Mesh(poleGeom, mountMaterial);
      rightPole.position.set(w * 0.35, -poleHeight / 2 + h * 0.2, -d * 0.2);
      rightPole.castShadow = true;

      // Crossbar connecting the poles
      const crossbarGeom = new THREE.BoxGeometry(w * 0.75, 0.08, 0.08);
      const crossbar = new THREE.Mesh(crossbarGeom, mountMaterial);
      crossbar.position.set(0, h * 0.1, -d * 0.2);

      mountGroup.add(leftPole, rightPole, crossbar);
      break;
    }

    case 'backplate': {
      // Solid lightbox / acrylic backing board behind the letters
      const padding = 0.4;
      const plateW = w + padding;
      const plateH = h + padding;
      const plateD = 0.12;

      const plateGeom = new THREE.BoxGeometry(plateW, plateH, plateD);
      const plateMesh = new THREE.Mesh(plateGeom, mountMaterial);
      plateMesh.position.set(0, h * 0.45, -plateD / 2 - 0.02);
      plateMesh.castShadow = true;
      plateMesh.receiveShadow = true;

      mountGroup.add(plateMesh);
      break;
    }

    case 'truss': {
      // Industrial scaffolding truss framework
      const trussGroup = new THREE.Group();
      const beamGeom = new THREE.BoxGeometry(w * 1.1, 0.06, 0.06);
      
      const topBeam = new THREE.Mesh(beamGeom, mountMaterial);
      topBeam.position.set(0, h * 1.05, -0.15);

      const midBeam = new THREE.Mesh(beamGeom, mountMaterial);
      midBeam.position.set(0, h * 0.5, -0.15);

      const btmBeam = new THREE.Mesh(beamGeom, mountMaterial);
      btmBeam.position.set(0, 0, -0.15);

      // Vertical struts
      const numStruts = 6;
      for (let s = 0; s <= numStruts; s++) {
        const strutX = -w * 0.55 + (w * 1.1 * s) / numStruts;
        const strutGeom = new THREE.CylinderGeometry(0.03, 0.03, h * 1.1, 8);
        const strut = new THREE.Mesh(strutGeom, mountMaterial);
        strut.position.set(strutX, h * 0.52, -0.15);
        trussGroup.add(strut);
      }

      trussGroup.add(topBeam, midBeam, btmBeam);
      mountGroup.add(trussGroup);
      break;
    }

    case 'pedestal': {
      // Concrete foundation base blocks (Vinewood style)
      const baseGeom = new THREE.BoxGeometry(w * 1.05, 0.35, d * 1.8);
      const baseMesh = new THREE.Mesh(baseGeom, mountMaterial);
      baseMesh.position.set(0, -0.18, d * 0.3);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;

      mountGroup.add(baseMesh);
      break;
    }

    case 'none':
    default:
      break;
  }

  return mountGroup;
}

/**
 * Calculates exact bounding box dimensions and geometry counts
 */
export function calculateMeshBounds(signRootGroup: THREE.Group): GeneratedMeshBounds {
  const box = new THREE.Box3().setFromObject(signRootGroup);
  const size = new THREE.Vector3();
  box.getSize(size);

  let vertexCount = 0;
  let faceCount = 0;

  signRootGroup.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) {
        const pos = mesh.geometry.attributes.position;
        if (pos) {
          vertexCount += pos.count;
          faceCount += mesh.geometry.index ? mesh.geometry.index.count / 3 : pos.count / 3;
        }
      }
    }
  });

  const width = Math.max(size.x, 0.05);
  const height = Math.max(size.y, 0.05);
  const depth = Math.max(size.z, 0.02);
  const radius = Math.sqrt(width * width + height * height + depth * depth) / 2;

  const centerX = (box.min.x + box.max.x) / 2;
  const centerY = (box.min.y + box.max.y) / 2;
  const centerZ = (box.min.z + box.max.z) / 2;

  return {
    minX: box.min.x,
    maxX: box.max.x,
    minY: box.min.y,
    maxY: box.max.y,
    minZ: box.min.z,
    maxZ: box.max.z,
    centerX: Number(centerX.toFixed(4)),
    centerY: Number(centerY.toFixed(4)),
    centerZ: Number(centerZ.toFixed(4)),
    width: Number(width.toFixed(4)),
    height: Number(height.toFixed(4)),
    depth: Number(depth.toFixed(4)),
    radius: Number(radius.toFixed(4)),
    vertexCount: Math.round(vertexCount) || 1200,
    faceCount: Math.round(faceCount) || 800,
  };
}
