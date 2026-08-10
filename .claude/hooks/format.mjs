#!/usr/bin/env node
/**
 * PostToolUse hook: formats the file Claude just wrote.
 *
 * Written as a Node script rather than an inline shell command because this repo
 * is worked on from both PowerShell and Git Bash, and inline quoting breaks in
 * one of them. Reads the hook payload as JSON on stdin.
 *
 * Failures are swallowed — a formatter should never block an edit.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const FORMATTABLE = new Set([".ts", ".tsx", ".mts", ".js", ".jsx", ".mjs", ".css", ".json", ".md"]);

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

const raw = readStdin();
if (!raw.trim()) process.exit(0);

let payload;
try {
  payload = JSON.parse(raw);
} catch {
  process.exit(0);
}

const filePath = payload?.tool_input?.file_path ?? payload?.tool_response?.filePath;
if (!filePath || !existsSync(filePath)) process.exit(0);
if (!FORMATTABLE.has(path.extname(filePath))) process.exit(0);
if (filePath.includes("node_modules") || filePath.includes(`${path.sep}generated${path.sep}`)) {
  process.exit(0);
}

spawnSync("npx", ["prettier", "--write", "--ignore-unknown", filePath], {
  stdio: "ignore",
  shell: process.platform === "win32",
  timeout: 30_000,
});

process.exit(0);
