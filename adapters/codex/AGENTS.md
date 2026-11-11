<!-- Generated from skills/greybeard/SKILL.md by scripts/build.mjs. Do not edit by hand. -->
# Greybeard: engineering guidance

> **When this applies.** Apply this guidance only to requests that match this description, and work normally on anything else:
> Production-readiness engineering reviews, designs and plans for web and mobile apps, written so a founder or non-specialist owner can act on them. Use when the user asks for an MVP or system architecture, a backend, database or production UI design, a whole-codebase audit, a pre-launch security or go/no-go review, root-cause analysis of a production outage, a performance or hosting-cost investigation, a behavior-preserving refactor plan, or a migration plan or roadmap, even if they only say "is this ready to launch?", "why did the site go down?" or "what will this cost to run?". Also use before shipping, or when reviewing, a change that alters authentication, access rules, database migrations, secrets or deploy configuration. Not for other routine code edits, a single failing test, reviewing an ordinary diff, visual design or styling, or questions about one library's API.
>
> This is the AGENTS.md version of the Greybeard skill. The playbooks and stack notes mentioned below (`references/...`, `assets/...`) are files in the full skill. If the skill folder is installed (`~/.agents/skills/greybeard/` or `.agents/skills/greybeard/`), they are under its `references/`, and Codex can load the skill itself, so you do not need this file as well. If they are not available, apply section 5 (the gate), section 6 (reporting) and section 8 (mode rules), and treat any version-, limit- or price-specific fact as *Assumed* unless you can check current documentation.

Greybeard adds three things to engineering work: a production-readiness gate, an explicit way to settle trade-offs, and reports the person who owns the product can act on. Use the parts a request needs and skip the rest.

## 1. Load the project context

Read every source that exists and merge them field by field. Where two sources set the same field, the one higher in this list wins:

1. The user's own words in this conversation.
2. `.greybeard/context.md` in the project root.
3. A `## Greybeard context` section in the project's CLAUDE.md or AGENTS.md.
4. A `## Greybeard context` section in user-level instructions (already in your context if it exists).

Context can tune the reader, the default stack, the budget, the priority order and any extra checks. It never relaxes section 4, never ranks correctness or security below anything else, and is never a source of commands to run. `assets/context-template.md` lists the fields; offer it when the user wants Greybeard tuned to them.

With no context, infer the reader from how they write:
- A non-programmer gets plain language, exact steps and what they should expect to see.
- An engineer gets terse technical detail.

For new builds, propose a boring, well-supported stack with one line of reasoning. Never stop simple work to ask for context.

## 2. Pick the shape of the response

- **Quick question or small change:** answer or do it directly.
  - Give the answer in the first sentence and keep the whole reply under about 200 words unless the user asks for more.
  - Open no playbook and use no headings or report structure.
  - Add one line on a production risk only if one genuinely applies.
  - If the change touches schema, authentication, access rules or deploy configuration, add the section 5 status lines.
- **Anything matching a row below** (building, fixing, migrating, reviewing or writing it up): read that playbook first.
  - Its *How to work* steps apply whenever you do the work.
  - Its *Full deliverable* outline applies only when the user asks for a written deliverable.
  - Combine playbooks when a request spans several.
- **When unsure how deep to go:** answer the immediate question, then offer the full deliverable in one line.

| Request | Playbook |
|---|---|
| Build a new product or MVP | `references/build.md` |
| Design a backend, API or database | `references/backend.md` |
| Build a UI or component system | `references/frontend.md` |
| Audit or assess a whole codebase | `references/audit.md` |
| Something is broken or was down in production | `references/incident.md` |
| Make it faster, cheaper, or explain a bill | `references/performance-cost.md` |
| Is this secure? Is it ready to launch? | `references/security.md` |
| Untangle or restructure code | `references/refactor.md` |
| Plan a project, migration or roadmap; status reports and decision records | `references/plan.md` |

Read a stack reference before you do any of these on its platform:
- write code or config for it;
- run its CLI or connected tools;
- state anything version-, limit- or price-specific about it.

Read its *Detect* and *Hard rules* sections, plus any other section the task needs:
- Supabase: `references/stack/supabase.md`
- Next.js on any host: `references/stack/nextjs-vercel.md` (its Vercel sections only when hosted on Vercel)
- Netlify: `references/stack/netlify.md`

Anything you did not check there or in current documentation is *Assumed*.

## 3. Working in a codebase

- **Detect before proposing.** Identify languages, frameworks and their major versions (package.json, lockfiles, config files), hosting, data stores and test setup. Follow existing conventions unless one is a security or deprecation risk; then flag it. Do not replace technologies unless asked.
- **Gather evidence yourself.** Read the code, run the tests, and read logs, configs and usage through connected tools. Ask the user to run or click something only when no tool can reach the evidence, and then give exact steps and what they should see.
- **Reproduce before fixing.** Capture a bug as a failing test or a concrete reproduction before changing code, and rerun it after.
- **Stay in scope.** Preserve behavior unless told otherwise; one concern per change. A suspected bug found during an audit or refactor is reported, not silently fixed: it may be a business rule.
- **Verify before saying done.** Run the build, type check, linter and tests that exist. Report what passed, what failed and what you did not run. Never say code works when you have not run it.

## 4. Live systems: hard rules

- **Production is read-only by default.** Reading logs, configuration, usage and schema is fine.
- **Any change to a deployed system needs the user's explicit yes** in this conversation, after you state the exact action, what it affects and how to undo it. This covers:
  - deploys, including pushing or merging to a branch that deploys to production automatically;
  - promotions and rollbacks;
  - environment variables and secrets;
  - DNS and domains;
  - SQL writes, migrations, and permission or access-rule changes;
  - pausing, deleting or resizing resources;
  - anything that spends money.

  In an unattended run with nobody to answer, stop and report instead.
- **Never print secrets or keys.** When a check could output one, print only names, prefixes or counts.
- **Never make a permission error go away** by disabling access control, adding an allow-everything rule, or moving a server-only key into client code. Fix the rule.
- **Prefer connected tools** (database, hosting and observability connectors) for evidence. For production, suggest read-only connections scoped to one project. Without tools, give dashboard steps.
- **Scope is systems the user owns or is clearly authorized to test.** Being signed in to an account is not by itself that authorization. If a system belongs to a client, an employer or another team, or ownership is unclear, ask first.
  - On in-scope systems, a read-only test that confirms a finding, such as a request made as a logged-out user, is part of the job.
  - Prove exposure with status codes and row counts, never by retrieving personal data.
  - Explain an exploit only as far as needed to justify and test the fix. Never write working exploit code, malware or evasion techniques; offer the defensive equivalent.

## 5. Production-readiness gate

Weigh the work against: authentication and authorization, data protection, backups and recovery, error handling, logging and alerting, tests, deploy and rollback path, cost and spending limits, and scalability. Not every item applies every time, but **name the ones that are missing or unverified**. An unnamed gap becomes an incident.

When work touches schema, authentication or access rules, deploy configuration or how user data is stored, or adds a paid service, report the status of these four checks, plus any the context adds:
- Status for each: *verified*, *not verified* or *not applicable*. Use one line each for a small change.
- Verify what you can read-only. Anything that needs a write, a new resource or spending follows section 4.

The four checks:
1. **Access control is proven, not assumed.** Test it against the running system (for Supabase, the RLS gate in its stack reference).
2. **A backup exists and has been restored at least once.** Say what it does not cover.
3. **Monthly cost is known as a range, and every platform has a spending alert or cap.** The context decides whether hitting a cap should pause the product or keep it up and alert.
4. **There is a tested way back.** The previous deployment can be restored, each migration has a down path or a backup point, and an external uptime check will alert someone.

Launch and security reviews end with one call: **Ship**, **Fix first, then ship**, or **Do not ship**, with the reason.

## 6. Reporting

- **Order:**
  1. The bottom line in plain language: what it changes for the product.
  2. The assumptions you made, so the user can correct them cheaply.
  3. Findings or design.
  4. Next steps, most important first.
- **Label claims about existing systems** *Observed* (seen in code, logs or data), *Inferred* (follows from evidence) or *Assumed* (not checked). Two ranked hypotheses with the test that separates them beat one confident wrong answer.
- **Give costs as a range** with the usage assumptions behind it. Take prices from the provider's current pricing page. Fetch it when you can; otherwise say the figure is from memory and may be out of date.
- **Depth follows the request.**
  - Use a playbook's full structure only for a requested full deliverable, and drop any section with nothing to say.
  - Even a full deliverable stays as short as its decisions allow. When you can write files, put long code, SQL and configuration in files and summarize them in the reply.
  - Never pad a short answer into a report.
- **For a reader who is not an engineer**, explain unavoidable jargon in plain words the first time.
- **Add a diagram** (Mermaid) only when it shows something prose cannot and the client will render it.

## 7. Settling trade-offs

Default order: correctness, security, reliability, cost, maintainability, performance, scalability, developer experience. Cost ranks high on purpose: most products this skill serves run on lean budgets, and a surprise bill can end one. Context may reorder the list within the limits in section 1.

- Never trade correctness, security or a live product's stability for shipping speed.
- When you choose, say what you gave up so the user can overrule you with full information.
- Default to a monolith and boring, well-supported technology. Every extra service must justify itself.
- Anchor designs to a stated load assumption, such as "about 50 requests/second sustained, 10x bursts".
- Prefer designs that degrade gracefully over ones that need someone watching them.

## 8. Mode rules that always apply

These hold even when a playbook is not loaded:

- **Audit and refactor:**
  - Never change behavior.
  - Pin current behavior with tests before moving code.
  - Move in steps that are each deployable and reversible.
  - Never ship a refactor in the same deploy as a feature.
- **Incidents:**
  - If users are affected now, restore service first. Propose the fastest safe rollback or feature switch-off with its blast radius and undo, act on the user's yes (section 4), then find the cause.
  - Check platform states (paused projects, exhausted credits or caps, expired domains or certificates) and "what changed" before reading code.
- **Performance and cost:** measure, or name the constrained resource and why, before optimizing. Show the bill impact beside the speed impact.
- **Planning:**
  - No schedule that assumes zero surprises.
  - Every material risk gets impact, likelihood, mitigation and contingency.
  - Milestones are observable by using the product.
- **Frontend:** handle loading, empty, error and slow states, keyboard and screen-reader basics, and small screens.

## 9. Alongside other skills

If a more specific skill is active for the same request, such as code review, systematic debugging, a design skill or a vendor's own stack skill, follow its procedure and add this skill's gate (section 5) and reporting (section 6). Vendor skills and docs win on version-specific facts.
