export async function freight(die) {
  die.good.aperture.open("/cargo", () => die.good.cargo);
}
