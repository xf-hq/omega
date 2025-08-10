import type { BunFile } from 'bun';

export class FileSource {
  constructor (public readonly path: string) {
    this.#file = Bun.file(path);
  }
  readonly #file: BunFile;

  async exists (): Promise<boolean> {
    try {
      await this.#file.stat();
      return true;
    }
    catch (e) {
      if (e.code === 'ENOENT') {
        return false;
      }
      throw e;
    }
  }
  async getModifiedTime (): Promise<Date> {
    const mtime = await this.#file.stat().then(stat => stat.mtime).catch(() => 0);
    return new Date(mtime);
  }
  async isNewerThan (filePath: string): Promise<boolean> {
    const [thisModifiedTime, otherStat] = await Promise.all([
      this.getModifiedTime(),
      Bun.file(filePath).stat(),
    ]);
    return thisModifiedTime > otherStat.mtime;
  }
  async readText (): Promise<string> {
    return this.#file.text();
  }
  async writeText (text: string): Promise<void> {
    await Bun.write(this.#file, text, { createPath: true });
  }
  async writeJSON (data: any): Promise<void> {
    return await this.writeText(JSON.stringify(data, null, 2));
  }
}
