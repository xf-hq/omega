import { rebuildEyeArtistryProject, type RebuildEyeArtistryProjectOptions } from '../../projects/xf-eye-artistry-ccxl/xf-eye-artistry-ccxl';
import { program } from '../program';
import { Option } from 'commander';

const cmd = program
  .command('eye-artistry')
  .description('CLI commands specific to the xf-eye-artistry-ccxl mod');

cmd.command('build')
  .description('Build the eye artistry project')
  .addOption(new Option('-i, --install [hot]', 'Install the mod to the game directory').choices(['hot']))
  .addOption(new Option('-f, --force [ext...]', 'Force rebuild even if nothing has changed').choices(['.app', '.mesh', '.morphtarget', '.xbm', '.inkcharcustomization']))
  .action(async (options: RebuildEyeArtistryProjectOptions) => {
    await rebuildEyeArtistryProject(options);
  });
