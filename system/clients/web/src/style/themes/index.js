import dark from "./variants/dark.js";

export default async function themes(ds) {
  return await [dark].reduce((acc, fn) => acc.then(fn), Promise.resolve(ds));
}
