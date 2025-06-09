import { BufferMode } from "@vivalence/interface";
import SignalHandler from "./SignalHandler.svelte";

export default (error) => [
  new BufferMode(
    {
      Component: SignalHandler,
    },
    {
      signal: {
        type: "ERROR",
        error: {
          message:
            "Something went wrong while pulling the next dependency instruction.",
          ...error,
        },
      },
    },
  ),
];
