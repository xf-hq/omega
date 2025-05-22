import { z } from 'zod/v4';
import { CMaterialInstance, CMaterialTemplate } from './materials';

export interface FileHeader {
  WolvenKitVersion: string;
  WKitJsonVersion: string;
  GameVersion: number;
  ExportedDateTime: string;
  DataType: string;
  ArchiveFileName: string;
}
export namespace FileHeader {
  export const Schema = z.strictObject({
    WolvenKitVersion: z.string(),
    WKitJsonVersion: z.string(),
    GameVersion: z.number(),
    ExportedDateTime: z.string(),
    DataType: z.string(),
    ArchiveFileName: z.string(),
  });
}

export interface FileData<T> {
  Version: number;
  BuildVersion: number;
  RootChunk: T;
}
export namespace FileData {
  export const Schema = <T extends z.ZodType>(type: T) => z.strictObject({
    Version: z.int(),
    BuildVersion: z.int(),
    RootChunk: type,
  });
}

export interface File<T> {
  Header: FileHeader;
  Data: FileData<T>;
}
export function File<T extends z.ZodType> (type: T) {
  return z.strictObject({
    Header: FileHeader.Schema,
    Data: FileData.Schema(type),
  });
}
export namespace File {
  export type MaterialTemplate = File<CMaterialTemplate>;
  export namespace MaterialTemplate {
    export const Schema = z.lazy(() => File(CMaterialTemplate.Schema));
  }

  export type MaterialInstance = File<CMaterialInstance>;
  export namespace MaterialInstance {
    export const Schema = z.lazy(() => File(CMaterialInstance.Schema));
  }
}
