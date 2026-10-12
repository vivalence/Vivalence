import { shape } from "@vivalence/typology";

export const EMITTER = async (mode) => {
  mode.metadata.emitter = await mode.connection.call("/metadata/emitter");
  mode.emit = shape.connection.wire(mode.connection.branch("/emit"), mode.metadata.emitter);
};
