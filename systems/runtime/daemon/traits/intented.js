// todo
// setup a twitch that ensures each intent for all users.
// if mode is not installed, also ensure all users have these intents.

export const INTENTED = async (mode, daemon) => {
  for (const intentPojo of mode.cake.dataset?.intent || []) {
    intentPojo.mode = mode.id;

    await daemon.entities.intent.ensure(intentPojo);
  }
  await daemon.entities.em.flush();
};
