import type { UserConfig } from '../config';
import { $ } from 'bun';
import FSP from 'fs/promises';

// # Here is a copy of the main help that the WolvenKit.CLI.exe outputs when run with only the -h flag:
// PS> WolvenKit.CLI.exe -h
// Description:
//
// Usage:
//   WolvenKit.CLI [command] [options]
//
// Commands:
//   archive, archiveinfo <path>                             Display information of an .archive file.
//   extract, unbundle <path>                                Target an archive to extract files from.
//   extract-and-export, unbundle-and-export, uncook <path>  Target an archive to uncook files from.
//   import <path>                                           Import raw files into redengine files.
//   export <path>                                           Export a file or list of files into raw files.
//   pack <path>                                             Pack resource files into an .archive file.
//   convert                                                 Convert CR2W (extracted) resource files and convert to json.
//   conflicts <path>                                        Lists all mod conflicts in your mods. [default: F:\Games\RedModding]
//   hash <input>                                            Some helper functions related to hashes.
//   oodle                                                   Some helper functions related to Oodle.
//   settings                                                App settings
//   wwise <path> <outpath>                                  Some helper functions related to Wwise. []
//   cr2w <path>                                             [DEPRECATED] cr2w file conversion command.
export class WolvenKitCLI {
  constructor (private readonly config: UserConfig) {}
  // Example of calling the CLI executable (Bun.$`...` returns a value of type `Bun.$.ShellOutput`):
  // ```ts
  // const result = await Bun.$`foo --bar baz`;
  // const text = await result.text(); // or use whatever else you need (e.g. .json()|.arrayBuffer()|.bytes()|.blob()|.stdout|.stderr|.exitCode)
  // ```

  async getArchiveInfo (params: WolvenKitCLI.Params.GetArchiveInfo): Promise<unknown> {
    throw new Error(`Not Implemented`);
  }
  async import (params: WolvenKitCLI.Params.Import): Promise<unknown> {
    const cliPath = this.config.wolvenKitCLIExePath;
    const inputPath = params.filePathToImport;
    const outputPath = await this.ensureOutputDirectory(params.outputDirectory);
    // Usage: WolvenKit.CLI import [<path>...] [options]
    // Arguments: <path> Input path for raw files. Can be a file or a folder or a list of files/folders.
    // Options: -o, --outpath <outpath> Output directory path.
    const result = await $`${cliPath} import "${inputPath}" -o "${outputPath}"${params.verbosity ? ` -v ${params.verbosity}` : ''}`;
    return result;
  }
  async export (params: WolvenKitCLI.Params.Export): Promise<unknown> {
    const cliPath = this.config.wolvenKitCLIExePath;
    const inputPath = params.filePathToExport;
    const outputPath = await this.ensureOutputDirectory(params.outputDirectory);
    // Usage: WolvenKit.CLI export [<path>...] [options]
    // Arguments: <path> Input path to file/directory or list of files/directories.
    // Options: -o, --outpath <outpath> Output directory path for all files to export to.
    const result = await $`${cliPath} export "${inputPath}" -o "${outputPath}"${params.verbosity ? ` -v ${params.verbosity}` : ''}`;
    return result;
  }
  async pack (params: WolvenKitCLI.Params.Pack): Promise<unknown> {
    const cliPath = this.config.wolvenKitCLIExePath;
    const inputPaths = params.directoryPathsToPack; // This is an array
    const outputPath = await this.ensureOutputDirectory(params.outputDirectory);
    // Usage: WolvenKit.CLI pack [<path>...] [options]
    // Arguments: <path> Input folder or folders.
    // Options: -o, --outpath <outpath> Output directory to create all archives.
    // Bun.$ automatically handles arrays by joining elements with spaces.
    const result = await $`${cliPath} pack ${inputPaths} -o "${outputPath}"${params.verbosity ? ` -v ${params.verbosity}` : ''}`;
    return result;
  }
  async convertToJSON (params: WolvenKitCLI.Params.Convert): Promise<unknown> {
    const cliPath = this.config.wolvenKitCLIExePath;
    const inputPath = params.filePathToConvert;
    const outputPath = await this.ensureOutputDirectory(params.outputDirectory);
    await FSP.mkdir(outputPath, { recursive: true });
    const result = await $`${cliPath} convert serialize "${inputPath}" -o "${outputPath}"${params.verbosity ? ` -v ${params.verbosity}` : ''}`;
    return result;
  }
  async convertFromJSON (params: WolvenKitCLI.Params.Convert): Promise<unknown> {
    const cliPath = this.config.wolvenKitCLIExePath;
    const inputPath = params.filePathToConvert;
    const outputPath = await this.ensureOutputDirectory(params.outputDirectory);
    const result = await $`${cliPath} convert deserialize "${inputPath}" -o "${outputPath}"${params.verbosity ? ` -v ${params.verbosity}` : ''}`;
    return result;
  }

  private async ensureOutputDirectory (outputPath: string): Promise<string> {
    await FSP.mkdir(outputPath, { recursive: true });
    return outputPath;
  }
}
export namespace WolvenKitCLI {
  export namespace Params {
    // # Here is a copy of the help that the WolvenKit.CLI.exe outputs when run with the -h flag for the "archive" command:
    // PS> WolvenKit.CLI.exe archive -h
    // Description:
    //   Display information of an .archive file.
    //
    // Usage:
    //   WolvenKit.CLI archive [<path>...] [options]
    //
    // Arguments:
    //   <path>  Input archives path. Can be a file or a folder or a list of files/folders.
    //
    // Options:
    //   -w, --pattern <pattern>                                     Search pattern (e.g. *.ink), if both regex and pattern is defined, pattern will be
    //                                                               prioritized.
    //   -r, --regex <regex>                                         Regex search pattern.
    //   -d, --diff                                                  Dump archive json for diff.
    //   -l, --list                                                  List all files in archive.
    export interface GetArchiveInfo {
      /**
       * An array of paths to archive files and/or directories where archive files can be found.
       */
      archivePaths: string[];
      verbosity?: 'quiet' | 'minimal' | 'normal' | 'detailed' | 'diagnostic';
    }

    // # Here is a copy of the help that the WolvenKit.CLI.exe outputs when run with the -h flag for the "import" command:
    // PS> WolvenKit.CLI.exe import -h
    // Description:
    //   Import raw files into redengine files.
    //
    // Usage:
    //   WolvenKit.CLI import [<path>...] [options]
    //
    // Arguments:
    //   <path>  Input path for raw files. Can be a file or a folder or a list of files/folders.
    //
    // Options:
    //   -p, --path <path>                                           [Deprecated] Input path for raw files. Can be a file or a folder or a list of files/folders.
    //   -o, --outpath <outpath>                                     Output directory path.  If used with --keep, this is the folder for the redengine files to
    //                                                               rebuild.
    //   -k, --keep                                                  Keep existing CR2W files intact and only append the buffer.
    export interface Import {
      filePathToImport: string;
      outputDirectory: string;
      verbosity?: 'quiet' | 'minimal' | 'normal' | 'detailed' | 'diagnostic';
    }

    // # Here is a copy of the help that the WolvenKit.CLI.exe outputs when run with the -h flag for the "export" command:
    // PS> WolvenKit.CLI.exe export -h
    // Description:
    //   Export a file or list of files into raw files.
    //
    // Usage:
    //   WolvenKit.CLI export [<path>...] [options]
    //
    // Arguments:
    //   <path>  Input path to file/directory or list of files/directories.
    //
    // Options:
    //   -p, --path <path>                                           [Deprecated] Input path to file/directory or list of files/directories.
    //   -o, --outpath <outpath>                                     Output directory path for all files to export to.
    //   -gp, --gamepath <gamepath>                                  Path to the Cyberpunk 2077 directory.
    //   --uext <bmp|cube|dds|jpg|png|tga|tiff>                      Format to uncook textures into (tga, bmp, jpg, png, dds), DDS by default.
    //   -fb, --forcebuffers <forcebuffers>                          Force uncooking to buffers for given extension. e.g. mesh.
    export interface Export {
      filePathToExport: string;
      outputDirectory: string;
      verbosity?: 'quiet' | 'minimal' | 'normal' | 'detailed' | 'diagnostic';
    }

    // # Here is a copy of the help that the WolvenKit.CLI.exe outputs when run with the -h flag for the "pack" command:
    // PS> WolvenKit.CLI.exe pack -h
    // Description:
    //   Pack resource files into an .archive file.
    //
    // Usage:
    //   WolvenKit.CLI pack [<path>...] [options]
    //
    // Arguments:
    //   <path>  Input folder or folders.
    //
    // Options:
    //   -p, --path <path>                                           [Deprecated] Input folder or folders.
    //   -o, --outpath <outpath>                                     Output directory to create all archives.
    //                                                               If not specified, will output in the same directory.
    export interface Pack {
      directoryPathsToPack: string[];
      outputDirectory: string;
      verbosity?: 'quiet' | 'minimal' | 'normal' | 'detailed' | 'diagnostic';
    }

    // # Here is a copy of the help that the WolvenKit.CLI.exe outputs when run with the -h flag for the "convert" command:
    // PS> WolvenKit.CLI.exe convert -h
    // Description:
    //   Convert CR2W (extracted) resource files and convert to json.
    //
    // Usage:
    //   WolvenKit.CLI convert [command] [options]
    //
    // Commands:
    //   d, deserialise, deserialize <path>  Create a CR2W file from json.
    //   s, serialise, serialize <path>      Serialize the CR2W file to json.

    // PS> WolvenKit.CLI.exe convert serialize -h
    // Description:
    // Serialize the CR2W file to json.
    //
    // Usage:
    // WolvenKit.CLI convert serialize [<path>...] [options]
    //
    // Arguments:
    // <path>  Input path to a CR2W file or folder.
    //
    // Options:
    // -o, --outpath <outpath>                                     Output directory path.
    // -w, --pattern <pattern>                                     Search pattern (e.g. *.ink), if both regex and pattern is defined, pattern will be
    //                                                             prioritized
    // -r, --regex <regex>                                         Regex search pattern.
    // --print                                                     Print to stdout

    // PS> WolvenKit.CLI.exe convert deserialize -h
    // Description:
    // Create a CR2W file from json.
    //
    // Usage:
    // WolvenKit.CLI convert deserialize [<path>...] [options]
    //
    // Arguments:
    // <path>  Input path to CR2W files or folders.
    //
    // Options:
    // -o, --outpath <outpath>                                     Output directory path.
    // -w, --pattern <pattern>                                     Search pattern (e.g. *.ink), if both regex and pattern is defined, pattern will be
    //                                                             prioritized
    // -r, --regex <regex>                                         Regex search pattern.
    // --print                                                     Print to stdout
    export interface Convert {
      filePathToConvert: string;
      outputDirectory: string;
      verbosity?: 'quiet' | 'minimal' | 'normal' | 'detailed' | 'diagnostic';
    }
  }
}
