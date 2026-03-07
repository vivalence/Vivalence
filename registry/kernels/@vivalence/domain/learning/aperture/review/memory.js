import { getMemoryDriver, validateSignal } from "../../memory/index.js";

export default async function (inputs, ctx) {
  let { scope, signal } = inputs;
  scope.user = ctx.user.id;

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
      user: scope.user,
    };

    if (scope.literal) {
      criteria.literal = scope.literal;
    } else {
      criteria.literal = null;
    }

    // if (scope.symbol) {criteria.symbol = scope.symbol;} else {criteria.symbol = null;}

    const memory = await ctx.daemon.entities.memory.findOne(criteria);
    return memory;
  } catch (error) {
    console.error("Error reading memory:", error);
    throw error;
  }
}

export async function create({ signal, scope }, ctx) {
  try {
    const [MemoryDriver, { driver, type }] = await getMemoryDriver({ scope }, ctx);
    const lastAt = new Date();

    const state = MemoryDriver.initiate({ signal });
    const { nextIn, nextAt } = MemoryDriver.schedule({ memory: { state } });

    const history = [{ signal, state, nextIn, nextAt, lastAt }];
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
      user: scope.user,
    };

    if (scope.literal) {
      memoryData.literal = scope.literal;
    }

    // if (scope.symbol) {memoryData.symbol = scope.symbol;}

    const memory = ctx.daemon.entities.memory.create(memoryData);
    await ctx.daemon.entities.em.persist(memory).flush();

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
      change: { from: null, to: status },
    };
  } catch (error) {
    console.error("Error creating memory:", error);
    throw error;
  }
}

export async function update({ signal, scope, memory }, ctx) {
  try {
    const [MemoryDriver, { driver, type }] = await getMemoryDriver({ scope, memory }, ctx);
    const lastAt = new Date();

    const state = MemoryDriver.update({ memory, signal });
    const { nextIn, nextAt } = MemoryDriver.schedule({ memory: { state } });
    const history = [...memory.history, { signal, state, nextIn, nextAt, lastAt }];
    const status = MemoryDriver.status({ memory: { state, nextIn, history } });
    history[history.length - 1].status = status;

    if (history.length > 10) history.shift();

    const updateData = {
      state,
      status,
      nextAt: new Date(nextAt),
      nextIn,
      lastAt,
      history,
    };

    ctx.daemon.entities.em.assign(memory, updateData);
    await ctx.daemon.entities.em.flush();

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
      change: change.from !== change.to ? change : null,
    };
  } catch (error) {
    console.error("Error updating memory:", error);
    throw error;
  }
}

// import { getMemoryDriver, validateSignal } from "../../memory/index.js";

// export default async function ({ scope, signal }, ctx) {
//   scope.user = { id: ctx.user.id };
//   signal = validateSignal(signal);

//   const memory = await read({ scope }, ctx);

//   if (!memory) {
//     return await create({ scope, signal }, ctx);
//   } else {
//     return await update({ memory, signal, scope }, ctx);
//   }
// }

// export async function read({ scope }, ctx) {
// try {
//   const criteria = {
//     user: scope.user.id,
//   };

//   if (scope.literal) {
//     criteria.literal = scope.literal.id;
//   } else {
//     criteria.literal = null;
//   }

//   if (scope.symbol) {
//     criteria.symbol = scope.symbol.id;
//   } else {
//     criteria.symbol = null;
//   }

//   const memory = await ctx.daemon.entities.memory.findOne(criteria);
//   return memory;
// } catch (error) {
//   console.error("Error reading memory:", error);
//   throw error;
// }
// }

// export async function create({ signal, scope }, ctx) {
//   try {
//     const [MemoryDriver, { driver, type }] = await getMemoryDriver(
//       { scope },
//       ctx,
//     );
//     const lastAt = new Date();

//     const state = MemoryDriver.initiate({ signal });
//     const { nextIn, nextAt } = MemoryDriver.schedule({ memory: { state } });

//     const history = [{ signal, state, nextIn, nextAt, lastAt }];
//     const status = MemoryDriver.status({ memory: { state, nextIn, history } });
//     history[0].status = status;

//     const memoryData = {
//       driver,
//       type,
//       status,
//       state,
//       nextAt: new Date(nextAt),
//       nextIn,
//       lastAt,
//       history,
//       user: scope.user.id,
//     };

//     if (scope.literal?.id) {
//       memoryData.literal = scope.literal.id;
//     }

//     if (scope.symbol?.id) {
//       memoryData.symbol = scope.symbol.id;
//     }

//     const memory = ctx.daemon.entities.memory.create(memoryData);
//     await ctx.daemon.entities.em.persist(memory).flush();

//     return {
//       id: memory.id,
//       state,
//       status,
//       nextIn,
//       nextAt,
//       lastAt,
//       type,
//       driver,
//       history,
//       change: { from: null, to: status },
//     };
//   } catch (error) {
//     console.error("Error creating memory:", error);
//     throw error;
//   }
// }

// export async function update({ signal, scope, memory }, ctx) {
//   try {
//     const [MemoryDriver, { driver, type }] = await getMemoryDriver(
//       { scope, memory },
//       ctx,
//     );
//     const lastAt = new Date();

//     const state = MemoryDriver.update({ memory, signal });
//     const { nextIn, nextAt } = MemoryDriver.schedule({ memory: { state } });
//     const history = [
//       ...memory.history,
//       { signal, state, nextIn, nextAt, lastAt },
//     ];
//     const status = MemoryDriver.status({ memory: { state, nextIn, history } });
//     history[history.length - 1].status = status;

//     if (history.length > 10) history.shift();

//     const updateData = {
//       state,
//       status,
//       nextAt: new Date(nextAt),
//       nextIn,
//       lastAt,
//       history,
//     };

//     ctx.daemon.entities.em.assign(memory, updateData);
//     await ctx.daemon.entities.em.flush();

//     const change = { from: memory.status, to: status };

//     return {
//       id: memory.id,
//       state,
//       status,
//       nextIn,
//       nextAt,
//       lastAt,
//       type,
//       driver,
//       history,
//       change: change.from !== change.to ? change : null,
//     };
//   } catch (error) {
//     console.error("Error updating memory:", error);
//     throw error;
//   }
// }
