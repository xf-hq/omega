import { rebuildEyeArtistryProject } from './xf-eye-artistry-ccxl';

// cd D:\Dev\xf-omega; cls; bun run --watch .\source\projects\xf-eye-artistry-ccxl\watch.ts

await rebuildEyeArtistryProject({
  force: false,
  install: false,
});
