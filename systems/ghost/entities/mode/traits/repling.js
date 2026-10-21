import { shape } from "@vivalence/typology";

export const REPLING = async (mode) => {
  if (mode.module !== null) return mode.repl.graft(mode.module.repl);
  mode.metadata.repl = await mode.connection.call("/metadata/repl");
  mode.repl.graft(shape.repl.wire(mode.metadata.repl, shape.repl.repl((signal) => mode.connection.call("/repl", signal))));
};
