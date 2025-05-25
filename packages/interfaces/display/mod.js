export * from "./components/index.js";

import useBox from "./lib/useBox.svelte.js";
import * as components from "./components/index.js";

export const lib = { useBox };

export default components;
