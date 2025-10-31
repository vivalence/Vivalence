export default function (paladin) {
  paladin.is = {
    get sudo() {
      return ["SUDO", "GAIA"].includes(paladin.role);
    },
    get dev() {
      return paladin.mode === "DEVELOPMENT";
      //
    },
    get prod() {
      return paladin.mode === "PRODUCTION";
      //
    },
    get veryimportant() {
      return ["SUDO", "GAIA", "GHOST"].includes(paladin.role);
    },
  };
}
