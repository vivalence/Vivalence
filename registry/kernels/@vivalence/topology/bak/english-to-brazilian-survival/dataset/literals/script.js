import { readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname, basename, relative } from "node:path";
import { pathToFileURL } from "node:url";

const wordsDir = "./words";
const sentencesFile = "./sentences.js";
const buckets = ["cefr.a1", "cefr.a2", "cefr.b1", "cefr.b2", "cefr.c1", "cefr.c2", "survival"];

const collectFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? collectFiles(join(dir, entry.name))
      : entry.name.endsWith(".js") && entry.name !== "index.js"
        ? [join(dir, entry.name)]
        : [],
  );

const bucketsOf = (entity) =>
  (entity.symbols ?? [])
    .map((symbol) => symbol.slug)
    .filter((slug) => slug?.startsWith("proficiency."))
    .map((slug) => slug.replace("proficiency.", ""))
    .filter((key) => buckets.includes(key));

const posOf = (literal) =>
  (literal.symbols ?? [])
    .map((symbol) => symbol.slug)
    .find((slug) => slug?.startsWith("word.part-of-speech."))
    ?.replace("word.part-of-speech.", "") ?? "unknown";

const accumulated = new Map();

// const files = collectFiles(wordsDir);

// for (const file of files) {
//   const { default: literals } = await import(pathToFileURL(file));
//   if (!Array.isArray(literals)) continue;

//   const isVerb = relative(wordsDir, file).startsWith("verb/");
//   const outName = isVerb ? "verb.js" : basename(file);

//   for (const literal of literals) {
//     for (const bucket of bucketsOf(literal)) {
//       const key = `${bucket}/${outName}`;
//       const list = accumulated.get(key) ?? [];
//       list.push(literal);
//       accumulated.set(key, list);
//     }
//   }
// }

const { default: sentences } = await import(pathToFileURL(sentencesFile));

for (const sentence of sentences) {
  for (const bucket of bucketsOf(sentence)) {
    const key = `${bucket}/sentence.js`;
    const list = accumulated.get(key) ?? [];
    list.push(sentence);
    accumulated.set(key, list);
  }
}

const bucketFiles = new Map();

for (const [key, entries] of accumulated) {
  const [bucket, fileName] = [key.split("/")[0], key.split("/").slice(1).join("/")];
  const outPath = join(bucket, fileName);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `export default ${JSON.stringify(entries)};\n`);
  console.log(`${outPath} (${entries.length})`);

  const tracked = bucketFiles.get(bucket) ?? [];
  tracked.push(fileName);
  bucketFiles.set(bucket, tracked);
}

const toImportName = (fileName) =>
  basename(fileName, ".js").replace(/-([a-z])/g, (_, char) => char.toUpperCase());

for (const [bucket, fileNames] of bucketFiles) {
  const sorted = [...new Set(fileNames)].sort();
  const imports = sorted.map((fileName) => {
    const name = toImportName(fileName);
    return `import ${name} from "./${fileName}";`;
  });

  const names = sorted.map(toImportName);

  const indexContent = [...imports, "", `export default [${names.join(", ")}].flat();`, ""].join(
    "\n",
  );

  const indexPath = join(bucket, "index.js");
  writeFileSync(indexPath, indexContent);
  console.log(`${indexPath}`);
}

console.log("\n--- counts by proficiency / type ---\n");

const counts = new Map();

for (const [key, entries] of accumulated) {
  const bucket = key.split("/")[0];
  const fileName = key.split("/").slice(1).join("/");
  const isSentence = fileName === "sentence.js";

  for (const entry of entries) {
    const type = isSentence ? "sentence" : posOf(entry);
    const countKey = `${bucket}|${type}`;
    counts.set(countKey, (counts.get(countKey) ?? 0) + 1);
  }
}

const allBuckets = [...new Set([...counts.keys()].map((key) => key.split("|")[0]))].sort();
const allTypes = [...new Set([...counts.keys()].map((key) => key.split("|")[1]))].sort();

for (const bucket of allBuckets) {
  const parts = allTypes
    .map((type) => [type, counts.get(`${bucket}|${type}`) ?? 0])
    .filter(([, count]) => count > 0)
    .map(([type, count]) => `${type}: ${count}`);

  const total = parts.reduce((sum, part) => sum + parseInt(part.split(": ")[1]), 0);
  console.log(`${bucket} (${total}):\n${parts.join("\n")}\n`);
}
