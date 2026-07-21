import { specimen, Broadcaster } from "@vivalence/typology";

specimen.describe("Broadcaster", () => {
  specimen.it("a push reaches every subscriber and queues until pulled", async () => {
    const broadcaster = new Broadcaster();
    const first = broadcaster.subscribe();
    const second = broadcaster.subscribe();
    broadcaster.push({ op: "create", entity: { id: "1", slug: "test" } }, { id: "1", slug: "test" });

    const firstResult = await first.iterable[Symbol.asyncIterator]().next();
    const secondResult = await second.iterable[Symbol.asyncIterator]().next();
    specimen.expect(firstResult.value.op).toBe("create");
    specimen.expect(firstResult.value.entity.slug).toBe("test");
    specimen.expect(secondResult.value.op).toBe("create");
    first.unsubscribe();
    second.unsubscribe();

    const queued = new Broadcaster();
    const subscription = queued.subscribe();
    queued.push({ op: "create", entity: { id: "1" } }, { id: "1" });
    queued.push({ op: "update", entity: { id: "2" } }, { id: "2" });
    const iterator = subscription.iterable[Symbol.asyncIterator]();
    const head = await iterator.next();
    const tail = await iterator.next();
    specimen.expect(head.value.entity.id).toBe("1");
    specimen.expect(tail.value.entity.id).toBe("2");
    subscription.unsubscribe();
  });

  specimen.it("a filter narrows the feed and an empty filter matches everything", async () => {
    const broadcaster = new Broadcaster();
    const filtered = broadcaster.subscribe({ slug: "hello" });
    broadcaster.push({ op: "update", entity: { id: "1", slug: "other" } }, { id: "1", slug: "other" });
    broadcaster.push({ op: "update", entity: { id: "2", slug: "hello" } }, { id: "2", slug: "hello" });
    const match = await filtered.iterable[Symbol.asyncIterator]().next();
    specimen.expect(match.value.entity.slug).toBe("hello");
    filtered.unsubscribe();

    const open = new Broadcaster();
    const everything = open.subscribe();
    open.push({ op: "create", entity: { id: "1" } }, { id: "1" });
    const anything = await everything.iterable[Symbol.asyncIterator]().next();
    specimen.expect(anything.value.op).toBe("create");
    everything.unsubscribe();
  });

  specimen.it("an unsubscribe or a timeout ends the feed", async () => {
    const broadcaster = new Broadcaster();
    const { iterable, unsubscribe } = broadcaster.subscribe();
    specimen.expect(broadcaster._subscribers.size).toBe(1);
    unsubscribe();
    specimen.expect(broadcaster._subscribers.size).toBe(0);

    const ended = await iterable[Symbol.asyncIterator]().next();
    specimen.expect(ended.done).toBe(true);

    broadcaster.push({ op: "create", entity: { id: "1" } }, { id: "1" });
    const afterPush = await iterable[Symbol.asyncIterator]().next();
    specimen.expect(afterPush.done).toBe(true);

    const timed = new Broadcaster();
    const subscription = timed.subscribe({}, { timeout: 50 });
    const expired = await subscription.iterable[Symbol.asyncIterator]().next();
    specimen.expect(expired.done).toBe(true);
    subscription.unsubscribe();
  });
});
