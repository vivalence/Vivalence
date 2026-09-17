import { logger } from "$telemetry";

export function focus({ terminals }) {
  const hydrated = new Map();

  const engage = async (thread) => {
    if (!thread?.daemon?.entities || hydrated.has(thread.id)) return;
    hydrated.set(thread.id, null);
    const focusing = logger.entry(`focus/${thread.id}`).open();
    const { buffer, turn } = thread.daemon.entities;
    try {
      const [buffers, turns] = await Promise.all([
        buffer.find({ thread: thread.id }, { populate: ["literals", "symbols"] }),
        turn.find({ thread: thread.id }, { populate: [] }),
      ]);
      const offBuffer = buffer.subscribe({ thread: thread.id });
      const offTurn = turn.subscribe({ thread: thread.id });
      hydrated.set(thread.id, () => {
        offBuffer();
        offTurn();
      });
      focusing.note({
        message: `thread focused`,
        buffers: buffers.length,
        turns: turns.length,
      });
    } catch (error) {
      hydrated.delete(thread.id);
      focusing.fault(error);
    }
    focusing.close();
  };

  let inner = [];
  const offEntities = terminals.$entities.subscribe((entities) => {
    inner.forEach((unsubscribe) => unsubscribe());
    inner = entities.map((terminal) => terminal.$thread.subscribe((thread) => engage(thread)));
  });

  return () => {
    offEntities();
    inner.forEach((unsubscribe) => unsubscribe());
    hydrated.forEach((teardown) => teardown?.());
  };
}
