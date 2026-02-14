import dark from "./dark.js";

export async function themes(ds) {
  return await [dark].reduce((acc, fn) => acc.then(fn), Promise.resolve(ds));
}

export default themes;
