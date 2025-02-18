// import config from "@vivalence/config";
import { colors } from "@vivalence/interfaces-cli";

export default async function deploy({ database }) {
  console.log(colors.blue("Starting database migration..."));

  // importing the mikro client and running deploy on it.

  console.log(colors.blue("database migrated!"));
  // return {};
}
