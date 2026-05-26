const select = document.querySelector("#aesthetic-select");
const body = document.body;
const headline = document.querySelector("#hero-title");
const modeBody = document.querySelector("#mode-body");
const modeEyebrow = document.querySelector("#mode-eyebrow");
const modeLabel = document.querySelector("#mode-label");
const modeSummary = document.querySelector("#mode-summary");
const metricMode = document.querySelector("#metric-mode");
const compositionJson = document.querySelector("#composition-json");
const compiledTokens = document.querySelector("#compiled-tokens");
const heroImage = document.querySelector("#hero-image");
const packGrid = document.querySelector("#pack-grid");
const themeToggle = document.querySelector("#theme-toggle");

const canonicalThemePair = {
  light: "mosvera-public",
  dark: "mosvera-public-dark",
};

const densityScale = {
  compact: { space: "0.82rem", section: "4rem" },
  comfortable: { space: "1.25rem", section: "5.8rem" },
  roomy: { space: "1.45rem", section: "6.2rem" },
  spacious: { space: "1.5rem", section: "6.8rem" },
};

const typeScale = {
  compact: { display: "clamp(2.2rem, 6vw, 5.2rem)", body: "clamp(0.96rem, 1.3vw, 1.06rem)", small: "0.72rem" },
  editorial: { display: "clamp(3rem, 8vw, 7.4rem)", body: "clamp(1rem, 1.6vw, 1.2rem)", small: "0.84rem" },
  large: { display: "clamp(3.4rem, 9vw, 8rem)", body: "clamp(1.04rem, 1.7vw, 1.22rem)", small: "0.82rem" },
  friendly: { display: "clamp(2.7rem, 7vw, 6.4rem)", body: "clamp(1.04rem, 1.7vw, 1.22rem)", small: "0.82rem" },
};

function family(name, fallback) {
  return `"${name}", ${fallback}`;
}

function compileSiteTheme(aesthetic) {
  const c = aesthetic.canonical;
  const density = densityScale[c.layout.density] ?? densityScale.comfortable;
  const scale = typeScale[c.typography.scale] ?? typeScale.editorial;

  return {
    "--paper": c.palette.background,
    "--surface": c.palette.surface,
    "--surface-alt": c.palette.surface_alt,
    "--ink": c.palette.ink,
    "--muted": c.palette.muted,
    "--accent": c.palette.accent,
    "--accent-2": c.palette.accent_2,
    "--border": c.palette.border,
    "--code-bg": c.palette.code_bg,
    "--code-ink": c.palette.code_ink,
    "--font-display": family(c.typography.display, "Georgia, serif"),
    "--font-body": family(c.typography.body, "ui-sans-serif, system-ui, sans-serif"),
    "--font-mono": family(c.typography.mono, "ui-monospace, SFMono-Regular, Consolas, monospace"),
    "--display-size": scale.display,
    "--body-size": scale.body,
    "--small-size": scale.small,
    "--space": density.space,
    "--section-gap": density.section,
    "--radius": c.layout.radius,
    "--shadow": c.layout.shadow,
    "--motion-duration": c.motion.duration,
    "--hero-saturation": c.imagery.saturation,
    "--hero-contrast": c.imagery.contrast,
    "--hero-blend": c.imagery.blend,
    "--hero-image": `url("${c.imagery.src}")`,
    "--hero-treatment": c.imagery.treatment,
    "--max-width": c.layout.max_width,
  };
}

function toCss(tokens) {
  return `:root {\n${Object.entries(tokens)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n")}\n}`;
}

function hashId() {
  return decodeURIComponent(location.hash.replace(/^#/, ""));
}

function setHash(id) {
  if (hashId() !== id) history.replaceState(null, "", `#${encodeURIComponent(id)}`);
}

function swatchName(name) {
  return name.replace(/_/g, " ");
}

function packUrl(aesthetic, kind) {
  if (kind === "download") {
    return aesthetic.download_url ?? `/packs/${aesthetic.id}.mosvera.json`;
  }
  return aesthetic.source_url ?? `https://github.com/mosvera/examples/blob/main/packs/${aesthetic.id}.mosvera.json`;
}

function renderSwatches(aesthetic) {
  const palette = aesthetic.swatches ?? {
    background: aesthetic.canonical.palette.background,
    surface: aesthetic.canonical.palette.surface,
    ink: aesthetic.canonical.palette.ink,
    accent: aesthetic.canonical.palette.accent,
    accent_2: aesthetic.canonical.palette.accent_2,
    border: aesthetic.canonical.palette.border,
  };
  const wrap = document.createElement("div");
  wrap.className = "swatch-row";
  wrap.setAttribute("aria-label", `${aesthetic.label} palette swatches`);

  for (const [name, value] of Object.entries(palette)) {
    const swatch = document.createElement("span");
    swatch.className = "color-swatch";
    swatch.style.setProperty("--swatch", value);
    swatch.dataset.hex = value;
    swatch.title = `${swatchName(name)}: ${value}`;
    swatch.tabIndex = 0;
    swatch.setAttribute("role", "img");
    swatch.setAttribute("aria-label", `${swatchName(name)} ${value}`);
    wrap.append(swatch);
  }

  return wrap;
}

function renderPackGallery(aesthetics, applyById) {
  packGrid.replaceChildren();
  for (const aesthetic of aesthetics) {
    const article = document.createElement("article");
    article.dataset.packId = aesthetic.id;

    const image = document.createElement("img");
    image.src = aesthetic.canonical.imagery.src;
    image.alt = aesthetic.canonical.imagery.alt;
    image.width = 640;
    image.height = 427;
    image.loading = "lazy";
    article.append(image);

    const copy = document.createElement("div");
    copy.className = "pack-copy";

    const meta = document.createElement("div");
    meta.className = "pack-meta";
    const id = document.createElement("span");
    id.className = "metric-label";
    id.textContent = aesthetic.id;
    const category = document.createElement("span");
    category.className = "pack-category";
    category.textContent = aesthetic.category ?? "Aesthetic pack";
    meta.append(id, category);

    const title = document.createElement("h3");
    title.textContent = aesthetic.label;
    const summary = document.createElement("p");
    summary.textContent = aesthetic.summary;
    copy.append(meta, title, summary, renderSwatches(aesthetic));
    article.append(copy);

    const actions = document.createElement("div");
    actions.className = "pack-actions";
    const apply = document.createElement("button");
    apply.type = "button";
    apply.className = "command-link primary";
    apply.textContent = "Apply to site";
    apply.addEventListener("click", () => applyById(aesthetic.id));

    const download = document.createElement("a");
    download.className = "command-link";
    download.href = packUrl(aesthetic, "download");
    download.download = `${aesthetic.id}.mosvera.json`;
    download.textContent = "Download pack";

    const source = document.createElement("a");
    source.className = "command-link";
    source.href = packUrl(aesthetic, "source");
    source.textContent = "View source";

    actions.append(apply, download, source);
    article.append(actions);
    packGrid.append(article);
  }
}

function applyAesthetic(aesthetic) {
  const tokens = compileSiteTheme(aesthetic);
  for (const [key, value] of Object.entries(tokens)) {
    document.documentElement.style.setProperty(key, value);
  }

  body.dataset.aesthetic = aesthetic.id;
  const isCanonicalDark = aesthetic.id === canonicalThemePair.dark;
  const isCanonicalLight = aesthetic.id === canonicalThemePair.light;
  body.dataset.canonicalScheme = isCanonicalDark ? "dark" : isCanonicalLight ? "light" : "custom";
  if (themeToggle) {
    const next = isCanonicalDark ? "Mosvera Public" : "Mosvera Public Dark";
    themeToggle.setAttribute("aria-label", `Switch to ${next}`);
    themeToggle.title = `Switch to ${next}`;
    themeToggle.setAttribute("aria-pressed", isCanonicalDark ? "true" : "false");
  }
  select.value = aesthetic.id;
  headline.textContent = aesthetic.canonical.voice.headline;
  modeBody.textContent = aesthetic.canonical.voice.body;
  modeEyebrow.textContent = aesthetic.canonical.voice.eyebrow;
  modeLabel.textContent = aesthetic.label;
  modeSummary.textContent = aesthetic.summary;
  metricMode.textContent = aesthetic.id;
  heroImage.src = aesthetic.canonical.imagery.src;
  heroImage.alt = aesthetic.canonical.imagery.alt;
  compositionJson.textContent = JSON.stringify(aesthetic.composition, null, 2);
  compiledTokens.textContent = toCss(tokens);
  setHash(aesthetic.id);

  for (const tile of document.querySelectorAll("[data-pack-id]")) {
    const active = tile.dataset.packId === aesthetic.id;
    tile.classList.toggle("is-active", active);
    tile.setAttribute("aria-current", active ? "true" : "false");
  }
}

async function main() {
  const response = await fetch("/data/aesthetics.json");
  if (!response.ok) throw new Error(`failed to load aesthetics: ${response.status}`);
  const registry = await response.json();
  const aesthetics = new Map(registry.aesthetics.map((aesthetic) => [aesthetic.id, aesthetic]));

  for (const aesthetic of registry.aesthetics) {
    const option = document.createElement("option");
    option.value = aesthetic.id;
    option.textContent = aesthetic.label;
    select.append(option);
  }

  select.addEventListener("change", () => {
    const next = aesthetics.get(select.value) ?? aesthetics.get(registry.default);
    applyAesthetic(next);
  });

  themeToggle?.addEventListener("click", () => {
    const current = body.dataset.aesthetic;
    const nextId = current === canonicalThemePair.dark ? canonicalThemePair.light : canonicalThemePair.dark;
    applyAesthetic(aesthetics.get(nextId) ?? aesthetics.get(registry.default));
  });

  window.addEventListener("hashchange", () => {
    const next = aesthetics.get(hashId()) ?? aesthetics.get(registry.default);
    applyAesthetic(next);
  });

  renderPackGallery(registry.aesthetics, (id) => {
    const next = aesthetics.get(id) ?? aesthetics.get(registry.default);
    applyAesthetic(next);
  });

  applyAesthetic(aesthetics.get(hashId()) ?? aesthetics.get(registry.default));
}

main().catch((error) => {
  console.error(error);
  document.documentElement.dataset.error = "aesthetic-load-failed";
});
