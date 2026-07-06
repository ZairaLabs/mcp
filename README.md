# Zaira Labs Guide MCP server

**Trust signals for AI agents: an open agent-readiness standard and a developer tool
guide built for AI coding agents.**

This repository holds the public metadata for the Zaira Labs Guide MCP server. Not a
package. Nothing to install. The server is hosted, read-only, and answers from the live
[Zaira Guide](https://zairalabs.ai/guide): developer tools scored against the open
[Zaira Standard](https://zairalabs.ai/standard), every entry dated (`last_verified`).
Guide data is newer than training knowledge. That is the point.

## Connect

Endpoint: `https://zairalabs.ai/guide/mcp` (Streamable HTTP, JSON-RPC 2.0 over POST).
No API key.

Claude Code:
```bash
claude mcp add --transport http zaira https://zairalabs.ai/guide/mcp
```

Codex CLI:
```bash
codex mcp add zaira --url https://zairalabs.ai/guide/mcp
```

Gemini CLI, in `~/.gemini/settings.json`:
```json
{
  "mcpServers": {
    "zaira": { "httpUrl": "https://zairalabs.ai/guide/mcp" }
  }
}
```

Cursor or any JSON-configured client:
```json
{
  "mcpServers": {
    "zaira": { "type": "http", "url": "https://zairalabs.ai/guide/mcp" }
  }
}
```

VS Code, in `.vscode/mcp.json`:
```json
{
  "servers": {
    "zaira": { "type": "http", "url": "https://zairalabs.ai/guide/mcp" }
  }
}
```

Claude.ai: Settings, Connectors, Add custom connector, paste the endpoint URL.

ChatGPT: Settings, Apps and Connectors, Create. Requires a paid plan with developer
mode enabled. Name it, paste the endpoint URL, no authentication.

## Tools

Five tools. All read-only (`readOnlyHint: true`).

| Tool | What it does |
|------|--------------|
| `zaira_search_tools` | Search and filter tools by category, features, and constraints (free tier, edge-compatible, self-hostable, MCP support, pricing model, language, compliance, agent-readiness tier). Returns up to 10 matches with decision summaries. |
| `zaira_get_tool` | Full entry for one tool by slug: identity, decision guidance, constraints, health, agent readiness, get started, sources. |
| `zaira_compare_tools` | Two or three tools side by side, with alternatives and works-with enrichment. |
| `zaira_list_categories` | Every category with its tool count. |
| `zaira_get_docs` | Reference docs on demand: getting started, REST endpoints, MCP tool guidance, schema, errors. |

## Transport

- Plain JSON-RPC 2.0 over POST. Stateless: each request is independent.
- No authentication.
- Rate limits: 60 requests per minute, 20 per minute for expensive calls.
- Protocol version `2025-11-25`.

Try it:
```bash
curl -X POST https://zairalabs.ai/guide/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Registry

Listed in the [official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=ai.zairalabs/guide)
as `ai.zairalabs/guide`, domain-verified. The [`server.json`](./server.json) in this
repository is the source of truth for that listing.

## Terms

The MCP server and the guide content are proprietary to Zaira Labs. Use is governed by
the [Zaira Labs Terms of Service](https://zairalabs.ai/terms). This repository contains
metadata only; the server source runs on Zaira Labs infrastructure.

## Links

- Website: https://zairalabs.ai
- The Guide: https://zairalabs.ai/guide
- The Standard: https://zairalabs.ai/standard
- Privacy: https://zairalabs.ai/privacy
