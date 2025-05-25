// import { validateSignal } from "../../memory/index.js";

export default async function ({ annotation, signal }, ctx) {
  console.log("review annotation", annotation, signal);
  // input = {
  //   annotation: {
  //     lemma: "salo",
  //     pos: "verb",
  //     aspect: "imp",
  //     inflclass: "latx",
  //     mood: "imp",
  //     number: "sing",
  //     person: "2",
  //     tense: "pres",
  //     verbform: "fin",
  //     voice: "act",
  //     suffix: "lo",
  //   },
  //   signal: "SUCCESS",
  // };

  // check if annotation exists. if not, remedy.
  // once exists, review annotation.

  // signal one of: ["MASTERY", "SUCCESS", "NEUTRAL", "MISTAKE", "FAILURE"]

  // delete scope.tag;

  // signal = validateSignal(signal);

  // if (scope.units?.length > 0) {
  //   scope.units.map(async (unit) => {
  //     await ctx.runtime.call("/review/unit", { signal, scope: { ...scope, units: null, unit } });
  //   });
  // }

  // if (!scope.unit?.id) return { status: "bounce", message: "Unit required" };

  // const { data: unit, error } = await ctx.runtime.services.supabase
  //   .from("Unit")
  //   .select("*")
  //   .eq("id", scope.unit.id)
  //   .eq("runtimeId", ctx.runtime.manifest.id)
  //   .single();

  // if (error) throw error;

  // const { statusChange, ...memory } = await ctx.runtime.call("/review/memory", { scope, signal });

  // // if (statusChange) (async () => await ctx.runtime.bus.emit("MemoryStatusChange:Unit", { unit, memory, scope }))();

  // scope.memory = { id: memory.id };

  // const play = await ctx.runtime.call("/review/play", {
  //   nextIn: memory.nextIn,
  //   nextAt: memory.nextAt,
  //   lastAt: memory.lastAt,
  //   scope,
  //   signal,
  // });

  // return { play, memory, statusChange };
}
