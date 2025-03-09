import { colors } from "@cliffy/ansi/colors";

export default async function boot(viva) {
  console.log(colors.blue("Booting Viva..."));

  return viva;
}
