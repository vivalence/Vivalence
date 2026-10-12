import { specimen, atom as belt } from "@vivalence/typology";
import { atom } from "nanostores";

specimen.describe("atom.until", () => {
  specimen.it("resolves at once when the value already satisfies", async () => {
    const store = atom(3);
    const controller = new AbortController();
    specimen.expect(await belt.until(store, (value) => value > 2, controller.signal)).toBe(3);
  });

  specimen.it("waits for the first satisfying value and then stops listening", async () => {
    const store = atom(0);
    const controller = new AbortController();
    let settled = null;
    const pending = belt.until(store, (value) => value >= 2, controller.signal).then((value) => (settled = value));
    store.set(1);
    await Promise.resolve();
    specimen.expect(settled).toBe(null);
    store.set(2);
    specimen.expect(await pending).toBe(2);
    store.set(5);
    specimen.expect(settled).toBe(2);
    specimen.expect(store.lc).toBe(0);
  });

  specimen.it("rejects with the signal's reason when aborted, releasing the listener", async () => {
    const store = atom(false);
    const controller = new AbortController();
    const pending = belt.until(store, Boolean, controller.signal);
    controller.abort("killed");
    await specimen.expect(pending).rejects.toBe("killed");
    specimen.expect(store.lc).toBe(0);
  });

  specimen.it("an already aborted signal rejects without listening", async () => {
    const store = atom(false);
    const controller = new AbortController();
    controller.abort("gone");
    await specimen.expect(belt.until(store, Boolean, controller.signal)).rejects.toBe("gone");
    specimen.expect(store.lc).toBe(0);
  });
});
