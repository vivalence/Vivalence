export default async function (body, ctx) {
  console.log("DEPRACATED CALL TO /tags/weakest");
  console.log("use /memory/filter/tags/byStrength/weakest instead");
  throw new Error("DEPRACATED CALL TO /tags/weakest");
}
