// moveto identity service.server ... ?!?

class Identity {
  mode = null;
  singleplayer = { user: null };
  constructor() {
    this.mode = "SINGLEPLAYER";
    this.singleplayer = {
      user: {
        id: "localhost",
        roles: ["ADMIN"],
      },
    };
  }
}

export default function (config) {
  const identity = new Identity(config);

  config.identity = identity;
  config.env["VIVA_IDENTITY_MODE"] = identity.mode;

  return config;
}
