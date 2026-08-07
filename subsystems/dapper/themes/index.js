import nordic from "./nordic.js";
import paper from "./paper.js";

export async function themes(ds) {
  return await [nordic, paper].reduce((acc, fn) => acc.then(fn), Promise.resolve(ds));
}

export default themes;
