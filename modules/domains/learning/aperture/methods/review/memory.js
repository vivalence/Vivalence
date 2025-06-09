import { getMemoryDriver, validateSignal } from "../../../memory/index.js";

export default async function ({ scope, signal }, ctx) {
  if (!scope.user) {
    const user = await ctx.runtime.services.identity.getUser();
    if (!user) throw new Error("User not found");
    scope.user = { id: user.id };
  }

  signal = validateSignal(signal);

  const memory = await read({ scope }, ctx);

  if (!memory) {
    return await create({ scope, signal }, ctx);
  } else {
    return await update({ memory, signal, scope }, ctx);
  }
}

export async function read({ scope }, ctx) {
  try {
    const criteria = {
      user: scope.user.id,
    };

    if (scope.unit) {
      criteria.unit = scope.unit.id;
    } else {
      criteria.unit = null;
    }

    if (scope.tag) {
      criteria.tag = scope.tag.id;
    } else {
      criteria.tag = null;
    }

    const memory = await ctx.runtime.entities.memory.findOne(criteria);
    return memory;
  } catch (error) {
    console.error("Error reading memory:", error);
    throw error;
  }
}

export async function create({ signal, scope }, ctx) {
  try {
    const [MemoryDriver, { driver, type }] = await getMemoryDriver(
      { scope },
      ctx,
    );
    const lastAt = new Date();

    const state = MemoryDriver.initiate({ signal });
    const { nextIn, nextAt } = MemoryDriver.schedule({ memory: { state } });

    const history = [{ signal, state, nextIn, nextAt, lastAt, scope }];
    const status = MemoryDriver.status({ memory: { state, nextIn, history } });
    history[0].status = status;

    const memoryData = {
      driver,
      type,
      status,
      state,
      nextAt: new Date(nextAt),
      nextIn,
      lastAt,
      history,
      user: scope.user.id,
    };

    if (scope.unit?.id) {
      memoryData.unit = scope.unit.id;
    }

    if (scope.tag?.id) {
      memoryData.tag = scope.tag.id;
    }

    const memory = ctx.runtime.entities.memory.create(memoryData);
    await ctx.runtime.entities.em.persist(memory).flush();

    return {
      id: memory.id,
      state,
      status,
      nextIn,
      nextAt,
      lastAt,
      type,
      driver,
      history,
      statusChange: { from: null, to: status },
    };
  } catch (error) {
    console.error("Error creating memory:", error);
    throw error;
  }
}

export async function update({ signal, scope, memory }, ctx) {
  try {
    const [MemoryDriver, { driver, type }] = await getMemoryDriver(
      { scope, memory },
      ctx,
    );
    const lastAt = new Date();

    const state = MemoryDriver.update({ memory, signal });
    const { nextIn, nextAt } = MemoryDriver.schedule({ memory: { state } });
    const history = [
      ...memory.history,
      { signal, state, nextIn, nextAt, lastAt, scope },
    ];
    const status = MemoryDriver.status({ memory: { state, nextIn, history } });
    history[history.length - 1].status = status;

    // limit history to 10
    if (history.length > 10) history.shift();

    const updateData = {
      state,
      status,
      nextAt: new Date(nextAt),
      nextIn,
      lastAt,
      history,
    };

    ctx.runtime.entities.em.assign(memory, updateData);
    await ctx.runtime.entities.em.flush();

    const change = { from: memory.status, to: status };

    return {
      id: memory.id,
      state,
      status,
      nextIn,
      nextAt,
      lastAt,
      type,
      driver,
      history,
      statusChange: change.from !== change.to ? change : null,
    };
  } catch (error) {
    console.error("Error updating memory:", error);
    throw error;
  }
}
// import { getMemoryDriver, validateSignal } from "../../memory/index.js";

// export default async function ({ scope, signal }, ctx) {
//   if (!scope.user) {
//     const user = await ctx.runtime.services.identity.getUser();
//     if (!user) throw new Error("User not found");
//     scope.user = { id: user.id };
//   }

//   signal = validateSignal(signal);

//   const memory = await read({ scope }, ctx);

//   if (!memory) {
//     return await create({ scope, signal }, ctx);
//   } else {
//     return await update({ memory, signal, scope }, ctx);
//   }
// }

// export async function read({ scope }, ctx) {
//   let query = ctx.runtime.services.supabase
//     .from("Memory")
//     .select("*")
//     .eq("userId", scope.user.id)
//     .eq("runtimeId", ctx.runtime.manifest.id);

//   if (scope.unit) query = query.eq("unitId", scope.unit.id);
//   else query = query.filter("unitId", "is", null);

//   if (scope.tag) query = query.eq("tagId", scope.tag.id);
//   else query = query.filter("tagId", "is", null);

//   const { data: memory, error } = await query.limit(1).maybeSingle();
//   if (error) throw error;

//   return memory;
// }

// export async function create({ signal, scope }, ctx) {
//   const [MemoryDriver, { driver, type }] = await getMemoryDriver(
//     { scope },
//     ctx,
//   );
//   const lastAt = new Date().toISOString();

//   const state = MemoryDriver.initiate({ signal });
//   const { nextIn, nextAt } = MemoryDriver.schedule({ memory: { state } });

//   const history = [{ signal, state, nextIn, nextAt, lastAt, scope }];
//   const status = MemoryDriver.status({ memory: { state, nextIn, history } });
//   history[0].status = status;

//   const { data, error } = await ctx.runtime.services.supabase
//     .from("Memory")
//     .insert([
//       {
//         driver,
//         type,
//         status,
//         state,

//         nextAt,
//         nextIn,
//         lastAt,
//         history,

//         runtimeId: ctx.runtime.manifest.id,
//         userId: scope.user.id,
//         unitId: scope.unit?.id,
//         tagId: scope.tag?.id,
//       },
//     ])
//     .select("id")
//     .single();

//   if (error) throw error;

//   return {
//     id: data.id,
//     state,
//     status,
//     nextIn,
//     nextAt,
//     lastAt,
//     type,
//     driver,
//     history,
//     statusChange: { from: null, to: status },
//   };
// }

// export async function update({ signal, scope, memory }, ctx) {
//   const [MemoryDriver, { driver, type }] = await getMemoryDriver(
//     { scope, memory },
//     ctx,
//   );
//   const lastAt = new Date().toISOString();

//   const state = MemoryDriver.update({ memory, signal });
//   const { nextIn, nextAt } = MemoryDriver.schedule({ memory: { state } });
//   const history = [
//     ...memory.history,
//     { signal, state, nextIn, nextAt, lastAt, scope },
//   ];
//   const status = MemoryDriver.status({ memory: { state, nextIn, history } });
//   history[history.length - 1].status = status;
//   // limit history to 10
//   if (history.length > 10) history.shift();

//   const { data, error } = await ctx.runtime.services.supabase
//     .from("Memory")
//     .update({
//       state,
//       status,
//       nextAt,
//       nextIn,
//       lastAt,
//       history,
//       updatedAt: new Date().toISOString(),
//     })
//     .eq("id", memory.id);

//   if (error) throw error;

//   const change = { from: memory.status, to: status };

//   return {
//     id: memory.id,
//     state,
//     status,
//     nextIn,
//     nextAt,
//     lastAt,
//     type,
//     driver,
//     history,
//     statusChange: change.from !== change.to ? change : null,
//   };
// }
