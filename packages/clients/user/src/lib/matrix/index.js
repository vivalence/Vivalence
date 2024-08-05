// let Matrix = new Map();
// const middlewares = [];
// const set = (signal, fn) => {Matrix.set(signal, fn); return true;};
// const middleware = (mw) => {middlewares.push(mw);};
// // const get = () => {return Matrix;};
// export default { set, get, middleware };
// [fun].reduce((acc, fn) => {return new Map([...acc, ...fn(new Map())]);}, Matrix);

import { writable } from "svelte/store";

const connect = (m) => {
  return (
    [...m].entries().reduce((acc, [signal, effect]) => {
      if (signal && effect && signal.onEffect) {
        signal.onEffect((event) => {
          console.log("signal", signal);
          console.log("event", event);
          console.log("effect", effect);
          if (effect.onSignal) {
            // const newMap = effect.onSignal(event);
            // if (newMap) {matrix.use(newMap);}
          }
        });

        acc.set(signal, effect);
      }
      return acc;
    }),
    new Map()
  );
};

const createMatrix = () => {
  const { subscribe, update } = writable(new Map());

  return {
    use: (middleware) => {
      update((matrix) => {
        const emptyMap = new Map([...matrix].filter(([_, v]) => v === null));
        const richMap = [middleware, connect].reduce((acc, fn) => fn(acc), emptyMap);
        return new Map([...matrix, ...richMap]);
      });
    },
    subscribe,
    update,
  };
};

export const matrix = createMatrix();

// const createSynapse = (signal, effect) => (...args) => {update(matrix => {const result = effect(...args); if (typeof result === 'function') {result(matrix);} else if (typeof result === 'object') {Object.entries(result).forEach(([key, value]) => matrix.set(key, value));} return matrix;});};
// const applyMiddleware = (...middlewares) => update((matrix) => {const applyMiddlewareChain = (map, [middleware, ...rest]) => middleware ? applyMiddlewareChain(middleware(map), rest) : map; const emptyMap = new Map([...matrix].filter(([_, v]) => v === null)); const richMap = applyMiddlewareChain(emptyMap, middlewares); richMap.forEach((value, key) => {if (!matrix.has(key) || matrix.get(key) === null) {matrix.set(key, value);}}); return matrix;});
// handleSignal: (signal, ...args) => update(matrix => {const handler = matrix.get(signal); if (handler && typeof handler.onSignal === 'function') {handler.onSignal(createSynapse(signal, handler));} return matrix;}),
// use: (middleware) =>
