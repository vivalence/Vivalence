import { BufferMode } from "@vivalence/interface";

export default (error) => [
  new BufferMode(SignalHandler, {
    signal: {
      type: "ERROR",
      error: {
        message:
          "Something went wrong while pulling the next dependency instruction.",
        ...error,
      },
    },
  }),
];
