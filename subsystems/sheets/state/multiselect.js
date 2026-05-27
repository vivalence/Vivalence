export function init({ options, selected = [] } = {}) {
  return { options, index: 0, selected: new Set(selected) };
}

export function move(state, delta) {
  const count = state.options.length;
  if (!count) return state;
  return { ...state, index: Math.max(0, Math.min(count - 1, state.index + delta)) };
}

export function toggle(state) {
  const option = state.options[state.index];
  const key = option?.value ?? option;
  const selected = new Set(state.selected);
  selected.has(key) ? selected.delete(key) : selected.add(key);
  return { ...state, selected };
}

export function values(state) {
  return [...state.selected];
}
