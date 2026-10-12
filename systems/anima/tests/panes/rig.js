// systems/anima/tests/panes/rig.js:1
import { atom } from "nanostores";
import { random } from "@vivalence/typology";
import { Terminal, TerminalDossier } from "../../src/entities/terminal/prototype.js";

export function repositoryDouble(daemons = []) {
  const $entities = atom([]);
  const [mount] = TerminalDossier.use;
  const find = (id) => $entities.get().find((terminal) => terminal.id === id);
  const related = (data) => ("daemon" in data ? { ...data, daemon: daemons.find((daemon) => daemon.id === data.daemon) ?? null } : data);
  const repository = {
    $entities,
    async create(data = {}) {
      const terminal = Object.assign(new Terminal(), { id: random.id(), index: $entities.get().length }, related(data));
      await mount({ entity: terminal, repository, lighthouse: { identity: null } }, async () => {});
      $entities.set([...$entities.get(), terminal]);
      return terminal;
    },
    async updateOne({ id }, data) {
      Object.assign(find(id), related(data));
      $entities.set([...$entities.get()]);
      return find(id);
    },
    drop: (id) => $entities.set($entities.get().filter((terminal) => terminal.id !== id)),
    removeOne: async ({ id }) => repository.drop(id),
  };
  return repository;
}
