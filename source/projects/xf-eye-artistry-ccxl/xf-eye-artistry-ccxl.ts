import Path from 'path';
import { FileSaverAndImporterUtility, WolvenKitProject, WolvenKitProjectFile } from '../../infrastructure/wolvenkit-helpers';
import { RedEngine as RE, RedEngineFile } from '../../red-engine/red-engine-types';
import { MY_CONFIG } from '../my-config';
import { prepareColourVariants, type ColourDefinition } from './atlas';
import { loadModSetupFile, type ModSetup } from './load-mod-setup-file';
import { prepareBaseMaterialTemplate, prepareLayerBaseMaterials, type BaseMaterials } from './materials';
import { prepareTextures, type TextureReference } from './textures';

export interface RebuildEyeArtistryProjectOptions {
  readonly force: boolean | string[];
  readonly install: boolean | 'hot';
}

export namespace RebuildEyeArtistryProjectOptions {
  export function force (ext: string, options: RebuildEyeArtistryProjectOptions) {
    if (options.force === true) {
      return true;
    }
    if (Array.isArray(options.force)) {
      return options.force.includes(ext);
    }
    return false;
  }
}

const createMorphtargetFileData = await preloadJSONTemplate<RedEngineFile<RE.MorphTargetMesh>>('./eye-makeup.morphtarget.json');
const createMeshFileData = await preloadJSONTemplate<RedEngineFile<RE.CMesh>>('./eye-makeup.mesh.json');

export async function rebuildEyeArtistryProject (options: RebuildEyeArtistryProjectOptions): Promise<void> {
  const project = new WolvenKitProject(MY_CONFIG, 'xf-eye-artistry-ccxl');
  const assetsDir = Path.join(project.config.projectDir, 'assets');

  // Read the data file that specifies the intended structure and content of the mod.
  const modSetup = loadModSetupFile(Path.join(assetsDir, 'project.yaml'));

  const colours = await prepareColourVariants(project);

  // Prepare and import any texture images to xbm files if they haven't already been imported.
  const textures = await prepareTextures(project, modSetup, assetsDir);

  // The mod setup file defines lists of textures that can then be bulk included in different switcher groups.
  const lists = prepareLists(modSetup, textures);

  await prepareSwitcherGroups(project, modSetup, lists, colours);

  console.log(`Done.`);
  return;
}

function prepareLists (modSetup: ModSetup, textures: Record<string, TextureReference>): Record<string, TextureReference[]> {
  const lists: Record<string, TextureReference[]> = {};
  for (const key in modSetup.lists) {
    const ids = modSetup.lists[key];
    const list: TextureReference[] = [];
    lists[key] = list;
    for (const id of ids) {
      const texture = textures[id];
      if (texture) {
        list.push(texture);
      }
      else {
        console.warn(`Texture with ID ${id} not found in textures.`);
      }
    }
  }
  return lists;
}

async function preloadJSONTemplate<T> (filename: string): Promise<() => T> {
  const path = Bun.fileURLToPath(import.meta.resolve(filename));
  const json = await Bun.file(path).text();
  return () => JSON.parse(json);
}

interface SwitcherGroup {
  identifier: string;
  label: string;
  variants: SelectableVariant[];
}

interface SelectableVariant {
  id: string;
  groupId: string;
  variantId: string;
  variantIndex: number;
  textureFile: WolvenKitProjectFile;
  subvariants: SelectableSubvariant[];
}

interface SelectableSubvariant {
  uniqueId: string;
}

async function prepareSwitcherGroups (
  project: WolvenKitProject,
  modSetup: ModSetup,
  lists: Record<string, TextureReference[]>,
  colours: ColourDefinition[],
): Promise<SwitcherGroup[]> {
  const fileSaverAndImporter = new FileSaverAndImporterUtility();

  const morphtargetFile = project.getArchiveFile(`${project.config.shortName}.morphtarget`);
  const meshFile = project.getArchiveFile(`${project.config.shortName}.mesh`);

  const morphTargetFileData = createMorphtargetFileData();
  morphTargetFileData.Data.RootChunk.baseMesh.DepotPath.$value = meshFile.archiveFullRelativePath;

  const meshFileData = createMeshFileData();

  let globalIndex = modSetup.ccxl.firstSwitcherGlobalIndex;
  const inkcc = RE.gameuiCharacterCustomizationInfoResource();
  const headGroups = {
    character_customization: RE.gameuiOptionsGroup('character_customization', []),
    face: RE.gameuiOptionsGroup('face', []),
  };
  inkcc.headGroups.push(headGroups.character_customization, headGroups.face);

  const baseMaterialTemplateFile = project.getArchiveFile(`materials\\mesh_decal__emp_front.mt`);
  prepareBaseMaterialTemplate(fileSaverAndImporter, baseMaterialTemplateFile);

  const groups: SwitcherGroup[] = [];
  for (let switcherGroupIndex = 0; switcherGroupIndex < modSetup.ccxl.switcherGroups.length; switcherGroupIndex++) {
    // Defines the set of variants that should be included in the switcher group.
    const switcherGroupSetup = modSetup.ccxl.switcherGroups[switcherGroupIndex];
    const variants: SelectableVariant[] = [];

    const materials = await prepareLayerBaseMaterials({
      project,
      baseMaterialTemplateFile,
      relativeMaterialsPath: 'materials',
      groupName: switcherGroupSetup.identifier,
      layerIndex: switcherGroupIndex,
    });

    const groupId = `${project.config.shortName}_${switcherGroupSetup.identifier}`;
    headGroups.character_customization.options.push(RE.CName(groupId), RE.CName(`${groupId}_none`));
    headGroups.face.options.push(RE.CName(`${groupId}_none`));

    const switcherInfo = RE.gameuiSwitcherInfo({
      index: globalIndex++,
      localizedName: switcherGroupSetup.label,
      name: groupId,
      options: [
        RE.gameuiSwitcherOption({
          index: 0,
          localizedName: 'Common-Off',
          names: [`${groupId}_none`],
        }),
      ],
      randomizeCategory: 'Makeup',
      switchVisibility: 1,
      uiSlot: groupId,
      uiSlots: [`${groupId}_colour`],
    });
    inkcc.headCustomizationOptions.push(
      RE.Handle(switcherInfo),
      RE.Handle(// The appearance for the "OFF" state of the switcher.
        RE.gameuiAppearanceInfo({
          definitions: [
            RE.gameuiIndexedAppearanceDefinition(),
          ],
          enabled: 1,
          index: globalIndex++,
          localizedName: `${switcherGroupSetup.label} Colour`,
          name: `${groupId}_none`,
          randomizeCategory: 'Makeup',
          uiSlot: `${groupId}_colour`,
          useThumbnails: 1,
        }),
      ),
    );

    // Populate the switcher group.
    for (let i = 0; i < switcherGroupSetup.include.length; ++i) {
      const list = lists[switcherGroupSetup.include[i]];
      if (!list) {
        console.warn(`List '${switcherGroupSetup.include[i]}' not found in lists.`);
        continue;
      }

      for (let variantIndex = 0; variantIndex < list.length; ++variantIndex) {
        // Each item in the list refers to a specific texture defining the look of the variant. The base texture is
        // monochrome in colour. A colour selector will comprise the second component of the switcher group and will be
        // populated with a material unique to each variant. Material instance daisy-chaining will be used to minimise
        // repetition where possible.
        const textureRef = list[variantIndex];
        const variantId = `${groupId}_${textureRef.id}`;
        headGroups.face.options.push(RE.CName(variantId));
        headGroups.character_customization.options.push(RE.CName(variantId));

        const appFile = project.getArchiveFile(`variants\\${variantId}.app`);
        variants.push(
          prepareVariant({
            groupId,
            variantId,
            variantIndex,
            globalIndex: globalIndex + variantIndex + 1,
            textureRef,
            appFile,
            materials,
            colours,
            inkcc,
            switcherInfo,
            morphtargetFile,
            meshFileData,
            fileSaverAndImporter,
          })
        );
      }
    }
    groups.push({
      identifier: switcherGroupSetup.identifier,
      label: switcherGroupSetup.label,
      variants,
    });
  }

  const inkccFile = project.getArchiveFile(`${project.config.shortName}.inkcharcustomization`);

  fileSaverAndImporter.addToQueue(inkccFile, RedEngineFile(inkcc));
  fileSaverAndImporter.addToQueue(morphtargetFile, morphTargetFileData);
  fileSaverAndImporter.addToQueue(meshFile, meshFileData);
  fileSaverAndImporter.done();
  await fileSaverAndImporter.allSaved();

  return groups;
}

function prepareVariant ({
  groupId,
  variantId,
  variantIndex,
  globalIndex,
  textureRef,
  appFile,
  materials,
  colours,
  inkcc,
  switcherInfo,
  morphtargetFile,
  meshFileData,
  fileSaverAndImporter,
}: {
  groupId: string;
  variantId: string;
  variantIndex: number;
  globalIndex: number;
  textureRef: TextureReference;
  appFile: WolvenKitProjectFile;
  materials: BaseMaterials;
  colours: ColourDefinition[];
  inkcc: RE.gameuiCharacterCustomizationInfoResource;
  switcherInfo: RE.gameuiSwitcherInfo;
  morphtargetFile: WolvenKitProjectFile;
  meshFileData: RedEngineFile<RE.CMesh>;
  fileSaverAndImporter: FileSaverAndImporterUtility;
}): SelectableVariant {
  const subvariants: SelectableSubvariant[] = [];

  console.log(`Preparing variant ${variantId}...`);

  // VARIANT
  switcherInfo.options.push(
    RE.gameuiSwitcherOption({
      index: variantIndex + 1,
      localizedName: textureRef.label,
      names: [variantId],
    })
  );

  const appearanceInfo = RE.gameuiAppearanceInfo({
    definitions: [],
    enabled: 0,
    index: globalIndex,
    link: `${groupId} colour`,
    linkController: 1,
    localizedName: textureRef.label,
    name: variantId,
    randomizeCategory: 'Makeup',
    resource: RE.ResourceReference({
      DepotPath: appFile.archiveFullRelativePath,
      Flags: 'Soft',
    }),
    uiSlot: `${groupId}_colour`,
    useThumbnails: 1,
  });
  inkcc.headCustomizationOptions.push(RE.Handle(appearanceInfo));

  const app = RE.appearanceAppearanceResource({
    appearances: [],
    baseEntity: RE.ResourceReference({ Flags: 'Soft' }),
    commonCookData: RE.ResourceReference({ Flags: 'Soft' }),
  });

  const mesh = meshFileData.Data.RootChunk;

  console.debug(`Adding materials for ${colours.length} colours...`);
  for (let i = 0; i < colours.length; ++i) {
    const mat = colours[i];
    const uniqueId = `${variantId}_${mat.baseId}`;
    const appearanceName = `${groupId}_${mat.baseId}`;

    const rgba = mat.rgba;
    const color = RE.Color({
      Alpha: 255,
      Blue: Math.round(rgba.b * 255),
      Green: Math.round(rgba.g * 255),
      Red: Math.round(rgba.r * 255),
    });

    app.appearances.push(
      RE.Handle(
        // We're defining an appearance here. It has only one component.
        RE.appearanceAppearanceDefinition({
          components: [
            RE.entMorphTargetSkinnedMeshComponent({
              autoHideDistance: 50,
              castLocalShadows: 'Always',
              castShadows: 'Always',
              meshAppearance: uniqueId,
              morphResource: RE.ResourceReference({
                DepotPath: morphtargetFile.archiveFullRelativePath,
              }),
              name: groupId,
              parentTransform: RE.entHardTransformBinding({
                bindName: 'root',
              }),
              skinning: RE.entSkinningBinding({
                bindName: 'root',
              }),
            }),
          ],
          cookedDataPathOverride: RE.ResourceReference({
            Flags: 'Soft',
          }),
          name: appearanceName,
          partsMasks: [],
          partsOverrides: [],
          partsValues: [],
          proxyMesh: RE.ResourceReference({ Flags: 'Soft' }),
          resolvedDependencies: [
            RE.ResourceReference({
              DepotPath: morphtargetFile.archiveFullRelativePath,
              Flags: 'Soft',
            }),
          ],
          visualTags: RE.redTagList(['Female']),
        }),
      ),
    );

    mesh.appearances.push(RE.Handle(
      RE.meshMeshAppearance({
        name: uniqueId,
        chunkMaterials: [uniqueId],
      })
    ));
    mesh.materialEntries.push(
      RE.CMeshMaterialEntry({
        index: mesh.materialEntries.length,
        isLocalInstance: 1,
        name: uniqueId,
      })
    );

    let basePath: string;
    switch (mat.kind) {
      case 'regular': basePath = materials.baseRegular.archiveFullRelativePath; break;
      case 'matte': basePath = materials.baseMatte.archiveFullRelativePath; break;
      case 'shimmer': basePath = materials.baseShimmer.archiveFullRelativePath; break;
      case 'glitter': basePath = materials.baseGlitter.archiveFullRelativePath; break;
    }
    mesh.localMaterialBuffer.materials.push(
      RE.CMaterialInstance({
        baseMaterial: RE.ResourceReference({ DepotPath: basePath }),
        values: [
          RE.MaterialColorParam('DiffuseColor', color.Red, color.Green, color.Blue, color.Alpha),
          RE.MaterialTextureParam('DiffuseTexture', textureRef.projectFile.archiveFullRelativePath),
        ],
      })
    );

    // SUBVARIANT
    appearanceInfo.definitions.push(
      RE.gameuiIndexedAppearanceDefinition({
        color: color,
        icon: RE.TweakDBID(`OptionsIcons.Id_xfea_colours_${mat.baseId}`),
        name: `${groupId}_${mat.baseId}`,
        index: appearanceInfo.definitions.length,
      })
    );

    subvariants.push({ uniqueId });
  }

  console.debug(`localMaterialBuffer now has ${mesh.localMaterialBuffer.materials.length} entries.`);

  fileSaverAndImporter.addToQueue(appFile, RedEngineFile(app));

  return {
    id: textureRef.id,
    groupId: groupId,
    variantId: variantId,
    variantIndex: variantIndex,
    textureFile: textureRef.projectFile,
    subvariants: subvariants,
  };
}
