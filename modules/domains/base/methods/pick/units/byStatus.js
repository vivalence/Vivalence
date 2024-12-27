import byStatus from "../lib/byStatus.js";

export default async function (input, ctx) {
  return await byStatus("units")(input, ctx);
}
