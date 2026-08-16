#!/usr/bin/env node
/**
 * Copies the plugin's rules/ into the current project's .claude/rules/.
 *
 * Rules only auto-load from a project's own .claude/rules/ — a plugin cannot
 * supply them directly, so the plugin ships them as payload and this installs them.
 *
 * Usage: node <plugin-root>/bin/init-rules.mjs [--force] [--target <dir>]
 */

import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const sourceDir = path.join(pluginRoot, "rules");

const args = process.argv.slice(2);
const force = args.includes("--force");
const targetIndex = args.indexOf("--target");
const projectRoot =
  targetIndex === -1 ? process.cwd() : path.resolve(args[targetIndex + 1]);
const targetDir = path.join(projectRoot, ".claude", "rules");

if (!existsSync(sourceDir)) {
  console.error(`No rules/ directory in the plugin at ${pluginRoot}`);
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });

const written = [];
const skipped = [];

for (const file of readdirSync(sourceDir).filter((f) => f.endsWith(".md"))) {
  const dest = path.join(targetDir, file);
  if (existsSync(dest) && !force) {
    skipped.push(file);
    continue;
  }
  cpSync(path.join(sourceDir, file), dest);
  written.push(file);
}

if (written.length)
  console.log(`Installed into .claude/rules/: ${written.join(", ")}`);
if (skipped.length)
  console.log(
    `Already present, left alone: ${skipped.join(", ")} (use --force to overwrite)`,
  );
if (!written.length && !skipped.length)
  console.log("No rule files found to install.");
