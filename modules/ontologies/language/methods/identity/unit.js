export default async function (body, ctx) {
  const { annotation, ...unit } = body.unit;
  // resulting string is kinda ugly and :; is not url conform
  const annotationKey = Object.keys(annotation)
    .sort()
    .filter((key) => key !== "suffix") //temporary. removing this requires update to all verb and aux units.
    .map((key) => key + ":" + annotation[key])
    .join(";");
  return annotationKey;
}
