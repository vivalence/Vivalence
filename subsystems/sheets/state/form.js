// a form is one or more pages of fields. one page is pages.length === 1 — one concept, not two.
export function init({ pages, actions }) {
  return { pages, actions, page: 0, active: 0, values: {}, done: false, action: null };
}

const fieldsOf = (state) => state.pages[state.page]?.fields ?? [];

export function reduce(state, event) {
  switch (event.kind) {
    case "set": {
      const field = fieldsOf(state)[state.active];
      if (!field) return state;
      return { ...state, values: { ...state.values, [field.name]: event.value } };
    }
    case "next": {
      const fields = fieldsOf(state);
      if (state.active < fields.length) return { ...state, active: state.active + 1 };
      // past the actions of a page: cross into the next one, unless this is the last.
      if (state.page + 1 >= state.pages.length) return state;
      return { ...state, page: state.page + 1, active: 0 };
    }
    case "prev": {
      if (state.active > 0) return { ...state, active: state.active - 1 };
      if (state.page === 0) return state;
      const back = state.page - 1;
      return { ...state, page: back, active: state.pages[back].fields.length };
    }
    case "action":
      return { ...state, done: true, action: event.action };
    default:
      return state;
  }
}

export function activeField(state) {
  const fields = fieldsOf(state);
  return state.active < fields.length ? fields[state.active] : null;
}

export function atActions(state) {
  return state.active >= fieldsOf(state).length;
}

export function page(state) {
  return state.pages[state.page] ?? null;
}
