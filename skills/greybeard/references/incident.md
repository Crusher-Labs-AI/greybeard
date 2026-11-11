# Incident and production debugging

Do not guess when evidence is available. A confident wrong root cause costs more than a slower correct one, because everyone stops looking.

## First: is it down now?

If users are affected now, restore service before finding the cause:

- Roll back to the last good deployment, turn the feature off, or revert the config change, whichever is fastest and safest.
- State the action, what it affects and how to undo it, and get the user's yes (SKILL.md section 4).
- A rollback serves the old build with the environment values it was built with. That can undo a bad environment-variable edit. But after a secret rotation it brings back the old (revoked or leaked) key, so never roll back past a rotation.
- A rollback never reverts the database, migrations or external state, and the project's environment settings stay edited for the next deploy. The stack reference says what yours covers.

## Then: is it a platform state, not a bug?

Rule these out before reading code. Each looks like a bug and is not:

- A paused project or site: an inactive free tier, exhausted credits or a hit spending cap.
- An exhausted quota: auth emails per hour, API rate limits, function minutes.
- An expired domain, certificate or third-party API key.
- A billing failure on any provider.
- A provider outage (check the status page).

The stack references list each platform's version of these with the fix.

## Method

1. **Restate the symptoms precisely:** what fails, for whom, since when, how often, and what still works.
2. **Find what changed:** deploys, config and environment-variable edits, migrations, dependency updates, data volume, and traffic. Most incidents follow a change.
3. **Pull the evidence yourself:** hosting function and runtime logs, database and auth logs, the browser console and the network tab. Use connected tools first; give exact dashboard steps only when no tool reaches it.
4. **Trace the actual execution path** through the code and quote the lines that matter.
5. **Form hypotheses** and rank them by how well they explain *all* the symptoms, not just the loudest one.
6. **For each hypothesis, name the evidence that would confirm or kill it** (a log line, a query, a reproduction), and go get it.
7. **Label every claim** *Observed*, *Inferred* or *Assumed*.
8. **Fix minimally:** reproduce with a failing test, fix, rerun, and keep behavior identical except for the bug.

## Full deliverable

Use only when a full write-up is requested, and drop empty sections:

1. Impact: who was affected, for how long, and what they saw
2. Timeline: detection, response, mitigation and resolution, with times
3. Root cause, or ranked hypotheses with the tests that separate them
4. Failure mechanism: why the code or platform produced exactly this behavior
5. Edge cases: other inputs or states that hit the same flaw
6. Fix: options with trade-offs (hotfix or proper fix), and the fix applied
7. Regression test that fails before the fix and passes after
8. Detection gap: the alert or log line that would have caught it sooner
9. Follow-ups, most important first, without blame

## Watch for

- Symptoms that started at a round time (midnight UTC, the first of the month), which often point to quotas, billing cycles, cron jobs or time-zone logic.
- Failures for only some users, which often point to caching, region, auth state or data shape.
- "It fixed itself", which often means a restart, cold start, rate-limit reset or cache expiry. The cause is still there.
