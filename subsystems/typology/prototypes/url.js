export class Url extends URL {
  constructor(url, more) {
    super(url, more);
  }

  [Symbol.for("nodejs.util.inspect.custom")]() {
    return `${this.constructor.name}:${this.href}`;
  }

  [Symbol.for("Deno.customInspect")]() {
    return `${this.constructor.name}:${this.href}`;
  }

  // [Symbol.toPrimitive](hint) {
  //   return `${this.constructor.name}:${this.href}`;
  // }
}
// export class Url extends URL {
//   constructor(url, more) {
//     super(url, more);

//     this[Symbol.for("nodejs.util.inspect.custom")] = () => {
//       return `${this.constructor.name}:${this.href}`;
//     };
//   }
//   [Symbol.for("nodejs.util.inspect.custom")]() {
//     return `${this.constructor.name}:${this.href}`;
//   }
//   [Symbol.toPrimitive](hint) {
//     return `${this.constructor.name}:${this.href}`;
//   }
//   toJSON() {
//     console.log("JSSSSOOOOONNNN");
//     return `URL:${this.constructor.name}:${this.href}`;
//   }
//   toString() {
//     return `${this.constructor.name}:${this.href}`;
//   }
// }
