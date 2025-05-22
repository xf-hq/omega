import type { RedEngine } from '../../red-engine/engine-types';

// Parameter Types:
// - 1: "CMaterialParameterTexture"
// - 2: "CMaterialParameterColor"
// - 5: "CMaterialParameterScalar"

// Decal Material Parameters:
// - DiffuseTexture { offset: 0, type: 1 ("CMaterialParameterTexture"), path: "engine\\textures\\editor\\grey.xbm" }
// - DiffuseColor { offset: 8, type: 2 ("CMaterialParameterColor"), defaultValue: { r: 255, g: 255, b: 255, a: 255 } }
// - DiffuseAlpha { offset: 12, type: 5 ("CMaterialParameterScalar"), "max": 340282347E38, min: -3.40282347E+38, defaultValue: 0 }
// - UVOffsetX { offset: 16, type: 5 ("CMaterialParameterScalar"), max: 1, min: -1, defaultValue: 0 }
// - UVOffsetY { offset: 20, type: 5 ("CMaterialParameterScalar"), max: 1, min: -1, defaultValue: 0 }
// - UVRotation { offset: 24, type: 5 ("CMaterialParameterScalar"), max: 1, min: -1, defaultValue: 0 }
// - UVScaleX { offset: 28, type: 5 ("CMaterialParameterScalar"), "max": 340282347E38, min: -3.40282347E+38, defaultValue: 1 }
// - UVScaleY { offset: 32, type: 5 ("CMaterialParameterScalar"), "max": 340282347E38, min: -3.40282347E+38, defaultValue: 1 }
// - SecondaryMask { offset: 36, type: 1 ("CMaterialParameterTexture"), path: "engine\\textures\\editor\\white.xbm" }
// - SecondaryMaskUVScale { offset: 44, type: 5 ("CMaterialParameterScalar"), max: 100, min: 1, defaultValue: 1 }
// - SecondaryMaskInfluence { offset: 48, type: 5 ("CMaterialParameterScalar"), max: 1, min: 0, defaultValue: 0 }
// - NormalTexture { offset: 52, type: 1 ("CMaterialParameterTexture"), path: "engine\\textures\\editor\\normal.xbm" }
// - NormalAlpha { offset: 60, type: 5 ("CMaterialParameterScalar"), "max": 340282347E38, min: -3.40282347E+38, defaultValue: 0 }
// - NormalAlphaTex { offset: 64, type: 1 ("CMaterialParameterTexture"), path: "engine\\textures\\editor\\white.xbm" }
// - UseNormalAlphaTex { offset: 72, type: 5 ("CMaterialParameterScalar"), max: 1, min: 0, defaultValue: 0 }
// - NormalsBlendingMode { offset: 76, type: 5 ("CMaterialParameterScalar"), max: 1, min: 0, defaultValue: 0 }
// - NormalsBlendingModeAlpha { offset: 80, type: 1 ("CMaterialParameterTexture"), path: "engine\\textures\\editor\\white.xbm" }
// - RoughnessTexture { offset: 88, type: 1 ("CMaterialParameterTexture"), path: "engine\\textures\\editor\\white.xbm" }
// - RoughnessScale { offset: 96, type: 5 ("CMaterialParameterScalar"), max: 2, min: 0, defaultValue: 1 }
// - RoughnessBias { offset: 100, type: 5 ("CMaterialParameterScalar"), max: 1, min: 0, defaultValue: 0 }
// - MetalnessTexture { offset: 104, type: 1 ("CMaterialParameterTexture"), path: "engine\\textures\\editor\\black.xbm" }
// - MetalnessScale { offset: 112, type: 5 ("CMaterialParameterScalar"), max: 2, min: 0, defaultValue: 1 }
// - MetalnessBias { offset: 116, type: 5 ("CMaterialParameterScalar"), max: 1, min: 0, defaultValue: 0 }
// - AlphaMaskContrast { offset: 120, type: 5 ("CMaterialParameterScalar"), max: 1, min: -1, defaultValue: 0 }
// - RoughnessMetalnessAlpha { offset: 124, type: 5 ("CMaterialParameterScalar"), "max": 340282347E38, min: -3.40282347E+38, defaultValue: 0 }
// - AnimationSpeed { offset: 128, type: 5 ("CMaterialParameterScalar"), "max": 340282347E38, min: -3.40282347E+38, defaultValue: 1 }
// - AnimationFramesWidth { offset: 132, type: 5 ("CMaterialParameterScalar"), "max": 340282347E38, min: -3.40282347E+38, defaultValue: 1 }
// - AnimationFramesHeight { offset: 136, type: 5 ("CMaterialParameterScalar"), "max": 340282347E38, min: -3.40282347E+38, defaultValue: 1 }
// - DepthThreshold { offset: 140, type: 5 ("CMaterialParameterScalar"), max: 10, min: 0, defaultValue: 0.5 }

export interface ColorValue {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface DecalMaterialParameters {
  DiffuseTexture?: string;
  DiffuseColor?: ColorValue;
  DiffuseAlpha?: number;
  UVOffsetX?: number;
  UVOffsetY?: number;
  UVRotation?: number;
  UVScaleX?: number;
  UVScaleY?: number;
  SecondaryMask?: string;
  SecondaryMaskUVScale?: number;
  SecondaryMaskInfluence?: number;
  NormalTexture?: string;
  NormalAlpha?: number;
  NormalAlphaTex?: string;
  UseNormalAlphaTex?: number;
  NormalsBlendingMode?: number;
  NormalsBlendingModeAlpha?: string;
  RoughnessTexture?: string;
  RoughnessScale?: number;
  RoughnessBias?: number;
  MetalnessTexture?: string;
  MetalnessScale?: number;
  MetalnessBias?: number;
  AlphaMaskContrast?: number;
  RoughnessMetalnessAlpha?: number;
  AnimationSpeed?: number;
  AnimationFramesWidth?: number;
  AnimationFramesHeight?: number;
  DepthThreshold?: number;
}

export interface DecalMaterialInstance {
  name: string;
  parameters: DecalMaterialParameters;
}

export const DecalMaterialInstance = {
  // to (): RedEngine.CMaterialInstance
};

