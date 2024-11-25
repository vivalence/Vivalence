// moveto identity service.server ... ?!?

class Identity {
  mode = null;
  singleplayer = { user: null };
  constructor() {
    this.mode = "SINGLEPLAYER";
    this.singleplayer = {
      user: {
        id: "localhost",
      },
    };
  }
}

export default async function (config) {
  const identity = new Identity(config);

  config.identity = identity;
  config.env["MODE"] = identity.mode;

  return config;
}
