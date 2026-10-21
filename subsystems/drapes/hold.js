export const holding = (fire, delay = 500) => {
  let timer = null;
  return {
    press: () => {
      timer = setTimeout(() => {
        timer = null;
        fire();
      }, delay);
    },
    release: () => {
      clearTimeout(timer);
      timer = null;
    },
  };
};

export const listing = (store) => (store() === undefined || store() === null ? [] : store());
