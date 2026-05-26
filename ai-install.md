# Install Mosvera

Mosvera runs locally inside your tools. It does not require a hosted Mosvera
runtime. Choose the path that matches how you want to use it.

## 1. Claude Desktop

Best for the easiest non-command-line install.

1. Open <https://github.com/mosvera/mcp/releases/latest>.
2. Download the latest `mosvera-mcp-*.mcpb` bundle.
3. Open the bundle in Claude Desktop.
4. Ask Claude:

```text
Use Mosvera to show server_status.
Use Mosvera to list my aesthetics.
Use Mosvera to resolve claymation-playful-builder and compile it into CSS variables.
```

## 2. Claude Code

Best if you already work in Claude Code.

```sh
claude mcp add mosvera -- npx -y @mosvera/mcp@latest
```

Restart Claude Code if the tools do not appear immediately.

## 3. Codex

Best if you work in Codex.

```sh
codex mcp add mosvera -- npx -y @mosvera/mcp@latest
```

Restart Codex if the tools do not appear immediately.

## 4. npm / MCP Host

Best for developers using another MCP host.

```sh
npx -y @mosvera/mcp@latest
```

Minimal host config shape:

```json
{
  "mcpServers": {
    "mosvera": {
      "command": "npx",
      "args": ["-y", "@mosvera/mcp@latest"]
    }
  }
}
```

## 5. TypeScript Runtime

Best for Node.js, browser build systems, and TypeScript apps.

```sh
npm install @mosvera/runtime
```

Use it to load or import a registry, resolve a named aesthetic, and compile
portable design tokens or CSS variables.

## 6. Python Runtime

Best for Python apps, scripts, notebooks, and data pipelines.

```sh
pip install mosvera
```

Use it to validate packs, import packs into plain dictionaries, resolve named
aesthetics, and compile tokens.

## 7. Aesthetic Packs

Best if you only want to try or share an aesthetic.

1. Browse the pack gallery on <https://mosvera.io/#pack-gallery>.
2. Download a `.mosvera.json` pack.
3. Ask Mosvera MCP to preview importing it.
4. Import it into your local registry.
5. Resolve and compile the named aesthetic.

Sample pack:

<https://mosvera.io/packs/claymation-playful-builder.mosvera.json>

## 8. Source Repos

Best for contributors.

- <https://github.com/mosvera/spec>
- <https://github.com/mosvera/runtime>
- <https://github.com/mosvera/python>
- <https://github.com/mosvera/mcp>
- <https://github.com/mosvera/providers>
- <https://github.com/mosvera/examples>
- <https://github.com/mosvera/mosvera.io>

## 9. ChatGPT

The local npm MCP server is not a one-click local ChatGPT install. A
ChatGPT-native Mosvera surface should be built as an Apps SDK / MCP app. For
now, use the runtime packages inside your own app, or use Mosvera through
Claude Desktop, Claude Code, Codex, or another local MCP host.

## Quick Mental Model

```text
.mosvera.json pack -> local registry -> named aesthetic -> resolved model -> tokens / CSS variables / provider payloads
```

The registry is your local data. Packs contain registry documents only, not
secrets, provider credentials, generated media, or hosted runtime state.
