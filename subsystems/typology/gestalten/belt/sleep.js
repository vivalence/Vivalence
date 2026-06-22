export function ms(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export const sleep = ms;

export function seconds(s) {
  return sleep(s * 1000);
}

// an AbortSignal that fires after `ms` — the platform-floor-safe shim for
// AbortSignal.timeout(ms). Pairs with promise.waiter().wait(signal) for per-wait
// timeouts. See .ikiro/CLAUDE.md ## code.
export function signal(ms) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}
