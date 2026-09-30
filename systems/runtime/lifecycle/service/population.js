export const aperture = async (die, next) => {
  die.service.aperture = (await die.mask.aperture(die.service.aperture, die.mask)) || die.service.aperture;
  die.service.aperture.open("/status", () => die.controller.status).open("/manifest", () => die.service.manifest);
  await next();
};
