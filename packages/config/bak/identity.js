// moveto identity service.server ... ?!?

class Identity {
  mode = null;
  singleplayer = { user: null };
  constructor() {
    this.mode = "SINGLEPLAYER";
    this.singleplayer = {
      // user: {
      //   id: "localhost",
      //   roles: ["ADMIN"],
      //   // config:{[*clients]:{preferences, defaults}} // ?type serialized signature
      //   intents: [
      //     {
      //       traits: ["bookmarked", "resolved"], // cron:'',
      //       data: {
      //         bookmark: { default: true },
      //         resolution: {
      //           runtime: "eng2esp",
      //           strategy: "eva",
      //           // session: "id", ? optional
      //           path: "/eng2esp/buffers/strategy/eva", // signature/signal: {},
      //           state: {},
      //         },
      //       },
      //     },
      //   ],
      // },
    };
  }
}

export default function (config) {
  config.identity = new Identity(config);

  // config.env["VIVA_IDENTITY_MODE"] = identity.mode;

  return config;
}
