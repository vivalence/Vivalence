// import { validateSignal } from "../../../memory/index.js";

export default async function ({ scope, signal, lastAt, nextAt, nextIn }, ctx) {
  if (!scope.user) {
    const user = await ctx.runtime.services.identity.getUser();
    if (!user) throw new Error("User not found");
    scope.user = { id: user.id };
  }

  const play = await read({ scope }, ctx);

  if (!play) {
    return await create({ scope, lastAt, nextIn, nextAt, signal }, ctx);
  } else {
    return await update({ play, lastAt, nextIn, nextAt, signal, scope }, ctx);
  }
}

export async function read({ scope }, ctx) {
  try {
    const criteria = {
      user: scope.user.id,
    };

    if (scope.memory?.id) {
      criteria.memory = scope.memory.id;
    }

    if (scope.game?.id) {
      criteria.game = scope.game.id;
    }

    if (scope.tactic?.id) {
      criteria.tactic = scope.tactic.id;
    } else {
      criteria.tactic = null;
    }

    if (scope.unit?.id) {
      criteria.unit = scope.unit.id;
    } else {
      criteria.unit = null;
    }

    if (scope.tag?.id) {
      criteria.tag = scope.tag.id;
    } else {
      criteria.tag = null;
    }

    const play = await ctx.runtime.entities.play.findOne(criteria);
    return play;
  } catch (error) {
    console.error("Error reading play:", error);
    throw error;
  }
}

export async function create({ scope, lastAt, nextIn, nextAt, signal }, ctx) {
  try {
    const history = [{ signal, nextIn, nextAt, lastAt, scope }];

    const playData = {
      user: scope.user.id,
      nextAt: new Date(nextAt),
      nextIn,
      lastAt: new Date(lastAt),
      history,
    };

    if (scope.memory?.id) {
      playData.memory = scope.memory.id;
    }

    if (scope.game?.id) {
      playData.game = scope.game.id;
    }

    if (scope.tactic?.id) {
      playData.tactic = scope.tactic.id;
    }

    if (scope.unit?.id) {
      playData.unit = scope.unit.id;
    }

    if (scope.tag?.id) {
      playData.tag = scope.tag.id;
    }

    const play = ctx.runtime.entities.play.create(playData);
    await ctx.runtime.entities.em.persist(play).flush();

    return {
      id: play.id,
      nextIn,
      nextAt,
      lastAt,
      history,
    };
  } catch (error) {
    console.error("Error creating play:", error);
    throw error;
  }
}

export async function update(
  { play, lastAt, nextIn, nextAt, signal, scope },
  ctx,
) {
  try {
    const history = [
      ...play.history,
      { signal, nextIn, nextAt, lastAt, scope },
    ];

    const updateData = {
      history,
      nextAt: new Date(nextAt),
      nextIn,
      lastAt: new Date(lastAt),
    };

    ctx.runtime.entities.em.assign(play, updateData);
    await ctx.runtime.entities.em.flush();

    return {
      id: play.id,
      nextIn,
      nextAt,
      lastAt,
      history,
    };
  } catch (error) {
    console.error("Error updating play:", error);
    throw error;
  }
}

// export async function read({ scope }, ctx) {
//   let query = ctx.runtime.services.supabase
//     .from("Play")
//     .select("*")
//     .eq("runtimeId", ctx.runtime.manifest.id)
//     .eq("memoryId", scope.memory.id)
//     .eq("gameId", scope.game.id)
//     .eq("userId", scope.user.id);

//   if (scope.tactic) query = query.eq("tacticId", scope.tactic.id);
//   else query = query.filter("tacticId", "is", null);

//   if (scope.unit) query = query.eq("unitId", scope.unit.id);
//   else query = query.filter("unitId", "is", null);

//   if (scope.tag) query = query.eq("tagId", scope.tag.id);
//   else query = query.filter("tagId", "is", null);

//   let { data: play, error } = await query.limit(1).maybeSingle();

//   if (error) throw error;
//   return play;
// }

// export async function create({ scope, lastAt, nextIn, nextAt, signal }, ctx) {
//   const history = [{ signal, nextIn, nextAt, lastAt, scope }];
//   const { data, error } = await ctx.runtime.services.supabase
//     .from("Play")
//     .insert([
//       {
//         runtimeId: ctx.runtime.manifest.id,
//         userId: scope.user.id,
//         memoryId: scope.memory.id,
//         gameId: scope.game.id,
//         tacticId: scope.tactic?.id,
//         unitId: scope.unit?.id,
//         tagId: scope.tag?.id,
//         nextAt,
//         nextIn,
//         lastAt,
//         history,
//       },
//     ])
//     .single()
//     .select("id");

//   if (error) throw error;

//   return { id: data.id, nextIn, nextAt, lastAt, history };
// }

// export async function update({ play, lastAt, nextIn, nextAt, signal, scope }, ctx) {
//   const history = [...play.history, { signal, nextIn, nextAt, lastAt, scope }];
//   const { data, error } = await ctx.runtime.services.supabase
//     .from("Play")
//     .update({
//       history,
//       nextAt,
//       nextIn,
//       lastAt,
//       updatedAt: new Date().toISOString(),
//     })
//     .eq("id", play.id);

//   if (error) throw error;

//   return { id: play.id, nextIn, nextAt, lastAt, history };
// }
