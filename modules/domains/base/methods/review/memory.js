import getMemoryDriver from "../../memory/index.js";

export default async function ({ scope, signal }, ctx) {
  if (!scope.user) {
    const user = await ctx.runtime.services.identity.getUser();
    if (!user) throw new Error("User not found");
    scope.user = { id: user.id };
  }

  const memory = await read({ scope }, ctx);

  if (!memory) {
    return await create({ scope, signal }, ctx);
  } else {
    return await update({ memory, signal, scope }, ctx);
  }
}

export async function read({ scope }, ctx) {
  let query = ctx.runtime.services.supabase
    .from("Memory")
    .select("*")
    .eq("userId", scope.user.id)
    .eq("runtimeId", ctx.runtime.manifest.id);

  if (scope.unit) query = query.eq("unitId", scope.unit.id);
  else query = query.filter("unitId", "is", null);

  if (scope.tag) query = query.eq("tagId", scope.tag.id);
  else query = query.filter("tagId", "is", null);

  const { data: memory, error } = await query.limit(1).maybeSingle();
  if (error) throw error;

  return memory;
}

export async function create({ signal, scope }, ctx) {
  const [MemoryDriver, { type, flavor }] = await getMemoryDriver({ scope }, ctx);
  const lastAt = new Date().toISOString();

  const state = MemoryDriver.initiate({ signal });
  const { nextIn, nextAt } = MemoryDriver.schedule({ memory: { state } });

  const history = [{ signal, state, nextIn, nextAt, lastAt, scope }];
  const status = MemoryDriver.status({ memory: { state, nextIn, history } });
  history[0].status = status;

  const { data, error } = await ctx.runtime.services.supabase
    .from("Memory")
    .insert([
      {
        type,
        flavor,
        status,
        state,

        nextAt,
        nextIn,
        lastAt,
        history,

        runtimeId: ctx.runtime.manifest.id,
        userId: scope.user.id,
        unitId: scope.unit?.id,
        tagId: scope.tag?.id,
      },
    ])
    .select("id")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    state,
    status,
    nextIn,
    nextAt,
    lastAt,
    flavor,
    type,
    history,
    statusChange: { from: null, to: status },
  };
}

export async function update({ signal, scope, memory }, ctx) {
  const [MemoryDriver, { type, flavor }] = await getMemoryDriver({ scope, memory }, ctx);
  const lastAt = new Date().toISOString();

  const state = MemoryDriver.update({ memory, signal });
  const { nextIn, nextAt } = MemoryDriver.schedule({ memory: { state } });
  const history = [...memory.history, { signal, state, nextIn, nextAt, lastAt, scope }];
  const status = MemoryDriver.status({ memory: { state, nextIn, history } });
  history[history.length - 1].status = status;

  const { data, error } = await ctx.runtime.services.supabase
    .from("Memory")
    .update({
      state,
      status,
      nextAt,
      nextIn,
      lastAt,
      history,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", memory.id);

  if (error) throw error;

  const change = { from: memory.status, to: status };

  return {
    id: memory.id,
    state,
    status,
    nextIn,
    nextAt,
    lastAt,
    flavor,
    type,
    history,
    statusChange: change.from !== change.to ? change : null,
  };
}
