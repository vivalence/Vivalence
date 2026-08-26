import paladin from "@vivalence/paladin";
import { Url } from "@vivalence/typology";
import { education } from "./education.js";
import { playground } from "./playground.js";

export const daemons = [education, playground];

export const manifest = {
  type: "instance",
  slug: "localhost",
  version: "0.0.1",
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
      serve: () => new Url(paladin.env.get("SERVICE_NLP_SERVE")),
      processors: "tokenize,mwt,pos,lemma,depparse",
    },
  },
];
