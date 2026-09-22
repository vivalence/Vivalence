**readme-walk** · step 7 added, `.ikiro/skills/readme-walk/SKILL.md`.

```sh
kill $(lsof -ti:2501 -sTCP:LISTEN)
```

`-sTCP:LISTEN` — clients hold sockets on :2501 too (Chrome's network helper did, 09-23); only the listener is the runtime.
