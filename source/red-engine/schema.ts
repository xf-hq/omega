import { z } from 'zod/v4';

export namespace Schema {
  export const IntBool = z.union([z.literal(0), z.literal(1)]);
  export const NonNegativeInteger = z.int().min(0);
  export const UInt8 = z.int().min(0).max(255);
  export const UInt32 = z.uint32().min(0);

  export const CName = z.strictObject({
    $type: z.literal('CName'),
    $storage: z.literal('string'),
    $value: z.string(),
  });

  export const Handle = z.strictObject({
    HandleId: z.string(),
    // Data:
  });

  export const RenderBufferData = z.strictObject({
    BufferId: z.string(),
    BufferType: z.unknown(),
    Bytes: z.base64(),
  });

  const PLATFORM_None = 'PLATFORM_None';
  const PLATFORM_PC = 'PLATFORM_PC';
  const PLATFORM_XboxOne = 'PLATFORM_XboxOne';
  const PLATFORM_PS4 = 'PLATFORM_PS4';
  const PLATFORM_PS5 = 'PLATFORM_PS5';
  const PLATFORM_XSX = 'PLATFORM_XSX';
  const PLATFORM_WindowsServer = 'PLATFORM_WindowsServer';
  const PLATFORM_LinuxServer = 'PLATFORM_LinuxServer';
  const PLATFORM_GGP = 'PLATFORM_GGP';

  export const ECookingPlatform = z.enum([
    PLATFORM_None,
    PLATFORM_PC,
    PLATFORM_XboxOne,
    PLATFORM_PS4,
    PLATFORM_PS5,
    PLATFORM_XSX,
    PLATFORM_WindowsServer,
    PLATFORM_LinuxServer,
    PLATFORM_GGP,
  ]);

  export const ResourcePath = z.strictObject({
    $type: z.literal('ResourcePath'),
    $storage: z.literal('string'),
    $value: z.string(),
  });
  export const ResourcePointer = z.strictObject({
    $type: z.literal('ResourcePointer'),
    $storage: z.literal('uint64'),
    $value: z.string().regex(/^\d+$/),
  });

  export const Flag_Default = 'Default';
  export const Flag_Obligatory = 'Obligatory';
  export const Flag_Template = 'Template';
  export const Flag_Soft = 'Soft';
  export const Flag_Embedded = 'Embedded';
  export const Flag_Inplace = 'Inplace';

  export const ResourceFlags = z.enum([
    Flag_Default,
    Flag_Obligatory,
    Flag_Template,
    Flag_Soft,
    Flag_Embedded,
    Flag_Inplace,
  ]);

  export const ResourceReference = z.strictObject({
    $type: z.literal('ResourceReference'),
    DepotPath: z.union([ResourcePath, ResourcePointer]),
    Flags: ResourceFlags,
  });

  export const Color = z.strictObject({
    $type: z.literal('Color'),
    Alpha: UInt8,
    Blue: UInt8,
    Green: UInt8,
    Red: UInt8,
  });

  export const Vector4 = z.strictObject({
    $type: z.literal('Vector4'),
    W: z.float32(),
    X: z.float32(),
    Y: z.float32(),
    Z: z.float32(),
  });

  export const rRef = z.union([
    rRef_.Float,
    rRef_.Color,
    rRef_.ITexture,
    rRef_.Multilayer_Mask,
    rRef_.Multilayer_Setup,
    rRef_.CGradient,
    rRef_.CFoliageProfile,
    rRef_.CHairProfile,
    rRef_.CSkinProfile,
    rRef_.CTerrainSetup,
  ]);
  export namespace rRef_ {
    const testCustomProp = (type: z.ZodType) => (data: any) => {
      const keys = Object.keys(data).filter((key) => key !== '$type');
      if (keys.length !== 1) {
        throw new Error(`Invalid ITexture: Expected two properties: $type and a custom key pointing to a ResourceReference (actual: [$type, ${keys.join(', ')}])`);
      }
      return type.parse(data[keys[0]]);
    };
    export const Float = z.looseObject({ $type: z.literal('Float') }).refine(testCustomProp(z.float32()));
    export const Color = z.looseObject({ $type: z.literal('Color') }).refine(testCustomProp(Schema.Color));
    export const Vector4 = z.looseObject({ $type: z.literal('Vector4') }).refine(testCustomProp(Schema.Vector4));
    export const ITexture = z.looseObject({ $type: z.literal('rRef:ITexture') }).refine(testCustomProp(ResourceReference));
    export const Multilayer_Mask = z.looseObject({ $type: z.literal('rRef:Multilayer_Mask') }).refine(testCustomProp(ResourceReference));
    export const Multilayer_Setup = z.looseObject({ $type: z.literal('rRef:Multilayer_Setup') }).refine(testCustomProp(ResourceReference));
    export const CGradient = z.looseObject({ $type: z.literal('rRef:CGradient') }).refine(testCustomProp(ResourceReference));
    export const CFoliageProfile = z.looseObject({ $type: z.literal('rRef:CFoliageProfile') }).refine(testCustomProp(ResourceReference));
    export const CHairProfile = z.looseObject({ $type: z.literal('rRef:CHairProfile') }).refine(testCustomProp(ResourceReference));
    export const CSkinProfile = z.looseObject({ $type: z.literal('rRef:CSkinProfile') }).refine(testCustomProp(ResourceReference));
    export const CTerrainSetup = z.looseObject({ $type: z.literal('rRef:CTerrainSetup') }).refine(testCustomProp(ResourceReference));
  }

  export const EMP_Normal = 'EMP_Normal';
  export const EMP_Front = 'EMP_Front';

  export const EMaterialPriority = z.enum([
    'EMP_Normal',
    'EMP_Front',
  ]);

  export const RMT_Standard = 'RMT_Standard';
  export const RMT_Subsurface = 'RMT_Subsurface';
  export const RMT_Cloth = 'RMT_Cloth';
  export const RMT_Eye = 'RMT_Eye';
  export const RMT_Hair = 'RMT_Hair';
  export const RMT_Foliage = 'RMT_Foliage';

  export const ERenderingMaterialType = z.enum([
    RMT_Standard,
    RMT_Subsurface,
    RMT_Cloth,
    RMT_Eye,
    RMT_Hair,
    RMT_Foliage,
  ]);

  export const CMaterialParameterInfo = z.strictObject({
    $type: z.literal('CMaterialParameterInfo'),
    name: CName,
    offset: NonNegativeInteger,
    type: z.int().min(1).max(5),
  });

  export const CMaterialParameterScalar = z.strictObject({
    $type: z.literal('CMaterialParameterScalar'),
    parameterName: CName,
    register: NonNegativeInteger,
    min: z.float32(),
    max: z.float32(),
    scalar: z.float32(),
  });

  export const CMaterialParameterColor = z.strictObject({
    $type: z.literal('CMaterialParameterColor'),
    parameterName: CName,
    register: NonNegativeInteger,
    color: Color,
  });

  export const CMaterialParameterTexture = z.strictObject({
    $type: z.literal('CMaterialParameterTexture'),
    parameterName: CName,
    register: NonNegativeInteger,
    texture: ResourceReference,
  });

  export const CMaterialParameter = z.union([
    CMaterialParameterScalar,
    CMaterialParameterColor,
    CMaterialParameterTexture,
  ]);

  export const TA_Wrap = 'TA_Wrap';
  export const TA_Mirror = 'TA_Mirror';
  export const TA_Clamp = 'TA_Clamp';
  export const TA_MirrorOnce = 'TA_MirrorOnce';
  export const TA_Border = 'TA_Border';

  export const ETextureAddressing = z.enum([
    TA_Wrap,
    TA_Mirror,
    TA_Clamp,
    TA_MirrorOnce,
    TA_Border,
  ]);

  export const TCF_None = 'TCF_None';
  export const TCF_Less = 'TCF_Less';
  export const TCF_Equal = 'TCF_Equal';
  export const TCF_LessEqual = 'TCF_LessEqual';
  export const TCF_Greater = 'TCF_Greater';
  export const TCF_NotEqual = 'TCF_NotEqual';
  export const TCF_GreaterEqual = 'TCF_GreaterEqual';
  export const TCF_Always = 'TCF_Always';

  export const ETextureComparisonFunction = z.enum([
    TCF_None,
    TCF_Less,
    TCF_Equal,
    TCF_LessEqual,
    TCF_Greater,
    TCF_NotEqual,
    TCF_GreaterEqual,
    TCF_Always,
  ]);

  export const TFMag_Point = 'TFMag_Point';
  export const TFMag_Linear = 'TFMag_Linear';

  export const ETextureFilteringMag = z.enum([
    TFMag_Point,
    TFMag_Linear,
  ]);

  export const TFMin_Point = 'TFMin_Point';
  export const TFMin_Linear = 'TFMin_Linear';
  export const TFMin_Anisotropic = 'TFMin_Anisotropic';
  export const TFMin_AnisotropicLow = 'TFMin_AnisotropicLow';

  export const ETextureFilteringMin = z.enum([
    TFMin_Point,
    TFMin_Linear,
    TFMin_Anisotropic,
    TFMin_AnisotropicLow,
  ]);

  export const TFMip_None = 'TFMip_None';
  export const TFMip_Point = 'TFMip_Point';
  export const TFMip_Linear = 'TFMip_Linear';

  export const ETextureFilteringMip = z.enum([
    TFMip_None,
    TFMip_Point,
    TFMip_Linear,
  ]);

  export const MSRM_Default = 'MSRM_Default';
  export const MSRM_Disable = 'MSRM_Disable';
  export const MSRM_Force2x2 = 'MSRM_Force2x2';

  export const EMaterialShadingRateMode = z.enum([
    MSRM_Default,
    MSRM_Disable,
    MSRM_Force2x2,
  ]);

  export const SamplerStateInfo = z.strictObject({
    $type: z.literal('SamplerStateInfo'),
    addressU: ETextureAddressing,
    addressV: ETextureAddressing,
    addressW: ETextureAddressing,
    comparisonFunc: ETextureComparisonFunction,
    filteringMag: ETextureFilteringMag,
    filteringMin: ETextureFilteringMin,
    filteringMip: ETextureFilteringMip,
    register: NonNegativeInteger,
  });

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

  export const PSODescBlendModeOp = z.enum([
    OP_Add,
    OP_Subtract,
    OP_RevSub,
    OP_Min,
    OP_Max,
    OP_Or,
    OP_And,
    OP_xOr,
    OP_nAnd,
    OP_nOr,
  ]);

  const FAC_Zero = 'FAC_Zero';
  const FAC_One = 'FAC_One';
  const FAC_SrcColor = 'FAC_SrcColor';
  const FAC_InvSrcColor = 'FAC_InvSrcColor';
  const FAC_SrcAlpha = 'FAC_SrcAlpha';
  const FAC_InvSrcAlpha = 'FAC_InvSrcAlpha';
  const FAC_DestColor = 'FAC_DestColor';
  const FAC_InvDestColor = 'FAC_InvDestColor';
  const FAC_DestAlpha = 'FAC_DestAlpha';
  const FAC_InvDestAlpha = 'FAC_InvDestAlpha';
  const FAC_BlendFactor = 'FAC_BlendFactor';
  const FAC_InvBlendFactor = 'FAC_InvBlendFactor';
  const FAC_Src1Color = 'FAC_Src1Color';
  const FAC_InvSrc1Color = 'FAC_InvSrc1Color';
  const FAC_Src1Alpha = 'FAC_Src1Alpha';
  const FAC_InvSrc1Alpha = 'FAC_InvSrc1Alpha';

  export const PSODescBlendModeFactor = z.enum([
    FAC_Zero,
    FAC_One,
    FAC_SrcColor,
    FAC_InvSrcColor,
    FAC_SrcAlpha,
    FAC_InvSrcAlpha,
    FAC_DestColor,
    FAC_InvDestColor,
    FAC_DestAlpha,
    FAC_InvDestAlpha,
    FAC_BlendFactor,
    FAC_InvBlendFactor,
    FAC_Src1Color,
    FAC_InvSrc1Color,
    FAC_Src1Alpha,
    FAC_InvSrc1Alpha,
  ]);

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

  export const PSODescBlendModeWriteMask = z.enum([
    MASK_None,
    MASK_R,
    MASK_G,
    MASK_RG,
    MASK_B,
    MASK_RB,
    MASK_GB,
    MASK_RGB,
    MASK_A,
    MASK_RA,
    MASK_GA,
    MASK_RGA,
    MASK_BA,
    MASK_RBA,
    MASK_GBA,
    MASK_RGBA,
  ]);

  export const PSODescRenderTarget = z.strictObject({
    alphaOp: PSODescBlendModeOp,
    blendEnable: IntBool,
    colorOp: PSODescBlendModeOp,
    destAlphaFactor: PSODescBlendModeFactor,
    destFactor: PSODescBlendModeFactor,
    srcAlphaFactor: PSODescBlendModeFactor,
    srcFactor: PSODescBlendModeFactor,
    writeMask: PSODescBlendModeWriteMask,
  });

  const COMPARISON_Never = 'COMPARISON_Never';
  const COMPARISON_Less = 'COMPARISON_Less';
  const COMPARISON_Equal = 'COMPARISON_Equal';
  const COMPARISON_LessEqual = 'COMPARISON_LessEqual';
  const COMPARISON_Greater = 'COMPARISON_Greater';
  const COMPARISON_NotEqual = 'COMPARISON_NotEqual';
  const COMPARISON_GreaterEqual = 'COMPARISON_GreaterEqual';
  const COMPARISON_Always = 'COMPARISON_Always';

  export const PSODescDepthStencilModeComparisonMode = z.enum([
    COMPARISON_Never,
    COMPARISON_Less,
    COMPARISON_Equal,
    COMPARISON_LessEqual,
    COMPARISON_Greater,
    COMPARISON_NotEqual,
    COMPARISON_GreaterEqual,
    COMPARISON_Always,
  ]);

  const STENCILOP_Keep = 'STENCILOP_Keep';
  const STENCILOP_Zero = 'STENCILOP_Zero';
  const STENCILOP_Replace = 'STENCILOP_Replace';
  const STENCILOP_IncreaseSaturate = 'STENCILOP_IncreaseSaturate';
  const STENCILOP_DecreaseSaturate = 'STENCILOP_DecreaseSaturate';
  const STENCILOP_Invert = 'STENCILOP_Invert';
  const STENCILOP_Increase = 'STENCILOP_Increase';
  const STENCILOP_Decrease = 'STENCILOP_Decrease';

  export const PSODescDepthStencilModeStencilOpMode = z.enum([
    STENCILOP_Keep,
    STENCILOP_Zero,
    STENCILOP_Replace,
    STENCILOP_IncreaseSaturate,
    STENCILOP_DecreaseSaturate,
    STENCILOP_Invert,
    STENCILOP_Increase,
    STENCILOP_Decrease,
  ]);

  const CULL_None = 'CULL_None';
  const CULL_Front = 'CULL_Front';
  const CULL_Back = 'CULL_Back';

  export const PSODescRasterizerModeCullMode = z.enum([
    CULL_None,
    CULL_Front,
    CULL_Back,
  ]);

  const FRONTFACE_CCW = 'FRONTFACE_CCW';
  const FRONTFACE_CW = 'FRONTFACE_CW';

  export const PSODescRasterizerModeFrontFaceWinding = z.enum([
    FRONTFACE_CCW,
    FRONTFACE_CW,
  ]);

  const OFFSET_None = 'OFFSET_None';
  const OFFSET_NormalBias = 'OFFSET_NormalBias';
  const OFFSET_ShadowBias = 'OFFSET_ShadowBias';
  const OFFSET_DecalBias = 'OFFSET_DecalBias';

  export const PSODescRasterizerModeOffsetMode = z.enum([
    OFFSET_None,
    OFFSET_NormalBias,
    OFFSET_ShadowBias,
    OFFSET_DecalBias,
  ]);

  export const PSODescStencilFuncDesc = z.strictObject({
    $type: z.literal('PSODescStencilFuncDesc'),
    stencilFunc: PSODescDepthStencilModeComparisonMode,
    stencilPassOp: PSODescDepthStencilModeStencilOpMode,
  });

  export const PSODescDepthStencilModeDesc = z.strictObject({
    $type: z.literal('PSODescDepthStencilModeDesc'),
    depthFunc: PSODescDepthStencilModeComparisonMode,
    depthTestEnable: IntBool,
    depthWriteEnable: IntBool,
    frontFace: PSODescStencilFuncDesc,
    stencilEnable: IntBool,
    stencilReadMask: IntBool,
    stencilWriteMask: IntBool,
  });

  export const PSODescRasterizerModeDesc = z.strictObject({
    $type: z.literal('PSODescRasterizerModeDesc'),
    allowMSAA: IntBool,
    conservativeRasterization: IntBool,
    cullMode: PSODescRasterizerModeCullMode,
    frontWinding: PSODescRasterizerModeFrontFaceWinding,
    offsetMode: PSODescRasterizerModeOffsetMode,
    scissors: IntBool,
    valid: IntBool,
    wireframe: IntBool,
  });

  export const PSODescBlendModeDesc = z.strictObject({
    alphaToCoverage: IntBool,
    independent: IntBool,
    numTargets: NonNegativeInteger,
    renderTarget: z.strictObject({
      Elements: z.tuple([
        PSODescRenderTarget,
        PSODescRenderTarget,
        PSODescRenderTarget,
        PSODescRenderTarget,
        PSODescRenderTarget,
        PSODescRenderTarget,
        PSODescRenderTarget,
        PSODescRenderTarget,
      ]),
    }),
  });

  export const FeatureFlagsMask = z.strictObject({
    $type: z.literal('FeatureFlagsMask'),
    flags: NonNegativeInteger,
  });

  export const MaterialPass = z.strictObject({
    $type: z.literal('MaterialPass'),
    blendMode: PSODescBlendModeDesc,
    depthStencilMode: PSODescDepthStencilModeDesc,
    enablePixelShader: IntBool,
    orderIndex: NonNegativeInteger,
    rasterizerMode: PSODescRasterizerModeDesc,
    stagePassNameDiscarded: CName,
    stagePassNameRegular: CName,
    stencilReadMask: UInt8,
    stencilRef: UInt8,
    stencilWriteMask: UInt8,
  });

  export const MaterialTechnique = z.strictObject({
    $type: z.literal('MaterialTechnique'),
    featureFlagsEnabledMask: FeatureFlagsMask,
    passes: z.array(MaterialPass),
    streamsToBind: UInt32,
  });

  export const MaterialUsedParameter = z.strictObject({
    $type: z.literal('MaterialUsedParameter'),
    name: CName,
    register: NonNegativeInteger,
  });

  export const CMaterialTemplate = z.strictObject({
    $type: z.literal('CMaterialTemplate'),
    audioTag: CName,
    canBeMasked: IntBool,
    canHaveDismemberment: IntBool,
    canHaveTangentUpdate: IntBool,
    cookingPlatform: ECookingPlatform,
    hasDPL: IntBool,
    materialPriority: EMaterialPriority,
    materialType: ERenderingMaterialType,
    materialVersion: NonNegativeInteger,
    name: CName,
    paramBlockSize: z.strictObject({
      Elements: z.tuple([
        NonNegativeInteger,
        NonNegativeInteger,
        NonNegativeInteger,
      ]),
    }),
    parameterInfo: z.tuple([
      z.array(CMaterialParameterInfo),
      z.array(CMaterialParameterInfo),
    ]),
    parameters: z.tuple([
      z.array(CMaterialParameter),
      z.array(CMaterialParameter),
      z.array(CMaterialParameter),
    ]),
    resourceVersion: NonNegativeInteger,
    samplerStateInfo: z.tuple([
      z.array(SamplerStateInfo),
      z.array(SamplerStateInfo),
      z.array(SamplerStateInfo),
    ]),
    shadingRateMode: EMaterialShadingRateMode,
    techniques: z.array(MaterialTechnique),
    usedParameters: z.strictObject({
      Elements: z.tuple([
        z.array(MaterialUsedParameter),
        z.array(MaterialUsedParameter),
        z.array(MaterialUsedParameter),
      ]),
    }),
  });

  export const CMaterialInstance = z.strictObject({
    $type: z.literal('CMaterialInstance'),
    audioTag: CName,
    baseMaterial: ResourceReference,
    cookingPlatform: ECookingPlatform,
    enableMask: IntBool,
    metadata: z.null(),
    resourceVersion: NonNegativeInteger,
    values: z.array(rRef),
  });
}