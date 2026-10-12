export function init({ options, index = 0 } = {}) {
  return { options, index };
}

export function move(state, delta) {
  const count = state.options.length;
  if (!count) return state;
  return { ...state, index: Math.max(0, Math.min(count - 1, state.index + delta)) };
}

export function value(state) {
  const option = state.options[state.index];
  return option?.value ?? option;
}
