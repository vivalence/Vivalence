import { Entity } from "../prototypes/entity.js";

export class Buffer extends Entity {
  view = null;
  context = null;

  static from(pojo, view) {
    const buffer = new Buffer(pojo);
    buffer.view = view;
    return buffer;
  }

  toJSON() {
    return {
      id: this.id,
      mode: typeof this.mode === "object" ? this.mode?.slug : this.mode,
      view: this.view ? { url: this.view.url } : null,
      data: this.data,
      literals: this.literals,
      symbols: this.symbols,
    };
  }
}

// export class Buffer extends Entity {
//   view = null;
//   context = null;
//
//   static from(pojo, view, context) {
//     const buffer = new Buffer(pojo);
//     buffer.view = view;
//     buffer.context = { ...context, buffer, ...(buffer.props ?? {}) };
//     return buffer;
//   }
//
//   toJSON() {
//     return {
//       id: this.id,
//       mode: typeof this.mode === "object" ? this.mode?.slug : this.mode,
//       view: this.view ? { url: this.view.url } : null,
//       props: this.props,
//     };
//   }
// }

export const prototype = Buffer;
