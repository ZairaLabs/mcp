"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repositoryRoot = path.resolve(__dirname, "..");
const bundleRoot = path.join(repositoryRoot, "integrations/openclaw/zaira-guide");
const bridgePath = path.join(bundleRoot, "bin/zaira-guide-bridge.cjs");
const { BUNDLE_NAME, BUNDLE_VERSION, rewriteInitializeLine } = require(bridgePath);

test("replaces only initialize client metadata with the reviewed bundle marker", () => {
  const output = JSON.parse(
    rewriteInitializeLine(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 7,
        method: "initialize",
        params: {
          protocolVersion: "2025-06-18",
          capabilities: { roots: {} },
          clientInfo: { name: "claude-code", version: "2.0.0" },
        },
      }),
    ),
  );

  assert.equal(output.params.clientInfo.name, "zaira-clawhub-bundle");
  assert.equal(output.params.clientInfo.version, "0.1.1");
  assert.equal(output.params.protocolVersion, "2025-06-18");
  assert.deepEqual(output.params.capabilities, { roots: {} });
  assert.equal(output.id, 7);
});

test("passes tool calls, notifications, and malformed input through byte-for-byte", () => {
  for (const line of [
    '{"jsonrpc":"2.0","id":8,"method":"tools/list"}',
    '{"jsonrpc":"2.0","method":"notifications/initialized"}',
    "not-json",
  ]) {
    assert.equal(rewriteInitializeLine(line), line);
  }
});

test("keeps the package, plugin, bridge, and workflow versions synchronized", () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(bundleRoot, "package.json")));
  const pluginJson = JSON.parse(fs.readFileSync(path.join(bundleRoot, "openclaw.plugin.json")));
  const codexPluginJson = JSON.parse(
    fs.readFileSync(path.join(bundleRoot, ".codex-plugin/plugin.json")),
  );
  const mcpJson = JSON.parse(fs.readFileSync(path.join(bundleRoot, ".mcp.json")));
  const workflow = fs.readFileSync(
    path.join(repositoryRoot, ".github/workflows/clawhub-zaira-guide.yml"),
    "utf8",
  );

  assert.equal(BUNDLE_NAME, "zaira-clawhub-bundle");
  assert.equal(BUNDLE_VERSION, "0.1.1");
  assert.equal(packageJson.version, BUNDLE_VERSION);
  assert.equal(pluginJson.version, BUNDLE_VERSION);
  assert.equal(codexPluginJson.version, BUNDLE_VERSION);
  assert.deepEqual(mcpJson.mcpServers["zaira-guide"], {
    command: "node",
    args: ["./bin/zaira-guide-bridge.cjs"],
  });
  assert.match(workflow, /source: ZairaLabs\/mcp/);
  assert.match(workflow, /ref: \$\{\{ github\.sha \}\}/);
  assert.match(workflow, /source_path: integrations\/openclaw\/zaira-guide/);
  assert.match(workflow, /version: 0\.1\.1/);
  assert.doesNotMatch(workflow, /source: \.\/integrations\/openclaw\/zaira-guide/);
});
