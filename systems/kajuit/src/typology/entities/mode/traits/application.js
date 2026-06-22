export const APPLICATION = async (mode, ctx) => {
  mode.metadata.app = await mode.connection.call("/metadata/app");

  mode.buffer = (desc = {}) => ({
    mode: mode.id,
    data: { ...(mode.metadata.app?.schema?.data ?? {}), ...(desc.data ?? {}) },
    literals: desc.literals ?? [],
    symbols: desc.symbols ?? [],
  });
};
