# Build: new product or MVP

Aim for the smallest system that is safe to put real users on. The two failure modes are a demo that breaks under real users and a platform nobody can afford to build or run.

## How to work

1. **Pin the core loop.** Who uses it, the one thing they do repeatedly, and what data that creates. Write these down as product assumptions; they are the cheapest thing to correct.
2. **Choose the stack.** Use the context's default stack if set. Otherwise pick one web framework, one managed Postgres and one host. Every extra service, queue or microservice must justify itself against a monolith with a Postgres database.
3. **Draw the trust boundary for every write.** The client may write owner-scoped data directly only under database access rules. Anything that must be trusted goes through server code: scores, prices, payments, entitlements, and anything rate-limited or validated.
4. **Set the plan floor.** Say which plan each platform needs once real users arrive. Free tiers are for prototypes with no real user data; say so whenever you recommend one. Common free tiers lack automatic backups, pause idle projects or forbid commercial use (see the stack references).
5. **Separate environments.** Use one project for development or staging and one for production, with separate secrets.
6. **Build in vertical slices** that each run end to end, and run them (SKILL.md section 3).

## Before real users

Report each item as done, not done or not applicable:

- Access control proven against the running system: every table reachable from the client has rules, and none allows everything.
- Sign-up email works at launch volume (default email senders on hosted auth are often limited to a few messages an hour), with CAPTCHA or rate limits on sign-up, sign-in and password reset.
- A backup exists and a restore has been tried once.
- Every platform has a spending alert or cap, and the monthly cost range is written down.
- Error tracking and one external uptime check alert a person.
- If personal data is stored: account deletion, data export and a privacy policy that matches what is collected.
- MFA and a second owner on the hosting, database, code and domain-registrar accounts.
- A tested way back: the previous deployment can be restored, and each migration has a down path or a backup point.

## Full deliverable

Use only when a full design is requested, and drop empty sections:

1. Product assumptions
2. Technical assumptions: budget, timeline, who maintains it
3. Architecture, with a diagram if it will render
4. Data model: the 3 to 5 core entities with their access rules, not an exhaustive ERD
5. Server paths and API: only what the MVP needs, marking which writes are trusted
6. UI flows and pages
7. File structure, concrete enough to start committing
8. Implementation of the requested parts, run and verified
9. "Before real users" status
10. Monthly cost at launch and at 10x, as ranges with assumptions
11. Scaling roadmap: the 2 or 3 changes needed at 10x, plus every deliberate shortcut and its upgrade path

For a partial request (just the schema, just the stack), deliver that part well and say which neighboring decisions it constrains.

## Watch for

- Clients that submit their own score, price, balance or entitlement.
- "Add auth later": retrofitting access rules onto live data is far harder than starting with them.
- Products driven by scheduled content (daily puzzles, feeds) going dark when content runs out. Add a runway check and an alert.
- Day boundaries and time zones in anything "per day".
- Leaderboards and counters computed by scanning whole tables on every request.
- Cheating windows, where answers or future content are sent to the client before they are needed.
