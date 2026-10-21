import { opentui } from "../host.js";
import * as core from "@opentui/core";
import { specimen } from "@vivalence/typology";
import ffi, { dlopen, getRawPointer, suffix, toArrayBuffer } from "../deno-ffi.js";

const fake = (symbols) => {
  const opened = [];
  const closed = [];
  const original = Deno.dlopen;
  Deno.dlopen = (path, signatures) => {
    opened.push({ path, signatures });
    return { symbols, close: () => closed.push(path) };
  };
  return { opened, closed, restore: () => (Deno.dlopen = original) };
};

specimen.describe("the host door — preload seats the ffi shim and the module worker; opentui resolves the core's renderer", { sanitizeOps: false, sanitizeResources: false }, () => {
  specimen.it("opentui resolves createCliRenderer, the very function @opentui/core exports", async () => {
    const resolved = await opentui();
    specimen.expect(Object.keys(resolved)).toEqual(["createCliRenderer"]);
    specimen.expect(resolved.createCliRenderer).toBe(core.createCliRenderer);
  });

  specimen.it("preload: globalThis.__opentuiNodeFfi is the deno-ffi shim; an absolute path Worker is a module worker on file://", async () => {
    specimen.expect(globalThis.__opentuiNodeFfi).toBe(ffi);
    specimen.expect(Object.keys(ffi)).toEqual(["dlopen", "toArrayBuffer", "getRawPointer", "suffix"]);
    const directory = await Deno.makeTempDir({ prefix: "ghost-worker-" });
    const path = `${directory}/worker.js`;
    await Deno.writeTextFile(path, `import { join } from "node:path";\nself.postMessage(join("a", "b"));\n`);
    const worker = new Worker(path);
    const message = await new Promise((resolve, reject) => {
      worker.onmessage = (event) => resolve(event.data);
      worker.onerror = (event) => reject(event.message);
    });
    worker.terminate();
    specimen.expect(message).toBe("a/b");
    await Deno.remove(directory, { recursive: true });
  });

  specimen.it("dlopen: each definition's types map to Deno's — string rides as a pointer — and the library opens once at the path", () => {
    const held = fake({ add: (left, right) => left + right });
    try {
      dlopen(`/lib/opentui.${suffix}`, { add: { arguments: ["i32", "u8", "char", "usize", "string", "f64"], return: "void" } });
      specimen.expect(held.opened).toEqual([{ path: `/lib/opentui.${suffix}`, signatures: { add: { parameters: ["i32", "u8", "i8", "usize", "pointer", "f64"], result: "void" } } }]);
    } finally {
      held.restore();
    }
  });

  specimen.it("dlopen: a type Deno has no name for is loud", () => {
    const held = fake({});
    try {
      specimen.expect(() => dlopen("/lib/x", { odd: { arguments: ["u128"], return: "void" } })).toThrow('[deno-ffi] no Deno type for "u128"');
    } finally {
      held.restore();
    }
  });

  specimen.it("functions: a pointer argument is null for null · undefined · 0 · 0n, a string is a NUL-terminated buffer, a view its address, a pointer object itself; bool is Boolean; a pointer return is its address as bigint", () => {
    const pointer = Deno.UnsafePointer.of(new Uint8Array([7]));
    const calls = [];
    const held = fake({
      take: (...values) => {
        calls.push(values);
        return pointer;
      },
      flag: (value) => value,
    });
    try {
      const { functions } = dlopen("/lib/x", { take: { arguments: ["pointer", "string", "bool", "i32"], return: "pointer" }, flag: { arguments: ["bool"], return: "bool" } });
      specimen.expect(functions.take(null, "hi", 1, 5)).toBe(BigInt(Deno.UnsafePointer.value(pointer)));
      const [first] = calls;
      specimen.expect(first[0]).toBe(null);
      specimen.expect(new Deno.UnsafePointerView(first[1]).getCString()).toBe("hi");
      specimen.expect([first[2], first[3]]).toEqual([true, 5]);
      functions.take(undefined, 0, 0, 0);
      functions.take(0n, new Uint8Array([1, 2]), "", 0);
      functions.take(pointer, Deno.UnsafePointer.value(pointer), false, 0);
      specimen.expect(calls[1][0]).toBe(null);
      specimen.expect(calls[1][1]).toBe(null);
      specimen.expect(calls[2][0]).toBe(null);
      specimen.expect(Deno.UnsafePointer.value(calls[2][1])).toBeGreaterThan(0);
      specimen.expect(calls[3][0]).toBe(pointer);
      specimen.expect(Deno.UnsafePointer.equals(calls[3][1], pointer)).toBe(true);
      specimen.expect(calls[2][2]).toBe(false);
      specimen.expect(functions.flag(0)).toBe(false);
      specimen.expect(() => functions.take(Symbol("x"), "", true, 0)).toThrow("[deno-ffi] not a pointer: symbol");
    } finally {
      held.restore();
    }
  });

  specimen.it("registerCallback mints a callback whose pointer arguments arrive as addresses and whose pointer return is a pointer; unregister closes it; close closes the rest and the library", () => {
    const held = fake({});
    try {
      const { lib } = dlopen("/lib/x", {});
      const seen = [];
      const echo = lib.registerCallback({ arguments: ["pointer", "i32"], return: "i32" }, (address, count) => {
        seen.push([address, count]);
        return count + 1;
      });
      specimen.expect(typeof echo).toBe("bigint");
      const call = new Deno.UnsafeFnPointer(Deno.UnsafePointer.create(echo), { parameters: ["pointer", "i32"], result: "i32" });
      const buffer = new Uint8Array([1]);
      specimen.expect(call.call(Deno.UnsafePointer.of(buffer), 41)).toBe(42);
      specimen.expect(seen).toEqual([[getRawPointer(buffer), 41]]);
      const pointing = lib.registerCallback({ arguments: [], return: "pointer" }, () => 0);
      const pointed = new Deno.UnsafeFnPointer(Deno.UnsafePointer.create(pointing), { parameters: [], result: "pointer" });
      specimen.expect(pointed.call()).toBe(null);
      lib.unregisterCallback(echo);
      lib.close();
      specimen.expect(held.closed).toEqual(["/lib/x"]);
    } finally {
      held.restore();
    }
  });

  specimen.it("toArrayBuffer reads length bytes at an address getRawPointer took; suffix names the platform's library", () => {
    const buffer = new Uint8Array([3, 1, 4, 1, 5]);
    specimen.expect([...new Uint8Array(toArrayBuffer(getRawPointer(buffer), 3))]).toEqual([3, 1, 4]);
    specimen.expect(suffix).toBe({ darwin: "dylib", windows: "dll" }[Deno.build.os] ?? "so");
  });
});
