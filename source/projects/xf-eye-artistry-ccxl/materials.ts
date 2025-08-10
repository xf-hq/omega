import type { FileSaverAndImporterUtility, WolvenKitProject, WolvenKitProjectFile } from '../../infrastructure/wolvenkit-helpers';
import { RedEngine as RE, RedEngineFile } from '../../red-engine/red-engine-types';

export interface BaseMaterials {
  baseMatte: WolvenKitProjectFile<RE.CMaterialInstance>;
  baseRegular: WolvenKitProjectFile<RE.CMaterialInstance>;
  baseShimmer: WolvenKitProjectFile<RE.CMaterialInstance>;
  baseGlitter: WolvenKitProjectFile<RE.CMaterialInstance>;
}

export async function prepareBaseMaterialTemplate (fileSaverAndImporter: FileSaverAndImporterUtility, projectFile: WolvenKitProjectFile): Promise<void> {
  await projectFile.copyJSONFrom(Bun.fileURLToPath(import.meta.resolve('./mesh_decal__emp_front.mt.json')));
  fileSaverAndImporter.addToQueue(projectFile);
}

export async function prepareLayerBaseMaterials ({
  project,
  baseMaterialTemplateFile,
  relativeMaterialsPath,
  groupName,
  layerIndex,
}: {
  project: WolvenKitProject;
  baseMaterialTemplateFile: WolvenKitProjectFile;
  relativeMaterialsPath: string;
  groupName: string;
  layerIndex: number;
}): Promise<BaseMaterials> {
  let baseMaterialPath: string | undefined;
  if (layerIndex <= 1) {
    baseMaterialPath = baseMaterialTemplateFile.archiveFullRelativePath;
  }
  const enableMask = layerIndex === 0 || layerIndex === 2;
  return {
    baseMatte: await generateBaseMatteMaterial(project.getArchiveFile(`${relativeMaterialsPath}\\${groupName}_matte.mi`), enableMask, baseMaterialPath),
    baseRegular: await generateBaseRegularMaterial(project.getArchiveFile(`${relativeMaterialsPath}\\${groupName}_regular.mi`), enableMask, baseMaterialPath),
    baseShimmer: await generateBaseMetallicMaterial(project.getArchiveFile(`${relativeMaterialsPath}\\${groupName}_shimmer.mi`), enableMask, baseMaterialPath),
    baseGlitter: await generateBaseGlitterMaterial(project.getArchiveFile(`${relativeMaterialsPath}\\${groupName}_glitter.mi`), enableMask, baseMaterialPath),
  };
}

async function generateBaseMatteMaterial (projectFile: WolvenKitProjectFile<RE.CMaterialInstance>, enableMask: boolean, baseMaterialPath?: string): Promise<WolvenKitProjectFile<RE.CMaterialInstance>> {
  await projectFile.saveAndImportJSON(
    RedEngineFile(
      RE.CMaterialInstance({
        baseMaterial: RE.ResourceReference({
          DepotPath: RE.ResourcePath(baseMaterialPath ?? 'base\\materials\\mesh_decal.mt'),
          Flags: 'Default',
        }),
        enableMask: enableMask ? 1 : 0,
        values: [
          RE.MaterialColorParam('DiffuseColor', 0, 0, 0, 0),
          RE.MaterialFloatParam('DiffuseAlpha', 1),
          RE.MaterialFloatParam('NormalAlpha', 0),
          RE.MaterialTextureParam('SecondaryMask', 'base\\characters\\common\\skin\\face\\noise_decal_d01.xbm'),
          RE.MaterialTextureParam('NormalTexture', 'engine\\textures\\small_flat_normal.xbm'),
          RE.MaterialFloatParam('SecondaryMaskUVScale', 30),
          RE.MaterialTextureParam('RoughnessTexture', 'engine\\textures\\editor\\roughmetal.xbm'),
          RE.MaterialFloatParam('RoughnessMetalnessAlpha', 1),
          RE.MaterialFloatParam('SecondaryMaskInfluence', 1),
          RE.MaterialFloatParam('NormalsBlendingMode', 1),
        ],
      })
    )
  );
  return projectFile;
}

async function generateBaseRegularMaterial (projectFile: WolvenKitProjectFile<RE.CMaterialInstance>, enableMask: boolean, baseMaterialPath?: string): Promise<WolvenKitProjectFile<RE.CMaterialInstance>> {
  await projectFile.saveAndImportJSON(
    RedEngineFile(
      RE.CMaterialInstance({
        baseMaterial: RE.ResourceReference({
          DepotPath: RE.ResourcePath(baseMaterialPath ?? 'base\\materials\\mesh_decal.mt'),
          Flags: 'Default',
        }),
        enableMask: enableMask ? 1 : 0,
        values: [
          RE.MaterialColorParam('DiffuseColor', 0, 0, 0, 0),
          RE.MaterialFloatParam('DiffuseAlpha', 1),
          RE.MaterialFloatParam('NormalAlpha', 0),
          RE.MaterialTextureParam('SecondaryMask', 'base\\characters\\common\\skin\\face\\noise_decal_d01.xbm'),
          RE.MaterialTextureParam('NormalTexture', 'engine\\textures\\small_flat_normal.xbm'),
          RE.MaterialFloatParam('SecondaryMaskUVScale', 30),
          RE.MaterialTextureParam('RoughnessTexture', 'engine\\textures\\editor\\roughmetal.xbm'),
          RE.MaterialFloatParam('RoughnessMetalnessAlpha', 1),
          RE.MaterialFloatParam('SecondaryMaskInfluence', 1),
          RE.MaterialFloatParam('NormalsBlendingMode', 1),
        ],
      })
    )
  );
  return projectFile;
}

async function generateBaseMetallicMaterial (projectFile: WolvenKitProjectFile<RE.CMaterialInstance>, enableMask: boolean, baseMaterialPath?: string): Promise<WolvenKitProjectFile<RE.CMaterialInstance>> {
  await projectFile.saveAndImportJSON(
    RedEngineFile(
      RE.CMaterialInstance({
        baseMaterial: RE.ResourceReference({
          DepotPath: RE.ResourcePath(baseMaterialPath ?? 'base\\materials\\mesh_decal.mt'),
          Flags: 'Default',
        }),
        enableMask: enableMask ? 1 : 0,
        values: [
          RE.MaterialColorParam('DiffuseColor', 0, 0, 0, 0),
          RE.MaterialFloatParam('DiffuseAlpha', 1),
          RE.MaterialFloatParam('NormalAlpha', 0),
          RE.MaterialTextureParam('SecondaryMask', 'base\\characters\\common\\skin\\face\\noise_decal_d01.xbm'),
          RE.MaterialTextureParam('NormalTexture', 'engine\\textures\\small_flat_normal.xbm'),
          RE.MaterialTextureParam('RoughnessTexture', 'engine\\textures\\editor\\black.xbm'),
          RE.MaterialTextureParam('MetalnessTexture', 'engine\\textures\\editor\\white.xbm'),
          RE.MaterialFloatParam('RoughnessMetalnessAlpha', 0.280000001),
          RE.MaterialFloatParam('SecondaryMaskInfluence', 1),
          RE.MaterialTextureParam('DiffuseTexture', 'engine\\textures\\editor\\grey.xbm'),
          RE.MaterialFloatParam('UVOffsetX', 0),
          RE.MaterialFloatParam('UVOffsetY', 0),
          RE.MaterialFloatParam('UVRotation', 0),
          RE.MaterialFloatParam('NormalsBlendingMode', 1),
          RE.MaterialFloatParam('AlphaMaskContrast', 0),
          RE.MaterialFloatParam('AnimationSpeed', 1),
          RE.MaterialFloatParam('AnimationFramesWidth', 1),
          RE.MaterialFloatParam('AnimationFramesHeight', 1),
          RE.MaterialFloatParam('DepthThreshold', 1),
        ],
      })
    )
  );
  return projectFile;
}

async function generateBaseGlitterMaterial (projectFile: WolvenKitProjectFile<RE.CMaterialInstance>, enableMask: boolean, baseMaterialPath?: string): Promise<WolvenKitProjectFile<RE.CMaterialInstance>> {
  await projectFile.saveAndImportJSON(
    RedEngineFile(
      RE.CMaterialInstance({
        baseMaterial: RE.ResourceReference({
          DepotPath: RE.ResourcePath(baseMaterialPath ?? 'base\\materials\\mesh_decal.mt'),
          Flags: 'Default',
        }),
        enableMask: enableMask ? 1 : 0,
        values: [
          RE.MaterialColorParam('DiffuseColor', 0, 0, 0, 0),
          RE.MaterialFloatParam('DiffuseAlpha', 1),
          RE.MaterialFloatParam('NormalAlpha', 0),
          RE.MaterialTextureParam('SecondaryMask', 'base\\characters\\common\\skin\\face\\noise_decal_d01.xbm'),
          RE.MaterialTextureParam('NormalTexture', 'engine\\textures\\small_flat_normal.xbm'),
          RE.MaterialTextureParam('RoughnessTexture', 'engine\\textures\\editor\\black.xbm'),
          RE.MaterialTextureParam('MetalnessTexture', 'engine\\textures\\editor\\white.xbm'),
          RE.MaterialFloatParam('RoughnessMetalnessAlpha', 0.280000001),
          RE.MaterialFloatParam('SecondaryMaskInfluence', 1),
          RE.MaterialTextureParam('DiffuseTexture', 'engine\\textures\\editor\\grey.xbm'),
          RE.MaterialFloatParam('UVOffsetX', 0),
          RE.MaterialFloatParam('UVOffsetY', 0),
          RE.MaterialFloatParam('UVRotation', 0),
          RE.MaterialFloatParam('NormalsBlendingMode', 1),
          RE.MaterialFloatParam('AlphaMaskContrast', 0),
          RE.MaterialFloatParam('AnimationSpeed', 1),
          RE.MaterialFloatParam('AnimationFramesWidth', 1),
          RE.MaterialFloatParam('AnimationFramesHeight', 1),
          RE.MaterialFloatParam('DepthThreshold', 1),
        ],
      }),
    )
  );
  return projectFile;
}
