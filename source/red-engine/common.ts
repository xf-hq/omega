import { z, type any } from 'zod/v4';
import { ResourceFlags } from './enums-and-flags';

export interface TupleOf<T extends readonly [any, ...any[]]> {
  Elements: T;
}
export namespace TupleOf {
  export const Schema = <T extends readonly [z.ZodType, ...z.ZodType[]]>(types: T) => z.strictObject({
    Elements: z.tuple(types),
  });
}

export type IntBool = 0 | 1;
export namespace IntBool {
  export const Schema = z.union([z.literal(0), z.literal(1)]);
}

/** An integer not less than 0 */
export type NonNegativeInteger = number;
export namespace NonNegativeInteger {
  export const Schema = z.int().min(0);
}

/** A value between 0 and 255 */
export type UInt8 = number;
export namespace UInt8 {
  export const Schema = z.int().min(0).max(255);
}

/** A value between 0 and 2^32 - 1 */
export type UInt32 = number;
export namespace UInt32 {
  export const Schema = z.uint32().min(0);
}

/** A 32 bit floating point number */
export type Float = number;
export namespace Float {
  export const Schema = z.float32();
}

/** The standard structure used for names and other forms of identifier */
export interface CName {
  $type: 'CName';
  $storage: 'string';
  $value: string;
}
export namespace CName {
  export const Schema = z.strictObject({
    $type: z.literal('CName'),
    $storage: z.literal('string'),
    $value: z.string(),
  });
}

/** A handle to a game resource of some kind */
export interface Handle<T> {
  HandleId: string;
  Data: T;
}
export namespace Handle {
  export const Schema = <T extends z.ZodType>(data: T) => z.strictObject({
    HandleId: z.string(),
    Data: data,
  });
}

export interface RenderBufferData {
  BufferId: string;
  BufferType: unknown;
  /** Base64 encoded */
  Bytes: string;
}
export namespace RenderBufferData {
  export const Schema = z.strictObject({
    BufferId: z.string(),
    BufferType: z.unknown(),
    Bytes: z.base64(),
  });
}

/**
 * A resource path.
 */
export interface ResourcePath {
  $type: 'ResourcePath';
  $storage: 'string';
  /**
   * The archive-relative path, separated by backslashes.
   * @example
   * 'base\\your_name\\your_mod\\foo\\bar.inkcharcustomization'
   */
  $value: string;
}
export namespace ResourcePath {
  export const Schema = z.strictObject({
    $type: z.literal('ResourcePath'),
    $storage: z.literal('string'),
    $value: z.string(),
  });
}

export interface ResourcePointer {
  $type: 'ResourcePointer';
  $storage: 'uint64';
  /**
   * Should be a string of digits. In most cases either this should be "0", or `ResourcePath` should be used instead.
   */
  $value: string;
}
export namespace ResourcePointer {
  export const Schema = z.strictObject({
    $type: z.literal('ResourcePointer'),
    $storage: z.literal('uint64'),
    $value: z.string().regex(/^\d+$/),
  });
}

/**
 * A reference to a resource in this or another `.archive` file.
 */
export interface ResourceReference {
  $type: 'ResourceReference';
  /**
   * The path to the resource, or an equivalent pointer.
   */
  DepotPath: ResourcePath | ResourcePointer;
  Flags: ResourceFlags;
}
export namespace ResourceReference {
  export const Schema = z.strictObject({
    $type: z.literal('ResourceReference'),
    DepotPath: z.union([ResourcePath.Schema, ResourcePointer.Schema]),
    Flags: ResourceFlags.Schema,
  });
}

export interface Color {
  $type: 'Color';
  Alpha: UInt8;
  Blue: UInt8;
  Green: UInt8;
  Red: UInt8;
}
export namespace Color {
  export const Schema = z.strictObject({
    $type: z.literal('Color'),
    Alpha: UInt8.Schema,
    Blue: UInt8.Schema,
    Green: UInt8.Schema,
    Red: UInt8.Schema,
  });
}

export interface Vector4 {
  $type: 'Vector4';
  W: Float;
  X: Float;
  Y: Float;
  Z: Float;
}
export namespace Vector4 {
  export const Schema = z.strictObject({
    $type: z.literal('Vector4'),
    W: Float.Schema,
    X: Float.Schema,
    Y: Float.Schema,
    Z: Float.Schema,
  });
}

const _Color = Color;
const _Vector4 = Vector4;
const _Float = Float;

export type rRef =
  | rRef_.Float
  | rRef_.Color
  | rRef_.ITexture
  | rRef_.Multilayer_Mask
  | rRef_.Multilayer_Setup
  | rRef_.CGradient
  | rRef_.CFoliageProfile
  | rRef_.CHairProfile
  | rRef_.CSkinProfile
  | rRef_.CTerrainSetup
;
export namespace rRef_ {
  export const Schema = z.union([
    rRef_.Float.Schema,
    rRef_.Color.Schema,
    rRef_.ITexture.Schema,
    rRef_.Multilayer_Mask.Schema,
    rRef_.Multilayer_Setup.Schema,
    rRef_.CGradient.Schema,
    rRef_.CFoliageProfile.Schema,
    rRef_.CHairProfile.Schema,
    rRef_.CSkinProfile.Schema,
    rRef_.CTerrainSetup.Schema,
  ]);

  const testCustomProp = (type: z.ZodType) => (data: any) => {
    const keys = Object.keys(data).filter((key) => key !== '$type');
    if (keys.length !== 1) {
      throw new Error(`Invalid ITexture: Expected two properties: $type and a custom key pointing to a ResourceReference (actual: [$type, ${keys.join(', ')}])`);
    }
    return type.parse(data[keys[0]]);
  };

  type _rRef<T extends string> = { $type: `rRef:${T}` } & { [prop: string]: ResourceReference };

  export type Float = _rRef<'Float'>;
  export namespace Float {
    export const Schema = z.looseObject({ $type: z.literal('Float') }).refine(testCustomProp(_Float.Schema));
  }

  export type Color = _rRef<'Color'>;
  export namespace Color {
    export const Schema = z.looseObject({ $type: z.literal('Color') }).refine(testCustomProp(_Color.Schema));
  }

  export type Vector4 = _rRef<'Vector4'>;
  export namespace Vector4 {
    export const Schema = z.looseObject({ $type: z.literal('Vector4') }).refine(testCustomProp(_Vector4.Schema));
  }

  export type ITexture = _rRef<'ITexture'>;
  export namespace ITexture {
    export const Schema = z.looseObject({ $type: z.literal('rRef:ITexture') }).refine(testCustomProp(ResourceReference.Schema));
  }

  export type Multilayer_Mask = _rRef<'Multilayer_Mask'>;
  export namespace Multilayer_Mask {
    export const Schema = z.looseObject({ $type: z.literal('rRef:Multilayer_Mask') }).refine(testCustomProp(ResourceReference.Schema));
  }

  export type Multilayer_Setup = _rRef<'Multilayer_Setup'>;
  export namespace Multilayer_Setup {
    export const Schema = z.looseObject({ $type: z.literal('rRef:Multilayer_Setup') }).refine(testCustomProp(ResourceReference.Schema));
  }

  export type CGradient = _rRef<'CGradient'>;
  export namespace CGradient {
    export const Schema = z.looseObject({ $type: z.literal('rRef:CGradient') }).refine(testCustomProp(ResourceReference.Schema));
  }

  export type CFoliageProfile = _rRef<'CFoliageProfile'>;
  export namespace CFoliageProfile {
    export const Schema = z.looseObject({ $type: z.literal('rRef:CFoliageProfile') }).refine(testCustomProp(ResourceReference.Schema));
  }

  export type CHairProfile = _rRef<'CHairProfile'>;
  export namespace CHairProfile {
    export const Schema = z.looseObject({ $type: z.literal('rRef:CHairProfile') }).refine(testCustomProp(ResourceReference.Schema));
  }

  export type CSkinProfile = _rRef<'CSkinProfile'>;
  export namespace CSkinProfile {
    export const Schema = z.looseObject({ $type: z.literal('rRef:CSkinProfile') }).refine(testCustomProp(ResourceReference.Schema));
  }

  export type CTerrainSetup = _rRef<'CTerrainSetup'>;
  export namespace CTerrainSetup {
    export const Schema = z.looseObject({ $type: z.literal('rRef:CTerrainSetup') }).refine(testCustomProp(ResourceReference.Schema));
  }
}
