import { Signature } from "./signature.js";
import { string, hash, is } from "@vivalence/typology";

// import { join } from "@std/path"; // URLs always use posix-style paths

function normalize(path) {
  // Remove redundant slashes and resolve . and ..
  const parts = string.split(path);
  const result = [];

  for (const part of parts) {
    if (part === "..") {
      result.pop();
    } else if (part !== ".") {
      result.push(part);
    }
  }

  const normalized = "/" + result.join("/");
  return path.endsWith("/") && normalized !== "/" ? normalized + "/" : normalized;
}
function join(...paths) {
  // Join paths and normalize
  const joined = paths.filter(Boolean).join("/").replace(/\/+/g, "/"); // collapse multiple slashes

  return normalize(joined);
}

export class Url extends Signature {
  constructor(...args) {
    super(...args);
    this.query ??= {};
  }

  static coercions = [
    [
      (u) => is.url(u) && is.string(u),
      (u) => {
        const url = new URL(u);
        return {
          nature: url.pathname,
          origin: url.origin,
          query: Object.fromEntries(url.searchParams),
        };
      },
    ],
    [
      (u) => is.url(u) && !is.string(u),
      (u) => ({
        nature: u.pathname || u.nature,
        origin: u.origin,
        query: u.query ?? (u.searchParams ? Object.fromEntries(u.searchParams) : {}),
      }),
    ],
    [(u) => is.Signal(u), (u) => ({ nature: u.pathname })],
    [(u) => is.string(u), (s) => ({ nature: normalize(s) })],
  ];

  hasher() {
    return hash.array([this.origin, this.nature]);
  }

  branch(signature) {
    return new this.constructor({
      nature: join(this.nature, signature),
      origin: this.origin,
    });
  }

  with(params) {
    const merged = { ...this.query };
    for (const [key, value] of Object.entries(params)) {
      if (value == null) continue;
      merged[key] = value;
    }
    return new this.constructor({
      nature: this.nature,
      origin: this.origin,
      query: merged,
    });
  }

  scheme(proto) {
    return new this.constructor({
      nature: this.nature,
      origin: this.origin?.replace(/^[a-z]+:/, `${proto}:`),
      query: this.query,
    });
  }

  get protocol() {
    return this.origin?.match(/^([a-z]+):/)?.[1] ?? null;
  }

  get secure() {
    return this.protocol === "https" || this.protocol === "wss";
  }

  get search() {
    const entries = Object.entries(this.query ?? {});
    if (!entries.length) return "";
    return (
      "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&")
    );
  }

  get searchParams() {
    return new URLSearchParams(this.query);
  }

  get absolute() {
    return this.origin + this.nature + this.search;
  }

  get json() {
    return {
      url: this.absolute,
      origin: this.origin ?? null,
      scheme: this.protocol,
      path: this.nature,
      query: this.query ?? {},
      parts: this.nature.split("/").filter(Boolean),
    };
  }

  get href() {
    return this.absolute;
  }
  get pathname() {
    return this.nature;
  }
  get port() {
    return new URL(this.absolute).port;
  }
  get hostname() {
    return new URL(this.absolute).hostname;
  }
}
// import { Signature } from "./signature.js";
// import { is } from "@vivalence/typology";

// export class Url extends Signature {
//   ought(thing) {
//     return is.string(thing) || is.url(thing);
//   }

//   // is
//   parse(thing) {
//     if (is.url(thing)) {
//       this.nature = thing.pathname;
//       this.origin = thing.origin;
//     } else if (is.string(thing)) {
//       const url = new URL(thing);
//       this.origin = url.origin;
//       this.nature = url.pathname;
//     }
//   }

//   branch(nature) {
//     return new this.constructor(
//       `${this.absolute}${nature}`.replace(/\/+/g, "/"),
//     );
//   }

//   hasher() {
//     return hash.array([this.origin, this.nature]);
//   }
//   get href() {
//     return this.absolute;
//   }
//   get absolute() {
//     return `${this.origin}${this.nature}`; // const path = this.array .map((s) => s.nature) .join("") .replace(/\/+/g, "/"); // return (this.tilde.origin || "") + (path || "/");
//   }
//   get pathname() {
//     return this.nature;
//   }
//   get json() {
//     return { ...super.json, origin: this.origin };
//   }
//   // get json() {const json = { nature: this.nature, origin: this.origin }; if (this.trace?.json) json.trace = this.trace.json; return json;}
// }

// // import { Signature } from "./signature.js";
// // import { is } from "@vivalence/typology";

// // export class Url extends Signature {
// //   origin = null;

// //   constructor(nature, trace) {
// //     if (nature instanceof URL) nature = nature.href;
// //     super(nature, trace);
// //   }

// //   hasher() {
// //     return hash.array([this.origin, this.nature]);
// //   }

// //   parse(string) {
// //     if (string instanceof URL) string = string.href;

// //     const match = string.match(/^(https?:\/\/[^\/]+)?(\/.*)?$/);
// //     if (match?.[1]) this.origin = match[1];

// //     const pathname = match?.[2] || "/";
// //     this.nature = pathname.replace(/\/+/g, "/") || "/";
// //   }

// //   get href() {
// //     const path = this.array
// //       .map((s) => s.nature)
// //       .join("")
// //       .replace(/\/+/g, "/");
// //     return (this.tilde.origin || "") + (path || "/");
// //   }

// // }

// // export class Url extends URL {
// //   constructor(url, more) {
// //     super(url, more);
// //   }

// //   branch() {}

// //   get absolute() {
// //     return this.href;
// //   }

// //   [Symbol.for("nodejs.util.inspect.custom")]() {
// //     return `${this.constructor.name}:${this.href}`;
// //   }

// //   [Symbol.for("Deno.customInspect")]() {
// //     return `${this.constructor.name}:${this.href}`;
// //   }

// //   // [Symbol.toPrimitive](hint) {
// //   //   return `${this.constructor.name}:${this.href}`;
// //   // }
// // }

// // // export class Url extends URL {
// // //   constructor(url, more) {
// // //     super(url, more);

// // //     this[Symbol.for("nodejs.util.inspect.custom")] = () => {
// // //       return `${this.constructor.name}:${this.href}`;
// // //     };
// // //   }
// // //   [Symbol.for("nodejs.util.inspect.custom")]() {
// // //     return `${this.constructor.name}:${this.href}`;
// // //   }
// // //   [Symbol.toPrimitive](hint) {
// // //     return `${this.constructor.name}:${this.href}`;
// // //   }
// // //   toJSON() {
// // //     console.log("JSSSSOOOOONNNN");
// // //     return `URL:${this.constructor.name}:${this.href}`;
// // //   }
// // //   toString() {
// // //     return `${this.constructor.name}:${this.href}`;
// // //   }
// // // }
// // // URL {
// // //   href: "https://vivalence.com:1794/",
// // //   origin: "https://vivalence.com:1794",
// // //   protocol: "https:",
// // //   username: "",
// // //   password: "",
// // //   host: "vivalence.com:1794",
// // //   hostname: "vivalence.com",
// // //   port: "1794",
// // //   pathname: "/",
// // //   hash: "",
// // //   search: ""
// // // }

// import { Signature } from "./signature.js";
// import { is } from "@vivalence/typology";

// export class Url extends Signature {
//   static coercions = [
//     [is.url, (u) => ({ nature: u.pathname, origin: u.origin })],
//     [
//       is.string,
//       (s) => {
//         const u = new URL(s);
//         return { nature: u.pathname, origin: u.origin };
//         //   parse(thing) {
//         //     if (is.url(thing)) {
//         //       this.nature = thing.pathname;
//         //       this.origin = thing.origin;
//         //     } else if (is.string(thing)) {
//         //       const url = new URL(thing);
//         //       this.origin = url.origin;
//         //       this.nature = url.pathname;
//         //     }
//         //   }
//       },
//     ],
//   ];

//   nature = "/";
//   origin = null;

//   hasher() {
//     return hash.array([this.origin, this.nature]);
//   }

//   branch(signature) {
//     return new this.constructor(
//       `${this.absolute}${nature}`.replace(/\/+/g, "/"), // needs propper join
//       // {nature:join(this.nature,signature), origin: this.origin}
//     );
//   }

//   get href() {
//     return this.absolute;
//   }

//   get absolute() {
//     // too much shit
//     // const origin = this.tilde.origin || ""; const path = this.array .map((s) => s.nature) .join("") .replace(/\/+/g, "/") || "/"; return origin + path;
//     // all we need actually is this.origin and this.nature jioned.
//   }

//   get pathname() {
//     return this.nature;
//   }

//   get json() {
//     return { ...super.json, origin: this.origin };
//   }
// }
