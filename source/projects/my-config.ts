import { UserConfig } from '../config';

/* MODIFY THIS WITH YOUR SETTINGS */

export const MY_CONFIG = new UserConfig({
  wolvenKitCLIExePath: 'F:\\Games\\RedModding\\WolvenKit.Console\\WolvenKit.CLI.exe',
  cyberpunk2077GameDirectory: 'F:\\Games\\Cyberpunk 2077',
  modOrganizer2Directory: 'F:\\Games\\MO2',
  projectsDir: 'F:\\Games\\RedModding\\Projects',
  modderName: 'axefrog',
  projects: {
    'xf-eye-artistry-ccxl': {
      label: 'XF',
      shortName: 'xfea',
    },
    'fafo-switchers-ccxl': {
      label: 'FAFO: Switchers',
      conventionalRootDirPattern: 'base\\{MODDER_NAME}',
    },
  },
});
