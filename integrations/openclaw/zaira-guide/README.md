# Zaira Guide for OpenClaw

This bundle gives OpenClaw agents a current, read-only source for
finding and comparing developer tools. It connects to the hosted Zaira Guide
MCP server and adds a skill that guides agents through discovery, due
diligence, and side-by-side comparison.

OpenClaw 2026.7.1 runs bundle MCP servers over local stdio. This bundle uses
the exact, signed `mcp-remote@0.1.38` release as a compatibility bridge to the
hosted Streamable HTTP endpoint. Node.js and `npx` are therefore required.

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

The bundle contains no executable plugin code or install scripts. At runtime,
OpenClaw launches `npx -y mcp-remote@0.1.38`, which may download and execute
that exact npm package on first use. The bridge is MIT-licensed, signed on npm,
has no package lifecycle scripts, and had no known production dependency
vulnerabilities when this release was prepared. It forwards MCP messages to
the Zaira endpoint and preserves OpenClaw in the forwarded client name.

The Zaira server requires no credentials. The bridge can support OAuth for
other servers, but this bundle does not configure OAuth or pass credentials.
It does not request background workers or local file permissions. The remote
MCP server exposes five read-only tools.

Bridge source: [`geelen/mcp-remote`](https://github.com/geelen/mcp-remote).

Source and release metadata live in the public
[`ZairaLabs/mcp`](https://github.com/ZairaLabs/mcp) repository.
