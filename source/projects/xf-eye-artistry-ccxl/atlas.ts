/**
 * This module builds up the texture atlas for each makeup palette choice that users have available when they select an
 * eyeliner or eyeshadow variant that the XF Eye Artistry mod adds to the game.
 */

import { rgbaToHSLA, type RGBA } from '@xf-common/color/color-functions';
import { Block } from '@xf-common/primitive';
import sharp from 'sharp';
import type { WolvenKitProject } from '../../infrastructure/wolvenkit-helpers';
import { RedEngine as RE, RedEngineFile } from '../../red-engine/red-engine-types';

export interface ColourDefinition {
  baseId: string;
  /** Values between 0 and 1 */
  rgba: RGBA;
  thumbnailIndex: number;
  kind: TextureAtlasBuilderItemKind;
}

export async function prepareColourVariants (project: WolvenKitProject): Promise<ColourDefinition[]> {
  const atlas = initializeEmptyAtlasBuilder(14, 160, 4);
  const palette = await createPalette(project);

  let id = 0;
  const colourMaterialDefinitions: ColourDefinition[] = [];
  const temp_matte: ColourDefinition[] = [];
  const temp_regular: ColourDefinition[] = [];
  const temp_shimmer: ColourDefinition[] = [];
  const temp_glitter: ColourDefinition[] = [];

  for (let rowIndex = 0; rowIndex < palette.length; ++rowIndex) {
    const paletteRow = palette[rowIndex];
    for (let colIndex = 0; colIndex < paletteRow.length; ++colIndex) {
      const colorId = (id++).toString().padStart(3, '0');
      const color = paletteRow[colIndex];
      addColourVariant(colorId, color, 'matte', temp_matte);
      addColourVariant(colorId, color, 'regular', temp_regular);
      addColourVariant(colorId, color, 'shimmer', temp_shimmer);
      addColourVariant(colorId, color, 'glitter', temp_glitter);
    }
    commitTempArray(temp_matte, 'matte');
    commitTempArray(temp_regular, 'regular');
    commitTempArray(temp_shimmer, 'shimmer');
    commitTempArray(temp_glitter, 'glitter');
  }

  await generateAtlasImageAndData(project, atlas);

  return colourMaterialDefinitions;

  /**
   * Adds a material to the atlas and the definitions array.
   * @param color The RGBA color of the material.
   * @param kind The kind of material being generated.
   * @param holdInTempArray Optional array to hold materials temporarily. If this is provided, push the material into it
   * and use 0 for the thumbnail index instead of appending to the atlas immediately.
   */
  function addColourVariant (colorId: string, color: RGBA, kind: TextureAtlasBuilderItemKind, holdInTempArray?: ColourDefinition[]): void {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);

    const baseId = `${colorId}_${kind}`;
    const thumbnailIndex = holdInTempArray ? 0 : appendImageInfoToAtlasBuilder(atlas, baseId, kind, { r, g, b, a: 255 });
    const colourMatDef: ColourDefinition = {
      baseId,
      rgba: color,
      thumbnailIndex,
      kind,
    };
    colourMaterialDefinitions.push(colourMatDef);
    if (holdInTempArray) {
      holdInTempArray.push(colourMatDef);
    }
  }

  function commitTempArray (tempArray: ColourDefinition[], kind: TextureAtlasBuilderItemKind): void {
    for (let i = 0; i < tempArray.length; ++i) {
      const material = tempArray[i];
      const color = {
        r: Math.round(material.rgba.r * 255),
        g: Math.round(material.rgba.g * 255),
        b: Math.round(material.rgba.b * 255),
        a: Math.round(material.rgba.a * 255),
      };
      material.thumbnailIndex = appendImageInfoToAtlasBuilder(atlas, material.baseId, kind, color);
    }
    tempArray.length = 0; // Clear the temporary array after committing
  }
}

async function createPalette (project: WolvenKitProject): Promise<RGBA[][]> {
  const palette: RGBA[][] = [];
  const rowlen = 343 * 3; // 343 is just the number of pixels I ended up with when creating the palette swatch pngs.
  const colw = rowlen / 7; // There are 7 swatches per palette png, and each is an entire column.
  for (let i = 0; i < 7; ++i) {
    const filePath = `${project.config.projectDir}\\assets\\inputs\\palette${i}.png`;
    const img = sharp(filePath);
    const buf = await img.raw().toBuffer();
    let row: RGBA[] = [];
    // - colw / 2    --> sample from the middle of the "palette${i}.png" swatch column
    // - j < rowlen  --> we're sampling one colour pixel from each column; beyond rowlen we're past the width of the image
    // - j += colw   --> advance by one column width
    for (let j = (colw / 2) << 0; j < rowlen; j += colw) {
      const g = buf[j] / 255;
      const b = buf[j + 1] / 255;
      const r = buf[j + 2] / 255;
      row.push({ r, g, b, a: 1 });
    }
    palette.push(row);
    row = [];
  }
  return palette;
}

export interface TextureAtlasBuilderInfo {
  items: TextureAtlasBuilderItemInfo[];
  columns: number;
  width: number;
  height: number;
  itemSize: number;
  gap: number;
}

export interface TextureAtlasBuilderItemInfo {
  name: string;
  kind: TextureAtlasBuilderItemKind;
  color: RGBA;
  x: number;
  y: number;
  width: number;
  height: number;
}
export type TextureAtlasBuilderItemKind = 'regular' | 'matte' | 'shimmer' | 'glitter';

function initializeEmptyAtlasBuilder (maxColumns: number, itemSize: number, gap: number): TextureAtlasBuilderInfo {
  return {
    items: [],
    columns: maxColumns,
    width: maxColumns * (itemSize + gap) + gap,
    // We'll wait until we've fully populated the atlas before calculating the final height of the atlas texture.
    height: 0,
    itemSize,
    gap,
  };
}

function appendImageInfoToAtlasBuilder (atlas: TextureAtlasBuilderInfo, name: string, kind: TextureAtlasBuilderItemKind, color: RGBA) {
  const col = atlas.items.length % atlas.columns;
  let x: number, y: number;

  if (atlas.items.length === 0) {
    // First image
    x = atlas.gap;
    y = atlas.gap;
  }
  else {
    const last = atlas.items[atlas.items.length - 1];
    if (col === 0) {
      // First image of a new row
      x = atlas.gap;
      y = last.y + last.height + atlas.gap;
    }
    else {
      // Next image in an existing row
      x = last.x + last.width + atlas.gap;
      y = last.y; // y value is the same as the previous item
    }
  }
  const index = atlas.items.length;
  atlas.items.push({
    name,
    kind,
    color,
    x,
    y,
    width: atlas.itemSize,
    height: atlas.itemSize,
  });

  return index;
}

/**
 * Produces the PNG file that will eventually be imported as a .xbm file. Also computes values for each of the
 * `clippingRectInUVCoords` objects associated with each item in the atlas. The caller then has the freedom to interate
 * through the items and collect those details as needed.
 */
export async function generateAtlasImageAndData (project: WolvenKitProject, atlas: TextureAtlasBuilderInfo) {
  const last = atlas.items[atlas.items.length - 1];
  atlas.height = last.y + last.height + atlas.gap;

  const inkatlasFile = project.getArchiveFile(`${project.config.shortName}-palette.inkatlas`);
  const xbmFile = project.getArchiveFile(`textures\\${project.config.shortName}-palette-atlas.xbm`);

  const inkAtlas = RE.inkTextureAtlas({
    activeTexture: 'StaticTexture',
    textureResolution: 'UltraHD_3840_2160',
    texture: RE.ResourceReference({ Flags: 'Soft' }),
    dynamicTexture: RE.ResourceReference({ Flags: 'Soft' }),
    dynamicTextureSlot: RE.inkDynamicTextureSlot({
      texture: RE.ResourceReference({ Flags: 'Soft' }),
    }),
    slots: {
      Elements: [
        RE.inkTextureSlot({
          texture: RE.ResourceReference({
            DepotPath: xbmFile.archiveFullRelativePath,
            Flags: 'Soft',
          }),
        }),
        RE.inkTextureSlot({ texture: RE.ResourceReference({ Flags: 'Soft' }) }),
        RE.inkTextureSlot({ texture: RE.ResourceReference({ Flags: 'Soft' }) }),
      ],
    },
    isSingleTextureMode: 1,
  });

  const file_img_base_matte = Bun.file(project.config.projectDir + '\\assets\\inputs\\thumbnails\\thumbnail-base-matte.png');
  const file_img_base_regular = Bun.file(project.config.projectDir + '\\assets\\inputs\\thumbnails\\thumbnail-base-regular.png');
  const file_img_base_shimmer = Bun.file(project.config.projectDir + '\\assets\\inputs\\thumbnails\\thumbnail-base-shimmer.png');
  const file_img_base_shimmer_sheen = Bun.file(project.config.projectDir + '\\assets\\inputs\\thumbnails\\thumbnail-base-shimmer-sheen.png');
  const file_img_base_shimmer_glint = Bun.file(project.config.projectDir + '\\assets\\inputs\\thumbnails\\thumbnail-base-shimmer-glint.png');
  const file_img_base_glitter = Bun.file(project.config.projectDir + '\\assets\\inputs\\thumbnails\\thumbnail-base-glitter.png');
  const file_img_base_glitter_sparkles = Bun.file(project.config.projectDir + '\\assets\\inputs\\thumbnails\\thumbnail-base-glitter-sparkles.png');

  const file_img_text_matte = Bun.file(project.config.projectDir + '\\assets\\inputs\\thumbnails\\thumbnail-text-matte.png');
  const file_img_text_regular = Bun.file(project.config.projectDir + '\\assets\\inputs\\thumbnails\\thumbnail-text-regular.png');
  const file_img_text_shimmer = Bun.file(project.config.projectDir + '\\assets\\inputs\\thumbnails\\thumbnail-text-shimmer.png');
  const file_img_text_glitter = Bun.file(project.config.projectDir + '\\assets\\inputs\\thumbnails\\thumbnail-text-glitter.png');
  const file_img_text_underlay = Bun.file(project.config.projectDir + '\\assets\\inputs\\thumbnails\\thumbnail-text-underlay.png');

  const stat_img_base_matte = await file_img_base_matte.stat();
  const stat_img_base_regular = await file_img_base_regular.stat();
  const stat_img_base_shimmer = await file_img_base_shimmer.stat();
  const stat_img_base_shimmer_sheen = await file_img_base_shimmer_sheen.stat();
  const stat_img_base_shimmer_glint = await file_img_base_shimmer_glint.stat();
  const stat_img_base_glitter = await file_img_base_glitter.stat();
  const stat_img_base_glitter_sparkles = await file_img_base_glitter_sparkles.stat();
  const stat_img_text_matte = await file_img_text_matte.stat();
  const stat_img_text_regular = await file_img_text_regular.stat();
  const stat_img_text_shimmer = await file_img_text_shimmer.stat();
  const stat_img_text_glitter = await file_img_text_glitter.stat();
  const stat_img_text_underlay = await file_img_text_underlay.stat();

  const mostRecentBaseImageModifiedTime = [
    stat_img_base_matte,
    stat_img_base_regular,
    stat_img_base_shimmer,
    stat_img_base_shimmer_sheen,
    stat_img_base_shimmer_glint,
    stat_img_base_glitter,
    stat_img_base_glitter_sparkles,
    stat_img_text_matte,
    stat_img_text_regular,
    stat_img_text_shimmer,
    stat_img_text_glitter,
    stat_img_text_underlay,
  ].sort((a, b) => b.mtime.getTime() - a.mtime.getTime())[0].mtime;

  const xbmModifiedTime = await xbmFile.cr2wFileSource.getModifiedTime();
  const shouldUpdateAtlasTexture = xbmModifiedTime < mostRecentBaseImageModifiedTime;

  let img_base_matte!: sharp.Sharp;
  let img_base_regular!: sharp.Sharp;
  let img_base_shimmer!: sharp.Sharp;
  let img_base_shimmer_sheen!: sharp.Sharp;
  let img_base_shimmer_glint!: sharp.Sharp;
  let img_base_glitter!: sharp.Sharp;
  let img_base_glitter_sparkles!: sharp.Sharp;
  let img_text_matte!: sharp.Sharp;
  let img_text_regular!: sharp.Sharp;
  let img_text_shimmer!: sharp.Sharp;
  let img_text_glitter!: sharp.Sharp;
  let img_text_underlay!: sharp.Sharp;

  if (shouldUpdateAtlasTexture) {
    img_base_matte = sharp(file_img_base_matte.name);
    img_base_regular = sharp(file_img_base_regular.name);
    img_base_shimmer = sharp(file_img_base_shimmer.name);
    img_base_shimmer_sheen = sharp(file_img_base_shimmer_sheen.name);
    img_base_shimmer_glint = sharp(file_img_base_shimmer_glint.name);
    img_base_glitter = sharp(file_img_base_glitter.name);
    img_base_glitter_sparkles = sharp(file_img_base_glitter_sparkles.name);
    img_text_matte = sharp(file_img_text_matte.name);
    img_text_regular = sharp(file_img_text_regular.name);
    img_text_shimmer = sharp(file_img_text_shimmer.name);
    img_text_glitter = sharp(file_img_text_glitter.name);
    img_text_underlay = sharp(file_img_text_underlay.name);
  }

  const atlasImage = sharp({
    create: {
      width: atlas.width,
      height: atlas.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  const composites: sharp.OverlayOptions[] = [];
  const tweakInstances: any[] = [];

  for (const image of atlas.items) {
    const color = image.color;
    const hsla = rgbaToHSLA({ r: color.r / 255, g: color.g / 255, b: color.b / 255, a: color.a / 255 });

    if (shouldUpdateAtlasTexture) {
      let image_base: sharp.Sharp;
      let image_text: sharp.Sharp;
      switch (image.kind) {
        case 'matte': [image_base, image_text] = [img_base_matte, img_text_matte]; break;
        case 'regular': [image_base, image_text] = [img_base_regular, img_text_regular]; break;
        case 'shimmer': [image_base, image_text] = [img_base_shimmer, img_text_shimmer]; break;
        case 'glitter': [image_base, image_text] = [img_base_glitter, img_text_glitter]; break;
      }

      const tintedImage = image_base
        .clone()
        .modulate({ brightness: hsla.l })
        .tint({ r: color.r, g: color.g, b: color.b, alpha: color.a })
        ;

      const buffer = await tintedImage.toBuffer();
      composites.push({
        input: buffer,
        left: image.x,
        top: image.y,
      });
      if (image.kind === 'glitter') {
        composites.push({
          input: await img_base_glitter_sparkles.toBuffer(),
          left: image.x,
          top: image.y,
          blend: 'colour-dodge',
        });
        composites.push({
          input: await image_text.clone().modulate({ lightness: 10, brightness: 1.35 }).toBuffer(),
          left: image.x,
          top: image.y,
          blend: 'color-dodge',
        });
      }
      else {
        if (image.kind === 'shimmer') {
          composites.push({
            input: await img_base_shimmer_sheen.toBuffer(),
            left: image.x,
            top: image.y,
            blend: 'overlay',
          }, {
            input: await img_base_shimmer_glint.toBuffer(),
            left: image.x,
            top: image.y,
            blend: 'screen',
          });
        }
        composites.push({
          input: await image_text.toBuffer(),
          left: image.x,
          top: image.y,
          blend: 'color-dodge',
        });
      }
    }

    inkAtlas.slots.Elements[0].parts.push(RE.inkTextureAtlasMapper({
      partName: image.name,
      clippingRectInUVCoords: RE.RectF({
        Left: image.x / atlas.width,
        Top: image.y / atlas.height,
        Right: (image.x + image.width) / atlas.width,
        Bottom: (image.y + image.height) / atlas.height,
      }),
    }));

    tweakInstances.push(
      `- { option: ${image.name}, definition: ${image.name} }`
    );
  }


  const tweakXLYAML = Block.join([
    `OptionsIcons.Id_${project.config.shortName}_colours_$(option):`, [
      `$type: gamedataUIIcon_Record`,
      `$instances:`, tweakInstances,
      `atlasPartName: $(definition)`,
      `atlasResourcePath: ${inkatlasFile.archiveFullRelativePath}`,
    ],
  ]);
  const tweakXLYAMLFile = Bun.file(project.config.resolveResourcesPath(`r6\\tweaks\\${project.config.modderName}\\${project.config.archiveName}.yaml`));
  await Bun.write(tweakXLYAMLFile, tweakXLYAML, { createPath: true });
  console.log(`Saved ${tweakInstances.length} icon declarations to ${tweakXLYAMLFile.name}.`);

  if (shouldUpdateAtlasTexture) {
    // Composite all tinted images onto the main atlas image
    const outputFilename = project.config.projectDir + '\\assets\\thumbnail-atlas.png';
    await xbmFile.ensureRawFileDir();
    await atlasImage.composite(composites).png().toFile(xbmFile.pngFilePath);

    console.log(`${atlas.items.length} images written to texture atlas ${outputFilename}. `);
    console.log(`Importing atlas png file from 'raw' dir to 'archive' dir as ${xbmFile.cr2wFileName}...`);
    await xbmFile.importPNG();
    // But wait, there's more! Unfortunately the xbm file will end up with the `setup.group` property incorrectly
    // configured. It needs to be TEXG_Generic_UI but is imported as TEXG_Generic_Color, which will make it look all
    // weird and washed out in the game. To fix, we'll now export the xbm back to a JSON file this time (complete with
    // massive blobs of base64 data), make our adjustments, and then import it back again.
    console.log(`Exporting xbm file to JSON in order to tweak the setup data...`);
    const xbmData = await xbmFile.exportJSON();
    xbmData.Data.RootChunk.setup.group = 'TEXG_Generic_UI';
    console.log(`Saving changes back to the JSON file and reimporting to xbm...`);
    await xbmFile.saveAndImportJSON(xbmData);
  }
  else {
    console.log(`Texture atlas PNG file already up to date, skipping texture generation.`);
  }

  console.log(`Saving inkatlas JSON file to 'raw', then importing to 'archive' dir as ${inkatlasFile.cr2wFileName}...`);
  if (!await inkatlasFile.saveAndImportJSON(RedEngineFile(inkAtlas))) {
    console.log(`JSON had not changed since last import, skipping.`);
  }
}
