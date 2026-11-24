import { received } from "./received.js";

const pulled = async (modeDie, messages, signal) => {
  while (!signal.aborted)
    try {
      for await (const message of messages(signal)) await received(modeDie, message);
    } catch (error) {
      modeDie.mode.stdout.fault(error);
    }
};

export const boot = (modeDie, mode) => {
  const release = new AbortController();
  const pulls = mode.statics.platforms.map((platform) =>
    pulled(modeDie, modeDie.providers[platform].messages, release.signal),
  );
  return () => {
    release.abort();
    return Promise.all(pulls);
  };
};
