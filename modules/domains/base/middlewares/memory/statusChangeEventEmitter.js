export default (input, ctx) => {
  if (input?.statusChange) {
    ctx.runtime.bus.emit("MemoryStatusChange", input);
  }
  return input;
};
