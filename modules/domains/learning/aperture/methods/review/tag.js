export default async function ({ scope, signal }, ctx) {
  if (!scope.tag?.id) return { status: "bounce", message: "Tag required" };

  const tag = await ctx.runtime.entities.tag.findOneOrFail({
    id: scope.tag.id,
  });

  if (!tag.traits.includes("LEARNABLE")) {
    return { status: "bounce", message: "Invalid learnable tag flavor" };
  }

  if (tag.data["LEARNABLE"].type === "INDIVIDUAL") {
    delete scope.unit;
  } else if (tag.data["LEARNABLE"].type === "RELATIONAL") {
    if (!scope.unit?.id) {
      return {
        status: "bounce",
        message: "Unit required for relational learnable tags",
      };
    }
  } else {
    return { status: "bounce", message: "Invalid learnable tag flavor" };
  }

  const memory = await ctx.runtime.call("/review/memory", {
    scope,
    signal,
  });

  //   if (tag.data["LEARNABLE"].type === "RELATIONAL") {
  //     const input = {scope, signal,} delete scope.unit;
  //     const { statusChange } = await ctx.runtime.call("/review/memory", input);
  //     // if (statusChange) (async () => await ctx.runtime.bus.emit("MemoryStatusChange:Tag", { tag, memory, scope }))();
  //   }

  scope.memory = { id: memory.id };

  const play = await ctx.runtime.call("/review/play", {
    nextIn: memory.nextIn,
    nextAt: memory.nextAt,
    lastAt: memory.lastAt,
    scope,
    signal,
  });

  return { status: "success", memory, play };
}
// if (scope.tags?.length > 0) {scope.tags.map(async (tag) => {await ctx.runtime.call("/review/tag", {signal, scope: { ...scope, tags: null, tag },});});}
// import { validateSignal } from "../../memory/index.js";

// // might want to refactor this into a reducer
// export default async function ({ scope, signal }, ctx) {
//   if (scope.tags?.length > 0) {
//     scope.tags.map(async (tag) => {
//       // should i handle the return?
//       await ctx.runtime.call("/review/tag", {
//         signal,
//         scope: { ...scope, tags: null, tag },
//       });
//     });
//   }

//   if (!scope.tag?.id) return { status: "bounce", message: "Tag required" };

//   signal = validateSignal(signal);

//   const { data: tag, error: te } = await ctx.runtime.services.supabase
//     .from("Tag")
//     .select("id, traits, data")
//     .eq("id", scope.tag.id)
//     .eq("runtimeId", ctx.runtime.manifest.id)
//     .single();

//   if (te || !tag) throw te || new Error("Tag not found");

//   if (!tag.traits.includes("LEARNABLE")) {
//     return { status: "bounce", message: "Invalid learnable tag flavor" };
//   }
//   if (tag.data["LEARNABLE"].type === "INDIVIDUAL") {
//     delete scope.unit;
//   } else if (tag.data["LEARNABLE"].type === "RELATIONAL") {
//     if (!scope.unit?.id) {
//       return {
//         status: "bounce",
//         message: "Unit required for relational learnable tags",
//       };
//     }
//   } else {
//     return { status: "bounce", message: "Invalid learnable tag flavor" };
//   }

//   const { statusChange, ...memory } = await ctx.runtime.call("/review/memory", {
//     scope,
//     signal,
//   });
//   // if (statusChange) (async () => await ctx.runtime.bus.emit("MemoryStatusChange:Tag", { tag, memory, scope }))();

//   if (tag.data["LEARNABLE"].type === "RELATIONAL") {
//     delete scope.unit;
//     const { statusChange } = await ctx.runtime.call("/review/memory", {
//       scope,
//       signal,
//     });
//     // if (statusChange) (async () => await ctx.runtime.bus.emit("MemoryStatusChange:Tag", { tag, memory, scope }))();
//   }

//   scope.memory = { id: memory.id };

//   const play = await ctx.runtime.call("/review/play", {
//     nextIn: memory.nextIn,
//     nextAt: memory.nextAt,
//     lastAt: memory.lastAt,
//     scope,
//     signal,
//   });

//   return { status: "success", memory, play, statusChange };
// }
