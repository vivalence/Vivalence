export function init({ fields, actions }) {
  return { fields, actions, active: 0, values: {}, done: false, action: null };
}

export function reduce(state, event) {
  switch (event.kind) {
    case "set": {
      const field = state.fields[state.active];
      if (!field) return state;
      return { ...state, values: { ...state.values, [field.name]: event.value } };
    }
    case "next":
      return { ...state, active: Math.min(state.fields.length, state.active + 1) };
    case "prev":
      return { ...state, active: Math.max(0, state.active - 1) };
    case "action":
      return { ...state, done: true, action: event.action };
    default:
      return state;
  }
}

export function activeField(state) {
  return state.active < state.fields.length ? state.fields[state.active] : null;
}

export function atActions(state) {
  return state.active >= state.fields.length;
}
