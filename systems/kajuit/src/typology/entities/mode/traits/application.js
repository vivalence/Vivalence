export const PROCEDURAL = async (mode, ctx) => {
  // mode.pro.app = await mode.connection.call("/metadata/app");
  //@beef not needed at all?
  // mode.pro.view = (buffer = {}) => ({mode: mode.id, data: { ...(mode.metadata.app?.schema?.data ?? {}), ...(desc.data ?? {}) }, literals: desc.literals ?? [], symbols: desc.symbols ?? [],});
};
export const APPLICATION = async (mode, ctx) => {
  //@beef move to mode.app
  mode.metadata.app = await mode.connection.call("/metadata/app");
  // mode.app = {...,view}

  //@beef was: mode.buffer(desc)
  //@beef or maybe depracated. is this used anywhere on the client?! doubt. or in that case, we might want to reconsider boundries. coherence.
  // ah. i think in standalone buffer construction. somewhere in the client.
  //
  mode.app.view = (desc = {}) => ({
    mode: mode.id,
    data: { ...(mode.metadata.app?.schema?.data ?? {}), ...(desc.data ?? {}) },
    literals: desc.literals ?? [],
    symbols: desc.symbols ?? [],
  });
};
