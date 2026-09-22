| form | verdict | why |
|---|---|---|
| `kernel: ["./mode.viva.js"]` | YES | populate maps the array |
| `kernel: "./mode.viva.js"` | NO | a string has no `.map` |

```js
// subsystems/paladin/lifecycle/populate.js:176-178
const daemon = (label) => ({ kernel = [], ...declaration }) => ({
  ...at(label)(declaration),
  kernel: kernel
```
