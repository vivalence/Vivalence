export default class Scope {
  constructor(scope = {}) {
    for (const key in scope) {
      if (Object.prototype.hasOwnProperty.call(scope, key)) {
        this[key] = scope[key];
      }
    }
  }
}
