export const strip = (cortex) =>
  [...cortex.faculties.values()].flat().map((faculty) => ({
    type: faculty.type,
    id: faculty.id,
    tune: faculty.tune,
    context: faculty.context,
    ...(faculty.options !== undefined && { options: faculty.options }),
    ...(faculty.choices !== undefined && { choices: faculty.choices }),
    channels: faculty.channels,
    ...(faculty.provider && { provider: faculty.provider }),
    ...(faculty.config && { config: faculty.config }),
    via: Object.keys(faculty.via),
  }));

export const wire = (connection, stripped = []) => stripped.map((meta) => ({ ...meta, via: avenues(connection.branch(meta.type), meta) }));

const avenues = (faculty, meta) => {
  const via = {};
  if (meta.via.includes("render")) via.render = (request) => faculty.call("/render", { provider: meta.provider, id: meta.id, ...request });
  if (meta.via.includes("stream")) via.stream = (request) => faculty.observe("/stream", { method: "POST", body: { provider: meta.provider, id: meta.id, ...request } });
  return via;
};
