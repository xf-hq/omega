/**
 * This file contains the original set of TypeScript interfaces and factory functions I created while getting a foothold
 * on automating the import, export and generation of various game files. I'm now in the process of implementing
 * canonical interfaces, Zod schemas and better functions and tools for working with each of the various types. This
 * file will be retired in the future.
 */

import { isNumber, isUndefined } from '@common/general/type-checking';

export interface RedEngineFile<T = unknown> {
  Header: RedEngineFileHeader;
  Data: RedEngineFileData<T>;
}
export function RedEngineFile<T> (data: T): RedEngineFile<T> {
  return {
    Header: {
      WolvenKitVersion: '8.16.2-nightly.2025-04-27',
      WKitJsonVersion: '0.0.9',
      GameVersion: 2200,
      ExportedDateTime: new Date().toISOString(),
      Schema: 'CR2W',
      ArchiveFileName: '',
    },
    Data: {
      Version: 195,
      BuildVersion: 0,
      RootChunk: data,
      EmbeddedFiles: [],
    },
  };
}

export interface RedEngineFileHeader {
  WolvenKitVersion: string;
  WKitJsonVersion: string;
  GameVersion: number;
  ExportedDateTime: string;
  Schema: string; // e.g., "CR2W"
  ArchiveFileName: string; // Path to the original file
}

export interface RedEngineFileData<T = unknown> {
  Version: number; // Version of the file format
  BuildVersion: number; // Build version of the file format
  RootChunk: T; // Placeholder for the root chunk data structure
  EmbeddedFiles: unknown[];
}

/**
 * Defines TypeScript interfaces for various Cyberpunk 2077 data structures
 * based on analysis of .inkcharcustomization, .app, .mesh, and .morphtarget JSON exports.
 */
export namespace RedEngine {
  type Simplified<T> = {
    [K in keyof T as K extends '$type' ? never : K]:
      T[K] extends Handle<infer U> ? U :
      T[K] extends Handle<infer U>[] ? U[] :
      T[K] extends CName ? string :
      T[K] extends CName[] ? string[] :
      // T[K] extends number ? number extends T[K] ? number : T[K]
      T[K];
  };
  type _<T extends BaseDataObject> = Partial<Simplified<T>>;
  // --- Base Types & Helpers ---
  interface BaseDataObject<T extends string = string> {
    readonly $type: T;
  }

  export type DataObject =
    | CName
    | TweakDBID
    | ResourcePath
    | ResourceReference
    | Color
    | redTagList
    | FixedPoint
    | WorldPosition
    | Quaternion
    | WorldTransform
    | Vector4
    | Vector3
    | Box
    | Matrix
    | gameuiCharacterRandomizationInfo
    | gameuiSwitcherOption
    | gameuiIndexedAppearanceDefinition
    | gameuiOptionsGroup
    | gameuiSwitcherInfo
    | gameuiAppearanceInfo
    | gameuiCharacterCustomizationInfoResource
    | entTagMask
    | entEntityParametersBuffer
    | appearanceAppearancePart
    | entHardTransformBinding
    | entSkinningBinding
    | entMorphTargetSkinnedMeshComponent
    | appearanceAppearanceDefinition
    | entdismembermentWoundConfigContainer
    | entdismembermentWoundsConfigSet
    | appearanceAppearanceResource
    | meshMeshAppearance
    | rRef_ITexture
    | CMaterialInstance
    | meshLocalMaterialHeader
    | meshMeshMaterialBuffer
    | CMeshMaterialEntry
    | CMesh
    | GpuWrapApiVertexPackingPackingElement
    | GpuWrapApiVertexLayoutDesc
    | rendVertexBufferChunk
    | rendIndexBufferChunk
    | rendChunk
    | rendTopologyData
    | rendRenderMeshBlobHeader
    | rendRenderMeshBlob
    | MorphTargetMesh
    | MorphTargetMeshEntry
    | rendRenderMorphTargetMeshBlob
    | rendRenderMorphTargetMeshBlobHeader
    | rendRenderMorphTargetMeshBlobTextureData
    | CMaterialParameter
    ;
  export type CMaterialParameter =
    | CMaterialParameterTexture
    | CMaterialParameterColor
    | CMaterialParameterScalar
    ;

  /** Simple string wrapper type, likely representing hashed strings. */
  export interface CName extends BaseDataObject<'CName'> {
    $storage: 'string';
    $value: string;
  }
  export const CName = (value: string = 'None'): CName => ({ $type: 'CName', $storage: 'string', $value: value });

  /** Simple string wrapper type for TweakDB IDs. */
  export interface TweakDBID extends BaseDataObject<'TweakDBID'> {
    $storage: 'string' | 'uint64';
    $value: string;
  }
  export const TweakDBID = (value: string | number = 0): TweakDBID => ({
    $type: 'TweakDBID',
    $storage: isNumber(value) ? 'uint64' : 'string',
    $value: String(value),
  });

  /** Simple string wrapper type for resource paths. Storage can be 'uint64' for null/empty paths ("0"). */
  export interface ResourcePath extends BaseDataObject<'ResourcePath'> {
    $storage: 'string' | 'uint64';
    $value: string;
  }
  export const ResourcePath = (value: string = ''): ResourcePath => ({
    $type: 'ResourcePath',
    $storage: value ? 'string' : 'uint64',
    $value: value || '0',
  });

  /** Structure for referencing game resources (e.g., .app, .mesh, .morphtarget, .mi, .xbm). */
  export interface ResourceReference {
    DepotPath: ResourcePath;
    Flags: 'Default' | 'Obligatory' | 'Template' | 'Soft' | 'Embedded' | 'Inplace';
  }
  export function ResourceReference (data: Partial<ResourceReference> = {}): ResourceReference {
    return {
      DepotPath: ResourcePath(),
      Flags: 'Default',
      ...data,
    };
  }

  /** RGBA color definition. */
  export interface Color extends BaseDataObject<'Color'> {
    Alpha: number;
    Blue: number;
    Green: number;
    Red: number;
  }
  export function Color (data?: _<Color>): Color;
  export function Color (r: number, g: number, b: number, a?: number): Color;
  export function Color (arg0?: _<Color> | number, arg1?: number, arg2?: number, arg3?: number): Color {
    const record: Color = { $type: 'Color', Alpha: 0, Blue: 0, Green: 0, Red: 0 };
    if (isUndefined(arg0)) return record;
    if (isNumber(arg0)) {
      record.Red = arg0;
      record.Green = arg1!;
      record.Blue = arg2!;
      record.Alpha = arg3!;
    }
    else {
      Object.assign(record, arg0);
    }
    return record;
  }

  /** Contains a list of tags, typically CName hashes. */
  export interface redTagList extends BaseDataObject<'redTagList'> {
    tags: CName[];
  }
  export function redTagList (tags: string[] = []): redTagList {
    return {
      $type: 'redTagList',
      tags: tags.map(CName),
    };
  }

  /** Represents a fixed-point number. */
  export interface FixedPoint extends BaseDataObject<'FixedPoint'> {
    Bits: number;
  }

  /** Represents a 3D position using fixed-point numbers. */
  export interface WorldPosition extends BaseDataObject<'WorldPosition'> {
    x: FixedPoint;
    y: FixedPoint;
    z: FixedPoint;
  }

  /** Represents a rotation in 3D space using a quaternion. */
  export interface Quaternion extends BaseDataObject<'Quaternion'> {
    i: number;
    j: number;
    k: number;
    r: number;
  }

  /** Represents a position and orientation in 3D space. */
  export interface WorldTransform extends BaseDataObject<'WorldTransform'> {
    Orientation: Quaternion;
    Position: WorldPosition;
  }

  /** Represents a 4-component vector. Values can be numbers or string representations like "-inf". */
  export interface Vector4 extends BaseDataObject<'Vector4'> {
    W: number | string;
    X: number | string;
    Y: number | string;
    Z: number | string;
  }

  /** Represents a 3-component vector. */
  export interface Vector3 extends BaseDataObject<'Vector3'> {
    X: number | string; // Assuming it might also contain string numbers like Vector4
    Y: number | string;
    Z: number | string;
  }

  /** Represents an axis-aligned bounding box. */
  export interface Box extends BaseDataObject<'Box'> {
    Max: Vector4;
    Min: Vector4;
  }

  /** Represents a 4x4 matrix. */
  export interface Matrix extends BaseDataObject<'Matrix'> {
    W: Vector4;
    X: Vector4;
    Y: Vector4;
    Z: Vector4;
  }

  /** Helper type for defining objects inline with a HandleId. */
  export interface Handle<T> {
    HandleId: string;
    Data: T;
  }

  let HandleIdCounter = 0;
  export const Handle = <T>(data: T): Handle<T> => ({
    HandleId: `${HandleIdCounter++}`,
    Data: data,
  });

  /** Helper type for referencing objects defined elsewhere in the same file via HandleId. */
  export interface HandleRef {
    HandleRefId: string;
  }

  /** Common structure for buffer data (e.g., vertex, index, diffs buffers). */
  export interface RenderBufferData {
    BufferId: string;
    Flags: number;
    Bytes: string; // Base64 encoded binary data
  }

  // --- Game UI Customization Types (.inkcharcustomization) ---

  /** Base type for customization options like SwitcherInfo and AppearanceInfo. */
  export interface gameuiCharacterCustomizationOption<T extends string = string> extends BaseDataObject<T> {
    censorFlag: string; // Note: Seen as "0" in JSON (there are a number of different flags; I think these are bitmasks)
    censorFlagAction: 'Activate' | 'Deactivate' | 'EquipItem' | 'UnequipItem' | 'Refresh';
    defaultIndex: number;
    editTags: ('NewGame' | 'HairDresser' | 'Ripperdoc')[]; // Note: Plain strings, not CName objects
    enabled: 0 | 1;
    hidden: 0 | 1;
    index: number;
    link: CName;
    linkController: 0 | 1;
    localizedName: string; // Often a LocKey like "LocKey#43269" or empty
    name: CName;
    onDeactivateActions: unknown[]; // Type unknown from example
    randomizeCategory: 'Body' | 'Eyebrows' | 'Eyes' | 'Face' | 'FaceModification' | 'FacialHair' | 'Hair' | 'Makeup' | 'Nails' | 'Scars' | 'Skin' | 'Tattoos' | 'Count' | 'Invalid';
    uiSlot: CName;
  }

  export const allEditTags = () => ['NewGame', 'HairDresser', 'Ripperdoc'] as gameuiAppearanceInfo['editTags'];

  /**
   * In the character creator, the player can specify how "weird" or "normal" they want their character to look after
   * hitting the randomize button. Rating seems to be between 1 and 10, with 1 being the most normal and 10 being the
   * most weird. a `minRating` of 3 makes the option too weird to be selected by the randomizer if the character
   * chooses the most vanilla of normality. A `maxRating` of 5 makes the option too vanilla to be selected by the
   * randomizer if the character chooses a high weirdness rating.
   */
  export interface gameuiCharacterRandomizationInfo extends BaseDataObject<'gameuiCharacterRandomizationInfo'> {
    maxRating: number;
    minRating: number;
  }
  export function gameuiCharacterRandomizationInfo (minRating: number = 1, maxRating: number = 10): gameuiCharacterRandomizationInfo {
    return {
      $type: 'gameuiCharacterRandomizationInfo',
      maxRating,
      minRating,
    };
  }

  export interface gameuiCharacterCustomizationAction extends BaseDataObject<'gameuiCharacterCustomizationAction'> {
    applyImmediately: 0 | 1;
    applyToUISlot: 0 | 1;
    params: string;
    type: 'Activate' | 'Deactivate' | 'EquipItem' | 'UnequipItem' | 'Refresh';
  }
  export function gameuiCharacterCustomizationAction (data: _<gameuiCharacterCustomizationAction> = {}): gameuiCharacterCustomizationAction {
    return {
      $type: 'gameuiCharacterCustomizationAction',
      applyImmediately: 0,
      applyToUISlot: 0,
      params: '',
      type: 'Activate',
      ...data,
    };
  }

  /** Represents an option within a SwitcherInfo. */
  export interface gameuiSwitcherOption extends BaseDataObject<'gameuiSwitcherOption'> {
    actions: gameuiCharacterCustomizationAction[]; // Type unknown from example
    index: number;
    localizedName: string;
    names: CName[];
    randomizationInfo: gameuiCharacterRandomizationInfo;
    tags: redTagList;
  }
  export function gameuiSwitcherOption (data: _<gameuiSwitcherOption> = {}): gameuiSwitcherOption {
    const record: gameuiSwitcherOption = {
      $type: 'gameuiSwitcherOption',
      actions: [],
      index: 0,
      localizedName: '',
      names: [],
      randomizationInfo: gameuiCharacterRandomizationInfo(),
      tags: redTagList(),
    };
    Object.assign(record, data);
    if (data.names) record.names = data.names.map(CName);
    return record;
  }

  /** Represents a specific appearance definition with an index, color, and icon. */
  export interface gameuiIndexedAppearanceDefinition extends BaseDataObject<'gameuiIndexedAppearanceDefinition'> {
    actions: unknown[]; // Type unknown from example
    color: Color;
    icon: TweakDBID;
    index: number;
    localizedName: string; // Often empty
    name: CName;
    randomizationInfo: gameuiCharacterRandomizationInfo;
    tags: redTagList;
  }
  export function gameuiIndexedAppearanceDefinition (data: _<gameuiIndexedAppearanceDefinition> = {}): gameuiIndexedAppearanceDefinition {
    const record: gameuiIndexedAppearanceDefinition = {
      $type: 'gameuiIndexedAppearanceDefinition',
      actions: [],
      color: Color({ Alpha: 0, Blue: 0, Green: 0, Red: 0 }),
      icon: TweakDBID(),
      index: 0,
      localizedName: '',
      name: CName(),
      randomizationInfo: gameuiCharacterRandomizationInfo(),
      tags: redTagList(),
    };
    Object.assign(record, data);
    if (data.name) record.name = CName(data.name);
    return record;
  }

  /** Groups multiple customization options under a name, referenced by CName. */
  export interface gameuiOptionsGroup extends BaseDataObject<'gameuiOptionsGroup'> {
    name: CName;
    options: CName[];
  }
  export function gameuiOptionsGroup (name: string, options: string[]): gameuiOptionsGroup {
    return {
      $type: 'gameuiOptionsGroup',
      name: CName(name),
      options: options.map(CName),
    };
  }

  /** A customization option that allows switching between multiple sub-options (SwitcherOption). */
  export interface gameuiSwitcherInfo extends gameuiCharacterCustomizationOption<'gameuiSwitcherInfo'> {
    options: gameuiSwitcherOption[];
    switchVisibility: 0 | 1;
    uiSlots: CName[]; // Note: Plural 'uiSlots' here vs singular 'uiSlot' in base
  }
  export function gameuiSwitcherInfo (data: _<gameuiSwitcherInfo> = {}): gameuiSwitcherInfo {
    const record: gameuiSwitcherInfo = {
      $type: 'gameuiSwitcherInfo',
      censorFlag: '0',
      censorFlagAction: 'Activate',
      defaultIndex: 0,
      editTags: allEditTags(),
      enabled: 1,
      hidden: 0,
      index: 0,
      link: CName(),
      linkController: 0,
      localizedName: '',
      name: CName(),
      onDeactivateActions: [],
      options: [],
      randomizeCategory: 'Count',
      switchVisibility: 0,
      uiSlot: CName(),
      uiSlots: [],
    };
    Object.assign(record, data);
    if (data.link) record.link = CName(data.link);
    if (data.name) record.name = CName(data.name);
    if (data.uiSlot) record.uiSlot = CName(data.uiSlot);
    if (data.uiSlots) record.uiSlots = data.uiSlots.map(CName);
    return record;
  }

  /** A customization option that defines a specific appearance with color/variant definitions. */
  export interface gameuiAppearanceInfo extends gameuiCharacterCustomizationOption<'gameuiAppearanceInfo'> {
    definitions: gameuiIndexedAppearanceDefinition[];
    resource: ResourceReference; // Links to the .app file
    useThumbnails: 0 | 1;
  }
  export function gameuiAppearanceInfo (data: _<gameuiAppearanceInfo> = {}): gameuiAppearanceInfo {
    const record: gameuiAppearanceInfo = {
      $type: 'gameuiAppearanceInfo',
      censorFlag: '0',
      censorFlagAction: 'Activate',
      defaultIndex: 0,
      definitions: [],
      editTags: allEditTags(),
      enabled: 1,
      hidden: 0,
      index: 0,
      link: CName(),
      linkController: 0,
      localizedName: '',
      name: CName(),
      onDeactivateActions: [],
      randomizeCategory: 'Count',
      resource: ResourceReference({ DepotPath: ResourcePath(), Flags: 'Default' }),
      uiSlot: CName(),
      useThumbnails: 0,
    };
    Object.assign(record, data);
    if (data.link) record.link = CName(data.link);
    if (data.name) record.name = CName(data.name);
    if (data.uiSlot) record.uiSlot = CName(data.uiSlot);
    Object.assign(record.resource, data.resource);
    return record;
  }

  /** Defines a character customization resource containing various options and groups for head, body, arms. */
  export interface gameuiCharacterCustomizationInfoResource extends BaseDataObject<'gameuiCharacterCustomizationInfoResource'> {
    armsCustomizationOptions: Handle<gameuiCharacterCustomizationOption>[]; // Assuming base type, specific types might vary
    armsGroups: gameuiOptionsGroup[];
    bodyCustomizationOptions: Handle<gameuiCharacterCustomizationOption>[]; // Assuming base type
    bodyGroups: gameuiOptionsGroup[];
    cookingPlatform: 'PLATFORM_None' | string; // e.g., "PLATFORM_None"
    excludedFromRandomize: CName[];
    headCustomizationOptions: Handle<gameuiSwitcherInfo | gameuiAppearanceInfo>[]; // Union of possible types
    headGroups: gameuiOptionsGroup[];
    perspectiveInfo: unknown[]; // Type unknown from example
    uiPresets: unknown[]; // Type unknown from example
    version: number;
    versionUpdateInfo: unknown[]; // Type unknown from example
  }
  export function gameuiCharacterCustomizationInfoResource (data: _<gameuiCharacterCustomizationInfoResource> = {}): gameuiCharacterCustomizationInfoResource {
    const record: gameuiCharacterCustomizationInfoResource = {
      $type: 'gameuiCharacterCustomizationInfoResource',
      armsCustomizationOptions: [],
      armsGroups: [],
      bodyCustomizationOptions: [],
      bodyGroups: [],
      cookingPlatform: 'PLATFORM_None',
      excludedFromRandomize: [],
      headCustomizationOptions: [],
      headGroups: [],
      uiPresets: [],
      perspectiveInfo: [],
      version: 1,
      versionUpdateInfo: [],
    };
    Object.assign(record, data);
    if (data.armsCustomizationOptions) record.armsCustomizationOptions = data.armsCustomizationOptions.map(Handle);
    if (data.bodyCustomizationOptions) record.bodyCustomizationOptions = data.bodyCustomizationOptions.map(Handle);
    if (data.excludedFromRandomize) record.excludedFromRandomize = data.excludedFromRandomize.map(CName);
    if (data.headCustomizationOptions) record.headCustomizationOptions = data.headCustomizationOptions.map(Handle);
    return record;
  }

  // --- Entity Types (.app) ---
  /** Base interface for entity components. */
  export interface entIComponent<T extends string = string> extends BaseDataObject<T> {
    name: CName;
    isEnabled: 0 | 1;
    isReplicable: 0 | 1;
    tags: redTagList;
    version: number;
  }

  /** Represents a mask using tags for enabling/disabling bindings. */
  export interface entTagMask extends BaseDataObject<'entTagMask'> {
    excludedTags: redTagList;
    hardTags: redTagList;
    softTags: redTagList;
  }

  /** Base interface for entity bindings (e.g., Transform, Skinning). */
  export interface entIBinding<T extends string = string> extends BaseDataObject<T> {
    bindName: CName; // Often "root"
    enabled: 0 | 1;
    enableMask: entTagMask;
    slotName?: CName; // Optional, present in HardTransformBinding
  }

  /** Represents a buffer for entity parameters. */
  export interface entEntityParametersBuffer extends BaseDataObject<'entEntityParametersBuffer'> {
    parameterBuffers: unknown[]; // Type unknown from example
  }
  export function entEntityParametersBuffer (buffers: unknown[] = []): entEntityParametersBuffer {
    return {
      $type: 'entEntityParametersBuffer',
      parameterBuffers: buffers,
    };
  }

  /** Represents a part of an appearance definition, linking to an entity resource. */
  export interface appearanceAppearancePart extends BaseDataObject<'appearanceAppearancePart'> {
    resource: ResourceReference; // Often links to an .ent file
  }

  /** Binds an entity component to a specific transform slot on the parent. */
  export interface entHardTransformBinding extends entIBinding<'entHardTransformBinding'> {
    slotName: CName; // Often "None"
  }

  /** Binds an entity component for skinning to the parent skeleton. */
  export interface entSkinningBinding extends entIBinding<'entSkinningBinding'> {}

  /** Represents a skinned mesh component capable of morph targets. */
  export interface entMorphTargetSkinnedMeshComponent extends entIComponent<'entMorphTargetSkinnedMeshComponent'> {
    acceptDismemberment: 0 | 1;
    autoHideDistance: number;
    castLocalShadows: string; // e.g., "Always"
    castShadows: string; // e.g., "Always"
    chunkMask: string; // Large number represented as string
    forceLODLevel: number; // -1 typically
    id: string; // CRUID represented as string
    localTransform: WorldTransform; // Usually identity transform
    meshAppearance: CName; // Name matching an appearance in the referenced mesh/morphtarget
    morphResource: ResourceReference; // Links to the .morphtarget file
    parentTransform: HandleRef | Handle<entHardTransformBinding>; // Can be a reference or inline definition
    renderingPlaneAnimationParam: CName; // Often "None"
    renderSceneLayerMask: string; // e.g., "Default"
    skinning: HandleRef | Handle<entSkinningBinding>; // Can be a reference or inline definition
    useSkinningLOD: 0 | 1;
    visibilityAnimationParam: CName; // Often "None"
  }

  /** Defines a specific visual appearance for an entity, composed of components and resources. */
  export interface appearanceAppearanceDefinition extends BaseDataObject<'appearanceAppearanceDefinition'> {
    censorFlags: number;
    compiledData: any; // Complex structure ("RedPackage"), define as any for now
    components: entMorphTargetSkinnedMeshComponent[]; // Add other component types as needed
    cookedDataPathOverride: ResourceReference; // Often null/empty path
    forcedLodDistance: number;
    hitRepresentationOverrides: unknown[]; // Type unknown from example
    inheritedVisualTags: redTagList;
    looseDependencies: unknown[]; // Type unknown from example
    name: CName; // The unique name for this appearance variant (e.g., color name)
    parametersBuffer: entEntityParametersBuffer;
    parentAppearance: CName; // Often "None"
    partsMasks: unknown[][]; // Array of arrays, inner type unknown from example ([[]])
    partsOverrides: unknown[]; // Type unknown from example
    partsValues: appearanceAppearancePart[];
    proxyMesh: ResourceReference; // Often null/empty path
    proxyMeshAppearance: CName; // Often "None"
    resolvedDependencies: ResourceReference[]; // Lists referenced resources like .morphtarget
    visualTags: redTagList; // Tags associated with this appearance (e.g., "Female")
  }
  export function appearanceAppearanceDefinition (data: _<appearanceAppearanceDefinition> = {}): appearanceAppearanceDefinition {
    const record: appearanceAppearanceDefinition = {
      $type: 'appearanceAppearanceDefinition',
      censorFlags: 0,
      compiledData: {},
      components: [],
      cookedDataPathOverride: ResourceReference(),
      forcedLodDistance: 0,
      hitRepresentationOverrides: [],
      inheritedVisualTags: redTagList(),
      looseDependencies: [],
      name: CName(),
      parametersBuffer: entEntityParametersBuffer(),
      parentAppearance: CName(),
      partsMasks: [],
      partsOverrides: [],
      partsValues: [],
      proxyMesh: ResourceReference(),
      proxyMeshAppearance: CName(),
      resolvedDependencies: [],
      visualTags: redTagList(),
    };
    Object.assign(record, data);
    if (data.name) record.name = CName(data.name);
    if (data.parentAppearance) record.parentAppearance = CName(data.parentAppearance);
    if (data.proxyMeshAppearance) record.proxyMeshAppearance = CName(data.proxyMeshAppearance);
    return record;
  }

  /** Container for wound configurations for a specific appearance name. */
  export interface entdismembermentWoundConfigContainer extends BaseDataObject<'entdismembermentWoundConfigContainer'> {
    AppearanceName: CName;
    Wounds: unknown[]; // Type unknown from example
  }

  /** A set of wound configurations for different appearances. */
  export interface entdismembermentWoundsConfigSet extends BaseDataObject<'entdismembermentWoundsConfigSet'> {
    Configs: Handle<entdismembermentWoundConfigContainer>[];
  }

  /** Represents a resource containing multiple appearance definitions for an entity type. */
  export interface appearanceAppearanceResource extends BaseDataObject<'appearanceAppearanceResource'> {
    alternateAppearanceMapping: unknown[]; // Type unknown from example
    alternateAppearanceSettingName: CName; // Often "None"
    alternateAppearanceSuffixes: unknown[]; // Type unknown from example
    appearances: Handle<appearanceAppearanceDefinition>[];
    baseEntity: ResourceReference; // Often null/empty path
    baseEntityType: CName; // Often "None"
    baseType: CName; // Often "None"
    censorshipMapping: unknown[]; // Type unknown from example
    commonCookData: ResourceReference; // Often null/empty path
    cookingPlatform: string; // e.g., "PLATFORM_None"
    DismEffects: unknown[]; // Type unknown from example
    DismWoundConfig: entdismembermentWoundsConfigSet;
    forceCompileProxy: 0 | 1;
    generatePlayerBlockingCollisionForProxy: 0 | 1;
    partType: CName; // Often "None"
    preset: CName; // Often "None"
    proxyPolyCount: number;
    Wounds: unknown[]; // Type unknown from example
  }

  // --- Mesh Types (.mesh) ---

  /** Defines a specific appearance variation within a mesh file (e.g., different materials). */
  export interface meshMeshAppearance extends BaseDataObject<'meshMeshAppearance'> {
    chunkMaterials: CName[]; // Material names (e.g., "black@makeup") applied to chunks for this appearance
    name: CName; // Name of this mesh appearance (e.g., "black", "blue")
    tags: CName[]; // Tags associated with this mesh appearance
  }

  /** Reference to a texture resource within a material instance. */
  export interface rRef_ITexture extends BaseDataObject<'rRef__colon__ITexture'> {
    DiffuseTexture: ResourceReference; // Links to the .xbm texture file
  }

  /** Represents an instance of a material, potentially overriding base material properties. */
  export interface CMaterialInstance extends BaseDataObject<'CMaterialInstance'> {
    audioTag: CName; // Often "None"
    baseMaterial: ResourceReference; // Links to the base .mi (Material Instance) file or null path
    cookingPlatform: string; // e.g., "PLATFORM_None"
    enableMask: 0 | 1;
    metadata: null | unknown; // Seen as null in example
    resourceVersion: number;
    values: rRef_ITexture[]; // Array of parameter overrides (e.g., textures). This might be more generic.
  }

  /** Header information for a local material stored within the mesh file. */
  export interface meshLocalMaterialHeader extends BaseDataObject<'meshLocalMaterialHeader'> {
    offset: number;
    size: number;
  }

  /** Contains locally defined materials within the mesh file. */
  export interface meshMeshMaterialBuffer extends BaseDataObject<'meshMeshMaterialBuffer'> {
    materials: CMaterialInstance[]; // Inline definitions of CMaterialInstance
    rawData: {
      Data: {
        Files: RedEngineFileData<CMaterialInstance>[];
      };
    }; // Complex structure containing serialized CR2W file data for materials
    rawDataHeaders: meshLocalMaterialHeader[];
  }

  /** Maps a material name used in the mesh to a material index (either external or local). */
  export interface CMeshMaterialEntry extends BaseDataObject<'CMeshMaterialEntry'> {
    index: number; // Index into either externalMaterials or localMaterialBuffer.materials
    isLocalInstance: 0 | 1; // True if the material is in localMaterialBuffer
    name: CName; // Name used to refer to this material (e.g., "@makeup")
  }

  /** Represents the core mesh data resource. */
  export interface CMesh extends BaseDataObject<'CMesh'> {
    appearances: Handle<meshMeshAppearance>[];
    boneNames: CName[]; // List of bone names used by the mesh skeleton
    boneRigMatrices: Matrix[]; // Transformation matrices for bones
    boneVertexEpsilons: number[]; // Epsilon values for bone vertices
    boundingBox: Box; // Overall bounding box for the mesh
    castGlobalShadowsCachedInCook: 0 | 1;
    castLocalShadowsCachedInCook: 0 | 1;
    castsRayTracedShadowsFromOriginalGeometry: 0 | 1;
    consoleBias: number;
    constrainAutoHideDistanceToTerrainHeightMap: 0 | 1;
    cookingPlatform: string; // e.g., "PLATFORM_None"
    externalMaterials: unknown[]; // References to external material resources (empty in example)
    floatTrackNames: unknown[]; // Unknown purpose (empty in example)
    forceLoadAllAppearances: 0 | 1;
    geometryHash: string; // Hash representing the mesh geometry
    inplaceResources: unknown[]; // Unknown purpose (empty in example)
    isPlayerShadowMesh: 0 | 1;
    isShadowMesh: 0 | 1;
    localMaterialBuffer: meshMeshMaterialBuffer; // Contains inline material definitions
    localMaterialInstances: CMaterialInstance[]; // Alternative way to store local materials? (empty in example)
    lodBoneMask: number[]; // Mask indicating bone usage per LOD level
    lodLevelInfo: number[]; // Information about Level of Detail levels
    materialEntries: CMeshMaterialEntry[]; // Maps material names to indices
    objectType: string; // e.g., "ROT_Character"
    parameters: {
      Elements: CMaterialParameter[][];
    }; // Unknown purpose (empty in example)
    preloadExternalMaterials: unknown[]; // Unknown purpose (empty in example)
    preloadLocalMaterialInstances: unknown[]; // Unknown purpose (empty in example)
    renderResourceBlob: Handle<rendRenderMeshBlob>; // Contains rendering-specific data blob
    resourceVersion: number;
    saveDateTime: string; // Timestamp string
    surfaceAreaPerAxis: Vector3; // Surface area calculation
    useRayTracingShadowLODBias: 0 | 1;
  }

  // --- Rendering Types (within .mesh renderResourceBlob) ---

  /** Element describing vertex packing for the GPU. */
  export interface GpuWrapApiVertexPackingPackingElement extends BaseDataObject<'GpuWrapApiVertexPackingPackingElement'> {
    streamIndex: number;
    streamType: string; // e.g., "ST_PerVertex", "ST_PerInstance"
    type: string; // e.g., "PT_Short4N", "PT_UByte4", "PT_Float16_2"
    usage: string; // e.g., "PS_Position", "PS_SkinIndices", "PS_TexCoord"
    usageIndex: number;
  }

  /** Describes the layout of vertex data for the GPU. */
  export interface GpuWrapApiVertexLayoutDesc extends BaseDataObject<'GpuWrapApiVertexLayoutDesc'> {
    elements: { Elements: GpuWrapApiVertexPackingPackingElement[] };
    hash: number;
    slotMask: number;
    slotStrides: { Elements: number[] };
  }

  /** Chunk describing vertex buffer layout and offsets. */
  export interface rendVertexBufferChunk extends BaseDataObject<'rendVertexBufferChunk'> {
    byteOffsets: { Elements: number[] }; // Offsets for different vertex attributes/streams
    vertexLayout: GpuWrapApiVertexLayoutDesc;
  }

  /** Chunk describing index buffer properties. */
  export interface rendIndexBufferChunk extends BaseDataObject<'rendIndexBufferChunk'> {
    pe: string; // Primitive element type, e.g., "IBCT_IndexUShort"
    teOffset: number; // Offset within the buffer
  }

  /** Represents a renderable chunk of the mesh. */
  export interface rendChunk extends BaseDataObject<'rendChunk'> {
    baseRenderMask: number;
    chunkIndices: rendIndexBufferChunk;
    chunkVertices: rendVertexBufferChunk;
    lodMask: number; // Bitmask indicating which LOD levels this chunk belongs to
    materialId: CName[]; // Material ID(s) used by this chunk (Updated from unknown[] based on typical usage, might still vary)
    mergedRenderMask: number;
    numIndices: number; // Number of indices in this chunk
    numVertices: number; // Number of vertices in this chunk
    renderMask: string; // Flags like "MCF_RenderInScene, MCF_RenderInShadows"
    vertexFactory: number; // Identifier for the vertex factory/shader
  }

  /** Describes mesh topology data (empty in example). */
  export interface rendTopologyData extends BaseDataObject<'rendTopologyData'> {
    data: unknown[];
    dataStride: number;
    metadata: unknown[];
    metadataStride: number;
  }

  /** Header for the render mesh blob containing metadata and offsets. */
  export interface rendRenderMeshBlobHeader extends BaseDataObject<'rendRenderMeshBlobHeader'> {
    bonePositions: Vector4[]; // Positions of bones
    customData: unknown[]; // Custom data array
    customDataElemStride: number;
    dataProcessing: number; // Flags or enum
    indexBufferOffset: number; // Offset to index data within the renderBuffer
    indexBufferSize: number; // Size of the index buffer
    opacityMicromaps: unknown[]; // Data for opacity micromaps
    quantizationOffset: Vector4; // Offset for dequantizing vertex positions
    quantizationScale: Vector4; // Scale for dequantizing vertex positions
    renderChunkInfos: rendChunk[]; // Definitions of render chunks
    renderChunks: unknown[]; // Possibly runtime chunk data? (empty in example)
    renderLODs: number[]; // LOD level information
    speedTreeWind: unknown[]; // Data related to SpeedTree wind effects
    topology: rendTopologyData[]; // Topology information
    topologyData: unknown[]; // Raw topology data? (empty in example)
    topologyDataStride: number;
    topologyMetadata: unknown[]; // Metadata for topology? (empty in example)
    topologyMetadataStride: number;
    version: number; // Version of the blob format
    vertexBufferSize: number; // Total size of the vertex buffer
  }

  /** Contains the binary render data (vertex/index buffers) and header info. */
  export interface rendRenderMeshBlob extends BaseDataObject<'rendRenderMeshBlob'> {
    header: rendRenderMeshBlobHeader;
    renderBuffer: RenderBufferData; // Contains 'Bytes' field with likely base64 binary data (Updated from any)
  }

  // --- MorphTarget Types (.morphtarget) ---

  /** Defines a morph target mesh, which is a base mesh plus morph target deformations. */
  export interface MorphTargetMesh extends BaseDataObject<'MorphTargetMesh'> {
    baseMesh: ResourceReference; // Reference to the base .mesh file
    baseMeshAppearance: CName; // Default appearance from the base mesh to use
    baseTexture: ResourceReference; // A base texture, often a normal map
    baseTextureParamName: CName; // Parameter name for the baseTexture (e.g., "Normal")
    blob: Handle<rendRenderMorphTargetMeshBlob>; // Handle to the morph target rendering blob
    boundingBox: Box; // Bounding box of the mesh
    cookingPlatform: string; // e.g., "PLATFORM_None"
    resourceVersion: number;
    targets: MorphTargetMeshEntry[]; // Array of morph target definitions
  }

  /** Defines a single morph target and its properties. */
  export interface MorphTargetMeshEntry extends BaseDataObject<'MorphTargetMeshEntry'> {
    boneNames: CName[]; // Names of bones influencing this morph target
    boneRigMatrices: Matrix[]; // Rigging matrices for the bones
    faceRegion: string; // Categorization of the morph target (e.g., "FACE_REGION_NOSE", "FACE_REGION_EYES")
    name: CName; // Unique name of this morph target (e.g., "h012")
    regionName: CName; // Name of the region this target affects (e.g., "nose", "eyes")
  }

  /** Contains texture data for morph target differences. */
  export interface rendRenderMorphTargetMeshBlobTextureData extends BaseDataObject<'rendRenderMorphTargetMeshBlobTextureData'> {
    targetDiffOffset: { Elements: (number | string)[] }; // Vector4 components, potentially string for -inf/inf
    targetDiffScale: { Elements: (number | string)[] }; // Vector4 components
    targetDiffsDataOffset: { Elements: number[] };
    targetDiffsDataSize: { Elements: number[] };
    targetDiffsMipLevelCounts: { Elements: number[] };
    targetDiffsWidth: { Elements: number[] };
  }

  /** Header for the morph target mesh blob. */
  export interface rendRenderMorphTargetMeshBlobHeader extends BaseDataObject<'rendRenderMorphTargetMeshBlobHeader'> {
    numDiffs: number; // Total number of differences
    numDiffsMapping: number; // Total number of difference mappings
    numTargets: number; // Number of morph targets
    numVertexDiffsInEachChunk: number[][]; // Array of arrays, vertex diffs per chunk per target/LOD?
    numVertexDiffsMappingInEachChunk: number[][]; // Similar for mapping
    targetPositionDiffOffset: Vector4[]; // Offset for dequantizing position differences
    targetPositionDiffScale: Vector4[]; // Scale for dequantizing position differences
    targetStartsInVertexDiffs: number[]; // Starting indices for each target in the vertex diffs buffer
    targetStartsInVertexDiffsMapping: number[]; // Starting indices for each target in the mapping buffer
    targetTextureDiffsData: rendRenderMorphTargetMeshBlobTextureData[]; // Texture difference data
    version: number; // Version of this blob header format
  }

  /** Contains the binary render data for morph targets. */
  export interface rendRenderMorphTargetMeshBlob extends BaseDataObject<'rendRenderMorphTargetMeshBlob'> {
    baseBlob: Handle<rendRenderMeshBlob>; // Handle to the base mesh's render blob
    diffsBuffer: RenderBufferData; // Buffer containing vertex differences
    header: rendRenderMorphTargetMeshBlobHeader; // Header for this morph target blob
    mappingBuffer: RenderBufferData; // Buffer containing mapping data for differences
    textureDiffsBuffer: RenderBufferData | null; // Buffer for texture differences, can be null
  }

  export interface CMaterialParameterScalar extends BaseDataObject<'CMaterialParameterScalar'> {
    parameterName: CName;
    register: number;
    max: number;
    min: number;
    scalar: number;
  }
  export function CMaterialParameterScalar (data: _<CMaterialParameterScalar> = {}): CMaterialParameterScalar {
    const record: CMaterialParameterScalar = {
      $type: 'CMaterialParameterScalar',
      parameterName: CName(),
      register: 0,
      max: 1,
      min: 0,
      scalar: 0,
    };
    Object.assign(record, data);
    if (data.parameterName) record.parameterName = CName(data.parameterName);
    return record;
  }

  export interface CMaterialParameterTexture extends BaseDataObject<'CMaterialParameterTexture'> {
    parameterName: CName;
    register: number;
    texture: ResourceReference;
  }
  export function CMaterialParameterTexture (data: _<CMaterialParameterTexture> = {}): CMaterialParameterTexture {
    const record: CMaterialParameterTexture = {
      $type: 'CMaterialParameterTexture',
      parameterName: CName(),
      register: 0,
      texture: ResourceReference(),
    };
    Object.assign(record, data);
    if (data.parameterName) record.parameterName = CName(data.parameterName);
    return record;
  }

  export interface CMaterialParameterColor extends BaseDataObject<'CMaterialParameterColor'> {
    color: Color;
    parameterName: CName;
    register: number;
  }
  export function CMaterialParameterColor (data: _<CMaterialParameterColor> = {}): CMaterialParameterColor {
    const record: CMaterialParameterColor = {
      $type: 'CMaterialParameterColor',
      color: Color({ Alpha: 255, Blue: 255, Green: 255, Red: 255 }),
      parameterName: CName(),
      register: 0,
    };
    Object.assign(record, data);
    if (data.parameterName) record.parameterName = CName(data.parameterName);
    return record;
  }
}
