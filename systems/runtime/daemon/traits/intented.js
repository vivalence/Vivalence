export const INTENTED = async (mode, daemon) => {
  for (const intentPojo of mode.cake.dataset?.intent || []) {
    intentPojo.mode = mode.id;

    await daemon.entities.intent.ensure(intentPojo);
  }
  await daemon.entities.em.flush();
};
