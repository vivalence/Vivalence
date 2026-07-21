import { specimen, Pipe } from "@vivalence/typology";

specimen.describe("Pipe", () => {
  specimen.it("a send fans out to every tap", () => {
    const pipe = new Pipe();
    const first = [];
    const second = [];
    pipe.tap((value) => first.push(value));
    const untap = pipe.tap((value) => second.push(value));
    pipe.send("x");
    untap();
    pipe.send("y");
    specimen.expect(first).toEqual(["x", "y"]);
    specimen.expect(second).toEqual(["x"]);
    specimen.expect(pipe.listeners.size).toBe(1);

    const aliased = new Pipe();
    const seen = [];
    const unsubscribe = aliased.subscribe((value) => seen.push(value));
    aliased.send("v");
    unsubscribe();
    aliased.send("dropped");
    specimen.expect(seen).toEqual(["v"]);

    const empty = new Pipe();
    empty.send("ignored");
    specimen.expect(empty.listeners.size).toBe(0);
  });

  specimen.it("an observer rides the async bridge", async () => {
    const pipe = new Pipe();
    const stream = pipe.observe();
    const pending = stream.next();
    await Promise.resolve();
    pipe.send("a");
    pipe.send("b");
    const first = await pending;
    const second = await stream.next();
    specimen.expect(first.value).toBe("a");
    specimen.expect(second.value).toBe("b");
    await stream.return();

    const aborted = new Pipe();
    const observer = aborted.observe();
    const pull = observer.next();
    await Promise.resolve();
    specimen.expect(aborted.listeners.size).toBe(1);
    observer.unsubscribe();
    await pull;
    specimen.expect(aborted.listeners.size).toBe(0);
  });

  specimen.it("a single send reaches every kind of sink", async () => {
    const pipe = new Pipe();
    const log = [];
    const ring = [];
    pipe.tap((value) => log.push(value));
    pipe.tap((value) => {
      ring.push(value);
      if (ring.length > 2) ring.shift();
    });

    const seen = [];
    const stream = pipe.observe();
    const consumer = (async () => {
      for await (const value of stream) {
        seen.push(value);
        if (seen.length === 3) stream.unsubscribe();
      }
    })();
    await Promise.resolve();

    pipe.send("a");
    pipe.send("b");
    pipe.send("c");
    await consumer;

    specimen.expect(log).toEqual(["a", "b", "c"]);
    specimen.expect(ring).toEqual(["b", "c"]);
    specimen.expect(seen).toEqual(["a", "b", "c"]);
  });

  specimen.it("a reactive holds the latest and folds the history", () => {
    const pipe = new Pipe();
    const latest = pipe.reactive();
    const history = pipe.reactive([], (list, value) => [...list, value]);

    const seen = [];
    latest.subscribe((value) => seen.push(value));

    pipe.send("a");
    pipe.send("b");
    pipe.send("c");

    specimen.expect(latest.get()).toBe("c");
    specimen.expect(history.get()).toEqual(["a", "b", "c"]);
    specimen.expect(seen).toEqual([null, "a", "b", "c"]);
  });
});
