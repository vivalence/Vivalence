export default async function ({ scope, signal, lastAt, nextAt, nextIn }, ctx) {
  scope.user = ctx.user.id;

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
      user: scope.user,
    };

    if (scope.product) {
      criteria.product = scope.product;
    }

    if (scope.memory) {
      criteria.memory = scope.memory;
    }

    if (scope.producer) {
      criteria.producer = scope.producer;
      // } else {criteria.producer = null;
    }

    if (scope.commissioner) {
      criteria.commissioner = scope.commissioner;
      // } else {criteria.commissioner = null;
    }

    if (scope.literal) {
      criteria.literal = scope.literal;
    } else {
      criteria.literal = null;
    }

    if (scope.symbol) {
      criteria.symbol = scope.symbol;
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
    const playData = {
      user: scope.user,
      product: scope.product,
      memory: scope.memory,
      nextAt: new Date(nextAt),
      nextIn,
      lastAt: new Date(lastAt),
    };

    if (scope.producer) {
      playData.producer = scope.producer;
    }

    if (scope.commissioner) {
      playData.commissioner = scope.commissioner;
    }

    if (scope.literal) {
      playData.literal = scope.literal;
    }

    if (scope.symbol) {
      playData.symbol = scope.symbol;
    }

    const play = ctx.daemon.entities.play.create(playData);
    await ctx.daemon.entities.em.persist(play).flush();

    return {
      id: play.id,
      nextIn,
      nextAt,
      lastAt,
    };
  } catch (error) {
    console.error("Error creating play:", error);
    throw error;
  }
}

export async function update(input, ctx) {
  const { play, lastAt, nextIn, nextAt, signal, scope } = input;
  try {
    const updateData = {
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
    };
  } catch (error) {
    console.error("Error updating play:", error);
    throw error;
  }
}

// export default async function ({ scope, signal, lastAt, nextAt, nextIn }, ctx) {
//   scope.user = ctx.user.id;

//   const play = await read({ scope }, ctx);

//   if (!play) {
//     return await create({ scope, lastAt, nextIn, nextAt, signal }, ctx);
//   } else {
//     return await update({ play, lastAt, nextIn, nextAt, signal, scope }, ctx);
//   }
// }

// export async function read({ scope }, ctx) {
//   try {
//     const criteria = {
//       user: scope.user.id,
//     };

//     if (scope.product?.id) {
//       criteria.product = scope.product.id;
//     }

//     if (scope.memory?.id) {
//       criteria.memory = scope.memory.id;
//     }

//     if (scope.producer?.id) {
//       criteria.producer = scope.producer.id;
//       // } else {criteria.producer = null;
//     }

//     if (scope.commissioner?.id) {
//       criteria.commissioner = scope.commissioner.id;
//       // } else {criteria.commissioner = null;
//     }

//     if (scope.literal?.id) {
//       criteria.literal = scope.literal.id;
//     } else {
//       criteria.literal = null;
//     }

//     if (scope.symbol?.id) {
//       criteria.symbol = scope.symbol.id;
//     } else {
//       criteria.symbol = null;
//     }

//     const play = await ctx.daemon.entities.play.findOne(criteria);
//     return play;
//   } catch (error) {
//     console.error("Error reading play:", error);
//     throw error;
//   }
// }

// export async function create({ scope, lastAt, nextIn, nextAt, signal }, ctx) {
//   try {
//     const playData = {
//       user: scope.user.id,
//       product: scope.product.id,
//       memory: scope.memory.id,
//       nextAt: new Date(nextAt),
//       nextIn,
//       lastAt: new Date(lastAt),
//     };

//     if (scope.producer?.id) {
//       playData.producer = scope.producer.id;
//     }

//     if (scope.commissioner?.id) {
//       playData.commissioner = scope.commissioner.id;
//     }

//     if (scope.literal?.id) {
//       playData.literal = scope.literal.id;
//     }

//     if (scope.symbol?.id) {
//       playData.symbol = scope.symbol.id;
//     }

//     const play = ctx.daemon.entities.play.create(playData);
//     await ctx.daemon.entities.em.persist(play).flush();

//     return {
//       id: play.id,
//       nextIn,
//       nextAt,
//       lastAt,
//     };
//   } catch (error) {
//     console.error("Error creating play:", error);
//     throw error;
//   }
// }

// export async function update(input, ctx) {
//   const { play, lastAt, nextIn, nextAt, signal, scope } = input;
//   try {
//     const updateData = {
//       nextAt: new Date(nextAt),
//       nextIn,
//       lastAt: new Date(lastAt),
//     };

//     ctx.daemon.entities.em.assign(play, updateData);
//     await ctx.daemon.entities.em.flush();

//     return {
//       id: play.id,
//       nextIn,
//       nextAt,
//       lastAt,
//     };
//   } catch (error) {
//     console.error("Error updating play:", error);
//     throw error;
//   }
// }
