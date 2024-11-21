import useBox from "./lib/useBox.svelte.js";
import * as components from "./components/index.js";

export const lib = { useBox };

export const { Button, Card, Icon, Input, Loader, Tag, Text, Widget } = components;

export default components;
