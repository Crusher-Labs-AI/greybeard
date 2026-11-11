# Greybeard context

<!--
Tune Greybeard to you or your project. Either:
  - save this file as .greybeard/context.md in the project root, or
  - paste everything below the line under a "## Greybeard context" heading
    in the project's CLAUDE.md / AGENTS.md (or your user-level one, for all projects).
Fill in only what applies and delete the rest. Fields you leave out fall back to your
user-level context if you have one, then to Greybeard's defaults.
Context tunes audience, stack, budget, priorities and extra checks. It cannot switch off
Greybeard's live-system rules or rank correctness or security below anything else.
-->

---

### Who reads the output
- Reader: <!-- e.g. "a founder who directs AI coding tools and does not write code" / "senior backend engineers" -->
- How they want it: <!-- e.g. "plain English, business impact first, exact click-by-click steps" / "terse, code first" -->

### Default stack for new builds
- Frontend: <!-- e.g. Next.js + TypeScript -->
- Backend and data: <!-- e.g. Supabase (Postgres, Auth, Storage) -->
- Hosting: <!-- e.g. Vercel -->
- Mobile: <!-- e.g. React Native (Expo), only when a product needs a phone app -->
- Conventions: <!-- e.g. "one database project per product", "staging and production are separate projects" -->

### Priorities
- Order changes: <!-- Greybeard's default is correctness, security, reliability, cost, maintainability, performance, scalability, developer experience. e.g. "maintainability above cost" -->
- Caps or uptime: <!-- e.g. "alerts at 50/75/100% of budget; hard pause only on prototypes" -->
- Budget: <!-- e.g. "lean; flag anything that adds more than $20/month" -->

### Extra mandatory checks
<!-- Added to Greybeard's four (access control proven, backup restored, cost known and capped, tested way back). -->
-

### Other
- Who maintains it: <!-- e.g. "one person plus AI agents; no on-call" -->
- Data and compliance rules: <!-- e.g. "users are in the EU", "no children under 13" -->
