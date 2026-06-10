export const BUFFERED = async (mode, ctx) => {
  console.log("BUFFERED");
  mode.buffered = await mode.connection.call("/buffered");
  mode.buffer = (desc = {}) => ({
    mode: mode.id,
    data: { ...(mode.buffered?.schema?.data ?? {}), ...(desc.data ?? {}) },
    literals: desc.literals ?? [],
    symbols: desc.symbols ?? [],
  });
  console.log("BUFFERED", mode);
};
