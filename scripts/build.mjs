#!/usr/bin/env node
// Greybeard build: regenerates adapters from SKILL.md, checks the repo, and builds release zips.
//
//   node scripts/build.mjs            regenerate adapters/ and run all checks
//   node scripts/build.mjs --check    verify only (CI): fail if adapters are stale or a check fails
//   node scripts/build.mjs --release  --check, plus publish-readiness checks, plus dist/ zip and notes
//
// No dependencies; Node 22+.

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_DIR = path.join(ROOT, "skills", "greybeard");
const SKILL_FILE = path.join(SKILL_DIR, "SKILL.md");
const args = new Set(process.argv.slice(2));
const CHECK_ONLY = args.has("--check") || args.has("--release");
const RELEASE = args.has("--release");

const errors = [];
const fail = (msg) => errors.push(msg);
const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");
const read = (p) => fs.readFileSync(p, "utf8");

// Files git would track: committed, staged, and untracked-but-not-ignored. Falls back to a walk without git.
function repoFiles() {
  try {
    const out = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: ROOT });
    return out.toString("utf8").split("\0").filter(Boolean).map((p) => path.join(ROOT, p)).filter((p) => fs.existsSync(p)).sort();
  } catch {
    return walk(ROOT);
  }
}
const isText = (buf) => !buf.includes(0);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "dist") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out.sort();
}

// ---------- SKILL.md frontmatter ----------
const skillRaw = read(SKILL_FILE);
if (skillRaw.includes("\r")) fail("skills/greybeard/SKILL.md has CRLF line endings; use LF");
const fm = skillRaw.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (!fm) {
  console.error("SKILL.md: missing YAML frontmatter");
  process.exit(1);
}
const [, frontmatter, body] = fm;
const field = (name) => {
  const m = frontmatter.match(new RegExp(`^${name}:\\s*(.*)$`, "m"));
  return m ? m[1].trim().replace(/^"(.*)"$/, "$1") : undefined;
};
const name = field("name");
const description = field("description");
const skillVersion = (frontmatter.match(/^\s+version:\s*"?([^"\s#]+)"?/m) || [])[1];

if (name !== "greybeard") fail(`SKILL.md name is "${name}", expected "greybeard"`);
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name || "") || (name || "").length > 64) fail("SKILL.md name violates the Agent Skills naming rules");
if (path.basename(SKILL_DIR) !== name) fail("skill folder name must equal the frontmatter name");
if (!description) fail("SKILL.md description is missing");
else {
  if (description.length > 1024) fail(`SKILL.md description is ${description.length} chars (max 1024)`);
  if (/[<>]/.test(description)) fail("SKILL.md description must not contain angle brackets");
  if (/:\s/.test(description)) fail('SKILL.md description contains ": " which breaks unquoted YAML');
  if (/^[|>][-+0-9]*$/.test(description)) fail("SKILL.md description must be a single-line scalar, not a YAML block scalar");
  if (/\s#/.test(description)) fail('SKILL.md description contains " #", which YAML treats as a comment');
}

// ---------- referenced files exist ----------
for (const m of body.matchAll(/`((?:references|assets)\/[^`\s]+)`/g)) {
  if (!fs.existsSync(path.join(SKILL_DIR, m[1]))) fail(`SKILL.md references missing file ${m[1]}`);
}
for (const f of walk(path.join(SKILL_DIR, "references"))) {
  const text = read(f);
  if (text.includes("\r")) fail(`${rel(f)} has CRLF line endings; use LF`);
  for (const m of text.matchAll(/`((?:references\/(?:stack\/)?)?[a-z0-9-]+\.md)`/g)) {
    const ref = m[1];
    const candidates = ref.startsWith("references/")
      ? [path.join(SKILL_DIR, ref)]
      : [path.join(path.dirname(f), ref), path.join(SKILL_DIR, "references", ref), path.join(SKILL_DIR, ref)];
    if (!candidates.some((p) => fs.existsSync(p))) fail(`${rel(f)} refers to missing file ${ref}`);
  }
}

// ---------- versions ----------
const plugin = JSON.parse(read(path.join(ROOT, ".claude-plugin", "plugin.json")));
const market = JSON.parse(read(path.join(ROOT, ".claude-plugin", "marketplace.json")));
const changelogTop = (read(path.join(ROOT, "CHANGELOG.md")).match(/^## (\d+\.\d+\.\d+) — (\d{4}-\d{2}-\d{2})/m) || []);
if (plugin.version !== skillVersion) fail(`plugin.json version ${plugin.version} != SKILL.md metadata.version ${skillVersion}`);
if (plugin.version !== changelogTop[1]) fail(`plugin.json version ${plugin.version} != top CHANGELOG entry ${changelogTop[1]}`);
for (const p of market.plugins || []) {
  for (const k of ["version", "description", "author"]) if (k in p) fail(`marketplace.json plugin entry sets "${k}"; keep it in plugin.json only`);
}
if (market.name !== "crusher-labs") fail(`marketplace name is "${market.name}", expected "crusher-labs"`);

// ---------- public-edition hygiene ----------
if (fs.existsSync(path.join(ROOT, ".mcp.json"))) fail(".mcp.json must not ship; document connectors in docs/CONNECTORS.md");
if (fs.existsSync(path.join(ROOT, "manifest.json"))) fail("manifest.json is not consumed by any platform; remove it");
const INTERNAL = [/crusher-labs-private/i, /internal use/i, /customized for crusher/i, /at crusher labs/i, /works for \*?\*?crusher/i];
const FILES = repoFiles();
for (const f of FILES) {
  const r = rel(f);
  if (r === "CHANGELOG.md" || r.startsWith("examples/") || r === "scripts/build.mjs" || r.startsWith("adapters/")) continue;
  const buf = fs.readFileSync(f);
  if (!isText(buf)) continue;
  const text = buf.toString("utf8");
  for (const re of INTERNAL) if (re.test(text)) fail(`${r} contains internal-edition wording (${re})`);
}

// ---------- adapters ----------
const SOURCE_NOTE = "<!-- Generated from skills/greybeard/SKILL.md by scripts/build.mjs. Do not edit by hand. -->";
const scopeNote =
  "> **When this applies.** Apply this guidance only to requests that match this description, and work normally on anything else:\n" +
  `> ${description}\n`;
const playbookNote = (where, installed) =>
  `> ${where} The playbooks and stack notes mentioned below (\`references/...\`, \`assets/...\`) are files in the full skill. ` +
  `${installed}` +
  "If they are not available, apply section 5 (the gate), section 6 (reporting) and section 8 (mode rules), " +
  "and treat any version-, limit- or price-specific fact as *Assumed* unless you can check current documentation.\n";
const bodyOut = body.replace(/^\n+/, "").replace(/^# Greybeard\n/, "");
const adapters = {
  "adapters/SYSTEM_PROMPT.md":
    `${SOURCE_NOTE}\n# Greybeard: engineering guidance\n\n${scopeNote}>\n` +
    playbookNote("This is the paste-in version of the Greybeard skill for tools without skill support.", "") +
    bodyOut,
  "adapters/codex/AGENTS.md":
    `${SOURCE_NOTE}\n# Greybeard: engineering guidance\n\n${scopeNote}>\n` +
    playbookNote(
      "This is the AGENTS.md version of the Greybeard skill.",
      "If the skill folder is installed (`~/.agents/skills/greybeard/` or `.agents/skills/greybeard/`), they are under its `references/`, and Codex can load the skill itself, so you do not need this file as well. "
    ) +
    bodyOut,
};
for (const [file, content] of Object.entries(adapters)) {
  const full = path.join(ROOT, file);
  const current = fs.existsSync(full) ? read(full) : null;
  if (Buffer.byteLength(content) > 32 * 1024) fail(`${file} exceeds 32 KiB`);
  if (current === content) continue;
  if (CHECK_ONLY) fail(`${file} is stale; run: node scripts/build.mjs`);
  else {
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
    console.log(`wrote ${file}`);
  }
}

// ---------- release readiness ----------
if (RELEASE) {
  for (const f of FILES) {
    const r = rel(f);
    if (r === "scripts/build.mjs") continue;
    const buf = fs.readFileSync(f);
    if (isText(buf) && /\bOWNER\/greybeard\b/.test(buf.toString("utf8"))) fail(`${r} still contains the OWNER/greybeard placeholder`);
  }
}

if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n` + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}

// ---------- zip ----------
function dosDateTime(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return { time: 0, date: ((y - 1980) << 9) | (m << 5) | d };
}
function crc32(buf) {
  if (typeof zlib.crc32 === "function") return zlib.crc32(buf) >>> 0;
  let c, crc = 0xffffffff;
  for (const byte of buf) {
    c = (crc ^ byte) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function buildZip(entries, isoDate) {
  // entries: [{ name, data: Buffer | null (directory) }]
  const { time, date } = dosDateTime(isoDate);
  const locals = [], centrals = [];
  let offset = 0;
  for (const { name: entryName, data } of entries) {
    const nameBuf = Buffer.from(entryName, "utf8");
    const isDir = data === null;
    const raw = isDir ? Buffer.alloc(0) : data;
    const comp = isDir ? raw : zlib.deflateRawSync(raw, { level: 9 });
    const method = isDir ? 0 : 8;
    const crc = isDir ? 0 : crc32(raw);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(method, 8); local.writeUInt16LE(time, 10); local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(comp.length, 18); local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28);
    locals.push(local, nameBuf, comp);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8); central.writeUInt16LE(method, 10); central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14); central.writeUInt32LE(crc, 16); central.writeUInt32LE(comp.length, 20);
    central.writeUInt32LE(raw.length, 24); central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30); central.writeUInt16LE(0, 32); central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36); central.writeUInt32LE(isDir ? 0x10 : 0, 38); central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);
    offset += 30 + nameBuf.length + comp.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(0, 4); end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16); end.writeUInt16LE(0, 20);
  return Buffer.concat([...locals, cd, end]);
}

if (RELEASE) {
  const dist = path.join(ROOT, "dist");
  fs.mkdirSync(dist, { recursive: true });
  const files = walk(SKILL_DIR);
  const dirs = new Set(["greybeard/"]);
  for (const f of files) {
    const parts = path.relative(SKILL_DIR, f).split(path.sep);
    for (let i = 1; i < parts.length; i++) dirs.add(`greybeard/${parts.slice(0, i).join("/")}/`);
  }
  const entries = [
    ...[...dirs].sort().map((d) => ({ name: d, data: null })),
    ...files.map((f) => ({ name: `greybeard/${path.relative(SKILL_DIR, f).split(path.sep).join("/")}`, data: fs.readFileSync(f) })),
  ];
  fs.writeFileSync(path.join(dist, "greybeard-skill.zip"), buildZip(entries, changelogTop[2]));
  const notes = read(path.join(ROOT, "CHANGELOG.md")).split(/^## /m)[1];
  fs.writeFileSync(path.join(dist, "RELEASE_NOTES.md"), `## ${notes.trim()}\n`);
  console.log(`built dist/greybeard-skill.zip (${files.length} files) and dist/RELEASE_NOTES.md`);
}

console.log(`ok: greybeard ${plugin.version}, description ${description.length}/1024 chars`);
