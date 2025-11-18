export class Url extends URL {
  constructor(url, more) {
    super(url, more);
  }

  get absolute() {
    return this.href;
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
// URL {
//   href: "https://vivalence.com:1794/",
//   origin: "https://vivalence.com:1794",
//   protocol: "https:",
//   username: "",
//   password: "",
//   host: "vivalence.com:1794",
//   hostname: "vivalence.com",
//   port: "1794",
//   pathname: "/",
//   hash: "",
//   search: ""
// }
