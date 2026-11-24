export const send = (terminal, signal) =>
  terminal.repl.dispatch(signal).catch((error) => terminal.controller.stdout.fault(error));
