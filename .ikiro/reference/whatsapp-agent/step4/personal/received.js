export const received = (modeDie, message) =>
  modeDie.datamap.shard.scope(async () => {
    const { parts, ...provider } = message;
    const user = await modeDie.entities.user.findOneOrFail({ slug: modeDie.mode.statics.user });
    modeDie.entities.em.setFilterParams("user", { user: user.id });
    const mine = { user: user.id, mode: modeDie.mode.id };
    const seen = await modeDie.entities.turn.count({
      thread: mine,
      meta: { provider: { platform: message.platform, id: message.id } },
    });
    if (seen) return;
    const newest = { orderBy: { createdAt: "DESC" }, limit: 1 };
    const [thread] = await modeDie.entities.thread.find(mine, newest);
    const [turn] = thread ? await modeDie.entities.turn.find({ thread: thread.id }, newest) : [];
    const fresh = parts[0].text === "/new";
    const silent = turn && Date.now() - turn.createdAt.getTime();
    const lapsed = silent > modeDie.mode.statics.idle * 1000;
    const current =
      !thread || (turn && (fresh || lapsed)) ? await modeDie.entities.thread.create(mine) : thread;
    await modeDie.entities.em.flush();
    if (fresh) return;
    await modeDie.entities.turn.chain({
      thread: current.id,
      role: "user",
      parts,
      meta: { provider },
    });
  });
