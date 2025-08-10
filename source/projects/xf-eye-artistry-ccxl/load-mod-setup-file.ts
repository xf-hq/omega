import YAML from 'yaml';
import FS from 'fs';

export interface ModSetup {
  textures: Record<string, string>;
  lists: Record<string, string[]>;
  ccxl: ModSetup.CCXL;
}
export namespace ModSetup {
  export interface CCXL {
    /**
     * Every entry in the `headCustomizationOptions` array has a unique index. Whatever index is specified here will
     * determine where these switcher options appear relative to all the existing vanilla switcher options.
     */
    firstSwitcherGlobalIndex: number;
    switcherGroups: Category[];
  }
  export interface Category {
    identifier: string;
    label: string;
    include: string[];
  }
}

export function loadModSetupFile (absolutePath: string): ModSetup {
  const fileContent = FS.readFileSync(absolutePath, 'utf8');
  const parsedData = YAML.parse(fileContent) as ModSetup;
  return parsedData;
}
