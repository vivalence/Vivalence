const carried = (faculty, source) => {
  const taken = faculty.channels.in.flatMap((channel) => channel.mime ?? []);
  if (taken.includes(source.mime)) return source;
  throw new Error(
    `[${faculty.type}] '${faculty.id}' takes no '${source.mime}' ${source.type}: ` +
      `it takes ${taken.join(", ")}`,
  );
};

const faculty = {
  type: "verbatim",
  id: "nova-3",
  channels: {
    in: [
      { type: "audio", codec: "pcm_16000" },
      { type: "audio", mime: ["audio/ogg", "audio/mpeg", "audio/mp4", "audio/aac"] },
    ],
    out: [{ type: "event" }],
  },
};

console.log(carried(faculty, { type: "audio", mime: "audio/ogg", data: "" }).mime);
try {
  carried(faculty, { type: "audio", mime: "audio/amr", data: "" });
} catch (fault) {
  console.log(fault.message);
}
