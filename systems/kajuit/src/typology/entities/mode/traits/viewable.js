export const VIEWABLE = async (mode, ctx) => {
  mode.view = await mode.connection.call("/metadata/view");
  mode.buffer = (desc = {}) => ({
    mode: mode.id,
    data: { ...(mode.view?.schema?.data ?? {}), ...(desc.data ?? {}) },
    literals: desc.literals ?? [],
    symbols: desc.symbols ?? [],
  });
};
