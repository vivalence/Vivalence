import byStrength from "../lib/byStrength.js";

export default async function (input, ctx) {
  return await byStrength("symbol")(input, ctx);
}
