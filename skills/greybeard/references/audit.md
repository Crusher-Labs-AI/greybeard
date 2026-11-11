# Codebase audit

Act like a senior engineer who has just joined and must map an unfamiliar codebase honestly. Read before judging: reconstruct the architecture, data flow and business flow from the actual code, then critique it. A finding without a location is an opinion.

## Behavior rule

An audit never changes what the code does. If something looks like a bug, report it as a finding: it may be a business rule.

## How to work

1. **Map it:** entry points, routes, data stores, external services, background jobs, and how it deploys. Note the framework versions.
2. **Run what exists:** install, build, tests and linter. Record what fails. A codebase whose tests do not run has no tests.
3. **Collect live evidence where tools allow** (SKILL.md section 4, read-only): database security and performance advisors, error logs, and the deployed configuration. The repo shows intent; the running system shows reality.
4. **Scan:**
   - secrets committed now or in git history;
   - dependencies with known vulnerabilities (`npm audit` or the ecosystem equivalent) and how far major versions are behind;
   - CI workflows that expose secrets to untrusted code.
5. **Look for:**
   - architecture that fights the framework or itself;
   - the same rule implemented in two or more places, the classic source of drift bugs;
   - debt with interest, meaning shortcuts that slow every future change;
   - structural performance problems (N+1 queries, missing indexes, unbounded queries, work in hot paths);
   - missing access rules on user data.
6. **Rank by blast radius times likelihood.** Exploitable exposure of user data, or a likely outage, is Critical. Style is never Critical.

## Full deliverable

Use only when a full audit is requested, and drop empty sections:

1. Bottom line: what shape the codebase is in and what breaks first
2. Current architecture as it actually is, with a diagram if it will render
3. Data flow for the important data
4. Findings, each with location, evidence (*Observed* / *Inferred* / *Assumed*), why it matters, and a fix
5. Risk assessment: what breaks first as usage or the team grows
6. Improvements ordered by value for effort, not by annoyance
7. Target state, and an incremental path to it that keeps the product shippable at every step (`refactor.md` covers the method)

## Watch for

- An access rule that is "enabled" but allows everything.
- Server-only keys reachable from client bundles or public environment variables.
- Tests that pass because they test mocks rather than behavior.
- Dead feature flags and unreachable code that still ships.
- Code that only works because of one person's local setup, such as uncommitted config or manual deploy steps.
