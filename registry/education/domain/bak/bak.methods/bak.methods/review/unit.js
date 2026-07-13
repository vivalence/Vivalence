export default async function ({ scope, signal }, ctx) {
  delete scope.tag;

  if (!scope.unit?.id) return { status: "bounce", message: "Unit required" };

  const { statusChange, ...memory } = await ctx.runtime.call("/review/memory", {
    scope,
    signal,
  });

  scope.memory = { id: memory.id };

  const play = await ctx.runtime.call("/review/play", {
    nextIn: memory.nextIn,
    nextAt: memory.nextAt,
    lastAt: memory.lastAt,
    scope,
    signal,
  });

  return { play, memory, statusChange };
}
// if (!(await ctx.runtime.validate.exists.unit({ id: scope.unit.id }))) return { status: "bounce", message: "Unit dont exist" };

// import { validateSignal } from "../../../memory/index.js";

// export default async function ({ scope, signal }, ctx) {
//   delete scope.tag;

//   signal = validateSignal(signal);

//   // if (scope.units?.length > 0) {scope.units.map(async (unit) => {await ctx.runtime.call("/review/unit", {signal, scope: { ...scope, units: null, unit },});});}

//   if (!scope.unit?.id) return { status: "bounce", message: "Unit required" };

//   const { data: unit, error } = await ctx.runtime.services.supabase
//     .from("Unit")
//     .select("*")
//     .eq("id", scope.unit.id)
//     .eq("runtimeId", ctx.runtime.manifest.id)
//     .single();

//   if (error) throw error;

//   const { statusChange, ...memory } = await ctx.runtime.call("/review/memory", {
//     scope,
//     signal,
//   });

//   // if (statusChange) (async () => await ctx.runtime.bus.emit("MemoryStatusChange:Unit", { unit, memory, scope }))();

//   scope.memory = { id: memory.id };

//   const play = await ctx.runtime.call("/review/play", {
//     nextIn: memory.nextIn,
//     nextAt: memory.nextAt,
//     lastAt: memory.lastAt,
//     scope,
//     signal,
//   });

//   return { play, memory, statusChange };
// }
