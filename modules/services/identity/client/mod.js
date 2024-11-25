import config from "@vivalence/config";

class IdentityClient {
  constructor(daemon) {
    this.daemon = daemon;
  }

  async getUser() {
    if (config.env.get("MODE") === "SINGLEPLAYER") {
      return config.identity.singleplayer.user;
    }
    return null;
  }
}

export default function identity(daemon) {
  // console.log("identity service");
  // what i create here ends up daemon.services.identity and runtime.services.identity
  // i call getIdentity() to get the identity client

  return new IdentityClient(daemon);
}
