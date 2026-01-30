export function ms(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export const sleep = ms;

export function seconds(s) {
  return sleep(s * 1000);
}
