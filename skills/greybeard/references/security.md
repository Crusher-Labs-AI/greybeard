# Security, privacy and launch review

This is a defensive review of systems the user controls (SKILL.md section 4). Each finding needs a location, how it could be exploited, and a fix, ranked by exploitability times impact rather than by how interesting the bug is. A vague "improve security" finding is noise.

## How to work

1. **Map the attack surface:** entry points (pages, API routes, server actions, functions, webhooks), trust boundaries, and what each can read or write.
2. **Prove access control on the running system, not just in the repo.** Run the platform's security advisor if one exists. As a logged-out user and as a second ordinary user, request data you should not see. Report the status code and row count, never the rows, and make sure the table actually holds rows first, or an empty answer proves nothing. The stack references have the exact checks.
3. **Work through the review surface below.** Use evidence labels (*Observed* / *Inferred* / *Assumed*) throughout.
4. **End with the call:** Ship, Fix first then ship, or Do not ship.

## Review surface

- **Authorization:** missing object-level checks are the most common real hole. Every read and write re-checks who is asking, including server actions and route handlers, which are public endpoints. In multi-tenant apps, run the same two-user test across tenants: a user in tenant A must not read or write tenant B's rows.
- **Authentication:** session handling, password reset, OAuth redirect allow-lists, email confirmation, rate limits and CAPTCHA on sign-up, sign-in and reset.
- **Secrets:** none in the repo or its history, client bundles, public environment variables, logs or error messages. Server-only keys stay on the server, and leaked ones are rotated, not just deleted.
- **Input and output:** validate on the server, encode output, and use parameterized queries. For file uploads, check type and size limits and whether buckets are public.
- **Webhooks and payments:** signature verification, idempotency, and entitlements decided on the server.
- **Abuse and cost:** rate limits on expensive or AI-backed endpoints, and per-user quotas. An unbounded endpoint is a security issue and a billing issue.
- **Headers and transport:** HTTPS everywhere, HSTS, a Content Security Policy that does not depend on `unsafe-inline` scripts, and cookie flags.
- **Dependencies and CI:** known vulnerabilities, unpinned third-party CI actions, and workflows that expose secrets to untrusted pull requests.
- **Accounts:** MFA and at least two owners on the hosting, database, code-hosting, email and domain-registrar accounts. Losing the one account that owns everything is an outage nobody can fix.
- **Privacy:** what personal data is stored, where, for how long and who it is shared with; account deletion and data export; and whether the privacy policy matches reality.
- **Recovery:** backups restored at least once, and what an attacker with the worst finding could destroy.

## Full deliverable

Use only when a full review is requested, and drop empty sections:

1. Bottom line, three to five sentences a non-engineer can act on, with the ship call
2. Attack surface and trust boundaries
3. Findings by severity (Critical, High, Medium, Low), each with location, attack scenario and fix
4. What an attacker gets from the worst finding, and what it would mean for users
5. Remediation order: Critical and High first, quick wins flagged
6. Fixed code for the top findings, if requested
7. Monitoring that would detect these attacks
8. What was not reviewed, so the user does not assume it was

For a quick "is this safe?" question, give the direct answer with the specific risk and skip the report.
