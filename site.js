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

function applyAesthetic(aesthetic) {
  const tokens = compileSiteTheme(aesthetic);
  for (const [key, value] of Object.entries(tokens)) {
    document.documentElement.style.setProperty(key, value);
  }

  body.dataset.aesthetic = aesthetic.id;
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

  window.addEventListener("hashchange", () => {
    const next = aesthetics.get(hashId()) ?? aesthetics.get(registry.default);
    applyAesthetic(next);
  });

  applyAesthetic(aesthetics.get(hashId()) ?? aesthetics.get(registry.default));
}

main().catch((error) => {
  console.error(error);
  document.documentElement.dataset.error = "aesthetic-load-failed";
});
