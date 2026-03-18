export class Context {
  constructor(ctx) {
    console.log("legacy vector context");
    Object.assign(this, ctx);
  }
}
