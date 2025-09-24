export function createContext() {
  // const { access } = get(authority);
  // if (access) ctx.request.headers;
  return {
    state: {},
    request: {
      headers: {
        // ["Authorization"]: `Bearer ${access}`,
      },
    },
    response: {
      headers: {},
    },
  };
}

export default createContext;
