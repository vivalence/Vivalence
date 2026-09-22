Still there. The word only lives in the file name — a body grep finds nothing:

```
documentation/content/10-19_about/12_software/12.01_slowstart.mdx
```

The route is the JD number, not the path — `documentation/content.config.ts:8` strips the directory, so `/12.01_slowstart` resolves as long as that file keeps its number. README link left as is.
