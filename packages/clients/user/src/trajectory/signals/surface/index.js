import ListComponent from "../../ui/list/List.svelte";

const createSurfaceSignal = (key, component) => {
  const signal = (props) => {
    signal.id = Math.random().toString(36).substring(2, 15);
    return { ...signal, ...props };
  };

  signal.key = key;
  signal.component = component;
  signal.type = "surface";

  signal.listen = (effect, trajectory) => {
    signal.effect = effect;
  };
  signal.trigger = (event) => {
    signal.effect(event);
  };

  return signal;
};

const List = createSurfaceSignal("List", ListComponent);
List.props = { active: { MODAL: "MODAL" } };

export const signals = { List };
