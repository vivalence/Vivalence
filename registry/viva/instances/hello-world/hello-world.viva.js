import paladin from "@vivalence/paladin";
import { Url } from "@vivalence/typology";
import { education } from "./education.js";
import { playground } from "./playground.js";

export const daemons = [education, playground];

export const manifest = {
  type: "instance",
  slug: "hello-world",
  version: "0.0.1",
};

// `viva instance/doctor` checks these against the keys the thunks were observed to read.
export const environment = {
  VIVA_RUNTIME_ORIGIN: {
    describe: "Scheme and authority the runtime is reachable at. Every address below derives from it.",
    default: "http://localhost:2501",
    group: "addresses",
  },
  VIVA_CLIENT_KAJUIT_ORIGIN: {
    describe: "Scheme and authority the kajuit browser client is reachable at.",
    default: "http://localhost:1794",
    group: "addresses",
  },
  VIVA_RUNTIME_SERVE: {
    describe: "Base URL the runtime serves on. Everything else hangs off this latch.",
    default: "${VIVA_RUNTIME_ORIGIN}/",
    group: "addresses",
  },
  VIVA_LIGHTHOUSE_SERVE: {
    describe: "Where the hosted lighthouse attaches inside the runtime's own path tree.",
    default: "${VIVA_RUNTIME_ORIGIN}/attached/process/lighthouse/multiplayer",
    group: "addresses",
  },
  VIVA_CLIENT_KAJUIT_SERVE: {
    describe: "Where the kajuit browser client serves.",
    default: "${VIVA_CLIENT_KAJUIT_ORIGIN}/",
    group: "addresses",
  },
  PUBLIC_VIVA_RUNTIME_REMOTE: {
    describe: "Runtime address the browser bundle calls. Reaches it through publish(), not a thunk.",
    default: "${VIVA_RUNTIME_SERVE}",
    group: "addresses",
  },
  PUBLIC_VIVA_LIGHTHOUSE_REMOTE: {
    describe: "Lighthouse address as CONSUMED — by the daemons, and by the browser after publish().",
    default: "${VIVA_LIGHTHOUSE_SERVE}",
    group: "addresses",
  },
  PUBLIC_VIVA_CLIENT_KAJUIT_REMOTE: {
    describe: "The client's own public address, for links it prints about itself.",
    default: "${VIVA_CLIENT_KAJUIT_SERVE}",
    group: "addresses",
  },
  VIVA_SERVICE_NLP_PORT: {
    describe: "Port the stanza NLP container binds. Read by the container, not by this declaration.",
    default: "5555",
    group: "services",
  },
  VIVA_SERVICE_NLP_SERVE: {
    describe: "Where the stanza NLP service binds when this instance hosts it.",
    default: "http://0.0.0.0:${VIVA_SERVICE_NLP_PORT}",
    group: "services",
  },
  VIVA_SERVICE_NLP_REMOTE: {
    describe: "Where daemons reach the NLP service. education.js has no fallback — doctor reports REQUIRED.",
    default: "http://localhost:${VIVA_SERVICE_NLP_PORT}",
    group: "services",
  },
  SECRET_VIVA_JWT: {
    describe: "Lighthouse signing secret. Generate with: openssl rand -base64 24",
    group: "keys",
  },
  SECRET_VIVA_ANTHROPIC_API_KEY: {
    describe: "Anthropic key. The education and playground harnesses need one.",
    group: "keys",
  },
  SECRET_VIVA_OPENROUTER_API_KEY: {
    describe: "OpenRouter key, used by the fast tier.",
    group: "keys",
  },
  SECRET_VIVA_ELEVENLABS_API_KEY: {
    describe: "ElevenLabs key, for speech rendering.",
    group: "keys",
  },
  SECRET_VIVA_DEEPGRAM_API_KEY: {
    describe: "Deepgram key, for dictation.",
    group: "keys",
  },
  SECRET_VIVA_SERVICE_NLP_KEY: {
    describe: "Shared secret between the runtime and the stanza NLP service.",
    group: "keys",
  },
};

export const runtime = {
  slug: "runtime",
  statics: {
    serve: () => new Url(paladin.env.get("VIVA_RUNTIME_SERVE")),
  },
  datamap: {
    module: "@viva/datamap/libsql",
    statics: {
      db: { file: `runtime.viva.db` },
    },
  },
};

export const lighthouse = {
  statics: {
    remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
  },
};

export const clients = {
  ghost: {
    slug: "ghost",
    statics: {
      lighthouse: {
        remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
      },
    },
  },
  kajuit: {
    slug: "kajuit",
    traits: ["ATTACHED"],
    statics: {
      serve: () => new Url(paladin.env.get("VIVA_CLIENT_KAJUIT_SERVE")),
      lighthouse: {
        remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
      },
    },
  },
};

export const services = [
  {
    slug: "multiplayer",
    module: "@viva/lighthouse/multiplayer",
    secrets: { jwt: () => paladin.secret.get("SECRET_VIVA_JWT") },
    statics: { serve: () => new Url(paladin.env.get("VIVA_LIGHTHOUSE_SERVE")) },
    datamap: {
      module: "@viva/datamap/libsql",
      statics: { db: { file: `lighthouse.viva.db` } },
    },
  },
  {
    slug: "nlp-stanza",
    module: "@viva/service/nlp-stanza",
    secrets: { key: () => paladin.secret.get("SECRET_VIVA_SERVICE_NLP_KEY") },
    statics: {
      serve: () => new Url(paladin.env.get("VIVA_SERVICE_NLP_SERVE")),
      processors: "tokenize,mwt,pos,lemma,depparse",
    },
  },
];
