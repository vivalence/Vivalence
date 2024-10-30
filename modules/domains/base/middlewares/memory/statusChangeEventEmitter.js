export default (memory, ctx) => {
  if (memory.statusChange) {
    ctx.runtime.emit("MemoryStatusChange", { memory });
  }
  return body;
};
