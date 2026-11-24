export const strip = (cortex) =>
  [...cortex.faculties.values()].flat().map((faculty) => ({
    type: faculty.type,
    id: faculty.id,
    ...(faculty.model && { model: faculty.model }),
    ...(faculty.upstream && { upstream: faculty.upstream }),
    ...(faculty.tier && { tier: faculty.tier }),
    tune: faculty.tune,
    context: faculty.context,
    ...(faculty.options !== undefined && { options: faculty.options }),
    ...(faculty.choices !== undefined && { choices: faculty.choices }),
    channels: bare(faculty.channels),
    ...(faculty.provider && { provider: faculty.provider }),
    ...(faculty.config && { config: faculty.config }),
  }));

const sides = ({ in: taken, out }) => ({ in: taken, out });

const bare = (channels) => ({
  ...(channels.render && { render: sides(channels.render) }),
  ...(channels.stream && { stream: sides(channels.stream) }),
});

export const wire = (connection, stripped = []) =>
  stripped.map((meta) => ({ ...meta, channels: avenues(connection.branch(meta.type), meta) }));

const avenues = (faculty, meta) => {
  const channels = {};
  if (meta.channels.render)
    channels.render = {
      ...meta.channels.render,
      via: (request) =>
        faculty.call("/render", { provider: meta.provider, id: meta.id, ...request }),
    };
  if (meta.channels.stream)
    channels.stream = {
      ...meta.channels.stream,
      via: (request) =>
        faculty.observe("/stream", {
          method: "POST",
          body: { provider: meta.provider, id: meta.id, ...request },
        }),
    };
  return channels;
};
