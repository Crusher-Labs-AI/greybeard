# Next.js on Vercel (with Supabase Auth) — stack reference
Last verified: 2026-11-11 (re-check pricing and limits before quoting them; links below)

Contents: Detect · Hard rules · Checks · Limits that bite · Cost and caps · Platform state, not a bug · Sources. Read Detect and Hard rules in full before acting. Run the commands below from the project root; on Windows PowerShell use `curl.exe` and Git Bash for pipelines.

These facts change monthly. Before you state a version, price, limit or default to the user, re-open the linked page. If the project has version-matched docs (`node_modules/next/dist/docs/`, which `AGENTS.md` points to on 16.2+), use them for framework behaviour. Label anything you did not re-check as an assumption.

## Detect
- Next.js version: read the resolved version in the lockfile (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lock`), not the range in `package.json`. Run `npm ls next` (or `pnpm why next` / `yarn why next`).
- Router: `app/` or `src/app/` means App Router (this file assumes it). `pages/` means Pages Router.
- Request interception: `proxy.(ts|js)` or `middleware.(ts|js)` at the project root, or in `src/` at the same level as `app/`.
- Caching model: `cacheComponents: true` in `next.config.*` means Cache Components (caching is opt-in with `use cache`). Without it, the previous model applies. New `create-next-app` apps turn on `cacheComponents` and `partialPrefetching` by default.
- Supabase Auth: `@supabase/ssr` and `@supabase/supabase-js` in dependencies. Env names are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (legacy projects use an anon-key name). Note the `@supabase/ssr` version: 0.10.0+ passes cache headers to `setAll`.
- Vercel: `.vercel/` (created by `vercel link`), `vercel.json`, or a Git integration. Plan: the dashboard team switcher shows it next to the team name. Hobby has no Spend Management.
- Read these: `next.config.*`, the proxy/middleware file, every `route.ts`, every file that starts with `'use server'`, the Data Access Layer (modules with `import 'server-only'`), and the Supabase client factories. Read names from `.env.example` only. Never print values from `.env*`.

## Hard rules
1. Every Server Action and Route Handler must check authentication and authorization itself, including ownership of the specific resource (not just "logged in"). A Server Action can be called by direct POST even when no UI uses it. A page-level check does not cover actions defined in that page. Validate every argument. Return only the fields the UI needs.
2. Proxy only does optimistic checks (read the cookie, redirect). It is never the only gate:
   - A matcher change, or moving a Server Function to another route, silently removes its coverage.
   - A path the matcher excludes also skips the Server Functions on that path.
   - Auth checks in layouts are not gates either, because layouts do not re-render on navigation.
3. Keep auth and data access in a Data Access Layer: `import 'server-only'`, one `verifySession()`-style function, and DTOs that return only the fields needed. Only the DAL reads secret `process.env` values. React `cache()` does nothing inside Server Actions or Route Handlers.
4. Supabase on the server:
   - Create the client with `createServerClient` from `@supabase/ssr` inside the request handler, never at module scope. Fluid compute reuses instances, so a module-level client can leak one user's session into another user's request.
   - Authorize with `getClaims()`, which verifies signature and expiry. Use `getUser()` where a revoked session must be rejected, because `getClaims()` cannot see server-side revocation.
   - Never trust `getSession()` in server code, Proxy included.
5. Never cache a response that sets or refreshes auth cookies. A cached `Set-Cookie` can sign one user in as another, through ISR or a CDN.
   - With `@supabase/ssr` 0.10.0+, apply the cache headers it passes to `setAll`.
   - With older or manual setups, send `Cache-Control: private, no-store` from every auth-handling route.
   - No `s-maxage`, `force-static`, ISR `revalidate` or `use cache` on routes that call Supabase auth.
6. With Cache Components, plain `use cache` and `use cache: remote` cannot read `cookies()` or `headers()`. Per-user data needs one of two patterns:
   - `use cache: private` (cached in the browser only).
   - A non-exported cached function keyed by an id taken from the session. If it is exported, a caller can pass another user's id.

   Cache keys and tags are stored as plain text, so never put tokens, emails or secrets in arguments or tags.
7. `NEXT_PUBLIC_*` values are inlined into browser JavaScript at build time. Only the Supabase URL and the publishable key may use that prefix. Secret keys (`sb_secret_...` or the legacy `service_role` JWT) belong only in server-only modules and in Vercel env vars of type Secret.
8. Stay on a patched Next.js release line (see Checks). 14.x and older get no scheduled security releases.
9. Treat Vercel MCP as write-capable.
   - It can deploy, edit env vars, pause projects, and roll back or promote deployments.
   - Since 2026-07-21 it can also make purchases after a confirmation step: a Pro upgrade, domains, v0 or AI Gateway credits, or the SIEM add-on. This needs a user with a billing role and a payment method on file.
   - It acts with the user's full account access, and no documented setting turns off purchases.
   - Use read tools by default. Before any deploy, env change, pause or resume, rollback or promote, budget change or purchase, state the action, its blast radius and how to undo it, then wait for an explicit yes in chat.

## Checks (read-only unless marked)
Versions and patches
- Run `npm ls next @supabase/ssr` to get installed versions and `npm view next version` to get the npm latest (16.4.6 on 2026-11-11).
- Compare with the newest "Security Release" post on nextjs.org/blog. Floor after the 2026-11-03 release: 16.4.5 (Active LTS) and 15.5.29 (Maintenance LTS; 15.x gets security releases until 2027-01-31).
- Release cadence: advance notice roughly monthly, about a week before each scheduled release. Urgent or exploited issues ship out of band (for example 2026-09-22 and 2026-10-14). Use `npm audit --omit=dev` as a second signal.

Proxy / middleware
- Find the file (works in bash, zsh and PowerShell): `git ls-files --cached --others --exclude-standard -- 'proxy.*' 'middleware.*' 'src/proxy.*' 'src/middleware.*'`
- Next 16+: expect `proxy.ts` exporting `proxy` or a default function. `middleware.ts` still runs but is deprecated and kept only for the Edge runtime. Proxy is Node.js-only, and setting `runtime` in it throws.
- Next 15 and earlier: the file must be `middleware.ts`. A `proxy.ts` is never called, so Supabase sessions never refresh and users get signed out.
- Read `config.matcher`. Without a matcher, Proxy runs on static assets too, so exclude `_next/static`, `_next/image` and files. Otherwise keep the auth matcher broad.

Auth on every entry point
Search the whole project (ripgrep skips `node_modules` and `.next` through `.gitignore`), so the root proxy file is covered.

- **List entry points:** `rg -l '^\s*[\x22\x27]use server[\x22\x27]'` (this also finds inline server actions) and `rg --files -g '**/route.{ts,js}'`. In each file, every exported function must run the auth/DAL check and an ownership check before touching data.
- **Heuristic for misses** (put the project's DAL function name in the pattern):
  ```
  rg -l '^\s*[\x22\x27]use server[\x22\x27]' | while IFS= read -r f; do rg -q 'getClaims|getUser|verifySession' "$f" || echo "$f"; done
  ```
- **`rg -n 'auth\.getSession\('`:** any hit in server code (route.ts, actions, Server Components, Proxy) is a finding.
- **`rg -n 'createServerClient\('`:** every call must sit inside a function that runs per request.

Caching
- **`rg -n 'use cache|s-maxage|force-static|export const revalidate|unstable_cache'`:** none of these may wrap auth code or per-user data, except `use cache: private` or a cache keyed by the session's user id.
- **Live check.** A request without a session never triggers a cookie refresh, so use a test account whose access token has expired. Copy its cookies from the browser's devtools, and sign that user out afterwards.
  1. `curl -s -o /dev/null -D - -H "Cookie: <test-user cookies>" https://<prod-host>/<auth-route>`
  2. Immediately repeat without the cookie.

  Pass: any response with `set-cookie` is `private` or `no-store` and never shows `x-vercel-cache: HIT`, and response 2 carries no `set-cookie`.

Secret exposure
Print only matched fragments (`-o`), never whole lines: a hit may be a live key. The base64 fragments catch legacy `service_role` JWTs stored under any name.

- `rg -n -o 'NEXT_PUBLIC_\w*(SECRET|SERVICE_ROLE|PRIVATE|PASSWORD|TOKEN)\w*'`
- `rg -n -o 'sb_secret_|service_role|SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY|c2VydmljZV9yb2xl|NlcnZpY2Vfcm9sZ|zZXJ2aWNlX3JvbG'`: a hit in a client component, or in any module it imports, is Critical.
- After `next build`, scan everything served to browsers, including prerendered pages. This must return nothing:
  ```
  rg -l -uu 'sb_secret_|c2VydmljZV9yb2xl|NlcnZpY2Vfcm9sZ|zZXJ2aWNlX3JvbG' .next/static .next/server/app -g '*.{js,html,rsc,body}'
  ```
- `git ls-files -- ':(glob)**/.env*'`: only example files may be tracked.

Vercel
- Usage and spend:
  - Dashboard: open Usage in the team sidebar, set "Last 30 days" and break down by project. Spend Management is under team Settings > Billing.
  - CLI (`vercel@65.11.0+`): `vercel billing usage --since 30d --group-by project` and `vercel billing invoices upcoming`.
  - Budgets (Owner or Billing role): `vercel billing budgets inspect`.
  - The CLI "Cost" column is before credits and discounts, so it is not the invoice amount.
- Env vars: `vercel env list --environment production` (CLI 64.7.0+). Secret-type values are write-only. Never `vercel env pull` production secrets to disk to inspect them.
- Rollback state: `vercel rollback status`.
- State-changing, never a default step:
  - `vercel billing budgets set --amount <N> [--pause]`
  - `vercel rollback <id|url>` and `vercel promote <id|url>`
  - Resuming or pausing a project
  - `vercel billing budgets remove`

## Limits that bite (Fluid compute; see the limits page)
- Max duration:
  - Hobby: 300 s (default and maximum).
  - Pro and Enterprise: 300 s default, 800 s maximum, 1800 s in beta.
  - When exceeded: 504 `FUNCTION_INVOCATION_TIMEOUT`. Set `maxDuration` on purpose, and move long jobs to a queue or workflow.
- Memory: Hobby is fixed at 2 GB / 1 vCPU. Pro defaults to 2 GB and goes up to 4 GB / 2 vCPU.
- Body size: request or response body over 4.5 MB returns 413 `FUNCTION_PAYLOAD_TOO_LARGE` (streamed responses are exempt). Upload files directly to storage, not through a function.
- Bundle and file descriptors: 250 MB uncompressed bundle (5 GB in the large-functions beta). 1,024 file descriptors shared across concurrent executions, so pool or reuse DB and HTTP connections.
- Region: functions default to `iad1`. Set the function region next to the database region, or every query pays cross-region latency.
- Env vars: 64 KB in total per deployment. A change applies only to new deployments.
- Runtime logs: kept for 1 hour on Hobby and 1 day on Pro. Capture evidence during an incident, or use a drain (Pro).
- Deployments per day: 100 on Hobby, 6,000 on Pro.
- The CDN caches a function response only if all of these hold: GET or HEAD, no `Authorization` header on the request, no `set-cookie`, no `private`/`no-cache`/`no-store`, no `Vary: *` or `Vary: Cookie`, and 10 MB or less.
- Next.js 16 upgrade breakers:
  - Node 20.9+ is required.
  - Turbopack is the default; `next build` fails if a custom webpack config exists, unless you pass `--webpack`.
  - `cookies()`, `headers()`, `params` and `searchParams` are async only.
  - The one-argument `revalidateTag` is deprecated and fails type checking.
  - Parallel route slots need a `default.js`.
  - With Cache Components, reading `cookies()` outside `<Suspense>` is a build error.
  - In the previous model, `fetch` is not cached by default.

## Cost and caps (re-check vercel.com/pricing and the Pro plan doc before quoting)
- Hobby is free and limited to personal, non-commercial use. A site is commercial if anyone involved is paid to build it, or if it takes payments, advertises a product or service, shows ads, or exists mainly for affiliate links. Donations do not count. Anything a business ships needs Pro. If a Hobby limit is exceeded, you usually wait 30 days or upgrade.
- Pro (doc updated 2026-09-15):
  - $20/month platform fee, which includes 1 deploying seat and $20 of monthly usage credit. The credit expires at month end.
  - Extra deploying seats are $20/month each. Viewer seats are free.
  - Usage beyond the credit is billed on demand. A notification fires at 75% of the credit.
- Spend Management (Pro, or Enterprise on Flexible Commitment; needs the Owner or Billing role):
  - New customers get notifications at a $200 per-cycle budget by default, at 50/75/100% (SMS at 100%).
  - That default only notifies. Projects pause only if someone turned on "Pause Production Deployments". Check the team's actual setting; do not assume.
- What the budget counts: metered usage beyond the credit. It does not count seats, Marketplace integrations or add-ons. Pausing does not stop AI Gateway key usage, v0 usage, or storage charges (deployment and function storage, Blob, container images).
- What a pause does: it pauses production for every project on the team, and visitors get 503 `DEPLOYMENT_PAUSED`. Spend is checked every few minutes, so alerts and pauses fire late and spend overshoots. Set the budget below the true maximum. Raising the budget does not resume anything.
- Owner policy: for each team, record whether reaching the budget should take production down (cost wins) or only alert (uptime wins). Never leave a team with neither.
- For teams created on or after 2026-10-30, `fetch` and `unstable_cache` caching is billed as Runtime Cache. Existing teams migrate when Vercel notifies them.
- Where to see spend: Dashboard Usage, team Settings > Billing, `vercel billing usage --since 30d --group-by project`, and `vercel billing invoices upcoming` (an estimate that changes until the period ends).

## "Platform state, not a bug"
- Every project returns 503 `DEPLOYMENT_PAUSED`: the spend budget was reached with pausing on, or someone paused it manually.
  - Fix, per project: Project > Settings > General > Resume Project, or the banner. Service returns within minutes; no redeploy is needed.
  - Raising the budget does not resume projects.
- A Hobby feature stops mid-month: a Hobby limit was exceeded. Wait (usually 30 days) or upgrade.
- Pushes to the production branch stop going live: an Instant Rollback turned off automatic assignment of production domains. Restore it by promoting a deployment (`vercel promote <id>`, or Manage on the production tile).
- A rollback did not fix the problem: a rollback serves the old build with the env vars it was built with.
  - It does not revert the database, migrations or external APIs. The project's env var settings also stay edited, and the next deploy uses the edited values. Cron definitions follow the target deployment.
  - Rolling back past a secret rotation brings the old key back into service.
  - Hobby can go back only one production deployment. Pro and Enterprise can go to any deployment that was previously in production.
  - Only one domain-reassignment job runs per project at a time:
    - A new rollback is refused with `409` while a rollback or promotion is running.
    - A new promotion replaces one in progress, except that promoting the same deployment twice is refused.
    - Jobs older than 3 minutes no longer block.
- A dashboard env var change has no effect: redeploy. `NEXT_PUBLIC_*` values also need a rebuild because they are inlined at build time.
- Users are signed out, or sessions never refresh, after a Next.js upgrade or downgrade. Check four causes:
  - `proxy.ts` on 15 or earlier.
  - The file is not at the root or in `src/`.
  - The export name is wrong.
  - The matcher excludes the route.
- A new deployment is refused because Next.js is vulnerable (CVE-2025-66478): upgrade Next.js. Never set the `DANGEROUSLY_DEPLOY_VULNERABLE_...` opt-out.
- 504 `FUNCTION_INVOCATION_TIMEOUT` or 413 `FUNCTION_PAYLOAD_TOO_LARGE`: a plan limit, not an app crash (see Limits).
- A route you expect to be cached always shows `x-vercel-cache: MISS`. This is by design when any of these hold: the response sets a cookie, is private or no-store, or varies on Cookie, or the request carries `Authorization`.
- Charges continue after a pause: the spend check lags, AI Gateway, v0 and storage keep billing, and seats and add-ons are outside the budget.
- Logs from last night's incident are gone: retention is 1 hour on Hobby and 1 day on Pro.

## Sources
- https://nextjs.org/docs/app/api-reference/file-conventions/proxy
- https://nextjs.org/docs/app/guides/upgrading/version-16
- https://nextjs.org/blog/next-16
- https://nextjs.org/docs/app/guides/authentication
- https://nextjs.org/docs/app/guides/data-security
- https://nextjs.org/docs/app/guides/authentication-with-cache-components
- https://nextjs.org/docs/app/getting-started/caching
- https://nextjs.org/docs/app/guides/caching-without-cache-components
- https://nextjs.org/docs/app/guides/environment-variables
- https://nextjs.org/docs/app/api-reference/config/next-config-js/output
- https://nextjs.org/blog/next-security-release-program
- https://nextjs.org/blog/november-2026-security-release
- https://nextjs.org/blog
- https://nextjs.org/support-policy
- https://registry.npmjs.org/next/latest
- https://supabase.com/docs/guides/auth/server-side/nextjs
- https://supabase.com/docs/guides/auth/server-side/advanced-guide
- https://supabase.com/docs/guides/api/api-keys
- https://vercel.com/docs/limits/fair-use-guidelines
- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/plans/pro-plan
- https://vercel.com/pricing
- https://vercel.com/docs/spend-management
- https://vercel.com/docs/pricing/manage-and-optimize-usage
- https://vercel.com/kb/guide/why-is-my-account-deployment-blocked
- https://vercel.com/docs/projects/managing-projects
- https://vercel.com/docs/instant-rollback
- https://vercel.com/docs/cli/rollback
- https://vercel.com/docs/cli/billing
- https://vercel.com/docs/cli/usage
- https://vercel.com/docs/cli/env
- https://vercel.com/docs/cli/link
- https://vercel.com/docs/environment-variables
- https://vercel.com/docs/functions/limitations
- https://vercel.com/docs/caching/cdn-cache
- https://vercel.com/docs/agent-resources/vercel-mcp
- https://vercel.com/changelog/vercel-mcp-now-supports-purchases
- https://vercel.com/changelog/new-deployments-of-vulnerable-next-js-applications-are-now-blocked-by
