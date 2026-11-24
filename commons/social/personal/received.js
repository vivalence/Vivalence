import { v7 } from "uuid";

export const received = (modeDie, message) =>
  modeDie.datamap.shard.scope(async () => {
    const { parts, ...provider } = message;
    const user = await modeDie.entities.user.findOneOrFail({
      slug: modeDie.mode.statics.users[message.from],
    });
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
    const id = v7();
    const packets = await modeDie.mode.harness.dialogue.stream({
      thread: current.id,
      turn: id,
      parts,
      system: { messenger: modeDie.providers[message.platform].format },
    });
    const heard = await modeDie.entities.turn.findOneOrFail({ id });
    heard.meta = { provider };
    await modeDie.entities.em.flush();
    modeDie.providers[message.platform]
      .typing(message)
      .catch((error) => modeDie.mode.stdout.fault(error));
    await Array.fromAsync(packets);
  });
