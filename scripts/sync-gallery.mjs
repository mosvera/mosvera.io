// SPDX-License-Identifier: Apache-2.0

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, "..");
const examplesRoot = resolve(process.argv[2] ?? join(siteRoot, "..", "mosvera-examples"));
const galleryPath = join(examplesRoot, "packs", "gallery.json");
const gallery = JSON.parse(readFileSync(galleryPath, "utf8"));

mkdirSync(join(siteRoot, "data"), { recursive: true });
mkdirSync(join(siteRoot, "assets", "aesthetics"), { recursive: true });
mkdirSync(join(siteRoot, "packs"), { recursive: true });

const siteGallery = {
  ...gallery,
  aesthetics: gallery.aesthetics.map((aesthetic) => ({
    ...aesthetic,
    download_url: `/packs/${aesthetic.id}.mosvera.json`,
  })),
};

writeFileSync(join(siteRoot, "data", "aesthetics.json"), `${JSON.stringify(siteGallery, null, 2)}\n`);

for (const aesthetic of gallery.aesthetics) {
  const source = join(examplesRoot, aesthetic.asset_file);
  const target = join(siteRoot, "assets", "aesthetics", `hero-${aesthetic.id}.webp`);
  copyFileSync(source, target);
  copyFileSync(
    join(examplesRoot, "packs", `${aesthetic.id}.mosvera.json`),
    join(siteRoot, "packs", `${aesthetic.id}.mosvera.json`),
  );
}

console.log(`Synced ${gallery.aesthetics.length} aesthetics from ${examplesRoot}`);
