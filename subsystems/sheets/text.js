export const insert = (state, chunk) => ({
  value: state.value.slice(0, state.cursor) + chunk + state.value.slice(state.cursor),
  cursor: state.cursor + chunk.length,
});

export const backspace = (state) =>
  state.cursor === 0
    ? state
    : { value: state.value.slice(0, state.cursor - 1) + state.value.slice(state.cursor), cursor: state.cursor - 1 };

export const move = (state, delta) => ({ ...state, cursor: Math.max(0, Math.min(state.value.length, state.cursor + delta)) });
