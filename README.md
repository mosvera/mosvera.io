# mosvera.io

Public website, schema host, and live aesthetic demonstrator for Mosvera.

The site is intentionally static. It demonstrates the Mosvera model by letting
visitors switch between checked-in aesthetic compositions and see the same site
re-theme immediately. Production adopters bring Mosvera into their own
platforms; this repo is the reference public example, not a hosted runtime
dependency.

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

## Verification

```sh
node scripts/verify.mjs
```

The verifier checks schema endpoint files, required v1 aesthetics, and common
public-release safety problems.
