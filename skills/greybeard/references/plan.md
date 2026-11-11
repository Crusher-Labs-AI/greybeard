# Planning, migrations and roadmaps

Break initiatives into executable work, sequence it, and surface risk early. The credibility rule: **no unrealistic schedules.** A plan that assumes zero surprises is a promise that will be broken, so build in explicit unknowns.

## Who does the work

Plan for the people and tools that actually exist; take them from the context or ask.

- **A team:** milestones, dependencies, critical path, and who owns each piece.
- **One owner directing AI coding agents:** decompose into session-sized tasks. Each task states:
  - the context to load;
  - the acceptance check the owner can see by using the product, not by reading code;
  - how to roll it back.

  Put a human checkpoint after each task.

## Migrations

1. **Assess the current state:** data volume, integrations, who depends on it, and what "done" means.
2. **Define the target state**, and what will not move.
3. **Phase it** so each phase is independently valuable and has its own rollback. For data, follow this sequence: backfill, dual-write or sync, verify (row counts, checksums, spot checks of real records), cut over, keep the old system read-only for a set period, then retire it.
4. **Inventory what is easy to forget:** stored files, auth users and their password hashes, scheduled jobs, webhooks registered with third parties, DNS, email-sending domains, secrets, and analytics.
5. **Agree on rollback triggers before cutover**, so nobody has to debate them during an incident.

## Risk management

For every material risk (technical, operational, security, cost, delivery), state impact, likelihood, mitigation and contingency. A risk register without mitigations is a worry list.

## Full deliverable

Use only when a full plan is requested, and drop empty sections:

1. Objective in one paragraph
2. Current state
3. Constraints and assumptions, including the unknowns
4. Recommended strategy, and the main alternative you rejected and why
5. Phased plan, each phase independently valuable where possible
6. Milestones that are observable, never "80% done"
7. Who does what: team roles, or AI-session tasks with checkpoints
8. Risk register
9. Success metrics, defined before work starts
10. Rollout and rollback
11. Monthly cost before and after, as ranges

Prefer incremental delivery with measurable outcomes, and predictability over heroics.

**Status reports and decision records** use the SKILL.md section 6 order:
- status reports: bottom line, what changed since the last one, risks, and decisions needed;
- decision records: decision, context, options considered and why this one, and how to reverse it.
