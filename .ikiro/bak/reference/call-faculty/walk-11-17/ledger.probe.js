import deepgram from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/deepgram/provider/index.js";
import elevenlabs from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/elevenlabs/provider/index.js";
for (const [slug, provider] of [["deepgram", deepgram], ["elevenlabs", elevenlabs]]) {
  const faculties = (await provider({ secrets: { key: "probe" } })).map((faculty) => ({ ...faculty, provider: slug }));
  console.log(slug, faculties.length, faculties.map((f) => `${f.type}/${f.id}`).join(" "));
  console.log(JSON.stringify(faculties[0], null, 2));
}
