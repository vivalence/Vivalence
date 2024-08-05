import Card from "$components/cards/Card.svelte";
import ui from "$signals/ui";

const options = [
  // fetch available strategies
  { label: "A", id: "123" },
  { label: "B", id: "125" },
  { label: "C", id: "124" },
];

const go = (path) => {};

function onSignal(event, m) {
  m.set(
    ui.LIST({
      options,
      active: { type: ui.LIST.props.active.MODAL, render: Card },
    }),
    {
      onSignal: (event, m) => {
        go("/strategy/" + event.active.id);
        return null; // taken by matrix to mean -- ui.List is done
        // fallback to home.
      },
    }
  );

  return m;
}

export default { onSignal };
