import { goto } from "$app/navigation";
import { Card } from "@vivalence/ui";

function goToStrategy(event, trajectory) {
  goto("/strategy/" + event.active.id);
  trajectory.clean();
  trajectory.setMode("closed");
}

async function getStrategies({ locals }, { active }) {
  const { data: strategies, error } = await locals.supabase
    .from("Strategy")
    .select("*")
    .eq("runtimeId", active.id)
    .order("name", { ascending: true });

  if (error) console.log("error", error);

  return strategies.map((strategy) => ({
    id: strategy.id,
    label: strategy.name,
    data: { strategy },
  }));
}

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

function boot(event, trajectory) {
  trajectory.use((t) => {
    t.clean().setMode("open");
    t.set(t.signals.surface.List({ label: "Chose Runtime", options: getRuntimes(t) }), (e, t) => {
      t.use((t) => {
        t.clean().set(
          t.signals.surface.List({ label: "Chose Strategy", options: getStrategies(t, e) }),
          goToStrategy
        );
      });
    });
  });
}

export default boot;
