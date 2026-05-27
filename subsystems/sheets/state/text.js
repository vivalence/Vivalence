export function init({ value = "", cursor } = {}) {
  return { value, cursor: cursor ?? value.length };
}

export function insert(state, chunk) {
  return {
    value: state.value.slice(0, state.cursor) + chunk + state.value.slice(state.cursor),
    cursor: state.cursor + chunk.length,
  };
}

export function backspace(state) {
  if (!state.cursor) return state;
  return {
    value: state.value.slice(0, state.cursor - 1) + state.value.slice(state.cursor),
    cursor: state.cursor - 1,
  };
}

export function move(state, delta) {
  return { ...state, cursor: Math.max(0, Math.min(state.value.length, state.cursor + delta)) };
}
