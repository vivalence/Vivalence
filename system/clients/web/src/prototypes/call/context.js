export function createContext() {
  return {
    state: {},
    request: {
      headers: {},
    },
    response: {
      headers: {},
    },
  };
}

export default createContext;
