import * as FSP from 'fs/promises';
import * as Process from 'process';
import YAML from 'yaml';
import OS from 'os';
import Path from 'path';

const DEFAULT_CONFIG_FILENAME = '.xf.yaml';
const DEFAULT_CONFIG_FILE_PATH = Path.join(OS.homedir(), DEFAULT_CONFIG_FILENAME);

export class UserConfig {
  constructor (data?: UserConfigData) {
    this.#data = data;
  }
  #data: UserConfigData | undefined;
  #wolvenKitCLIExePath: string | null | undefined;
  #cyberpunk2077GameDirectory: string | null | undefined;
  #modOrganizer2Directory: string | null | undefined;
  #projectsDir: string | null | undefined;
  #defaultProjectSourceDir: string | null | undefined;
  #defaultProjectArchiveDir: string | null | undefined;
  #defaultProjectRawDir: string | null | undefined;
  #defaultProjectResourcesDir: string | null | undefined;
  #defaultConventionalRootDirPattern: string | null | undefined;
  #defaultModderName: string | null | undefined;
  #projects: Record<string, UserProjectConfig> | undefined;

  get wolvenKitCLIExePath (): string | null {
    this.assertDataLoaded();
    return this.#wolvenKitCLIExePath !== undefined
      ? this.#wolvenKitCLIExePath
      : this.#wolvenKitCLIExePath = this.#data?.wolvenKitCLIExePath ?? null;
  }
  get cyberpunk2077GameDirectory (): string | null {
    this.assertDataLoaded();
    return this.#cyberpunk2077GameDirectory !== undefined
      ? this.#cyberpunk2077GameDirectory
      : this.#cyberpunk2077GameDirectory = this.#data?.cyberpunk2077GameDirectory ?? null;
  }

  get modOrganizer2Directory (): string | null {
    this.assertDataLoaded();
    return this.#modOrganizer2Directory !== undefined
      ? this.#modOrganizer2Directory
      : this.#modOrganizer2Directory = this.#data?.modOrganizer2Directory ?? null;
  }

  get projectsDir (): string | null {
    this.assertDataLoaded();
    return this.#projectsDir !== undefined
      ? this.#projectsDir
      : this.#projectsDir = this.#data?.projectsDir ?? null;
  }

  get defaultProjectSourceDir (): string | null {
    this.assertDataLoaded();
    if (this.#defaultProjectSourceDir !== undefined) return this.#defaultProjectSourceDir;
    // Defaults to 'source' if omitted, null means fallback to project root
    return this.#defaultProjectSourceDir = this.#data?.defaultProjectSourceDir === undefined
      ? 'source'
      : this.#data.defaultProjectSourceDir;
  }

  get defaultProjectArchiveDir (): string | null {
    this.assertDataLoaded();
    if (this.#defaultProjectArchiveDir !== undefined) return this.#defaultProjectArchiveDir;
    // Defaults to 'archive' if omitted, null means fallback to source dir
    return this.#defaultProjectArchiveDir = this.#data?.defaultProjectArchiveDir === undefined
      ? 'archive'
      : this.#data.defaultProjectArchiveDir;
  }

  get defaultProjectRawDir (): string | null {
    this.assertDataLoaded();
    if (this.#defaultProjectRawDir !== undefined) return this.#defaultProjectRawDir;
    // Defaults to 'raw' if omitted, null means fallback to source dir
    return this.#defaultProjectRawDir = this.#data?.defaultProjectRawDir === undefined
      ? 'raw'
      : this.#data.defaultProjectRawDir;
  }

  get defaultProjectResourcesDir (): string | null {
    this.assertDataLoaded();
    if (this.#defaultProjectResourcesDir !== undefined) return this.#defaultProjectResourcesDir;
    // Defaults to 'resources' if omitted, null means fallback to source dir
    return this.#defaultProjectResourcesDir = this.#data?.defaultProjectResourcesDir === undefined
      ? 'resources'
      : this.#data.defaultProjectResourcesDir;
  }

  get defaultConventionalRootDirPattern (): string | null {
    this.assertDataLoaded();
    if (this.#defaultConventionalRootDirPattern !== undefined) return this.#defaultConventionalRootDirPattern;
    // Defaults to 'base\\{MODDER_NAME}\\{ARCHIVE_NAME}' if omitted, null means fallback to archive/raw dir
    return this.#defaultConventionalRootDirPattern = this.#data?.defaultConventionalRootDirPattern === undefined
      ? 'base\\{MODDER_NAME}\\{ARCHIVE_NAME}'
      : this.#data.defaultConventionalRootDirPattern;
  }

  get defaultModderName (): string | null {
    this.assertDataLoaded();
    return this.#defaultModderName !== undefined
      ? this.#defaultModderName
      : this.#defaultModderName = this.#data?.modderName ?? null;
  }

  get projects (): Readonly<Record<string, UserProjectConfig>> {
    this.assertDataLoaded();
    if (this.#projects === undefined) {
      this.#projects = {};
      if (this.#data?.projects) {
        for (const archiveName in this.#data.projects) {
          const projectData = this.#data.projects[archiveName];
          // Ensure projectData is not undefined before creating UserProjectConfig
          if (projectData) {
            this.#projects[archiveName] = new UserProjectConfig(archiveName, projectData, this);
          }
        }
      }
    }
    return this.#projects;
  }

  project (archiveName: string): UserProjectConfig | undefined {
    this.assertDataLoaded();
    return this.projects[archiveName];
  }

  async load (path?: string): Promise<void> {
    this.resetAllData();
    const configPath = path ?? await getClosestUserConfigPath() ?? DEFAULT_CONFIG_FILE_PATH;
    try {
      const fileContent = await FSP.readFile(configPath, 'utf-8');
      this.#data = YAML.parse(fileContent) as UserConfigData;
    }
    catch (error: any) {
      if (error?.code === 'ENOENT') {
        // If the default config path doesn't exist, treat it as empty config
        if (configPath === DEFAULT_CONFIG_FILE_PATH) {
          this.#data = {} as UserConfigData; // Allow operation with no config file
        }
        else {
          throw new Error(`User config file not found at ${configPath}`);
        }
      }
      else {
        throw new Error(`Failed to load or parse user config from ${configPath}: ${error.message}`);
      }
    }
  }

  async isGameRunning (): Promise<boolean> {
    try {
      await Bun.$`powershell.exe -NoProfile -Command "Get-Process -Name 'Cyberpunk2077' -ErrorAction SilentlyContinue"`;
      return true;
    }
    catch (error) {
      if (error.exitCode === 1) return false;
      throw new Error(`Failed to check if game is running: ${error.message}`);
    }
  }

  private resetAllData (): void {
    if (this.#data === undefined) return;
    this.#data = undefined;
    this.#wolvenKitCLIExePath = undefined;
    this.#cyberpunk2077GameDirectory = undefined;
    this.#projectsDir = undefined;
    this.#defaultProjectSourceDir = undefined;
    this.#defaultProjectArchiveDir = undefined;
    this.#defaultProjectRawDir = undefined;
    this.#defaultProjectResourcesDir = undefined;
    this.#defaultConventionalRootDirPattern = undefined;
    this.#defaultModderName = undefined;
    this.#projects = undefined;
  }

  private assertDataLoaded (): void {
    if (this.#data === undefined) {
      throw new Error('UserConfig data not loaded. Call load() first.');
    }
  }
}

export class UserProjectConfig {
  readonly archiveName: string;
  readonly #data: UserModdingProjectData;
  readonly #parentConfig: UserConfig;

  #shortName: string | undefined;
  #modderName: string | null | undefined;
  #projectDir: string | undefined;
  #sourceDir: string | undefined;
  #archiveDir: string | undefined;
  #rawDir: string | undefined;
  #resourcesDir: string | undefined;
  #conventionalRootDir: string | null | undefined;
  #xlFilename: string | undefined;
  #xlFilePath: string | undefined;

  constructor (archiveName: string, data: UserModdingProjectData, parentConfig: UserConfig) {
    this.archiveName = archiveName;
    this.#data = data;
    this.#parentConfig = parentConfig;
  }

  get label (): string { return this.#data.label; }

  get shortName (): string {
    return this.#shortName !== undefined
      ? this.#shortName
      : this.#shortName = this.#data.shortName ?? this.archiveName;
  }

  get modderName (): string | null {
    return this.#modderName !== undefined
      ? this.#modderName
      : this.#modderName = this.#data.modderName ?? this.#parentConfig.defaultModderName;
  }

  get projectDir (): string {
    if (this.#projectDir !== undefined) return this.#projectDir;

    const projDir = this.#data.projectDir;
    if (projDir) {
      if (Path.isAbsolute(projDir)) {
        return this.#projectDir = projDir;
      }
      else {
        const baseProjectsDir = this.#parentConfig.projectsDir;
        if (!baseProjectsDir) {
          throw new Error(`Project "${this.archiveName}" specifies a relative path, but UserConfig.projectsDir is not set.`);
        }
        return this.#projectDir = Path.resolve(baseProjectsDir, projDir);
      }
    }
    else {
      // If projectDir is not specified for the project, assume it's in a subdir named after the project
      // within the main projectsDir
      const baseProjectsDir = this.#parentConfig.projectsDir;
      if (!baseProjectsDir) {
        throw new Error(`Project "${this.archiveName}" does not specify projectDir, and UserConfig.projectsDir is not set.`);
      }
      return this.#projectDir = Path.resolve(baseProjectsDir, this.archiveName);
    }
  }

  get sourceDir (): string {
    if (this.#sourceDir !== undefined) return this.#sourceDir;

    const projSourceDir = this.#data.sourceDir ?? this.#parentConfig.defaultProjectSourceDir;
    return this.#sourceDir = projSourceDir === null
      ? this.projectDir // null means fallback to project root
      : Path.resolve(this.projectDir, projSourceDir);
  }

  get archiveDir (): string {
    if (this.#archiveDir !== undefined) return this.#archiveDir;

    const projArchiveDir = this.#data.archiveDir ?? this.#parentConfig.defaultProjectArchiveDir;
    return this.#archiveDir = projArchiveDir === null
      ? this.sourceDir // null means fallback to source dir
      : Path.resolve(this.sourceDir, projArchiveDir);
  }

  get rawDir (): string {
    if (this.#rawDir !== undefined) return this.#rawDir;

    const projRawDir = this.#data.rawDir ?? this.#parentConfig.defaultProjectRawDir;
    return this.#rawDir = projRawDir === null
      ? this.sourceDir // null means fallback to source dir
      : Path.resolve(this.sourceDir, projRawDir);
  }

  get resourcesDir (): string {
    if (this.#resourcesDir !== undefined) return this.#resourcesDir;

    const projResourcesDir = this.#data.resourcesDir ?? this.#parentConfig.defaultProjectResourcesDir;
    return this.#resourcesDir = projResourcesDir === null
      ? this.sourceDir // null means fallback to source dir
      : Path.resolve(this.sourceDir, projResourcesDir);
  }

  get conventionalRootDir (): string | null {
    if (this.#conventionalRootDir !== undefined) return this.#conventionalRootDir;

    const pattern = this.#data.conventionalRootDirPattern ?? this.#parentConfig.defaultConventionalRootDirPattern;
    if (pattern === null) {
      return this.#conventionalRootDir = null; // null means fallback to archive/raw dir (handled by consumer)
    }

    const modderName = this.modderName;
    if (pattern.includes('{MODDER_NAME}') && !modderName) {
      console.warn(`Project "${this.archiveName}" uses {MODDER_NAME} in conventionalRootDirPattern, but no modder name is defined.`);
      // Fallback to null if pattern requires modder name but none is available
      return this.#conventionalRootDir = null;
    }

    let resolvedPath = pattern.replace('{ARCHIVE_NAME}', this.archiveName);
    if (modderName) {
      resolvedPath = resolvedPath.replace('{MODDER_NAME}', modderName);
    }

    // The conventional root is relative to the archive/raw dirs, not the project root
    return this.#conventionalRootDir = resolvedPath;
  }

  get xlFilename (): string {
    return this.#xlFilename ??= `${this.archiveName}.xl`;
  }
  get xlFilePath (): string {
    return this.#xlFilePath ??= this.resolveResourcesPath(this.xlFilename);
  }

  /** Resolves a relative path against the conventional root within the archive directory. */
  resolveCR2WPath (relativePath: string): string {
    const conventionalRoot = this.conventionalRootDir;
    const baseDir = this.archiveDir;
    return conventionalRoot
      ? Path.join(baseDir, conventionalRoot, relativePath)
      : Path.join(baseDir, relativePath);
  }

  /** Resolves a relative path against the conventional root within the raw directory. */
  resolveRawPath (relativePath: string): string {
    const conventionalRoot = this.conventionalRootDir;
    const baseDir = this.rawDir;
    return conventionalRoot
      ? Path.join(baseDir, conventionalRoot, relativePath)
      : Path.join(baseDir, relativePath);
  }

  /** Resolves a relative path against the resources directory. */
  resolveResourcesPath (relativePath: string): string {
    return Path.join(this.resourcesDir, relativePath);
  }
}

async function getClosestUserConfigPath (startDir?: string): Promise<string | null> {
  let currentDir = Path.resolve(startDir ?? Process.cwd());

  while (true) {
    const configPath = Path.join(currentDir, DEFAULT_CONFIG_FILENAME);
    try {
      await FSP.access(configPath); // Check if file exists and is accessible
      return configPath;
    }
    catch (error: any) {
      if (error?.code !== 'ENOENT') {
        // Log unexpected errors but continue searching
        console.warn(`Error accessing config file at ${configPath}: ${error.message}`);
      }
    }

    const parentDir = Path.dirname(currentDir);
    if (parentDir === currentDir) {
      // Reached the root directory
      return null;
    }
    currentDir = parentDir;
  }
}

export interface UserConfigData {
  readonly wolvenKitCLIExePath?: string;
  readonly cyberpunk2077GameDirectory?: string;
  readonly modOrganizer2Directory?: string;
  /**
   * Absolute path to the directory where all projects are stored. This is required if any projects specify only a
   * relative path for their project directory.
   */
  readonly projectsDir?: string;
  /**
   * Default relative subpath for all standard project assets as per WolvenKit conventions. A value of null causes this
   * to fall back to the project's own root directory. Defaults to 'source' if omitted, unless explicitly specified by
   * the project configuration itself.
   */
  readonly defaultProjectSourceDir?: string | null;
  /**
   * Default relative subpath where all CR2W files are stored. This is the directory that will be targeted when packing
   * the project into an archive file. A value of null causes this to fall back to the project's source directory.
   * Defaults to 'archive' if omitted.
   */
  readonly defaultProjectArchiveDir?: string | null;
  /**
   * Default relative subpath where exported CR2W files are stored as JSON, PNG images, glb files, and so on. A value
   * of null causes this to fall back to the project's source directory. Defaults to 'raw' if omitted, unless explicitly
   * specified by the project configuration itself.
   */
  readonly defaultProjectRawDir?: string | null;
  /**
   * Default relative subpath where special project resources are stored (primarily ArchiveXL config files). A value of
   * null causes this to fall back to the project's source directory. Defaults to 'resources' if omitted, unless
   * explicitly specified by the project configuration itself.
   */
  readonly defaultProjectResourcesDir?: string | null;
  /**
   * Default relative subpath to use when importing and exporting files that form part of the project archive.
   * @remarks
   * In most mods it is common to have all of the mod's files stored relative to a deeper inner directory, the purpose
   * generally being to ensure uniqueness of name, relative to other mods that might also be in play at the same time
   * while the game is running. This directory is relative to {@link defaultProjectArchiveDir} and
   * {@link defaultProjectRawDir} (depending on the context). When specifying a relative path to a project archive(able)
   * file, this path will be prepended to the specified relative path of the file in question. Defaults to
   * 'base\\{MODDER_NAME}\\{ARCHIVE_NAME}' if omitted, unless explicitly specified by the project configuration itself. A
   * value of null causes this to fall back to either the project's "archive" or "raw" directory (or their equivalents
   * after all configurations are taken into account), depending on the context.
   */
  readonly defaultConventionalRootDirPattern?: string | null;
  /**
   * The modder name to be assumed when the project doesn't specify it explicitly.
   */
  readonly modderName?: string;
  readonly projects?: Record<string, UserModdingProjectData>;
}

export interface UserModdingProjectData {
  /**
   * The primary title of the mod. Will be used when generating certain localized names for the mod.
   */
  readonly label: string;
  readonly shortName?: string;
  readonly modderName?: string;
  /**
   * Relative or absolute path to the project directory. If this is a relative path, it will be resolved against the
   * `projectsDir` property of the UserConfig. If relative and `projectsDir` is not set, this will be resolved against
   * the current working directory. If omitted entirely, it defaults to a subdirectory within `projectsDir` named after
   * the project key.
   */
  readonly projectDir?: string;
  /**
   * If specified, overrides {@link UserConfigData.defaultProjectSourceDir} for this project.
   */
  readonly sourceDir?: string | null; // Added based on defaultProjectSourceDir comment
  /**
   * If specified, overrides {@link UserConfigData.defaultProjectArchiveDir} for this project.
   */
  readonly archiveDir?: string | null; // Allow null
  /**
   * If specified, overrides {@link UserConfigData.defaultProjectRawDir} for this project.
   */
  readonly rawDir?: string | null; // Allow null
  /**
   * If specified, overrides {@link UserConfigData.defaultProjectResourcesDir} for this project.
   */
  readonly resourcesDir?: string | null; // Allow null
  /**
   * Relative subpath to use when importing and exporting files that form part of the project archive.
   * @remarks
   * In most mods it is common to have all of the mod's files stored relative to a deeper inner directory, the purpose
   * generally being to ensure uniqueness of name, relative to other mods that might also be in play at the same time
   * while the game is running. This directory is relative to {@link archiveDir} and {@link rawDir} (depending on the
   * context). When specifying a relative path to a project archive(able) file, this path will be prepended to the
   * specified relative path of the file in question.
   * @example
   * 'base\\{MODDER_NAME}\\{ARCHIVE_NAME}'
   */
  readonly conventionalRootDirPattern?: string | null; // Allow null
}
