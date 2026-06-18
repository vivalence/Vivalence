export const EMITTER = async (mode, ctx) => {
  mode.emitter = await mode.connection.call("/metadata/emitter");
};
