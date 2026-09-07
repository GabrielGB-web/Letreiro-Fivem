export type MaterialType =
  | 'neon'
  | 'metal'
  | 'gold'
  | 'rust'
  | 'concrete'
  | 'carbon'
  | 'wood'
  | 'matte';

export type MountType =
  | 'none'
  | 'poles'
  | 'backplate'
  | 'truss'
  | 'pedestal';

export type CollisionMaterial =
  | 'CONCRETE'
  | 'METAL_LIGHT'
  | 'METAL_HEAVY'
  | 'WOOD'
  | 'PLASTIC'
  | 'GLASS';

export type FontStyle =
  | 'vinewood'
  | 'bold_sans'
  | 'condensed'
  | 'neon_tube'
  | 'gothic'
  | 'stencil'
  | 'cyber'
  | 'arcade'
  | 'script'
  | 'serif'
  | 'western'
  | 'brush';

export type ModeType = 'text' | 'image' | 'hybrid';

export type BadgeShape = 'none' | 'contour' | 'shield' | 'circle' | 'rectangle' | 'hexagon' | 'diamond';

export interface ImageConfig {
  dataUrl: string | null;
  fileName: string;
  badgeShape: BadgeShape;
  hasFrame: boolean; // When false, renders pure borderless logo without 3D backing plate or rim
  depth: number; // 3D extrusion depth of the emblem (0.05 to 4.0m)
  scale: number; // emblem size scale (0.2 to 4.0)
  widthScale?: number; // optional stretch X (0.2 to 3.0, default 1.0)
  heightScale?: number; // optional stretch Y (0.2 to 3.0, default 1.0)
  threshold: number; // 0-255 transparency cutoff
  glowRim: boolean;
  glowRimColor: string;
  glowRimIntensity: number;
  reliefDepth: number; // 3D embossing/relief
  invertAlpha: boolean;
  frameWidth: number; // border thickness
}

export type TimeOfDay = 'midnight' | 'sunset' | 'day';

export interface MapPreset {
  name: string;
  category: string;
  x: number;
  y: number;
  z: number;
  heading: number;
}

export interface SignConfig {
  // Generation Mode
  mode: ModeType;
  
  // Image / Emblem configuration
  imageConfig: ImageConfig;

  // Text content
  text: string;
  subText: string;
  fontStyle: FontStyle;
  
  // Dimensions & Spacing
  scale: number; // overall scale (0.5 to 3.0)
  depth: number; // 3D extrusion depth (0.1 to 1.5)
  bevel: number; // bevel size (0 to 0.15)
  letterSpacing: number; // space between letters (-0.35 to 0.8)
  lineSpacing: number; // space between lines (0.5 to 2.5)
  curveRadius: number; // 0 = flat, >0 = arched
  
  // Colors & Materials
  materialType: MaterialType;
  primaryColor: string;
  secondaryColor: string; // for backing / mount / bevel
  glowColor: string; // for neon emissive
  glowIntensity: number; // 0 to 5
  glowPulse: boolean;
  roughness: number;
  metalness: number;
  
  // Mount / Support Structure
  mountType: MountType;
  mountColor: string;
  mountHeight: number;
  
  // FiveM Prop Data
  propName: string;
  resourceName: string;
  categoryTag: string;
  lodDist: number; // default 250
  hasCollision: boolean;
  collisionMaterial: CollisionMaterial;
  
  // Location (.ymap)
  coords: {
    x: number;
    y: number;
    z: number;
    heading: number;
  };
}

export interface GeneratedMeshBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  centerX?: number;
  centerY?: number;
  centerZ?: number;
  width: number;
  height: number;
  depth: number;
  radius: number;
  vertexCount: number;
  faceCount: number;
}

export interface FtpExportConfig {
  protocol: 'ftp' | 'sftp';
  host: string;
  port: number;
  username: string;
  password: string;
  remotePath: string;
  autoEnsure: boolean;
}
