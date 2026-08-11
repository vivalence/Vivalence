export const begin = (knowables, streak) => ({
  streak: streak ?? 0,
  attempts: 0,
  pending: knowables.map((knowable, index) => ({ index, runs: 0, reps: 0 })),
});

export const current = (state) => state.pending[0] ?? null;

export const complete = (state) => state.pending.length === 0;

export const first = (state) => (current(state)?.reps ?? 0) === 0;

export const record = (state, success) => {
  const [head, ...rest] = state.pending;
  if (!head) return state;
  const entry = { ...head, reps: head.reps + 1, runs: success ? head.runs + 1 : 0 };
  return {
    ...state,
    attempts: state.attempts + 1,
    pending: entry.runs >= state.streak ? rest : [...rest, entry],
  };
};
