# reader

A service that opens one public URL and hands back its structure and its text.
No model, no cortex — the caller decides which node is the article; this package
only fetches it safely, describes it, and cuts it out.

    @commons/service/reader

`guard` refuses private and non-http(s) addresses, `hop` follows redirects
checking EVERY hop, `skeleton` describes a document without its text, `extract`
turns one node into markdown. `limits` holds every bound in one place, so the
pure halves never import the network half.

## Consume it

```js
consume: {
  reader: {
    module: "@commons/service/reader";
  }
}
```

`daemon.services.reader.open(url)` returns the page: `url` `status` `headers`
`title` `body` `bytes` `capped` `document` `skeleton`, and an
`extract(selector)` that cuts one node out of it. The stream is readable once,
so what `open` returns is the only copy there will ever be.

## Test

    deno test -A --no-check commons/services/reader/tests/*.test.js

Every test runs offline: fetch and the DNS resolver are injected, and the HTML
comes from `tests/fixtures/`.
