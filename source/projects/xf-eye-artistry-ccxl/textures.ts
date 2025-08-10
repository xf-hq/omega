import FSP from 'fs/promises';
import Path from 'path';
import type { WolvenKitProject, WolvenKitProjectFile } from '../../infrastructure/wolvenkit-helpers';
import type { ModSetup } from './load-mod-setup-file';

export interface TextureReference {
  readonly id: string;
  readonly label: string;
  readonly projectFile: WolvenKitProjectFile;
}

const ORIGINAL_ASSET_FILENAME_SUFFIX = '_Base_color.png';

export async function prepareTextures (project: WolvenKitProject, modSetup: ModSetup, assetsDir: string) {
  const textures: Record<string, TextureReference> = {};

  const xbmDir = project.config.resolveCR2WPath('textures');
  await FSP.mkdir(xbmDir, { recursive: true });

  const MAX_SIMULTANEOUS_CLI_OPS = 5;
  let promises: Array<Promise<void>> = [];
  for (const textureId in modSetup.textures) {
    promises.push(
      prepareAsset(textureId).then(texture => {
        if (texture) {
          textures[textureId] = texture;
        }
      })
    );
    if (promises.length === MAX_SIMULTANEOUS_CLI_OPS) {
      await Promise.all(promises);
      promises = [];
    }
  }
  await Promise.all(promises);

  return textures;

  async function prepareAsset (textureId: string): Promise<TextureReference | null> {
    const projectFile = project.getArchiveFile(`textures/${textureId}.xbm`);

    const xbmPath = projectFile.cr2wFilePath;
    const xbmMtime = (await projectFile.cr2wFileSource.getModifiedTime()).valueOf();

    const textureName = modSetup.textures[textureId];
    const textureAssetDir = Path.join(assetsDir, textureName);
    const files = await FSP.readdir(textureAssetDir, { withFileTypes: true });
    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith(ORIGINAL_ASSET_FILENAME_SUFFIX)) continue;
      const assetSourceFilePath = Path.join(textureAssetDir, file.name);
      const assetStats = await FSP.stat(assetSourceFilePath);
      const assetMtime = assetStats.mtimeMs;

      // Ensure original asset file is copied to the project location where it could be manually imported using the main
      // WolvenKit UI if desired.
      await FSP.copyFile(assetSourceFilePath, projectFile.pngFilePath);

      if (xbmMtime < assetMtime) {
        // Temporary directory is because if prepareAsset is run in parallel and multiple source assets have the same
        // name, the CLI will be attempting to write to the same file, which will result in various errors.
        const temporaryXbmDir = Path.join(assetsDir, '.xbm', textureId);
        await FSP.mkdir(temporaryXbmDir, { recursive: true });
        // Temporary filename is because the WolvenKit cli writes to the same filename as the input, except with a
        // different extension.
        const temporaryFilename = Path.basename(assetSourceFilePath, Path.extname(ORIGINAL_ASSET_FILENAME_SUFFIX)) + '.xbm';
        const temporaryXbmPath = Path.join(temporaryXbmDir, temporaryFilename);
        console.log(`Importing texture asset "${textureName}" (${textureId}) to xbm file...`);
        await project.cli.import({
          filePathToImport: assetSourceFilePath,
          outputDirectory: temporaryXbmDir,
        });
        await FSP.rename(temporaryXbmPath, xbmPath);
        await FSP.rm(temporaryXbmDir, { recursive: true, force: true });
      }
      else {
        console.log(`Texture asset "${textureName}" (${textureId}) is up to date, skipping import.`);
      }
      const texture: TextureReference = {
        id: textureId,
        label: textureName,
        projectFile: projectFile,
      };
      return texture;
    }
    return null;
  }
}
