import config from "@vivalence/config";

const makeIdentityClient = () => ({
  getUser() {
    if (config.env.get("VIVA_MODE") === "SINGLEPLAYER") {
      return config.identity.singleplayer.user;
    }
    return null;
  },
});

export default function identity() {
  // console.log("identity service");
  // what i create here ends up daemon.services.identity and runtime.services.identity
  // i call getIdentity() to get the identity client

  return makeIdentityClient();
}
