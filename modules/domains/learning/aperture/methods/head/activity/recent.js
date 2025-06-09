export default async function ({ input }, ctx) {
  const user = await ctx.runtime.services.identity.getUser();
  const plays = await ctx.runtime.entities.play.find(
    { user: user.id },
    {
      populate: ["memory", "unit", "tag"],
      orderBy: { updatedAt: "desc" },
      limit: 25,
    },
  );
  const activities = [];
  for (const play of plays) {
    const recent = play.history
      .sort((a, b) => {
        return new Date(b.lastAt) - new Date(a.lastAt);
      })
      .splice(0, 3)
      .map((history) => ({
        timestamp: history.lastAt,
        signal: history.signal,
      }));

    const activity = {
      // might want to include memory strength.
      // should include what tactic/game was played.
      currentStatus: play.memory.status,
      nextAt: play.nextAt,
      recent,
    };
    if (play.unit) {
      activity.unit = {
        annotation: play.unit.annotation,
        data: play.unit.data,
      };
    }
    if (play.tag) {
      activity.tag = {
        ontology: play.tag.data.ONTOLOGICAL,
        name: play.tag.name,
        description: play.tag.description,
      };
    }
    activities.push(activity);
  }

  return activities;
}
