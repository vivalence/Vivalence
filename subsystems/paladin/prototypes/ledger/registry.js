export class Registry {
  constructor(paladin, path) {
    this.paladin = paladin;
    this.path = path;
  }

  read() {
    return this.paladin.read.json(this.path, null);
  }

  write(locations) {
    return this.paladin.state.json(this.path, locations);
  }

  async seed(scope) {
    const locations = [];
    for await (const entry of Deno.readDir(scope.absolute)) {
      if (entry.isDirectory) locations.push(`${scope.absolute}/${entry.name}`);
    }
    await this.write(locations);
    return locations;
  }
}
