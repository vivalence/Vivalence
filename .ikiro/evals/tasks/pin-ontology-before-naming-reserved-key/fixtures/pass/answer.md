Grepped first: `nature` is a Signature identity key (`subsystems/typology/prototypes/signature.js:15`), `reference` and `slug` are manifest keys, `assert(path, module)` already sits at `registry.js:189` — so the new one stays beside it, universal verb, plain params.

- `elsewhere(path, module)` — is this module held under another path
- `shadowed(path, module)`
- `duplicate(path, module)`
- `holds(module)` — returns the path it is held under, or null; the caller compares

```
grep -rn '\belsewhere\b\|\bshadowed\b' subsystems systems commons → 0
```
