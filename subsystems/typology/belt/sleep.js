export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function seconds(s) {
  return sleep(s * 1000);
}
