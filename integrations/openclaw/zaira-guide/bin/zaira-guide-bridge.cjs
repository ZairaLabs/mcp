#!/usr/bin/env node

"use strict";

const { spawn } = require("node:child_process");
const readline = require("node:readline");

const BUNDLE_NAME = "zaira-clawhub-bundle";
const { version: BUNDLE_VERSION } = require("../package.json");

function npxLauncher(platform = process.platform, environment = process.env) {
  if (platform === "win32") {
    return {
      command: environment.ComSpec || "cmd.exe",
      args: ["/d", "/s", "/c", "npx.cmd"],
    };
  }
  return { command: "npx", args: [] };
}

function rewriteInitializeFrame(line) {
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    return { line, rewritten: false };
  }

  if (
    message?.method !== "initialize" ||
    !message.params ||
    typeof message.params !== "object" ||
    !message.params.clientInfo ||
    typeof message.params.clientInfo !== "object"
  ) {
    return { line, rewritten: false };
  }

  return {
    line: JSON.stringify({
      ...message,
      params: {
        ...message.params,
        clientInfo: {
          ...message.params.clientInfo,
          name: BUNDLE_NAME,
          version: BUNDLE_VERSION,
        },
      },
    }),
    rewritten: true,
  };
}

function rewriteInitializeLine(line) {
  return rewriteInitializeFrame(line).line;
}

function main() {
  const launcher = npxLauncher();
  const child = spawn(
    launcher.command,
    [
      ...launcher.args,
      "-y",
      "mcp-remote@0.1.38",
      "https://zairalabs.ai/guide/mcp",
      "--transport",
      "http-only",
      "--silent",
    ],
    { stdio: ["pipe", "pipe", "inherit"] },
  );

  child.stdout.pipe(process.stdout);
  const input = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  let childFinished = false;

  function stopInput() {
    input.close();
    process.stdin.pause();
  }

  void (async () => {
    let initializeRewritten = false;
    try {
      for await (const line of input) {
        let output = line;
        if (!initializeRewritten) {
          const frame = rewriteInitializeFrame(line);
          output = frame.line;
          initializeRewritten = frame.rewritten;
        }
        await new Promise((resolve, reject) => {
          child.stdin.write(`${output}\n`, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
      }
    } catch (error) {
      if (!childFinished && error.code !== "EPIPE" && error.code !== "ERR_STREAM_DESTROYED") {
        console.error(`Unable to write to the Zaira MCP bridge: ${error.message}`);
        process.exitCode = 1;
        child.kill();
      }
    } finally {
      if (!child.stdin.destroyed) child.stdin.end();
    }
  })();

  child.stdin.on("error", (error) => {
    if (!childFinished && error.code !== "EPIPE") {
      console.error(`Unable to write to the Zaira MCP bridge: ${error.message}`);
      process.exitCode = 1;
    }
  });
  child.on("error", (error) => {
    childFinished = true;
    stopInput();
    console.error(`Unable to start the Zaira MCP bridge: ${error.message}`);
    process.exitCode = 1;
  });
  child.on("exit", (code, signal) => {
    childFinished = true;
    stopInput();
    if (signal) process.kill(process.pid, signal);
    else process.exitCode = code ?? 1;
  });
}

if (require.main === module) main();

module.exports = { BUNDLE_NAME, BUNDLE_VERSION, npxLauncher, rewriteInitializeLine };
