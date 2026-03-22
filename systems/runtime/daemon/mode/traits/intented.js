export const INTENTED = async (mode, daemon) => {
  for (const intentPojo of mode.cake.dataset?.intent || []) {
    intentPojo.mode = { id: mode.entity.id };
    await daemon.entities.intent.ensure(intentPojo);
  }
  await daemon.entities.em.flush();
};
