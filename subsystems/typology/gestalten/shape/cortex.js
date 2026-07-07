export const strip = (cortex) =>
  [...cortex.faculties.values()].flat().map((faculty) => ({
    type: faculty.type,
    tune: faculty.tune,
    context: faculty.context,
    channels: faculty.channels,
    via: Object.keys(faculty.via),
  }));

export const wire = (connection, strip = []) =>
  strip.map((meta) => ({ ...meta, via: providers(connection, meta) }));

const providers = (connection, meta) => {
  const via = {};
  const round = (request) => ({ type: meta.type, tune: meta.tune, request });
  if (meta.via.includes("render"))
    via.render = (request) => connection.call("/render", round(request));
  if (meta.via.includes("stream"))
    via.stream = (request) => connection.observe("/stream", { method: "POST", body: round(request) });
  return via;
};
