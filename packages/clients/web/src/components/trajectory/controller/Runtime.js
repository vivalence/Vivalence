import { goto } from "$app/navigation";

async function getRuntimes({ locals }) {
  const { data: runtimes } = await locals.supabase
    .from("Runtime")
    .select("*")
    .order("name", { ascending: true });

  const result = runtimes.map((runtime) => ({
    id: runtime.id,
    label: runtime.name,
    data: { runtime },
  }));
  return result;
}
async function getUsersStrategies({ locals }, { active }) {
  const { data: strategies, error } = await locals.supabase
    .from("Strategy")
    .select("*")
    .eq("runtimeId", active.id)
    .order("name", { ascending: true });

  if (error) throw error;

  return strategies.map((strategy) => ({
    id: strategy.id,
    label: strategy.name,
    data: { strategy },
  }));
}

async function getJoinableStrategies(runtime, t) {
  const { data: strategies, error } = await t.locals.call("/v/runtime/available/strategies", {
    runtime,
  });
  if (error) throw error;

  return strategies.map((strategy) => ({
    id: strategy.slug,
    label: strategy.name,
    data: { strategy },
  }));
}

const joinStrategy = (runtime) => async (event, t) => {
  const { data: strategy, error } = await t.locals.call("/v/user/join/strategy", {
    runtime,
    strategy: event.active.data.strategy,
  });
  if (error) throw error;
  goto("/strategy/" + strategy.id);
  t.clean().setMode("closed");
};

function goToStrategy(event, trajectory) {
  goto("/strategy/" + event.active.id);
  trajectory.clean().setMode("closed");
}

function boot(event, trajectory) {
  trajectory.use((t) => {
    t.clean().setMode("open");

    const effectJoin = (e, t) => {
      const effect = (event, t) => {
        const runtime = event.active.data.runtime;
        const options = getJoinableStrategies(runtime, t);
        const signal = t.signals.surface.List({ label: "Chose Strategy", options });
        t.use((t) => t.clean().set(signal, joinStrategy(runtime)));
      };
      const signal = t.signals.surface.List({ label: "Chose Runtime", options: getRuntimes(t) });

      t.use((t) => t.clean().set(signal, effect));
    };

    const effectGo = (e, t) => {
      const effect = (e, t) => {
        const options = getUsersStrategies(t, e);
        const signal = t.signals.surface.List({ label: "Chose Strategy", options });
        t.use((t) => t.clean().set(signal, goToStrategy));
      };
      const signal = t.signals.surface.List({ label: "Chose Runtime", options: getRuntimes(t) });

      t.use((t) => t.clean().set(signal, effect));
    };

    t.set(t.signals.navigation.j({ label: "(j)oin" }), effectJoin);
    t.set(t.signals.navigation.g({ label: "(g)o" }), effectGo);
  });
}

export default boot;
