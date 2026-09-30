export const freight = async (die, next) => {
  die.daemon.aperture.open("/cargo", () => die.daemon.cargo);
  await next();
};
