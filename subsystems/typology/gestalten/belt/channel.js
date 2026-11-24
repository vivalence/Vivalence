export const media = (written) => {
  const [essence, ...parameters] = written.split(";").map((piece) => piece.trim());
  return {
    essence: essence.toLowerCase(),
    parameters: Object.fromEntries(
      parameters.map((parameter) => {
        const [name, value] = parameter.split("=");
        return [
          name.toLowerCase(),
          value
            .replaceAll('"', "")
            .split(",")
            .map((piece) => piece.trim()),
        ];
      }),
    ),
  };
};

const within = (taken, given) =>
  taken.essence === given.essence &&
  Object.entries(taken.parameters).every(
    ([name, values]) =>
      !(name in given.parameters) ||
      given.parameters[name].every((value) => values.includes(value)),
  );

export const match = (channel, part) =>
  channel.type === part.type &&
  (!channel.mime ||
    ("mime" in part && channel.mime.some((taken) => within(media(taken), media(part.mime)))));

const named = (channel) => (channel.mime ? channel.mime.join(", ") : channel.type);

const WORDED = { in: "takes", out: "gives" };

const refused = (faculty, via, side, part) =>
  new Error(
    `[${faculty.type}] '${faculty.id}' ${WORDED[side]} no ` +
      `'${part.mime ?? part.type}' ${part.type} on ${via}: ` +
      `it ${WORDED[side]} ${faculty.channels[via][side].map(named).join(", ")}`,
  );

const PADDED = [
  [(data) => data.endsWith("=="), 2],
  [(data) => data.endsWith("="), 1],
  [() => true, 0],
];

const weight = (part) =>
  Math.floor((part.data.length * 3) / 4) - PADDED.find(([padded]) => padded(part.data))[1];

const bounded = (faculty, via, parts) => {
  for (const channel of faculty.channels[via].in) {
    const held = parts.filter((part) => match(channel, part));
    if ("count" in channel && held.length > channel.count)
      throw new Error(
        `[${faculty.type}] '${faculty.id}' takes at most ${channel.count} ${named(channel)} ` +
          `on ${via}: ${held.length} given`,
      );
    const heavy = "bytes" in channel && held.find((part) => weight(part) > channel.bytes);
    if (heavy)
      throw new Error(
        `[${faculty.type}] '${faculty.id}' takes at most ${channel.bytes} bytes of ` +
          `${named(channel)} on ${via}: ${weight(heavy)} given`,
      );
  }
  return parts;
};

const taken = (faculty, via, part) =>
  part.type === "alien" || faculty.channels[via].in.some((channel) => match(channel, part));

export const take = (faculty, via, parts) => {
  const stranger = parts.find((part) => !taken(faculty, via, part));
  if (stranger) throw refused(faculty, via, "in", stranger);
  return bounded(faculty, via, parts);
};

const UNITS = [
  [(bytes) => bytes >= 1048576, (bytes) => `${(bytes / 1048576).toFixed(1)} MB`],
  [(bytes) => bytes >= 1024, (bytes) => `${Math.round(bytes / 1024)} kB`],
  [() => true, (bytes) => `${bytes} bytes`],
];

const sized = (bytes) => UNITS.find(([fits]) => fits(bytes))[1](bytes);

const attached = (faculty, part) => ({
  type: "text",
  text:
    `[attached ${part.type} · file ${part.file} · ${part.mime} · ${sized(weight(part))} · ` +
    `${faculty.id} cannot read ${part.type}]`,
});

export const lower = (faculty, via, parts) =>
  take(
    faculty,
    via,
    parts.map((part) =>
      taken(faculty, via, part) || !("file" in part) ? part : attached(faculty, part),
    ),
  );

export const give = (faculty, via, part) => {
  if (part.type === "alien" || faculty.channels[via].out.some((channel) => match(channel, part)))
    return part;
  throw refused(faculty, via, "out", part);
};
