import { z } from 'zod/v4';
import { CName, Color, Float, Handle, IntBool, NonNegativeInteger, ResourceReference, TupleOf, UInt32, UInt8, rRef_ } from './common';
import { ECookingPlatform, EMaterialPriority, EMaterialShadingRateMode, ERenderingMaterialType, ETextureAddressing, ETextureComparisonFunction, ETextureFilteringMag, ETextureFilteringMin, ETextureFilteringMip, PSODescBlendModeFactor, PSODescBlendModeOp, PSODescBlendModeWriteMask, PSODescDepthStencilModeComparisonMode, PSODescDepthStencilModeStencilOpMode, PSODescRasterizerModeCullMode, PSODescRasterizerModeFrontFaceWinding, PSODescRasterizerModeOffsetMode, type ResourceFlags } from './enums-and-flags';

export interface CMaterialParameterInfo {
  $type: 'CMaterialParameterInfo';
  name: CName;
  offset: NonNegativeInteger;
  type: 1 | 2 | 3 | 4 | 5;
}
export namespace CMaterialParameterInfo {
  export const Schema = z.strictObject({
    $type: z.literal('CMaterialParameterInfo'),
    name: CName.Schema,
    offset: NonNegativeInteger.Schema,
    type: z.int().min(1).max(5),
  });
}

export interface CMaterialParameterScalar {
  $type: 'CMaterialParameterScalar';
  parameterName: CName;
  register: NonNegativeInteger;
  min: number;
  max: number;
  scalar: number;
}
export namespace CMaterialParameterScalar {
  export const Schema = z.strictObject({
    $type: z.literal('CMaterialParameterScalar'),
    parameterName: CName.Schema,
    register: NonNegativeInteger.Schema,
    min: Float.Schema,
    max: Float.Schema,
    scalar: Float.Schema,
  });
}

export interface CMaterialParameterColor {
  $type: 'CMaterialParameterColor';
  parameterName: CName;
  register: NonNegativeInteger;
  color: Color;
}
export namespace CMaterialParameterColor {
  export const Schema = z.strictObject({
    $type: z.literal('CMaterialParameterColor'),
    parameterName: CName.Schema,
    register: NonNegativeInteger.Schema,
    color: Color.Schema,
  });
}

export interface CMaterialParameterTexture {
  $type: 'CMaterialParameterTexture';
  parameterName: CName;
  register: NonNegativeInteger;
  texture: ResourceReference;
}
export namespace CMaterialParameterTexture {
  export const Schema = z.strictObject({
    $type: z.literal('CMaterialParameterTexture'),
    parameterName: CName.Schema,
    register: NonNegativeInteger.Schema,
    texture: ResourceReference.Schema,
  });
}

export interface CMaterialParameter {
  $type: 'CMaterialParameter';
  parameterName: CName;
  register: NonNegativeInteger;
  scalar: CMaterialParameterScalar;
  color: CMaterialParameterColor;
  texture: CMaterialParameterTexture;
}
export namespace CMaterialParameter {
  export const Schema = z.union([
    CMaterialParameterScalar.Schema,
    CMaterialParameterColor.Schema,
    CMaterialParameterTexture.Schema,
  ]);
}

export interface SamplerStateInfo {
  $type: 'SamplerStateInfo';
  addressU: ETextureAddressing;
  addressV: ETextureAddressing;
  addressW: ETextureAddressing;
  comparisonFunc: ETextureComparisonFunction;
  filteringMag: ETextureFilteringMag;
  filteringMin: ETextureFilteringMin;
  filteringMip: ETextureFilteringMip;
  register: NonNegativeInteger;
}
export namespace SamplerStateInfo {
  export const Schema = z.strictObject({
    $type: z.literal('SamplerStateInfo'),
    addressU: ETextureAddressing.Schema,
    addressV: ETextureAddressing.Schema,
    addressW: ETextureAddressing.Schema,
    comparisonFunc: ETextureComparisonFunction.Schema,
    filteringMag: ETextureFilteringMag.Schema,
    filteringMin: ETextureFilteringMin.Schema,
    filteringMip: ETextureFilteringMip.Schema,
    register: NonNegativeInteger.Schema,
  });
}

export interface PSODescRenderTarget {
  $type: 'PSODescRenderTarget';
  alphaOp: PSODescBlendModeOp;
  blendEnable: IntBool;
  colorOp: PSODescBlendModeOp;
  destAlphaFactor: PSODescBlendModeFactor;
  destFactor: PSODescBlendModeFactor;
  srcAlphaFactor: PSODescBlendModeFactor;
  srcFactor: PSODescBlendModeFactor;
  writeMask: PSODescBlendModeWriteMask;
}
export namespace PSODescRenderTarget {
  export const Schema = z.strictObject({
    alphaOp: PSODescBlendModeOp.Schema,
    blendEnable: IntBool.Schema,
    colorOp: PSODescBlendModeOp.Schema,
    destAlphaFactor: PSODescBlendModeFactor.Schema,
    destFactor: PSODescBlendModeFactor.Schema,
    srcAlphaFactor: PSODescBlendModeFactor.Schema,
    srcFactor: PSODescBlendModeFactor.Schema,
    writeMask: PSODescBlendModeWriteMask.Schema,
  });
}

export interface PSODescStencilFuncDesc {
  $type: 'PSODescStencilFuncDesc';
  stencilFunc: PSODescDepthStencilModeComparisonMode;
  stencilPassOp: PSODescDepthStencilModeStencilOpMode;
}
export namespace PSODescStencilFuncDesc {
  export const Schema = z.strictObject({
    $type: z.literal('PSODescStencilFuncDesc'),
    stencilFunc: PSODescDepthStencilModeComparisonMode.Schema,
    stencilPassOp: PSODescDepthStencilModeStencilOpMode.Schema,
  });
}

export interface PSODescDepthStencilModeDesc {
  $type: 'PSODescDepthStencilModeDesc';
  depthFunc: PSODescDepthStencilModeComparisonMode;
  depthTestEnable: IntBool;
  depthWriteEnable: IntBool;
  frontFace: PSODescStencilFuncDesc;
  stencilEnable: IntBool;
  stencilReadMask: IntBool;
  stencilWriteMask: IntBool;
}
export namespace PSODescDepthStencilModeDesc {
  export const Schema = z.strictObject({
    $type: z.literal('PSODescDepthStencilModeDesc'),
    depthFunc: PSODescDepthStencilModeComparisonMode.Schema,
    depthTestEnable: IntBool.Schema,
    depthWriteEnable: IntBool.Schema,
    frontFace: PSODescStencilFuncDesc.Schema,
    stencilEnable: IntBool.Schema,
    stencilReadMask: IntBool.Schema,
    stencilWriteMask: IntBool.Schema,
  });
}

export interface PSODescRasterizerModeDesc {
  $type: 'PSODescRasterizerModeDesc';
  allowMSAA: IntBool;
  conservativeRasterization: IntBool;
  cullMode: PSODescRasterizerModeCullMode;
  frontWinding: PSODescRasterizerModeFrontFaceWinding;
  offsetMode: PSODescRasterizerModeOffsetMode;
  scissors: IntBool;
  valid: IntBool;
  wireframe: IntBool;
}
export namespace PSODescRasterizerModeDesc {
  export const Schema = z.strictObject({
    $type: z.literal('PSODescRasterizerModeDesc'),
    allowMSAA: IntBool.Schema,
    conservativeRasterization: IntBool.Schema,
    cullMode: PSODescRasterizerModeCullMode.Schema,
    frontWinding: PSODescRasterizerModeFrontFaceWinding.Schema,
    offsetMode: PSODescRasterizerModeOffsetMode.Schema,
    scissors: IntBool.Schema,
    valid: IntBool.Schema,
    wireframe: IntBool.Schema,
  });
}

export interface PSODescBlendModeDesc {
  $type: 'PSODescBlendModeDesc';
  alphaToCoverage: IntBool;
  independent: IntBool;
  numTargets: NonNegativeInteger;
  renderTarget: TupleOf<[
    PSODescRenderTarget,
    PSODescRenderTarget,
    PSODescRenderTarget,
    PSODescRenderTarget,
    PSODescRenderTarget,
    PSODescRenderTarget,
    PSODescRenderTarget,
    PSODescRenderTarget,
  ]>;
}
export namespace PSODescBlendModeDesc {
  export const Schema = z.strictObject({
    alphaToCoverage: IntBool.Schema,
    independent: IntBool.Schema,
    numTargets: NonNegativeInteger.Schema,
    renderTarget: TupleOf.Schema([
      PSODescRenderTarget.Schema,
      PSODescRenderTarget.Schema,
      PSODescRenderTarget.Schema,
      PSODescRenderTarget.Schema,
      PSODescRenderTarget.Schema,
      PSODescRenderTarget.Schema,
      PSODescRenderTarget.Schema,
      PSODescRenderTarget.Schema,
    ]),
  });
}

export interface FeatureFlagsMask {
  $type: 'FeatureFlagsMask';
  flags: ResourceFlags;
}
export namespace FeatureFlagsMask {
  export const Schema = z.strictObject({
    $type: z.literal('FeatureFlagsMask'),
    flags: NonNegativeInteger.Schema,
  });
}

export interface MaterialPass {
  $type: 'MaterialPass';
  blendMode: PSODescBlendModeDesc;
  depthStencilMode: PSODescDepthStencilModeDesc;
  enablePixelShader: IntBool;
  orderIndex: NonNegativeInteger;
  rasterizerMode: PSODescRasterizerModeDesc;
  stagePassNameDiscarded: CName;
  stagePassNameRegular: CName;
  stencilReadMask: UInt8;
  stencilRef: UInt8;
  stencilWriteMask: UInt8;
}
export namespace MaterialPass {
  export const Schema = z.strictObject({
    $type: z.literal('MaterialPass'),
    blendMode: PSODescBlendModeDesc.Schema,
    depthStencilMode: PSODescDepthStencilModeDesc.Schema,
    enablePixelShader: IntBool.Schema,
    orderIndex: NonNegativeInteger.Schema,
    rasterizerMode: PSODescRasterizerModeDesc.Schema,
    stagePassNameDiscarded: CName.Schema,
    stagePassNameRegular: CName.Schema,
    stencilReadMask: UInt8.Schema,
    stencilRef: UInt8.Schema,
    stencilWriteMask: UInt8.Schema,
  });
}

export interface MaterialTechnique {
  $type: 'MaterialTechnique';
  featureFlagsEnabledMask: FeatureFlagsMask;
  passes: MaterialPass[];
  streamsToBind: UInt32;
}
export namespace MaterialTechnique {
  export const Schema = z.strictObject({
    $type: z.literal('MaterialTechnique'),
    featureFlagsEnabledMask: FeatureFlagsMask.Schema,
    passes: z.array(MaterialPass.Schema),
    streamsToBind: UInt32.Schema,
  });
}

export interface MaterialUsedParameter {
  $type: 'MaterialUsedParameter';
  name: CName;
  register: NonNegativeInteger;
}
export namespace MaterialUsedParameter {
  export const Schema = z.strictObject({
    $type: z.literal('MaterialUsedParameter'),
    name: CName.Schema,
    register: NonNegativeInteger.Schema,
  });
}

export interface CMaterialTemplate {
  $type: 'CMaterialTemplate';
  audioTag: CName;
  canBeMasked: IntBool;
  canHaveDismemberment: IntBool;
  canHaveTangentUpdate: IntBool;
  cookingPlatform: ECookingPlatform;
  hasDPL: IntBool;
  materialPriority: EMaterialPriority;
  materialType: ERenderingMaterialType;
  materialVersion: NonNegativeInteger;
  name: CName;
  paramBlockSize: TupleOf<[
    NonNegativeInteger,
    NonNegativeInteger,
    NonNegativeInteger,
  ]>;
  parameterInfo: [
    CMaterialParameterInfo[],
    CMaterialParameterInfo[],
  ];
  parameters: TupleOf<[
    CMaterialParameter[],
    CMaterialParameter[],
    CMaterialParameter[],
  ]>;
  resourceVersion: NonNegativeInteger;
  samplerStateInfo: TupleOf<[
    SamplerStateInfo[],
    SamplerStateInfo[],
    SamplerStateInfo[],
  ]>;
  shadingRateMode: EMaterialShadingRateMode;
  techniques: TupleOf<[
    MaterialTechnique[],
    MaterialTechnique[],
    MaterialTechnique[],
  ]>;
  usedParameters: TupleOf<[
    MaterialUsedParameter[],
    MaterialUsedParameter[],
    MaterialUsedParameter[],
  ]>;
}
export namespace CMaterialTemplate {
  export const Schema = z.strictObject({
    $type: z.literal('CMaterialTemplate'),
    audioTag: CName.Schema,
    canBeMasked: IntBool.Schema,
    canHaveDismemberment: IntBool.Schema,
    canHaveTangentUpdate: IntBool.Schema,
    cookingPlatform: ECookingPlatform.Schema,
    hasDPL: IntBool.Schema,
    materialPriority: EMaterialPriority.Schema,
    materialType: ERenderingMaterialType.Schema,
    materialVersion: NonNegativeInteger.Schema,
    name: CName.Schema,
    paramBlockSize: TupleOf.Schema([
      NonNegativeInteger.Schema,
      NonNegativeInteger.Schema,
      NonNegativeInteger.Schema,
    ]),
    parameterInfo: z.tuple([
      z.array(CMaterialParameterInfo.Schema),
      z.array(CMaterialParameterInfo.Schema),
    ]),
    parameters: TupleOf.Schema([
      z.array(Handle.Schema(CMaterialParameter.Schema)),
      z.array(Handle.Schema(CMaterialParameter.Schema)),
      z.array(Handle.Schema(CMaterialParameter.Schema)),
    ]),
    resourceVersion: NonNegativeInteger.Schema,
    samplerStateInfo: z.tuple([
      z.array(SamplerStateInfo.Schema),
      z.array(SamplerStateInfo.Schema),
      z.array(SamplerStateInfo.Schema),
    ]),
    shadingRateMode: EMaterialShadingRateMode.Schema,
    techniques: z.array(MaterialTechnique.Schema),
    usedParameters: TupleOf.Schema([
      z.array(MaterialUsedParameter.Schema),
      z.array(MaterialUsedParameter.Schema),
      z.array(MaterialUsedParameter.Schema),
    ]),
  });
}

export interface CMaterialInstance {
  $type: 'CMaterialInstance';
  audioTag: CName;
  baseMaterial: ResourceReference;
  cookingPlatform: ECookingPlatform;
  enableMask: IntBool;
  metadata: null;
  resourceVersion: NonNegativeInteger;
  values: CMaterialParameter[];
}
export namespace CMaterialInstance {
  export const Schema = z.strictObject({
    $type: z.literal('CMaterialInstance'),
    audioTag: CName.Schema,
    baseMaterial: ResourceReference.Schema,
    cookingPlatform: ECookingPlatform.Schema,
    enableMask: IntBool.Schema,
    metadata: z.null(),
    resourceVersion: NonNegativeInteger.Schema,
    values: z.array(rRef_.Schema),
  });
}
