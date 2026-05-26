# Agent Guidance

This repo is the static public Mosvera site, schema host, mirrored pack
download surface, live aesthetic demonstrator, and AI-agent entrypoint surface.

## Safety Rules

- Do not commit secrets, `.env*`, local config, vault references, generated
  media source URLs, caches, private notes, or local machine paths.
- Preserve unrelated user changes and keep edits narrow.
- Use DCO-signed commits when committing.
- Do not deploy manually, rotate credentials, change repo visibility, or create
  releases unless explicitly asked.

## Repo Boundaries

- Keep the site static and public-safe.
- Keep gallery source data in `mosvera/examples`; mirror it here for deploy.
- Keep schema endpoints extensionless under `/schema/0.1/`.
- Keep `/llms.txt`, `/llms-full.txt`, `/ai-install.md`, and
  `/.well-known/mosvera.json` accurate for agents.

## Verification

- Run `node scripts/sync-gallery.mjs ../mosvera-examples` when gallery source
  changes.
- Run `node scripts/verify.mjs`.
- Run `git diff --check` before committing.
