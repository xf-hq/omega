import { z } from 'zod/v4';

export const PLATFORM_None = 'PLATFORM_None';
export const PLATFORM_PC = 'PLATFORM_PC';
export const PLATFORM_XboxOne = 'PLATFORM_XboxOne';
export const PLATFORM_PS4 = 'PLATFORM_PS4';
export const PLATFORM_PS5 = 'PLATFORM_PS5';
export const PLATFORM_XSX = 'PLATFORM_XSX';
export const PLATFORM_WindowsServer = 'PLATFORM_WindowsServer';
export const PLATFORM_LinuxServer = 'PLATFORM_LinuxServer';
export const PLATFORM_GGP = 'PLATFORM_GGP';

export type ECookingPlatform = typeof PLATFORM_None | typeof PLATFORM_PC | typeof PLATFORM_XboxOne | typeof PLATFORM_PS4 | typeof PLATFORM_PS5 | typeof PLATFORM_XSX | typeof PLATFORM_WindowsServer | typeof PLATFORM_LinuxServer | typeof PLATFORM_GGP;
export namespace ECookingPlatform {
  export const Schema = z.enum([PLATFORM_None, PLATFORM_PC, PLATFORM_XboxOne, PLATFORM_PS4, PLATFORM_PS5, PLATFORM_XSX, PLATFORM_WindowsServer, PLATFORM_LinuxServer, PLATFORM_GGP]);
}

export const Flag_Default = 'Default';
export const Flag_Obligatory = 'Obligatory';
export const Flag_Template = 'Template';
export const Flag_Soft = 'Soft';
export const Flag_Embedded = 'Embedded';
export const Flag_Inplace = 'Inplace';

export type ResourceFlags = typeof Flag_Default | typeof Flag_Obligatory | typeof Flag_Template | typeof Flag_Soft | typeof Flag_Embedded | typeof Flag_Inplace;
export namespace ResourceFlags {
  export const Schema = z.enum([Flag_Default, Flag_Obligatory, Flag_Template, Flag_Soft, Flag_Embedded, Flag_Inplace]);
}

export const EMP_Normal = 'EMP_Normal';
export const EMP_Front = 'EMP_Front';

export type EMaterialPriority = typeof EMP_Normal | typeof EMP_Front;
export namespace EMaterialPriority {
  export const Schema = z.enum([EMP_Normal, EMP_Front]);
}

export const RMT_Standard = 'RMT_Standard';
export const RMT_Subsurface = 'RMT_Subsurface';
export const RMT_Cloth = 'RMT_Cloth';
export const RMT_Eye = 'RMT_Eye';
export const RMT_Hair = 'RMT_Hair';
export const RMT_Foliage = 'RMT_Foliage';

export type ERenderingMaterialType = typeof RMT_Standard | typeof RMT_Subsurface | typeof RMT_Cloth | typeof RMT_Eye | typeof RMT_Hair | typeof RMT_Foliage;
export namespace ERenderingMaterialType {
  export const Schema = z.enum([RMT_Standard, RMT_Subsurface, RMT_Cloth, RMT_Eye, RMT_Hair, RMT_Foliage]);
}

export const TA_Wrap = 'TA_Wrap';
export const TA_Mirror = 'TA_Mirror';
export const TA_Clamp = 'TA_Clamp';
export const TA_MirrorOnce = 'TA_MirrorOnce';
export const TA_Border = 'TA_Border';

export type ETextureAddressing = typeof TA_Wrap | typeof TA_Mirror | typeof TA_Clamp | typeof TA_MirrorOnce | typeof TA_Border;
export namespace ETextureAddressing {
  export const Schema = z.enum([TA_Wrap, TA_Mirror, TA_Clamp, TA_MirrorOnce, TA_Border]);
}

export const TCF_None = 'TCF_None';
export const TCF_Less = 'TCF_Less';
export const TCF_Equal = 'TCF_Equal';
export const TCF_LessEqual = 'TCF_LessEqual';
export const TCF_Greater = 'TCF_Greater';
export const TCF_NotEqual = 'TCF_NotEqual';
export const TCF_GreaterEqual = 'TCF_GreaterEqual';
export const TCF_Always = 'TCF_Always';

export type ETextureComparisonFunction = typeof TCF_None | typeof TCF_Less | typeof TCF_Equal | typeof TCF_LessEqual | typeof TCF_Greater | typeof TCF_NotEqual | typeof TCF_GreaterEqual | typeof TCF_Always;
export namespace ETextureComparisonFunction {
  export const Schema = z.enum([TCF_None, TCF_Less, TCF_Equal, TCF_LessEqual, TCF_Greater, TCF_NotEqual, TCF_GreaterEqual, TCF_Always]);
}

export const TFMag_Point = 'TFMag_Point';
export const TFMag_Linear = 'TFMag_Linear';

export type ETextureFilteringMag = typeof TFMag_Point | typeof TFMag_Linear;
export namespace ETextureFilteringMag {
  export const Schema = z.enum([TFMag_Point, TFMag_Linear]);
}

export const TFMin_Point = 'TFMin_Point';
export const TFMin_Linear = 'TFMin_Linear';
export const TFMin_Anisotropic = 'TFMin_Anisotropic';
export const TFMin_AnisotropicLow = 'TFMin_AnisotropicLow';

export type ETextureFilteringMin = typeof TFMin_Point | typeof TFMin_Linear | typeof TFMin_Anisotropic | typeof TFMin_AnisotropicLow;
export namespace ETextureFilteringMin {
  export const Schema = z.enum([TFMin_Point, TFMin_Linear, TFMin_Anisotropic, TFMin_AnisotropicLow]);
}

export const TFMip_None = 'TFMip_None';
export const TFMip_Point = 'TFMip_Point';
export const TFMip_Linear = 'TFMip_Linear';

export type ETextureFilteringMip = typeof TFMip_None | typeof TFMip_Point | typeof TFMip_Linear;
export namespace ETextureFilteringMip {
  export const Schema = z.enum([TFMip_None, TFMip_Point, TFMip_Linear]);
}

export const MSRM_Default = 'MSRM_Default';
export const MSRM_Disable = 'MSRM_Disable';
export const MSRM_Force2x2 = 'MSRM_Force2x2';

export type EMaterialShadingRateMode = typeof MSRM_Default | typeof MSRM_Disable | typeof MSRM_Force2x2;
export namespace EMaterialShadingRateMode {
  export const Schema = z.enum([MSRM_Default, MSRM_Disable, MSRM_Force2x2]);
}

export const OP_Add = 'OP_Add';
export const OP_Subtract = 'OP_Subtract';
export const OP_RevSub = 'OP_RevSub';
export const OP_Min = 'OP_Min';
export const OP_Max = 'OP_Max';
export const OP_Or = 'OP_Or';
export const OP_And = 'OP_And';
export const OP_xOr = 'OP_xOr';
export const OP_nAnd = 'OP_nAnd';
export const OP_nOr = 'OP_nOr';

export type PSODescBlendModeOp = typeof OP_Add | typeof OP_Subtract | typeof OP_RevSub | typeof OP_Min | typeof OP_Max | typeof OP_Or | typeof OP_And | typeof OP_xOr | typeof OP_nAnd | typeof OP_nOr;
export namespace PSODescBlendModeOp {
  export const Schema = z.enum([OP_Add, OP_Subtract, OP_RevSub, OP_Min, OP_Max, OP_Or, OP_And, OP_xOr, OP_nAnd, OP_nOr]);
}

export const FAC_Zero = 'FAC_Zero';
export const FAC_One = 'FAC_One';
export const FAC_SrcColor = 'FAC_SrcColor';
export const FAC_InvSrcColor = 'FAC_InvSrcColor';
export const FAC_SrcAlpha = 'FAC_SrcAlpha';
export const FAC_InvSrcAlpha = 'FAC_InvSrcAlpha';
export const FAC_DestColor = 'FAC_DestColor';
export const FAC_InvDestColor = 'FAC_InvDestColor';
export const FAC_DestAlpha = 'FAC_DestAlpha';
export const FAC_InvDestAlpha = 'FAC_InvDestAlpha';
export const FAC_BlendFactor = 'FAC_BlendFactor';
export const FAC_InvBlendFactor = 'FAC_InvBlendFactor';
export const FAC_Src1Color = 'FAC_Src1Color';
export const FAC_InvSrc1Color = 'FAC_InvSrc1Color';
export const FAC_Src1Alpha = 'FAC_Src1Alpha';
export const FAC_InvSrc1Alpha = 'FAC_InvSrc1Alpha';

export type PSODescBlendModeFactor = typeof FAC_Zero | typeof FAC_One | typeof FAC_SrcColor | typeof FAC_InvSrcColor | typeof FAC_SrcAlpha | typeof FAC_InvSrcAlpha | typeof FAC_DestColor | typeof FAC_InvDestColor | typeof FAC_DestAlpha | typeof FAC_InvDestAlpha | typeof FAC_BlendFactor | typeof FAC_InvBlendFactor | typeof FAC_Src1Color | typeof FAC_InvSrc1Color | typeof FAC_Src1Alpha | typeof FAC_InvSrc1Alpha;
export namespace PSODescBlendModeFactor {
  export const Schema = z.enum([FAC_Zero, FAC_One, FAC_SrcColor, FAC_InvSrcColor, FAC_SrcAlpha, FAC_InvSrcAlpha, FAC_DestColor, FAC_InvDestColor, FAC_DestAlpha, FAC_InvDestAlpha, FAC_BlendFactor, FAC_InvBlendFactor, FAC_Src1Color, FAC_InvSrc1Color, FAC_Src1Alpha, FAC_InvSrc1Alpha]);
}

export const MASK_None = 'MASK_None';
export const MASK_R = 'MASK_R';
export const MASK_G = 'MASK_G';
export const MASK_RG = 'MASK_RG';
export const MASK_B = 'MASK_B';
export const MASK_RB = 'MASK_RB';
export const MASK_GB = 'MASK_GB';
export const MASK_RGB = 'MASK_RGB';
export const MASK_A = 'MASK_A';
export const MASK_RA = 'MASK_RA';
export const MASK_GA = 'MASK_GA';
export const MASK_RGA = 'MASK_RGA';
export const MASK_BA = 'MASK_BA';
export const MASK_RBA = 'MASK_RBA';
export const MASK_GBA = 'MASK_GBA';
export const MASK_RGBA = 'MASK_RGBA';

export type PSODescBlendModeWriteMask = typeof MASK_None | typeof MASK_R | typeof MASK_G | typeof MASK_RG | typeof MASK_B | typeof MASK_RB | typeof MASK_GB | typeof MASK_RGB | typeof MASK_A | typeof MASK_RA | typeof MASK_GA | typeof MASK_RGA | typeof MASK_BA | typeof MASK_RBA | typeof MASK_GBA | typeof MASK_RGBA;
export namespace PSODescBlendModeWriteMask {
  export const Schema = z.enum([MASK_None, MASK_R, MASK_G, MASK_RG, MASK_B, MASK_RB, MASK_GB, MASK_RGB, MASK_A, MASK_RA, MASK_GA, MASK_RGA, MASK_BA, MASK_RBA, MASK_GBA, MASK_RGBA]);
}

export const COMPARISON_Never = 'COMPARISON_Never';
export const COMPARISON_Less = 'COMPARISON_Less';
export const COMPARISON_Equal = 'COMPARISON_Equal';
export const COMPARISON_LessEqual = 'COMPARISON_LessEqual';
export const COMPARISON_Greater = 'COMPARISON_Greater';
export const COMPARISON_NotEqual = 'COMPARISON_NotEqual';
export const COMPARISON_GreaterEqual = 'COMPARISON_GreaterEqual';
export const COMPARISON_Always = 'COMPARISON_Always';

export type PSODescDepthStencilModeComparisonMode = typeof COMPARISON_Never | typeof COMPARISON_Less | typeof COMPARISON_Equal | typeof COMPARISON_LessEqual | typeof COMPARISON_Greater | typeof COMPARISON_NotEqual | typeof COMPARISON_GreaterEqual | typeof COMPARISON_Always;
export namespace PSODescDepthStencilModeComparisonMode {
  export const Schema = z.enum([COMPARISON_Never, COMPARISON_Less, COMPARISON_Equal, COMPARISON_LessEqual, COMPARISON_Greater, COMPARISON_NotEqual, COMPARISON_GreaterEqual, COMPARISON_Always]);
}

export const STENCILOP_Keep = 'STENCILOP_Keep';
export const STENCILOP_Zero = 'STENCILOP_Zero';
export const STENCILOP_Replace = 'STENCILOP_Replace';
export const STENCILOP_IncreaseSaturate = 'STENCILOP_IncreaseSaturate';
export const STENCILOP_DecreaseSaturate = 'STENCILOP_DecreaseSaturate';
export const STENCILOP_Invert = 'STENCILOP_Invert';
export const STENCILOP_Increase = 'STENCILOP_Increase';
export const STENCILOP_Decrease = 'STENCILOP_Decrease';

export type PSODescDepthStencilModeStencilOpMode = typeof STENCILOP_Keep | typeof STENCILOP_Zero | typeof STENCILOP_Replace | typeof STENCILOP_IncreaseSaturate | typeof STENCILOP_DecreaseSaturate | typeof STENCILOP_Invert | typeof STENCILOP_Increase | typeof STENCILOP_Decrease;
export namespace PSODescDepthStencilModeStencilOpMode {
  export const Schema = z.enum([STENCILOP_Keep, STENCILOP_Zero, STENCILOP_Replace, STENCILOP_IncreaseSaturate, STENCILOP_DecreaseSaturate, STENCILOP_Invert, STENCILOP_Increase, STENCILOP_Decrease]);
}

export const CULL_None = 'CULL_None';
export const CULL_Front = 'CULL_Front';
export const CULL_Back = 'CULL_Back';

export type PSODescRasterizerModeCullMode = typeof CULL_None | typeof CULL_Front | typeof CULL_Back;
export namespace PSODescRasterizerModeCullMode {
  export const Schema = z.enum([CULL_None, CULL_Front, CULL_Back]);
}

export const FRONTFACE_CCW = 'FRONTFACE_CCW';
export const FRONTFACE_CW = 'FRONTFACE_CW';

export type PSODescRasterizerModeFrontFaceWinding = typeof FRONTFACE_CCW | typeof FRONTFACE_CW;
export namespace PSODescRasterizerModeFrontFaceWinding {
  export const Schema = z.enum([FRONTFACE_CCW, FRONTFACE_CW]);
}

export const OFFSET_None = 'OFFSET_None';
export const OFFSET_NormalBias = 'OFFSET_NormalBias';
export const OFFSET_ShadowBias = 'OFFSET_ShadowBias';
export const OFFSET_DecalBias = 'OFFSET_DecalBias';

export type PSODescRasterizerModeOffsetMode = typeof OFFSET_None | typeof OFFSET_NormalBias | typeof OFFSET_ShadowBias | typeof OFFSET_DecalBias;
export namespace PSODescRasterizerModeOffsetMode {
  export const Schema = z.enum([OFFSET_None, OFFSET_NormalBias, OFFSET_ShadowBias, OFFSET_DecalBias]);
}

