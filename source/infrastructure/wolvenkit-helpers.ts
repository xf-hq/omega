import { AssociativeWeakSet } from '@xf-common/facilities/weak-reference-management';
import FS from 'node:fs';
import FSP from 'node:fs/promises';
import OS from 'node:os';
import Path from 'node:path';
import type { UserConfig, UserProjectConfig } from '../config';
import type { RedEngine, RedEngineFile } from '../red-engine/red-engine-types';
import { FileSource } from './file-system';
import { WolvenKitCLI } from './wolvenkit-cli';

export class WolvenKitProject {
  constructor (private readonly userConfig: UserConfig, projectName: string) {
    const projectConfig = userConfig.project(projectName)!;
    if (!projectConfig) {
      throw new Error(`Project ${projectName} not found in config`);
    }
    this.#projectConfig = projectConfig;
    this.#cli = new WolvenKitCLI(userConfig);
  }
  readonly #projectConfig: UserProjectConfig;
  readonly #cli: WolvenKitCLI;
  readonly #fileCache = new AssociativeWeakSet<string, WolvenKitProjectFile>();

  get label (): string { return this.#projectConfig.label; }
  get config (): UserProjectConfig { return this.#projectConfig; }
  get cli (): WolvenKitCLI { return this.#cli; }

  getArchiveFile (relativePath: `${string}.app`): WolvenKitProjectFile<RedEngine.appearanceAppearanceResource>;
  getArchiveFile (relativePath: `${string}.mesh`): WolvenKitProjectFile<RedEngine.CMesh>;
  getArchiveFile (relativePath: `${string}.morphtarget`): WolvenKitProjectFile<RedEngine.MorphTargetMesh>;
  getArchiveFile (relativePath: `${string}.inkcharcustomization`): WolvenKitProjectFile<RedEngine.gameuiCharacterCustomizationInfoResource>;
  getArchiveFile (relativePath: `${string}.inkatlas`): WolvenKitProjectFile<RedEngine.inkTextureAtlas>;
  getArchiveFile (relativePath: `${string}.mi`): WolvenKitProjectFile<RedEngine.CMaterialInstance>;
  getArchiveFile (relativePath: `${string}.xbm`): WolvenKitProjectFile<RedEngine.CBitmapTexture>;
  getArchiveFile<T extends RedEngine.DataObject> (relativePath: string): WolvenKitProjectFile<T>;
  getArchiveFile (relativePath: string) {
    let file = this.#fileCache.get(relativePath);
    if (!file) {
      file = new WolvenKitProjectFile(this.#cli, this.#projectConfig, relativePath);
      this.#fileCache.set(relativePath, file);
    }
    return file;
  }

  async purgeFromModOrganizer2Overwrite (): Promise<void> {
    const mo2dir = this.userConfig.modOrganizer2Directory;
    if (!mo2dir) return;
    const baseDir = Path.join(mo2dir, 'overwrite\\archive\\pc');
    const glob = new Bun.Glob(`${baseDir}\\{hot,mod}\\${this.#projectConfig.archiveName}.*`);
    for await (const file of glob.scan({ absolute: true, onlyFiles: true })) {
      await FSP.unlink(file);
      console.log('[Purge MO2 overwrite]', file);
    }
  }

  async purgeFromHotReloadDirectory (): Promise<void> {
    const gameDir = this.userConfig.cyberpunk2077GameDirectory;
    if (!gameDir) {
      console.warn(`UserConfig does not have a cyberpunk2077GameDirectory set, cannot purge hot reload directory.`);
      return;
    }
    const hotReloadDir = Path.join(gameDir, 'archive', 'pc', 'hot');
    if (await FSP.exists(hotReloadDir)) {
      const glob = new Bun.Glob(`${hotReloadDir}\\${this.#projectConfig.archiveName}.*`);
      for await (const file of glob.scan({ absolute: true, onlyFiles: true })) {
        await FSP.unlink(file);
        console.log('[Purge Hot Reload]', file);
      }
    }
  }

  async install (hotReload = false): Promise<void> {
    if (hotReload) {
      if (!await this.userConfig.isGameRunning()) {
        hotReload = false;
        console.warn(`Game is not running. Mod will be installed to the mod directory normally. Hot reload option ignored.`);
      }
    }
    if (!hotReload) {
      await this.purgeFromModOrganizer2Overwrite();
    }

    const gameDir = this.userConfig.cyberpunk2077GameDirectory;
    if (!gameDir) {
      console.warn(`UserConfig does not have a cyberpunk2077GameDirectory set, cannot hot reload.`);
      return;
    }
    const tempArchivePath = await this.buildArchiveToTempDir();
    const baseDir = Path.join(gameDir, 'archive', 'pc');
    const modDir = Path.join(baseDir, 'mod');
    const archiveDestDir = hotReload ? Path.join(baseDir, 'hot') : modDir;

    if (!hotReload) {
      await this.purgeFromHotReloadDirectory();
    }

    // If drive is the same, we can use rename, otherwise we need to copy
    if (Path.parse(tempArchivePath).root === Path.parse(archiveDestDir).root) {
      await FSP.rename(tempArchivePath, Path.join(archiveDestDir, Path.basename(tempArchivePath)));
    }
    else {
      await FSP.copyFile(tempArchivePath, Path.join(archiveDestDir, Path.basename(tempArchivePath)));
      await FSP.unlink(tempArchivePath);
    }
    await FSP.copyFile(this.#projectConfig.xlFilePath, Path.join(modDir, this.#projectConfig.xlFilename));

    console.log(`Project ${this.label} installed to game ${hotReload ? 'hot reload' : 'mod'} directory.`);
  }

  async buildArchiveToTempDir (): Promise<string> {
    const osTempDir = Path.join(OS.tmpdir(), 'xf-cp2077', this.#projectConfig.archiveName);
    await FSP.mkdir(osTempDir, { recursive: true });
    await this.#cli.pack({
      directoryPathsToPack: [this.#projectConfig.archiveDir],
      outputDirectory: osTempDir,
    });
    const glob = new Bun.Glob(`${osTempDir}\\*.archive`);
    const paths: string[] = [];
    const stats_: Promise<FS.Stats>[] = [];
    for await (const file of glob.scan({ absolute: true, onlyFiles: true })) {
      paths.push(file);
      stats_.push(FSP.stat(file));
    }
    if (paths.length === 0) {
      throw new Error(`No archive files found in ${osTempDir}. This is a problem. Check the console output for possible errors.`);
    }
    const stats = (await Promise.all(stats_)).map((s, i) => [s, paths[i]] as const);
    stats.sort((a, b) => b[0].mtimeMs - a[0].mtimeMs);
    const desiredArchiveFilename = `${this.#projectConfig.archiveName}.archive`;
    const initialArchivePath = stats[0][1];
    if (Path.basename(initialArchivePath) === desiredArchiveFilename) return initialArchivePath;
    const finalArchivePath = Path.join(osTempDir, desiredArchiveFilename);
    if (await FSP.exists(finalArchivePath)) await FSP.unlink(finalArchivePath);
    await FSP.rename(initialArchivePath, finalArchivePath);
    return finalArchivePath;
  }
}

export class WolvenKitProjectFile<T extends RedEngine.DataObject = RedEngine.DataObject> {
  constructor (
    private readonly cli: WolvenKitCLI,
    private readonly projectConfig: UserProjectConfig,
    public readonly relativePath: string
  ) {}
  #cr2wFilePath: string | undefined;
  #cr2wFileName: string | undefined;
  #cr2wFileDir: string | undefined;
  #rawFilePath: string | undefined;
  #rawFileDir: string | undefined;
  #jsonFilePath: string | undefined;
  #pngFilePath: string | undefined;
  #jpgFilePath: string | undefined;
  #cr2wFileSource: FileSource | undefined;
  #jsonFileSource: FileSource | undefined;
  #archiveFullRelativePath: string | undefined;

  get cr2wFilePath (): string {
    return this.#cr2wFilePath ??= this.projectConfig.resolveCR2WPath(this.relativePath);
  }
  get cr2wFileName (): string {
    return this.#cr2wFileName ??= Path.basename(this.cr2wFilePath);
  }
  get cr2wFileDir (): string {
    return this.#cr2wFileDir ??= Path.dirname(this.cr2wFilePath);
  }
  get rawFilePath (): string {
    return this.#rawFilePath ??= this.projectConfig.resolveRawPath(this.relativePath);
  }
  get rawFileDir (): string {
    return this.#rawFileDir ??= Path.dirname(this.rawFilePath);
  }
  get jsonFilePath (): string {
    return this.#jsonFilePath ??= this.projectConfig.resolveRawPath(this.relativePath) + '.json';
  }
  get pngFilePath (): string {
    return this.#pngFilePath ??= this.projectConfig.resolveRawPath(this.relativePath.slice(0, -Path.extname(this.relativePath).length)) + '.png';
  }
  get jpgFilePath (): string {
    return this.#jpgFilePath ??= this.projectConfig.resolveRawPath(this.relativePath.slice(0, -Path.extname(this.relativePath).length)) + '.jpg';
  }
  get cr2wFileSource (): FileSource {
    return this.#cr2wFileSource ??= new FileSource(this.cr2wFilePath);
  }
  get jsonFileSource (): FileSource {
    return this.#jsonFileSource ??= new FileSource(this.jsonFilePath);
  }
  get archiveFullRelativePath (): string {
    return this.#archiveFullRelativePath ??= Path.join(this.projectConfig.conventionalRootDir ?? '', this.relativePath);
  }

  async ensureCR2WFileDir (): Promise<void> {
    await FSP.mkdir(this.cr2wFileDir, { recursive: true });
  }
  async ensureRawFileDir (): Promise<void> {
    await FSP.mkdir(this.rawFileDir, { recursive: true });
  }

  /**
   * Uses the WolvenKit CLI to export the cr2w file to its raw path. Only use this for textures and meshes. Regular data
   * files should be exported using the `exportJSON` method.
   */
  async export (): Promise<void> {
    await this.cli.export({
      filePathToExport: this.cr2wFilePath,
      outputDirectory: this.rawFileDir,
    });
  }

  async exportJSON (force = false): Promise<RedEngineFile<T>> {
    let requiresConversion = force;
    if (!force) {
      const [crw2exists, jsonExists] = await Promise.all([
        this.cr2wFileSource.exists(),
        this.jsonFileSource.exists(),
      ]);
      requiresConversion = !crw2exists || !jsonExists;
    }
    if (!requiresConversion) {
      const cr2wModifiedTime = await this.cr2wFileSource.getModifiedTime();
      const jsonModifiedTime = await this.jsonFileSource.getModifiedTime();
      requiresConversion = cr2wModifiedTime > jsonModifiedTime;
    }
    if (requiresConversion) {
      await this.cli.convertToJSON({
        filePathToConvert: this.cr2wFilePath,
        outputDirectory: this.rawFileDir,
      });
    }
    const text = await this.jsonFileSource.readText();
    return JSON.parse(text);
  }

  /**
   * Uses the WolvenKit CLI to import the raw file to its cr2w path. Only use this for textures and meshes. Regular data
   * files should be imported using the `importJSON` method.
   */
  async import (fromPath: string): Promise<void> {
    const ext = Path.extname(fromPath);
    const rawPath = this.rawFilePath.substring(0, this.rawFilePath.length - Path.extname(this.rawFilePath).length) + ext;
    await FSP.copyFile(fromPath, rawPath);
    await this.cli.import({
      filePathToImport: rawPath,
      outputDirectory: this.cr2wFileDir,
    });
  }

  async importPNG (): Promise<void> {
    await this.import(this.pngFilePath);
  }
  async importJPG (): Promise<void> {
    await this.import(this.jpgFilePath);
  }
  async importJSON (): Promise<void> {
    await this.cli.convertFromJSON({
      filePathToConvert: this.jsonFilePath,
      outputDirectory: this.cr2wFileDir,
      // verbosity: 'quiet',
    });
  }

  async copyJSONFrom (path: string): Promise<void> {
    await FSP.copyFile(path, this.jsonFilePath);
  }
  async copyAndImportJSON (fromPath: string): Promise<void> {
    await this.copyJSONFrom(fromPath);
    await this.importJSON();
  }

  async saveJSON (data: RedEngineFile<T>): Promise<void> {
    await this.jsonFileSource.writeText(JSON.stringify(data, null, 2));
  }
  async saveAndImportJSON (data: RedEngineFile<T>): Promise<boolean> {
    const oldJSON = await this.jsonFileSource.readText().catch(() => '{}');
    const newJSON = JSON.stringify(data, null, 2);
    if (oldJSON === newJSON) {
      const cr2wTime = await this.cr2wFileSource.getModifiedTime();
      const jsonTime = await this.jsonFileSource.getModifiedTime();
      if (cr2wTime > jsonTime) {
        return false;
      }
    }
    await this.jsonFileSource.writeText(newJSON);
    await this.importJSON();
    return true;
  }
}


export class FileSaverAndImporterUtility {
  static MAX_SIMULTANEOUS_JOBS = 5;

  readonly #queue: { file: WolvenKitProjectFile; data?: any }[] = [];
  #processing = 0;
  #allSaved = Promise.withResolvers<void>();
  #done = false;

  addToQueue (file: WolvenKitProjectFile, data?: any): void {
    if (this.#done) {
      throw new Error('Cannot add to queue after done() has been called.');
    }
    this.#queue.push({ file, data });
    this.processNextFile();
  }

  private processNextFile (): void {
    if (this.#processing >= FileSaverAndImporterUtility.MAX_SIMULTANEOUS_JOBS) {
      return;
    }
    const next = this.#queue.shift();
    if (!next) {
      if (this.#done && this.#processing === 0) {
        this.#allSaved.resolve();
      }
      return;
    }
    ++this.#processing;
    console.log('Saving: ', next.file.archiveFullRelativePath);
    if (next.data) {
      next.file.saveAndImportJSON(next.data).then(() => {
        --this.#processing;
        this.processNextFile();
      });
    }
    else {
      next.file.importJSON().then(() => {
        --this.#processing;
        this.processNextFile();
      });
    }
    this.processNextFile();
  }

  done (): void {
    this.#done = true;
    if (this.#processing === 0 && this.#queue.length === 0) {
      this.#allSaved.resolve();
    }
  }

  async allSaved (): Promise<void> {
    return this.#allSaved.promise;
  }
}
