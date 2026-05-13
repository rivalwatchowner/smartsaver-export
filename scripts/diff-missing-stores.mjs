import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const src = fs.readFileSync(path.join(root, "convex", "stores.ts"), "utf8");
const start = src.indexOf("const categories = {");
const end = src.indexOf("\n    };", start);
if (start < 0 || end < 0) throw new Error("Could not find categories block in stores.ts");
const block = src.slice(start + "const categories = ".length, end + 1);

const categories = {};
const keys = [];
const catRe = /(\w+):\s*\[/g;
let m;
while ((m = catRe.exec(block)) !== null) keys.push({ key: m[1], idx: m.index });

for (const k of keys) {
  const rest = block.slice(k.idx);
  const open = rest.indexOf("[");
  let depth = 0;
  let j = k.idx + open;
  for (; j < block.length; j++) {
    const c = block[j];
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) {
        j++;
        break;
      }
    }
  }
  const arrStr = block.slice(k.idx + open + 1, j - 1);
  const names = [];
  const strRe = /"((?:\\.|[^"\\])*)"/g;
  let sm;
  while ((sm = strRe.exec(arrStr)) !== null) names.push(sm[1].replace(/\\'/g, "'"));
  categories[k.key] = names;
}

const expected = [];
for (const [cat, arr] of Object.entries(categories)) {
  for (const name of arr) expected.push({ name, category: cat });
}

const snapshotPath = process.argv[2];
if (!snapshotPath) {
  console.error("Usage: node scripts/diff-missing-stores.mjs <path-to-stores-list-json>");
  process.exit(1);
}
const raw = fs.readFileSync(snapshotPath, "utf8");
const ji = raw.indexOf("[");
if (ji < 0) throw new Error("No JSON array in snapshot file");
const data = JSON.parse(raw.slice(ji));
const dbNames = new Set(data.map((d) => d.name));

const missing = expected.filter((e) => !dbNames.has(e.name));
const seedNames = new Set(expected.map((e) => e.name));
const extras = data.filter((row) => !seedNames.has(row.name));
const out = {
  totalExpected: expected.length,
  inDb: data.length,
  missingCount: missing.length,
  missing,
  extraInDbCount: extras.length,
  extraInDb: extras.map((r) => ({ name: r.name, category: r.category })),
};
console.log(JSON.stringify(out, null, 2));
