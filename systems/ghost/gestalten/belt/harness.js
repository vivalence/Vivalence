import { soma } from "@vivalence/typology";

export const stream = async (mode, thread, parts) => {
  let transcript = null;
  try {
    for await (const packet of mode.harness.dialogue.stream({ thread: thread.id, id: crypto.randomUUID(), parts })) thread.controller.stdout.mark("stream", (transcript = soma.transcript(transcript, packet)));
  } finally {
    thread.controller.stdout.mark("stream", { ...transcript, open: null });
  }
};
