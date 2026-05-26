// SPDX-License-Identifier: Apache-2.0

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();

const requiredSchemas = {
  common: "https://mosvera.io/schema/0.1/common",
  composition: "https://mosvera.io/schema/0.1/composition",
  template: "https://mosvera.io/schema/0.1/template",
  modifier: "https://mosvera.io/schema/0.1/modifier",
  palette: "https://mosvera.io/schema/0.1/palette",
  "capability-manifest": "https://mosvera.io/schema/0.1/capability-manifest",
  "aesthetic-pack": "https://mosvera.io/schema/0.1/aesthetic-pack",
  "compliance-vector": "https://mosvera.io/schema/0.1/compliance-vector",
};

const requiredAesthetics = [
  "quiet-editorial",
  "technical-manual",
  "cinematic-lab",
  "claymation-playful-builder",
];

const requiredPackUrls = requiredAesthetics.map(
  (id) => `https://raw.githubusercontent.com/mosvera/spec/main/examples/packs/${id}.mosvera.json`,
);

const forbiddenPaths = [
  ".envrc",
  ".remember",
  ".local",
  "COMING_SOON_PLAN.md",
  "CHANGES.md",
  "docs/narrative",
];

const forbiddenText = [
  "secrets-vault",
  "shared/cloudflare",
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_API_KEY",
  "GH_TOKEN",
  "GITHUB_TOKEN",
  "NPM_TOKEN",
  "github_pat_",
  "ghp_",
  "npm_",
  "niclydon/mosvera-web",
  "/home/niclydon",
  "team_",
  "output.niclydon.io",
];

const textExtensions = new Set([
  "",
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".svg",
  ".txt",
  ".yml",
]);

function fail(message) {
  throw new Error(message);
}

for (const path of forbiddenPaths) {
  if (existsSync(join(root, path))) fail(`forbidden public path present: ${path}`);
}

for (const [name, id] of Object.entries(requiredSchemas)) {
  const path = join(root, "schema", "0.1", name);
  if (!existsSync(path)) fail(`missing schema endpoint file: ${name}`);
  const schema = JSON.parse(readFileSync(path, "utf8"));
  if (schema.$id !== id) fail(`${name} has $id ${schema.$id}, expected ${id}`);
}

const aestheticsPath = join(root, "data", "aesthetics.json");
const aesthetics = JSON.parse(readFileSync(aestheticsPath, "utf8"));
const ids = new Set(aesthetics.aesthetics.map((aesthetic) => aesthetic.id));
for (const id of requiredAesthetics) {
  if (!ids.has(id)) fail(`missing v1 aesthetic: ${id}`);
}
if (aesthetics.default !== "quiet-editorial") fail("default aesthetic must be quiet-editorial");

const heroImages = new Set();
for (const aesthetic of aesthetics.aesthetics) {
  const imagery = aesthetic.canonical?.imagery;
  if (!imagery?.src) fail(`${aesthetic.id} missing canonical.imagery.src`);
  if (!imagery?.alt) fail(`${aesthetic.id} missing canonical.imagery.alt`);
  if (!imagery.src.startsWith("/assets/aesthetics/")) {
    fail(`${aesthetic.id} hero image must live under /assets/aesthetics/`);
  }
  if (!imagery.src.endsWith(".webp")) fail(`${aesthetic.id} hero image must be WebP`);
  if (!existsSync(join(root, imagery.src.slice(1)))) fail(`${aesthetic.id} hero image missing: ${imagery.src}`);
  heroImages.add(imagery.src);
}
if (heroImages.size !== aesthetics.aesthetics.length) fail("each aesthetic must use a distinct hero image");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if ([".git", ".vercel", "node_modules", "dist", "coverage"].includes(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

for (const file of walk(root)) {
  const rel = relative(root, file);
  if (rel === "scripts/verify.mjs") continue;
  const ext = rel.includes(".") ? rel.slice(rel.lastIndexOf(".")) : "";
  if (!textExtensions.has(ext)) continue;
  const content = readFileSync(file, "utf8");
  for (const needle of forbiddenText) {
    if (content.includes(needle)) fail(`forbidden text "${needle}" found in ${rel}`);
  }
}

const index = readFileSync(join(root, "index.html"), "utf8");
for (const id of requiredAesthetics) {
  if (!readFileSync(aestheticsPath, "utf8").includes(id)) fail(`aesthetic ${id} not reachable`);
  if (!index.includes(id)) fail(`index does not include pack gallery aesthetic: ${id}`);
}
for (const url of requiredPackUrls) {
  if (!index.includes(url)) fail(`index does not include pack download URL: ${url}`);
}
for (const phrase of ["Preview pack", "Import pack", "Resolve/compile aesthetic"]) {
  if (!index.includes(phrase)) fail(`index does not include pack workflow phrase: ${phrase}`);
}
for (const path of [
  "/schema/0.1/composition",
  "/data/aesthetics.json",
  "/site.js",
  "/styles.css",
  "/assets/aesthetics/hero-quiet-editorial.webp",
]) {
  if (!index.includes(path)) fail(`index does not reference ${path}`);
}
if (!index.includes('id="hero-image"')) fail("index missing switchable hero image");

console.log("mosvera.io static verification passed");
