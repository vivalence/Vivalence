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

export const repeating = (fire, delay = 200, every = 120) => {
  let timer = null;
  let fired = 0;
  const stop = () => {
    clearTimeout(timer);
    clearInterval(timer);
    timer = null;
  };
  return {
    press: (subject) => {
      stop();
      fired = 0;
      timer = setTimeout(() => {
        timer = setInterval(() => {
          fired += 1;
          fire(subject);
        }, every);
      }, delay);
    },
    release: stop,
    leave: () => {
      stop();
      fired = 0;
    },
    click: (subject) => {
      if (fired === 0) fire(subject);
      fired = 0;
    },
  };
};

export const listing = (store) => (store() === undefined || store() === null ? [] : store());
