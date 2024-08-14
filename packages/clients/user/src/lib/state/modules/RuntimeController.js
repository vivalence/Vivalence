import { goto } from "$app/navigation";
import Card from "$components/cards/Card.svelte";

function goToStrategy(event, matrix) {
  goto("/strategy/" + event.active.id);
  matrix.clean();
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
  return runtimes.map((runtime) => ({
    id: runtime.id,
    label: runtime.name,
    data: { runtime },
  }));
}

function boot(event, matrix) {
  matrix.clean();

  matrix.use((m) => {
    m.set(
      m.signals.surface.List({
        label: "Chose Runtime",
        options: getRuntimes(m),
        active: { type: m.signals.surface.List.props.active.MODAL }, //render: Card
      }),
      (e, m) => {
        m.clean();
        m.use((m) =>
          m.set(
            m.signals.surface.List({
              label: "Chose Strategy",
              options: getStrategies(m, e),
              active: { type: m.signals.surface.List.props.active.MODAL }, //render: Card
            }),
            goToStrategy
          )
        );
      }
    );
  });
}

export default boot;
