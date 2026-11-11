<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="brand/greybeard-logo-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="brand/greybeard-logo.png">
    <img alt="Greybeard — Bugs fear the beard!" src="brand/greybeard-logo.png" width="480">
  </picture>
</p>

# Greybeard

**Senior-engineer judgment for people who direct AI coding tools.**

Greybeard is a free, open-source skill for Claude Code, Claude.ai and other Agent Skills clients. It adds three things to engineering work:

- **A production-readiness gate.** It names the gaps a demo-quality answer skips: access control, backups, monitoring, rollback and cost. Four checks become mandatory whenever work touches user data, authentication or deployment.
- **An explicit way to settle trade-offs:** correctness, then security, reliability, cost, and so on. It says what it gave up so you can overrule it.
- **Reports the product owner can act on:** bottom line first, assumptions stated, every claim labelled *Observed*, *Inferred* or *Assumed*, and next steps last.

It is plain Markdown, so you can read all of it before you install it.

## Install

**Claude Code** (two commands):

```shell
/plugin marketplace add Crusher-Labs-AI/greybeard
/plugin install greybeard@crusher-labs
```

Or from a terminal: `claude plugin marketplace add Crusher-Labs-AI/greybeard`, then `claude plugin install greybeard@crusher-labs`

**Claude.ai and the Claude desktop app:** download `greybeard-skill.zip` from the [latest release](https://github.com/Crusher-Labs-AI/greybeard/releases/latest), then go to **Customize > Skills > + > Create skill > Upload a skill**.

**Codex and other Agent Skills clients:** copy `skills/greybeard/` into your skills folder (for Codex, `~/.agents/skills/greybeard/`).

[docs/INSTALL.md](docs/INSTALL.md) covers every platform, updating, and tools without skill support.

## What it does

Describe the job. Greybeard picks the mode that fits and loads only that playbook:

| Mode | What you get |
|---|---|
| **Build** | An MVP design and build: the smallest system safe to put real users on, with a "before real users" checklist and monthly cost at launch and at 10x |
| **Backend and data** | A design anchored to stated load numbers: which requests go where, schema with indexes and access rules, failure modes |
| **Frontend** | UI that handles loading, empty, error and slow states, accessibility and small screens, not just the happy path |
| **Audit** | An honest map of an unfamiliar codebase, with findings tied to files and ranked by blast radius |
| **Incident** | Restore service first, rule out platform states (paused projects, exhausted credits, expired domains), then evidence-based root cause, a regression test and the missing alert |
| **Performance and cost** | The real bottleneck, measured, with bill impact beside speed impact, plus a monthly cost review |
| **Security and launch** | A defensive review that proves access control on the running system and ends with **Ship**, **Fix first, then ship** or **Do not ship** |
| **Refactor** | Behavior-preserving restructuring in small, reversible steps, with behavior pinned by tests first |
| **Plan** | Roadmaps and migrations with rollback for every phase and no fantasy schedules. Work can be split into AI-agent sessions with checkpoints. |

Quick questions get direct answers with no report scaffolding.

<details>
<summary><b>Example:</b> a quick question, answered for a non-programmer owner</summary>

> **Q:** Quick one: do I need Row Level Security on a Supabase table that only my server code writes to and nobody reads from the browser?

> Yes, turn RLS on. "Only my server reads it" is not the same as "nobody can read it." Supabase builds a web API for every table in the `public` schema. Anyone with your publishable (anon) key can call that API, and the key is in your site's code where anyone can copy it. Row Level Security (RLS) is the database's set of rules for who can see or change each row. With it off, that public key can usually read and write the whole table. For a consumer product, that means a stranger could download or edit real people's data.
>
> The fix costs nothing, and you don't need to write any policies (the individual access rules):
>
> ```sql
> alter table public.your_table enable row level security;
> ```
>
> With RLS on and no policies, browsers get nothing back. Your server code keeps working because the secret (`sb_secret_…`) or legacy `service_role` key skips RLS. To undo it, run the same command with `disable` in place of `enable`.
>
> One catch: if your server's Supabase client also carries a signed-in user's session, RLS applies to it and its queries will come back empty. Use a separate admin client with no user session for this table.
>
> *Assumed:* the table is in `public` and your server uses the secret key. Moving the table to a schema the API doesn't expose works too.
>
> I can check it now without changing anything: the Security Advisor, plus a logged-out request that should return zero rows. I'll only apply the change once you say yes.

</details>

### How it tests

`evals/` holds six cases for `claude plugin eval`. Each case runs three times with Greybeard installed and three times without it, and the scores are averaged. These are the results for version 3.0.0 (2026-11-11):

| Case | With | Without |
|---|---|---|
| Pre-launch review of an app with planted security bugs | 0.85 | 0.67 |
| Monthly cost estimate | 0.89 | 0.78 |
| Outage with no logs | 1.00 | 0.67 |
| Quick question* | 0.89 | 1.00 |
| Two requests where Greybeard should stay out of the way | 1.00 | 1.00 |

\*Greybeard correctly did not load for the quick question in any run, so that gap is ordinary run-to-run variation in plain Claude's answer, not the skill.

The gains come from behavior a strong model skips by default:
- opening with a plain verdict and a ship / fix-first / do-not-ship call (3 of 3 runs, against 0 of 3 without Greybeard);
- giving costs as ranges with their assumptions;
- giving concrete prevention steps after an outage.

Both arms found the four planted security bugs every time. Neither flagged the deprecated `middleware.ts`, a known gap the suite keeps testing.

Run the suite yourself with `claude plugin eval . --scaffold`.

It ships dated reference notes for **Supabase**, **Next.js on Vercel** and **Netlify**: current key names, access-rule checks, backup reality, spending caps, and the platform states that look like bugs. It reads them instead of relying on what the model remembers.

## Ground rules it follows

- Detects your stack and versions before proposing anything, and keeps your conventions.
- Gathers evidence itself (code, tests, logs, connected tools) before asking you to do anything.
- Runs the build and tests before saying something works, and says what it did not run.
- **Treats production as read-only.** Any deploy, rollback, environment-variable change, migration, DNS change or purchase needs your explicit yes, after it has said what will change and how to undo it.
- Gives costs as ranges with assumptions, from current pricing pages rather than memory.

## Make it yours

Greybeard adapts to who is reading. To fix the defaults (your audience, default stack, budget, priority order and extra mandatory checks), copy [`skills/greybeard/assets/context-template.md`](skills/greybeard/assets/context-template.md) to `.greybeard/context.md` in your project. You can also paste it under a `## Greybeard context` heading in your `CLAUDE.md` or `AGENTS.md`.

[`examples/crusher-labs.context.md`](examples/crusher-labs.context.md) is the context Crusher Labs uses for its own products: a founder directing AI tools, Next.js + Supabase, lean budgets.

## Connectors (optional)

Greybeard does not install or start any MCP servers. If you connect your database or hosting provider yourself, it uses those tools for evidence. [docs/CONNECTORS.md](docs/CONNECTORS.md) shows read-only, single-project setups.

## What it is not

- Not a replacement for code review, testing, or a professional security audit or penetration test.
- Not a process framework. It pairs well with process skills (planning, TDD, systematic debugging): they handle how the work is done, and Greybeard adds the readiness gate and the reporting.
- Not affiliated with or endorsed by Anthropic, OpenAI, Supabase, Vercel or Netlify.

## Repository layout

```text
skills/greybeard/          the skill: SKILL.md, references/ (playbooks + stack notes), assets/
.claude-plugin/            plugin and marketplace manifests for Claude Code
adapters/                  generated: SYSTEM_PROMPT.md (paste-in), codex/AGENTS.md
examples/                  example context files
docs/                      install guide and optional connector setup
evals/                     eval cases for `claude plugin eval`
scripts/build.mjs          regenerates adapters, checks the repo, builds release zips
```

## License and support

[MIT](LICENSE). Questions and bugs go to GitHub Issues; security reports follow [SECURITY.md](SECURITY.md). Version history is in [CHANGELOG.md](CHANGELOG.md).

Made by [Crusher Labs AI](https://crusherlabs.ai).
