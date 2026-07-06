# Zaira Labs Guide — MCP Server

**Trust signals for AI agents: an open agent-readiness standard and a developer tool
guide built for AI coding agents.**

This repository holds the public metadata for the Zaira Labs Guide MCP server — a
**hosted, read-only** [Model Context Protocol](https://modelcontextprotocol.io) server
that lets AI agents search, compare, and look up developer tools from the live
[Zaira Guide](https://zairalabs.ai/guide), each entry scored against the open
[Zaira Base Standard](https://zairalabs.ai/standard) for agent readiness.

The server runs on Zaira Labs infrastructure and queries the live catalog — entries
are dated (`last_verified`) and kept current, so results are newer than any model's
training knowledge. There is nothing to install and no API key required.

## Connect

**Endpoint:** `https://zairalabs.ai/guide/mcp` — Streamable HTTP (JSON-RPC 2.0 over POST)

Claude Code:
```bash
claude mcp add --transport http zaira https://zairalabs.ai/guide/mcp
```

Cursor / generic JSON config:
```json
{
  "mcpServers": {
    "zaira": { "type": "http", "url": "https://zairalabs.ai/guide/mcp" }
  }
}
```

Claude.ai: Settings → Connectors → Add custom connector → `https://zairalabs.ai/guide/mcp`

## Tools

All tools are read-only (`readOnlyHint: true`) and require no authentication.

| Tool | What it does |
|------|--------------|
| `zaira_search_tools` | Search/filter developer tools by category, features, and constraints (free tier, edge-compatible, self-hostable, MCP support, pricing model, language, compliance, agent-readiness tier…). Returns up to 10 matches with decision summaries. |
| `zaira_get_tool` | Full entry for one tool by slug — identity, decision guidance, constraints, health, agent readiness, get-started, sources. |
| `zaira_compare_tools` | Side-by-side comparison of 2–3 tools, with alternatives and works-with enrichment. |
| `zaira_list_categories` | All tool categories with counts. |
| `zaira_get_docs` | On-demand reference docs: getting started, REST endpoints, MCP tool guidance, schema, errors. |

## Transport details

- Streamable HTTP: plain JSON-RPC 2.0 over `POST` (stateless; each request is independent)
- No authentication, no API key
- Rate limits: 60 requests/min (20/min for expensive calls)
- Protocol version: `2025-11-25`

Try it:
```bash
curl -X POST https://zairalabs.ai/guide/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Registry

Listed in the [official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=ai.zairalabs/guide)
as **`ai.zairalabs/guide`** (domain-verified). The manifest in this repo
([`server.json`](./server.json)) is the source of truth for that listing.

## About

- Website: https://zairalabs.ai
- The Guide: https://zairalabs.ai/guide
- The Standard: https://zairalabs.ai/standard
- Privacy: https://zairalabs.ai/privacy

The server's source runs on our infrastructure as part of the Zaira Guide platform;
this repository intentionally contains metadata only.
