export default async function (body, ctx) {
  const { annotation } = body;
  const annotationKey = Object.keys(annotation)
    .sort()
    .map((key) => key + ":" + annotation[key])
    .join(";");
  return annotationKey;
}
