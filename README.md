# mosvera.io

Public website, schema host, and live aesthetic demonstrator for Mosvera.

The site is intentionally static. It demonstrates the Mosvera model by letting
visitors switch between checked-in aesthetic compositions and see the same site
re-theme immediately. Production adopters bring Mosvera into their own
platforms; this repo is the reference public example, not a hosted runtime
dependency.

The 25-pack gallery source of truth lives in
[`mosvera/examples`](https://github.com/mosvera/examples/tree/main/packs).
This repo mirrors `packs/gallery.json` and the gallery WebP assets into the
static deploy bundle.

## Local Preview

```sh
python3 -m http.server 8099
```

Then open `http://localhost:8099/`.

## Public Packages

- Spec and schemas: <https://github.com/mosvera/spec>
- JS/TS runtime: <https://www.npmjs.com/package/@mosvera/runtime>
- Python runtime: <https://pypi.org/project/mosvera/>
- Provider adapters: <https://www.npmjs.com/search?q=%40mosvera%2Fprovider>
- Local MCP bridge: <https://www.npmjs.com/package/@mosvera/mcp>
- Claude Desktop bundle: <https://github.com/mosvera/mcp/releases/latest>

The MCP server uses a local user-owned registry. The default Claude Desktop
path is the `.mcpb` release bundle; npm/npx remains available for developers
and automation.

## AI Agent Entry Points

- Compact agent index: <https://mosvera.io/llms.txt>
- Full agent reference: <https://mosvera.io/llms-full.txt>
- Install router: <https://mosvera.io/ai-install.md>
- Machine-readable manifest: <https://mosvera.io/.well-known/mosvera.json>
- Search sitemap: <https://mosvera.io/sitemap.xml>

Agents should ask the user which install route they want before running local
commands. The site advertises `/llms.txt` through HTML metadata and an HTTP
`Link` header.

The canonical public URL is `https://mosvera.io/`; `www.mosvera.io` redirects to
the apex. Search engines should use `sitemap.xml`, while `llms.txt` remains the
AI-agent discovery surface.

## Verification

```sh
node scripts/sync-gallery.mjs ../mosvera-examples
node scripts/verify.mjs
```

The verifier checks schema endpoint files, required v1 aesthetics, and common
public-release safety problems.

## Deployment

The Vercel project is connected to `mosvera/mosvera.io` and deploys production
from `main`. GitHub pushes should create the production deployment automatically;
manual `vercel deploy --prod` is only a fallback if the Git integration is down.
