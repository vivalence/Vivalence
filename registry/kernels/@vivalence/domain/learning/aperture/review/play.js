export default async function ({ scope, signal, lastAt, nextAt, nextIn }, ctx) {
  scope.user = { id: ctx.user.id };

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

    if (scope.producer?.id) {
      criteria.producer = scope.producer.id;
      // } else {criteria.producer = null;
    }

    if (scope.generator?.id) {
      criteria.generator = scope.generator.id;
      // } else {criteria.generator = null;
    }

    if (scope.literal?.id) {
      criteria.literal = scope.literal.id;
    } else {
      criteria.literal = null;
    }

    if (scope.symbol?.id) {
      criteria.symbol = scope.symbol.id;
    } else {
      criteria.symbol = null;
    }

    const play = await ctx.daemon.entities.play.findOne(criteria);
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

    if (scope.producer?.id) {
      playData.producer = scope.producer.id;
    }

    if (scope.generator?.id) {
      playData.generator = scope.generator.id;
    }

    if (scope.literal?.id) {
      playData.literal = scope.literal.id;
    }

    if (scope.symbol?.id) {
      playData.symbol = scope.symbol.id;
    }

    const play = ctx.daemon.entities.play.create(playData);
    await ctx.daemon.entities.em.persist(play).flush();

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

    ctx.daemon.entities.em.assign(play, updateData);
    await ctx.daemon.entities.em.flush();

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
