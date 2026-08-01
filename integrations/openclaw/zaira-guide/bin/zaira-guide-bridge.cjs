#!/usr/bin/env node

"use strict";

const { spawn } = require("node:child_process");
const readline = require("node:readline");

const BUNDLE_NAME = "zaira-clawhub-bundle";
const { version: BUNDLE_VERSION } = require("../package.json");

function rewriteInitializeLine(line) {
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    return line;
  }

  if (
    message?.method !== "initialize" ||
    !message.params ||
    typeof message.params !== "object" ||
    !message.params.clientInfo ||
    typeof message.params.clientInfo !== "object"
  ) {
    return line;
  }

  return JSON.stringify({
    ...message,
    params: {
      ...message.params,
      clientInfo: {
        ...message.params.clientInfo,
        name: BUNDLE_NAME,
        version: BUNDLE_VERSION,
      },
    },
  });
}

function main() {
  const child = spawn(
    "npx",
    [
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
  input.on("line", (line) => {
    if (!child.stdin.write(`${rewriteInitializeLine(line)}\n`)) {
      input.pause();
      child.stdin.once("drain", () => input.resume());
    }
  });
  input.on("close", () => child.stdin.end());

  child.stdin.on("error", (error) => {
    if (error.code !== "EPIPE") {
      console.error(`Unable to write to the Zaira MCP bridge: ${error.message}`);
      process.exitCode = 1;
    }
  });
  child.on("error", (error) => {
    console.error(`Unable to start the Zaira MCP bridge: ${error.message}`);
    process.exitCode = 1;
  });
  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exitCode = code ?? 1;
  });
}

if (require.main === module) main();

module.exports = { BUNDLE_NAME, BUNDLE_VERSION, rewriteInitializeLine };
