export function preferences(mode) {
  const key = `viva.mode.${mode}`;
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? {};
    } catch {
      return {};
    }
  };
  const write = (patch) => localStorage.setItem(key, JSON.stringify({ ...read(), ...patch }));
  return { read, write };
}
