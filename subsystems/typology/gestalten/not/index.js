// aaah linguistic collapse
class NotError extends Error {
  constructor(error = {}) {
    super(`${error.thing} ${error.not} ${error.expected}`);
    Object.assign(this, error);
    // console.trace(this);
  }
}

class Not {
  // super(`${not.thing} ${not.not} ${not.expected}`);
  constructor(error = {}) {
    Object.assign(this, error);
    // console.trace(this);
  }
  throw() {
    throw new NotError(this);
  }
}

const fab = (not) => (thing, expected) => new Not({ not, thing, expected });

export const not = {
  is: (not, thing, params) => {
    if (is.string(not)) not = { not };
    if (is.object(params)) Object.assign(not, params);
    return new Not({ ...not, thing });
  },
  cake: fab("cake"),
  viva: (thing) => fab("viva")(`${typeof thing}`),
  object: fab("object"),
  defined: fab("defined"),
};
