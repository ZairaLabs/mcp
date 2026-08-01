"use strict";

const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const repositoryRoot = path.resolve(__dirname, "..");
const bundleRoot = path.join(repositoryRoot, "integrations/openclaw/zaira-guide");
const bridgePath = path.join(bundleRoot, "bin/zaira-guide-bridge.cjs");
const { BUNDLE_NAME, BUNDLE_VERSION, npxLauncher, rewriteInitializeLine } = require(bridgePath);

function runBridge(input, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [bridgePath], {
      env: { ...process.env, ...env },
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code, signal) => resolve({ code, signal, stdout, stderr }));
    if (input !== null) child.stdin.end(input);
  });
}

function installFakeNpx(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "zaira-guide-npx-"));
  const fakeScript = path.join(directory, "fake-npx.cjs");
  fs.writeFileSync(
    fakeScript,
    `
const fs = require("node:fs");
fs.writeFileSync(process.env.FAKE_NPX_ARGS_PATH, JSON.stringify(process.argv.slice(2)));
if (process.env.FAKE_NPX_SIGNAL) process.kill(process.pid, process.env.FAKE_NPX_SIGNAL);
if (process.env.FAKE_NPX_EXIT_CODE) process.exit(Number(process.env.FAKE_NPX_EXIT_CODE));
process.stdin.pipe(process.stdout);
`,
  );
  fs.writeFileSync(
    path.join(directory, "npx"),
    `#!/bin/sh\nexec "${process.execPath}" "${fakeScript}" "$@"\n`,
    { mode: 0o755 },
  );
  fs.writeFileSync(
    path.join(directory, "npx.cmd"),
    `@echo off\r\n"${process.execPath}" "%~dp0fake-npx.cjs" %*\r\n`,
  );
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

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

test("leaves invalid initialize shapes unchanged and preserves other client metadata", () => {
  for (const message of [
    { jsonrpc: "2.0", id: 1, method: "initialize" },
    { jsonrpc: "2.0", id: 2, method: "initialize", params: null },
    { jsonrpc: "2.0", id: 3, method: "initialize", params: { clientInfo: "invalid" } },
  ]) {
    const line = JSON.stringify(message);
    assert.equal(rewriteInitializeLine(line), line);
  }

  const output = JSON.parse(rewriteInitializeLine(JSON.stringify({
    jsonrpc: "2.0",
    id: 4,
    method: "initialize",
    params: { clientInfo: { name: "host", version: "1", title: "Host UI" } },
  })));
  assert.equal(output.params.clientInfo.title, "Host UI");
});

test("selects a native npx launcher on POSIX and cmd.exe on Windows", () => {
  assert.deepEqual(npxLauncher("linux"), { command: "npx", args: [] });
  assert.deepEqual(npxLauncher("darwin"), { command: "npx", args: [] });
  assert.deepEqual(npxLauncher("win32", { ComSpec: "C:\\Windows\\cmd.exe" }), {
    command: "C:\\Windows\\cmd.exe",
    args: ["/d", "/s", "/c", "npx.cmd"],
  });
});

test("runs the pinned bridge end to end and preserves line framing", async (t) => {
  const fakeNpxDirectory = installFakeNpx(t);
  const argsPath = path.join(fakeNpxDirectory, "args.json");
  const initialize = JSON.stringify({
    jsonrpc: "2.0",
    id: 9,
    method: "initialize",
    params: { clientInfo: { name: "host", version: "1" } },
  });
  const toolCall = '{"jsonrpc":"2.0","id":10,"method":"tools/list"}';
  const result = await runBridge(`${initialize}\n${toolCall}\n`, {
    PATH: `${fakeNpxDirectory}${path.delimiter}${process.env.PATH ?? ""}`,
    FAKE_NPX_ARGS_PATH: argsPath,
  });

  assert.equal(result.code, 0, result.stderr);
  assert.equal(result.signal, null);
  assert.deepEqual(JSON.parse(fs.readFileSync(argsPath, "utf8")), [
    "-y",
    "mcp-remote@0.1.38",
    "https://zairalabs.ai/guide/mcp",
    "--transport",
    "http-only",
    "--silent",
  ]);
  const lines = result.stdout.trimEnd().split("\n");
  assert.equal(JSON.parse(lines[0]).params.clientInfo.name, BUNDLE_NAME);
  assert.equal(JSON.parse(lines[0]).params.clientInfo.version, BUNDLE_VERSION);
  assert.equal(lines[1], toolCall);
});

test("propagates bridge exit failures", async (t) => {
  const fakeNpxDirectory = installFakeNpx(t);
  const result = await runBridge("", {
    PATH: `${fakeNpxDirectory}${path.delimiter}${process.env.PATH ?? ""}`,
    FAKE_NPX_ARGS_PATH: path.join(fakeNpxDirectory, "args.json"),
    FAKE_NPX_EXIT_CODE: "23",
  });
  assert.equal(result.code, 23, result.stderr);
});

test("reports a missing npx executable", async () => {
  const result = await runBridge("", { PATH: "/nonexistent" });
  assert.equal(result.code, 1);
  if (process.platform !== "win32") {
    assert.match(result.stderr, /Unable to start the Zaira MCP bridge: spawn npx ENOENT/);
  }
});

test("terminates promptly on spawn failure while client stdin stays open", { timeout: 2000 }, async () => {
  const result = await runBridge(null, { PATH: "/nonexistent" });
  assert.equal(result.code, 1);
  if (process.platform !== "win32") {
    assert.match(result.stderr, /Unable to start the Zaira MCP bridge: spawn npx ENOENT/);
  }
});

test("propagates child termination signals", { skip: process.platform === "win32" }, async (t) => {
  const fakeNpxDirectory = installFakeNpx(t);
  const result = await runBridge("", {
    PATH: `${fakeNpxDirectory}${path.delimiter}${process.env.PATH ?? ""}`,
    FAKE_NPX_ARGS_PATH: path.join(fakeNpxDirectory, "args.json"),
    FAKE_NPX_SIGNAL: "SIGTERM",
  });
  assert.equal(result.code, null);
  assert.equal(result.signal, "SIGTERM");
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
  assert.match(
    workflow,
    /uses: openclaw\/clawhub\/\.github\/workflows\/package-publish\.yml@1a3ee6e015af1d9a83a9ce271b56b22d9e17ad20/,
  );
  assert.match(workflow, /validate-or-publish:\r?\n\s+needs: bundle-tests/);
  assert.match(workflow, /source_path: integrations\/openclaw\/zaira-guide/);
  assert.match(workflow, /version: 0\.1\.1/);
  assert.doesNotMatch(workflow, /source: \.\/integrations\/openclaw\/zaira-guide/);
});
