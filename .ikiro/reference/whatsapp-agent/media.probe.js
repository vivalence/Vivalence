const media = (written) => {
  const [essence, ...parameters] = written.split(";").map((piece) => piece.trim());
  return {
    essence: essence.toLowerCase(),
    parameters: Object.fromEntries(
      parameters.map((parameter) => {
        const [name, value] = parameter.split("=");
        return [name.toLowerCase(), value.replaceAll('"', "").split(",")];
      }),
    ),
  };
};

const within = (taken, given) =>
  taken.essence === given.essence &&
  Object.entries(taken.parameters).every(
    ([name, values]) =>
      !(name in given.parameters) || given.parameters[name].every((value) => values.includes(value)),
  );

export const match = (channel, part) =>
  channel.type === part.type &&
  (!channel.mime || channel.mime.some((taken) => within(media(taken), media(part.mime))));

const file = { type: "audio", mime: ["audio/ogg", "audio/mpeg", "audio/mp4", "audio/aac"] };
const narrow = { type: "audio", mime: ["audio/ogg;codecs=opus"] };
const live = { type: "audio", mime: ["audio/pcm;rate=16000;channels=1"] };

const cases = [
  [file, "audio/ogg; codecs=opus"],
  [file, "audio/amr"],
  [narrow, "audio/ogg; codecs=opus"],
  [narrow, "audio/ogg; codecs=vorbis"],
  [narrow, "audio/ogg"],
  [live, "audio/pcm;rate=16000;channels=1"],
  [live, "audio/pcm;rate=44100;channels=1"],
  [live, "audio/pcm;rate=16000;channels=2"],
];
for (const [channel, mime] of cases)
  console.log(match(channel, { type: "audio", mime }), channel.mime[0], "←", mime);
