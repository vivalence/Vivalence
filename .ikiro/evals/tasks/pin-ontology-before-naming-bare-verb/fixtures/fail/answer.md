The guard reads `paladin.scope.instance.absolute` and throws when it is empty. Candidates:

- `mounted()` — the instance is mounted for this shell; reads like the runtime's own word
- `ready()`
- `check()`

`mounted()` is the one — it is what the failing line is about.
