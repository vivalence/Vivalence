const TYPES = {
  char: "i8", i8: "i8", u8: "u8", i16: "i16", u16: "u16", i32: "i32", u32: "u32", i64: "i64", u64: "u64",
  f32: "f32", f64: "f64", bool: "bool", pointer: "pointer", void: "void", string: "pointer",
  usize: "usize", isize: "isize",
};

const deno = (type) => {
  if (!(type in TYPES)) throw new Error(`[deno-ffi] no Deno type for "${type}"`);
  return TYPES[type];
};

const encoder = new TextEncoder();

const address = (pointer) => (pointer === null ? 0n : BigInt(Deno.UnsafePointer.value(pointer)));

const pointerOf = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "bigint" || typeof value === "number") {
    return value === 0n || value === 0 ? null : Deno.UnsafePointer.create(BigInt(value));
  }
  if (typeof value === "string") return Deno.UnsafePointer.of(encoder.encode(`${value}\0`));
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return Deno.UnsafePointer.of(value);
  if (typeof value === "object") return value;
  throw new TypeError(`[deno-ffi] not a pointer: ${typeof value}`);
};

const identity = (value) => value;

const argument = (type) => (type === "pointer" || type === "string" ? pointerOf : type === "bool" ? Boolean : identity);

const result = (type) => (type === "pointer" ? address : identity);

const signature = (definition) => ({ parameters: definition.arguments.map(deno), result: deno(definition.return) });

export const suffix = Deno.build.os === "darwin" ? "dylib" : Deno.build.os === "windows" ? "dll" : "so";

export function dlopen(path, definitions) {
  const library = Deno.dlopen(
    path,
    Object.fromEntries(Object.entries(definitions).map(([name, definition]) => [name, signature(definition)])),
  );
  const callbacks = new Map();
  const functions = Object.fromEntries(
    Object.entries(definitions).map(([name, definition]) => {
      const native = library.symbols[name];
      const into = definition.arguments.map(argument);
      const out = result(definition.return);
      return [name, (...values) => out(native(...values.map((value, index) => into[index](value))))];
    }),
  );
  const lib = {
    registerCallback(definition, callback) {
      const into = definition.arguments.map((type) => (type === "pointer" ? address : identity));
      const unsafe = new Deno.UnsafeCallback(signature(definition), (...values) => {
        const value = callback(...values.map((each, index) => into[index](each)));
        return definition.return === "pointer" ? pointerOf(value) : value;
      });
      const pointer = address(unsafe.pointer);
      callbacks.set(pointer, unsafe);
      return pointer;
    },
    unregisterCallback(pointer) {
      callbacks.get(pointer).close();
      callbacks.delete(pointer);
    },
    close() {
      for (const unsafe of callbacks.values()) unsafe.close();
      callbacks.clear();
      library.close();
    },
  };
  return { lib, functions };
}

export function toArrayBuffer(pointer, length) {
  return Deno.UnsafePointerView.getArrayBuffer(Deno.UnsafePointer.create(BigInt(pointer)), length);
}

export function getRawPointer(buffer) {
  return address(Deno.UnsafePointer.of(buffer));
}

export default { dlopen, toArrayBuffer, getRawPointer, suffix };
