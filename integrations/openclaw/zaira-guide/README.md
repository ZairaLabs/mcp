# Zaira Tool Research for OpenClaw

Your agent already knows a stale version of every developer tool. This bundle
gives it current, sourced Zaira Guide evidence before it chooses a library,
API, platform, service, or agent tool.

One installation adds both the `zaira-tool-research` skill and a direct,
read-only connection to the hosted Zaira Guide MCP server. The skill guides
agents through discovery, due diligence, and side-by-side comparison. The MCP
server supplies current records, sources, and verification dates. No Zaira
account, API key, or native OpenClaw plugin code is required.

OpenClaw's current compatible-bundle importer accepts local stdio MCP entries.
This bundle therefore uses a small local wrapper around the exact, signed
`mcp-remote@0.1.38` release as a compatibility bridge to Zaira's hosted
Streamable HTTP endpoint. Node.js and `npx` are required. The wrapper changes
only the MCP initialize client name and version to `zaira-clawhub-bundle` and
this package version. That privacy-safe, self-identified marker attributes the
package channel; it does not identify a user, attest a unique install, or add
new data collection. The bridge can be
removed when supported OpenClaw releases accept hosted HTTP MCP entries
directly from compatible bundles.

## Install

From ClawHub after the first release is published:

```bash
openclaw plugins install clawhub:@zairalabs/zaira-guide
```

Verify that OpenClaw detected a bundle and its MCP server:

```bash
openclaw plugins inspect zaira-guide
openclaw skills list
```

Restart the gateway after installing or updating:

```bash
openclaw gateway restart
```

## What it connects to

- Endpoint: `https://zairalabs.ai/guide/mcp`
- Transport: local stdio through `mcp-remote@0.1.38`, then Streamable HTTP
- Authentication: none
- Access: read-only

Queries leave the local OpenClaw host and are sent to Zaira Labs. Do not put
secrets, personal data, unpublished source code, or unnecessary customer data
in search text. Use is governed by the
[Zaira Labs Terms](https://zairalabs.ai/terms) and
[Privacy Policy](https://zairalabs.ai/privacy).

## Trust boundary

The bundle contains no native OpenClaw plugin code or install scripts. Its
small Node.js wrapper launches `npx -y mcp-remote@0.1.38`, which may download
and execute that exact npm package on first use. The wrapper rewrites only MCP
initialize client metadata; tool calls, search text, and responses pass through
unchanged. The pinned bridge is MIT-licensed, signed on npm, has no package
lifecycle scripts, and had no known production dependency vulnerabilities when
this release was prepared. It forwards MCP messages to the Zaira endpoint.

The Zaira server requires no credentials. The bundle does not configure OAuth,
pass credentials, request background workers, or request local file
permissions. The remote MCP server exposes five read-only tools.

Bridge source: [`geelen/mcp-remote`](https://github.com/geelen/mcp-remote).

## Try it

Ask an uncoached question that requires a current decision:

> I need an API authentication provider for a small autonomous-agent product.
> Compare the strongest current options for a low initial budget, hosted
> deployment, machine-to-machine auth, and an exit path if pricing changes.
> Recommend one and show me what evidence might be stale or missing.

Source and release metadata live in the public
[`ZairaLabs/mcp`](https://github.com/ZairaLabs/mcp) repository.
