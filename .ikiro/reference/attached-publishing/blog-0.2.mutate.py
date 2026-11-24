import subprocess, sys, os, tempfile
root = sys.argv[1]
blog = os.path.join(root, "commons/publishers/blog")
MUTATIONS = [
    ("the rehome plugin out", "press.js", "rehypePlugins: [raw, katex, rehomed],", "rehypePlugins: [raw, katex],"),
    ("the comment strip out", "press.js", "remarkPlugins: [uncommented, math],", "remarkPlugins: [math],"),
    ("the stale removal out", "aperture/index.js", "      for (const file of gone) {", "      for (const file of []) {"),
    ("the clean address out", "attachment.js", "const places = [asked, `${asked}.html`, join(asked, \"index.html\")];", "const places = [asked];"),
    ("the root route out", "attachment.js", 'new Vector().open("/", served).open("/(.*)", served)', 'new Vector().open("/(.*)", served)'),
    ("the etag answer out", "attachment.js", '  if (ctx.request.headers.get("if-none-match") === `"${file.integrity}"`)', "  if (false)"),
    ("the source guard out", "aperture/index.js", "  if (relative(source, mount).startsWith(\"..\")) throw new Error(`[blog] '${path}' leaves source/`);\n", ""),
    ("the draft filter out", "theme/index.js", 'const shown = articles.filter((article) => article.status !== "draft");', "const shown = articles;"),
    ("the unlisted skip out", "theme/index.js", "previous: essays.slice(0, at).findLast(listed),", "previous: essays[at - 1],"),
    ("the preview's base out", "aperture/index.js", 'html.replace("<head>", `<head>\\n<base href="${site(ctx)}/${shown.page}">`)', "html"),
]
env = {**os.environ, "DENO_DIR": os.path.expanduser("~/Library/Caches/deno"), "NO_COLOR": "1"}
for label, file, old, new in MUTATIONS:
    path = os.path.join(blog, file)
    held = open(path).read()
    if held.count(old) != 1:
        print(f"{label}: ANCHOR x{held.count(old)}"); continue
    open(path, "w").write(held.replace(old, new))
    try:
        run = subprocess.run(["deno", "test", "-A", "--no-check", "commons/publishers/blog/tests/blog.test.js"], cwd=root, env={**env, "HOME": tempfile.mkdtemp()}, capture_output=True, text=True)
        out = run.stdout + run.stderr
        reds = [line.strip().split(" ... FAILED")[0][:110] for line in out.splitlines() if "... FAILED" in line and line.startswith("  ")]
        tail = [line for line in out.splitlines() if line.startswith(("ok |", "FAILED |"))]
        print(f"{label}: {tail[-1] if tail else 'NO SUMMARY'}")
        for red in reds: print(f"    red: {red}")
    finally:
        open(path, "w").write(held)
