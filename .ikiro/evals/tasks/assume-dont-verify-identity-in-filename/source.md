family: assume-dont-verify
ledger: .ikiro/zettelkasten.md:1289 `### a content grep is not an existence check when identity lives in the filename`
today: `documentation/content/10-19_about/12_software/12.01_slowstart.mdx` (body: 0 occurrences of "slowstart") · `documentation/content.config.ts:8` — `generateId: ({ entry }) => entry.replace(/.*\//, "").replace(/\.mdx$/, "")` · `README.md:397` links `https://docs.vivalence.org/12.01_slowstart`

beef verbatim: /"12.xyz???!"/

failing artifact: `grep -rl slowstart documentation/` → nothing → /"gone entirely"/, the README's CTA declared a 404 and repointed.
corrected: the page named by its file — the Johnny-Decimal number IS the URL, the word only ever appears in the FILE NAME — README untouched.
