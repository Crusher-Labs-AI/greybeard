# Backend and data design

Anchor every choice to a stated load. Architecture advice without numbers is decoration. If the user gave none, state the numbers you designed for (for example, "5,000 daily users, peak 20 requests/second") so the design can be checked against reality.

## How to work

1. **Requirements with numbers:** users, requests per second at peak, data size in a year, acceptable downtime, and how much data loss is acceptable.
2. **Choose the path for each kind of request.** This is usually the real design decision on managed platforms:
   - Reads and owner-scoped writes can go from the client to the managed database through row-level access rules.
   - Trusted writes (scores, payments, entitlements, validated or rate-limited actions) go through server code that holds the server-only key.
   - Heavy CPU, image or long work does not belong in short-lived edge functions. Check their CPU, memory and time limits.
   - Serverless code that connects to Postgres directly uses the provider's connection pooler, never one connection per invocation.
3. **Design the schema for the known queries.** Add indexes for every filter, join and sort used by hot paths and by access rules. Every migration that creates a table also creates its grants and access rules.
4. **Cache deliberately.** Say what is cached, for how long, and how it is invalidated, and what happens on a cold cache. Never cache personalized responses or responses that set auth cookies in a shared cache.
5. **Add background jobs only if the workload needs them.** If it does, give each one retries with backoff, idempotency keys and a place where failed work lands and alerts.
6. **Plan deployment:** environments, how migrations run (forward-only, with a backup point before risky ones), and where secrets live.

## Judgment calls to state explicitly

- **Monolith or services:** default to a monolith. Services need an organizational or scaling reason.
- **Sync or async:** async adds retries, ordering and dead letters. Charge for that complexity honestly.
- **Multi-tenancy:** if tenants exist, choose shared schema with a tenant column, schema per tenant, or database per tenant, and say why. Verify that every tenant-scoped query and rule filters by tenant.
- **Build or use the platform:** a custom service must beat "the platform already does this".

## Full deliverable

Use only when a full design is requested, and drop empty sections:

1. Requirements and load assumptions
2. Architecture and components, with a diagram if it will render
3. Data flow for the 1 or 2 most important requests, end to end
4. Server paths and API: resources, auth model, which writes are trusted
5. Schema with indexes and access rules
6. Caching
7. Background jobs, or why there are none
8. Deployment, migrations and secrets
9. Failure modes: what users see when the database, host or a third party is down
10. Scaling plan: the first bottleneck and the response planned for it
11. Monthly cost now and at 10x, as ranges with assumptions

## Watch for

- N+1 queries from loops in client or server code.
- Unbounded queries; every list endpoint paginates.
- Webhook and payment handlers that are not idempotent and do not verify signatures.
- Aggregates (leaderboards, counts, feeds) recomputed on every request instead of indexed, cached or materialized.
- Race conditions on "one per user per day" rules. Enforce them with a unique constraint, not a read-then-write.
- Clock and time-zone assumptions in scheduling and daily resets.
