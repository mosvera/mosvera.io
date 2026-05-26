// SPDX-License-Identifier: Apache-2.0

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const here = dirname(fileURLToPath(import.meta.url));
const examplesRoot = resolve(here, "..", "..", "mosvera-examples");

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
  "neon-noir-console",
  "botanical-glasshouse",
  "lunar-industrial",
  "ukiyo-e-interface",
  "bauhaus-signal",
  "desert-modernist",
  "alpine-research",
  "maximalist-zine",
  "luxury-atelier",
  "retro-future-terminal",
  "oceanic-biolume",
  "brutalist-civic",
  "soft-focus-wellness",
  "spacecraft-telemetry",
  "museum-archive",
  "arcade-pop",
  "graphite-studio",
  "stained-glass-fable",
  "kinetic-sports-broadcast",
  "cybernetic-garden",
  "porcelain-minimal",
];

const requiredPackUrls = requiredAesthetics.map(
  (id) => `/packs/${id}.mosvera.json`,
);

const requiredSourceUrls = requiredAesthetics.map(
  (id) => `https://github.com/mosvera/examples/blob/main/packs/${id}.mosvera.json`,
);

const quickstartUrl = "https://github.com/mosvera/spec/blob/main/docs/guides/10-minute-quickstart.md";
const mcpBundleUrl = "https://github.com/mosvera/mcp/releases/download/v0.1.9/mosvera-mcp-0.1.9.mcpb";

const agentFiles = {
  "llms.txt": {
    phrases: [
      "# Mosvera",
      "For AI Agents",
      "claude mcp add mosvera -- npx -y @mosvera/mcp@latest",
      "codex mcp add mosvera -- npx -y @mosvera/mcp@latest",
      "npx -y @mosvera/mcp@latest",
      "npm install @mosvera/runtime",
      "pip install mosvera",
      "llms-full.txt",
      "ai-install.md",
      ".well-known/mosvera.json",
      "Mosvera runs locally",
    ],
  },
  "llms-full.txt": {
    phrases: [
      "Mosvera Agent Reference",
      "Term Stack",
      "MCP Tool Surface",
      "Provider Compile IDs",
      "25 Public Aesthetic Packs",
      "google-gemini-image",
      "heygen-avatar-video",
      "compile_provider_payload",
      "Ask before writing to a local registry",
    ],
  },
  "ai-install.md": {
    phrases: [
      "# Install Mosvera",
      "Claude Desktop",
      "Claude Code",
      "Codex",
      "TypeScript Runtime",
      "Python Runtime",
      "Aesthetic Packs",
      "ChatGPT",
      "codex mcp add mosvera -- npx -y @mosvera/mcp@latest",
    ],
  },
};

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

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
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

for (const [fileName, { phrases }] of Object.entries(agentFiles)) {
  const path = join(root, fileName);
  if (!existsSync(path)) fail(`missing AI agent entrypoint: ${fileName}`);
  const content = readFileSync(path, "utf8");
  for (const phrase of phrases) {
    if (!content.includes(phrase)) fail(`${fileName} missing phrase: ${phrase}`);
  }
}

const manifestPath = join(root, ".well-known", "mosvera.json");
if (!existsSync(manifestPath)) fail("missing .well-known/mosvera.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (manifest.homepage !== "https://mosvera.io") fail("manifest homepage must be https://mosvera.io");
if (manifest.ai_entrypoints?.compact !== "https://mosvera.io/llms.txt") fail("manifest missing compact AI entrypoint");
if (manifest.install?.codex?.command !== "codex mcp add mosvera -- npx -y @mosvera/mcp@latest") {
  fail("manifest codex install command is incorrect");
}
if (manifest.install?.claude_code?.command !== "claude mcp add mosvera -- npx -y @mosvera/mcp@latest") {
  fail("manifest Claude Code install command is incorrect");
}
if (manifest.packages?.mcp?.version !== "0.1.9") fail("manifest MCP version must match current public site bundle");
if (manifest.mcp?.provider_execution !== false) fail("manifest must state MCP does not execute providers");
if (manifest.schemas?.aesthetic_pack !== "https://mosvera.io/schema/0.1/aesthetic-pack") {
  fail("manifest missing aesthetic pack schema URL");
}

const aestheticsPath = join(root, "data", "aesthetics.json");
const aesthetics = JSON.parse(readFileSync(aestheticsPath, "utf8"));
const examplesGalleryPath = join(examplesRoot, "packs", "gallery.json");
if (existsSync(examplesGalleryPath)) {
  const examplesGallery = JSON.parse(readFileSync(examplesGalleryPath, "utf8"));
  const normalized = {
    ...examplesGallery,
    aesthetics: examplesGallery.aesthetics.map((aesthetic) => ({
      ...aesthetic,
      download_url: `/packs/${aesthetic.id}.mosvera.json`,
    })),
  };
  if (JSON.stringify(aesthetics) !== JSON.stringify(normalized)) {
    fail("data/aesthetics.json has drifted from ../mosvera-examples/packs/gallery.json");
  }
}
if (aesthetics.count !== 25) fail(`gallery count is ${aesthetics.count}, expected 25`);
if (aesthetics.aesthetics.length !== 25) fail(`gallery has ${aesthetics.aesthetics.length} aesthetics, expected 25`);
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
  const exampleAsset = join(examplesRoot, "packs", "assets", `hero-${aesthetic.id}.webp`);
  if (existsSync(exampleAsset) && sha256(join(root, imagery.src.slice(1))) !== sha256(exampleAsset)) {
    fail(`${aesthetic.id} hero image has drifted from mosvera-examples`);
  }
  const sitePack = join(root, "packs", `${aesthetic.id}.mosvera.json`);
  const examplePack = join(examplesRoot, "packs", `${aesthetic.id}.mosvera.json`);
  if (!existsSync(sitePack)) fail(`${aesthetic.id} mirrored pack file missing`);
  if (existsSync(examplePack) && sha256(sitePack) !== sha256(examplePack)) {
    fail(`${aesthetic.id} mirrored pack file has drifted from mosvera-examples`);
  }
  heroImages.add(imagery.src);
  if (aesthetic.download_url !== `/packs/${aesthetic.id}.mosvera.json`) {
    fail(`${aesthetic.id} download_url must point at a same-origin pack file`);
  }
  if (aesthetic.source_url !== `https://github.com/mosvera/examples/blob/main/packs/${aesthetic.id}.mosvera.json`) {
    fail(`${aesthetic.id} source_url must point at mosvera/examples`);
  }
  for (const [name, color] of Object.entries(aesthetic.swatches ?? {})) {
    if (!/^#[0-9a-f]{6}$/.test(color)) fail(`${aesthetic.id} swatch ${name} is not a lowercase hex color`);
  }
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
const siteJs = readFileSync(join(root, "site.js"), "utf8");
const styles = readFileSync(join(root, "styles.css"), "utf8");
const readme = readFileSync(join(root, "README.md"), "utf8");
const robots = readFileSync(join(root, "robots.txt"), "utf8");
const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
for (const id of requiredAesthetics) {
  if (!readFileSync(aestheticsPath, "utf8").includes(id)) fail(`aesthetic ${id} not reachable`);
  if (!readFileSync(aestheticsPath, "utf8").includes(`hero-${id}.webp`)) fail(`aesthetic ${id} missing hero asset reference`);
}
for (const url of requiredPackUrls) {
  if (!readFileSync(aestheticsPath, "utf8").includes(url)) fail(`gallery data does not include pack download URL: ${url}`);
}
for (const url of requiredSourceUrls) {
  if (!readFileSync(aestheticsPath, "utf8").includes(url)) fail(`gallery data does not include pack source URL: ${url}`);
}
for (const phrase of ["Preview pack", "Import pack", "Resolve/compile aesthetic"]) {
  if (!index.includes(phrase)) fail(`index does not include pack workflow phrase: ${phrase}`);
}
for (const phrase of ["pack-grid", "Apply to site", "Download pack", "View source", "data-hex", "color-swatch", "swatch-row"]) {
  if (!index.includes(phrase) && !siteJs.includes(phrase) && !styles.includes(phrase)) {
    fail(`site does not include gallery UI phrase: ${phrase}`);
  }
}
if (!index.includes(quickstartUrl)) fail("index does not link to the 10-minute quickstart");
if (!index.includes(mcpBundleUrl)) fail("index does not link to the current MCP bundle");
for (const phrase of [
  'href="/llms.txt"',
  'href="/.well-known/mosvera.json"',
  'href="/ai-install.md"',
  "LLM-readable index",
  "install router",
  'id="pack-gallery"',
]) {
  if (!index.includes(phrase)) fail(`index does not include AI discovery phrase: ${phrase}`);
}
for (const phrase of ["llms.txt", "llms-full.txt", "ai-install.md", ".well-known/mosvera.json"]) {
  if (!readme.includes(phrase)) fail(`README does not include AI entrypoint: ${phrase}`);
}
if (!robots.includes("Sitemap: https://mosvera.io/llms.txt")) fail("robots.txt does not advertise llms.txt");
const headerSources = new Map(vercel.headers.map((entry) => [entry.source, entry.headers]));
for (const source of ["/llms.txt", "/llms-full.txt", "/ai-install.md", "/.well-known/mosvera.json"]) {
  if (!headerSources.has(source)) fail(`vercel.json missing header rule for ${source}`);
  const headers = headerSources.get(source);
  if (!headers.some((header) => header.key === "Access-Control-Allow-Origin" && header.value === "*")) {
    fail(`vercel.json missing CORS header for ${source}`);
  }
}
const rootHeaders = headerSources.get("/(.*)") ?? [];
if (!rootHeaders.some((header) => header.key === "Link" && header.value.includes("</llms.txt>"))) {
  fail("vercel.json root headers do not advertise llms.txt");
}
for (const phrase of ["10-minute quickstart", "Claude Desktop", "npm/MCP", "TypeScript", "Python"]) {
  if (!index.includes(phrase)) fail(`index does not include quickstart phrase: ${phrase}`);
}
for (const phrase of ["Google", "Runway", "ElevenLabs", "Firefly", "Meshy"]) {
  if (!index.includes(phrase)) fail(`index does not include provider phrase: ${phrase}`);
}
for (const phrase of [
  "What just happened?",
  "local registry",
  "named aesthetic",
  "composition document",
  "aesthetic pack",
  "tokens",
  "CSS variables",
  "no hosted runtime dependency",
]) {
  if (!index.includes(phrase)) fail(`index does not include explainer phrase: ${phrase}`);
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
if (!index.includes('id="pack-grid"')) fail("index missing rendered pack gallery mount");

console.log("mosvera.io static verification passed");
