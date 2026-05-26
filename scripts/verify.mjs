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
  "compliance-vector": "https://mosvera.io/schema/0.1/compliance-vector",
};

const requiredAesthetics = [
  "quiet-editorial",
  "technical-manual",
  "cinematic-lab",
  "claymation-playful-builder",
];

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

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if ([".git", "node_modules", "dist", "coverage"].includes(entry)) continue;
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
}
for (const path of ["/schema/0.1/composition", "/data/aesthetics.json", "/site.js", "/styles.css"]) {
  if (!index.includes(path)) fail(`index does not reference ${path}`);
}

console.log("mosvera.io static verification passed");
