import { steer } from "@vivalence/typology";

export const modes = (execution) => async (die, next) => {
  const { daemon } = die;
  const releases = [];
  for (const mode of daemon.modes) {
    const seat = { ...die, mode };
    await steer.dispatch.execute(execution, seat);
    releases.push(...seat.releases);
  }
  try {
    await next();
  } finally {
    for (const release of releases.reverse()) await release();
  }
};

export const healthy = async (die, next) => {
  const { daemon } = die;
  daemon.$status.set({ code: "HEALTHY" });
  daemon.mounted.resolve();
  try {
    await next();
  } finally {
    daemon.$status.set({ code: "RELEASED" });
  }
};
