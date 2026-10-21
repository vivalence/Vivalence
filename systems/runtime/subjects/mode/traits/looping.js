import { shape, Vector } from "@vivalence/typology";

export const LOOPING = (mode) => {
  mode.looping = async (ctx) => {
    if (ctx.terminal === null) return new Vector();
    const strip = await ctx.socket.call(`/terminal/${ctx.terminal.id}/metadata/repl`);
    return shape.repl.wire(strip, shape.repl.tool((signal) => ctx.socket.call(`/terminal/${ctx.terminal.id}/repl`, signal)));
  };
};
