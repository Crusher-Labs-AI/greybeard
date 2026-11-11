# Changelog

## 3.0.0 — 2026-11-11

First public edition.

### Changed
- **Generic core with optional project context.** Company-specific defaults (audience, stack, priorities) moved out of the skill into context:
  - Sources are `.greybeard/context.md`, or a `## Greybeard context` section in a project or user-level CLAUDE.md / AGENTS.md. They are merged field by field.
  - Context can never relax the live-system rules or rank security below anything else.
  - Without context, Greybeard infers the reader from how they write.
  - The Crusher Labs context ships as a worked example.
- **Narrower trigger description.** It now covers decision-level deliverables and pre-ship checks, with an explicit "not for" list, so it no longer claims all engineering work.
- **Quick answers first.** Quick questions get direct answers with no playbook. Reports follow one order: bottom line, assumptions, findings, next steps. Playbook outlines are used only for requested full deliverables, and empty sections are dropped.
- **Mandatory checks rewritten as four verifiable checks:**
  - access control proven on the running system;
  - a backup restored at least once;
  - monthly cost known, with alerts or caps;
  - a tested way back.
- **Playbooks rewritten** with procedures and non-obvious checks instead of heading lists, and renamed: `build`, `backend`, `frontend`, `audit`, `incident`, `performance-cost`, `security`, `refactor`, `plan`.

### Added
- **Working-in-a-codebase rules:** detect versions, gather evidence with tools, reproduce before fixing, and run build and tests before claiming done.
- **Live-system rules:**
  - production is read-only by default, and pushes to auto-deploying branches count as deploys;
  - any change needs explicit approval after stating impact and undo;
  - unattended runs stop and report;
  - permission errors are never "fixed" by removing access control;
  - exposure is proven with status codes and counts, never by pulling personal data;
  - being signed in to someone else's system is not authorization to test it.
- **Dated stack references** for Supabase, Next.js on Vercel, and Netlify.
- **Monthly cost review** in the performance-and-cost mode.
- **Incident triage** for "platform state, not a bug" and restore-service-first.
- **Privacy and account-security items** in the security review.
- `scripts/build.mjs` generates the Codex `AGENTS.md` and the paste-in system prompt from SKILL.md so they cannot drift, and builds release zips. Eval cases for `claude plugin eval`.

### Removed
- **Bundled MCP servers (`.mcp.json`).** Connectors are now optional and documented in `docs/CONNECTORS.md` with read-only, single-project setups.
- `manifest.json`, the separate `codex` branch, and the hand-maintained `AI_PLATFORM_PROMPT.md` (now generated as `adapters/SYSTEM_PROMPT.md`).

### Fixed
- **Out-of-date platform guidance**, which now lives in the dated stack references:
  - Supabase publishable and secret keys replace legacy `anon` / `service_role`;
  - free tiers are no longer the default for products with real users;
  - Next.js 16 `proxy.ts`;
  - server-side auth checks.
- **Install instructions** now match the current Claude Code, Claude.ai and Codex flows.

## 2.x

Internal edition used at Crusher Labs AI; not published.
