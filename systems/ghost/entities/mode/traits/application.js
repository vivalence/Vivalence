import { Bundle } from "@vivalence/typology";

export const APPLICATION = async (mode) => {
  const record = await mode.connection.call("/metadata/application");
  mode.application = { url: record.url, schema: record.schema, bundle: new Bundle(record.bundle).withUrl(record.url) };
};

export const open = async (terminal, mode) => {
  const thread = terminal.thread;
  const kept = thread.$buffers
    .get()
    .filter((buffer) => buffer.mode === mode)
    .sort((first, second) => first.index - second.index)
    .at(-1);
  const buffer = kept === undefined ? await mode.runtime.entities.buffer.create({ mode: mode.id, thread: thread.id, data: {} }) : kept;
  if (terminal.thread === thread) terminal.$buffer.set(buffer);
  return buffer;
};
