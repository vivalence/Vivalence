**steer.natures** · `subsystems/typology/gestalten/steer/trie.js`, beside `rollup` — the walk is `rollup`'s, `pattern.nature` is already the leaf name.

```js
// subsystems/typology/gestalten/steer/trie.js
export function natures(vector) {
  return rollup(vector).map(({ pattern }) => pattern.nature);
}
```
