# Netlify — stack reference
Last verified: 2026-11-11 (re-check pricing and limits before quoting them; links below)

Contents: Detect · Hard rules · Checks · Limits that bite · Cost and caps · Platform state, not a bug · Sources. Read Detect and Hard rules in full before acting. On Windows PowerShell use `curl.exe` and Git Bash for pipelines.

Facts here are dated. Before you quote a price, credit rate or limit to the owner, re-open the matching source link. If you cannot re-check it, label the figure "as of 2026-11-11".

## Detect
- These files mean the project uses Netlify:
  - `netlify.toml` at the repo root or the base directory
  - `.netlify/state.json` containing a `siteId` (`netlify link` writes it)
  - `netlify/functions/` (the default functions directory)
  - `_redirects` or `_headers` in the publish directory
  - `NETLIFY_SITE_ID` or `NETLIFY_AUTH_TOKEN` in CI config
- Next.js adapter:
  - Netlify auto-installs the OpenNext adapter (`@netlify/plugin-nextjs`, v5.x) and updates it on every build unless the project pins it.
  - A pin is `@netlify/plugin-nextjs` in package.json plus `[[plugins]] package = "@netlify/plugin-nextjs"` in netlify.toml. Read the pinned version with `npm ls @netlify/plugin-nextjs`. Netlify advises against pinning.
  - The adapter supports Next.js 13.5 and later. Earlier versions use the legacy runtime.
  - A new adapter built on the Next.js Adapter API was announced to roll out automatically "later this year" (2026). Check the changelog before you say which adapter runs.
- Read the Next.js major version from package.json and the lockfile. Next.js 16+ uses `proxy.ts`; 15 and earlier use `middleware.ts`.
- Plan model:
  - A Team Owner opens Usage & billing > Plan details (`https://app.netlify.com/teams/<team>/billing/general#plan-details`). A monthly credit allotment means a credit-based plan. Usage packages or tiered add-ons mean a Legacy plan.
  - Teams created on or after 2025-09-04 are credit-based.
  - "Free" and "Pro" exist in both models, so the plan name alone does not tell you which one it is. If you cannot see the dashboard, ask the owner.
- Never move a Legacy team to credits yourself. The switch is irreversible, projects cannot be moved back to a Legacy team, and an Analytics subscription ends with no refund.
- Live access:
  - `netlify status --json` shows the CLI login and linked project.
  - Look for a Netlify MCP server in the client's MCP config.

## Hard rules
1. Never put secrets in:
   - `netlify.toml` (`[build.environment]`, `[context.*.environment]`)
   - a committed `.env*` file
   - any `NEXT_PUBLIC_*` variable (Next.js inlines these into browser JS at build time)

   Set secrets only through the UI, CLI or API.
2. Mark every secret "Contains secret values" (CLI: `env:set ... --secret`). It is then write-only: nobody can read the value back from the UI, CLI or API (except the `dev` context). The flag cannot be removed. The variable must name explicit deploy contexts and scopes, and cannot have the Post processing scope. Do not type a secret value on a command line the transcript or shell history keeps; have the owner enter it in the UI.
3. Production secrets go in the Production context only. Deploy Previews and branch deploys get separate non-production values, because:
   - Anyone with a preview link can open it unless it is protected.
   - Password protection is not available on credit-based Free or Personal.
   - Credit Pro protects previews under Project configuration > General > Visitor access > Project visibility > Previews only.
   - The latest branch deploy per branch gets no `noindex` header, so search engines can index it.
4. Team-level shared variables hold non-sensitive config only. Give each site its own secret.
5. Never make a build pass by setting `SECRETS_SCAN_ENABLED=false` or by adding a real secret's key to `SECRETS_SCAN_OMIT_KEYS`. A scan failure means the value is in the code or the build output: fix that. Add only confirmed false positives to `SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES`.
6. Public repos: keep the Untrusted deploys policy on "Require approval" (the default). Never pick "Build without restrictions", which gives every environment variable to fork pull requests.
7. Leaked secret:
   - Rotate it at the issuer first.
   - Update the Netlify variable, then build and deploy.
   - Delete any deploy that contains the leaked value.
8. Require 2FA (or enforced SSO) on every account with Owner rights.
9. Netlify MCP server, CLI and API are write-capable. Treat them that way.
   - Per its docs, the MCP server creates and deploys projects, changes access controls, installs extensions, and manages env vars, secrets and forms.
   - No read-only mode and no per-project scoping is documented. A personal access token (PAT) acts as the user on every team the user belongs to.
   - Before any deploy, publish, env var change, access change, extension change or plan change, state the change, its blast radius and how to undo it. Then wait for an explicit yes.
   - Pre-approve only read tools. If the client splits tools into reader and updater groups, allow only the readers.
10. MCP install and auth:
    - Remote: `claude mcp add --transport http netlify https://mcp.netlify.com/mcp`. For other clients: `npx -y add-mcp https://mcp.netlify.com/mcp`. Authorize Netlify when prompted. The old URL `https://netlify-mcp.netlify.app/mcp` still works.
    - Local: `claude mcp add netlify -- npx -y @netlify/mcp@<version>`. Pin the exact version shown by `npm view @netlify/mcp version` (it was 1.21.0 on 2026-11-11); never run it unpinned.
    - The package README says Node 22+, but Netlify's Claude Code guide asks for Node 24+, so use 24.
    - The owner adds the PAT to the server's env block as `NETLIFY_PERSONAL_ACCESS_TOKEN` themselves, never as a command-line argument.
    - Never commit a PAT or the CLI `config.json`. On SSO teams the token must be authorized for the team.
11. Next.js security releases can also need an adapter bump. Example: the 2026-11-03 advisory needed Next.js 16.4.5 / 15.5.29 plus adapter 5.16.6 for the middleware-cookie case; it says upgrading Next.js alone does not fix that case on Netlify. An unpinned adapter updates on the next deploy. A pinned one must be bumped by hand. After every Next.js security release, read Netlify's advisory for it.

## Checks
All read-only unless marked WRITE.
- `netlify status --json`: which account and project the CLI is linked to.
- List variable names only. The plain output includes values, so pipe it straight through this filter (it works in bash, zsh and PowerShell):
  ```
  netlify env:list --context production --json | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{const j=JSON.parse(s);console.log((Array.isArray(j)?j.map(v=>v.key):Object.keys(j)).join('\n'))})"
  ```
  Repeat with `--context deploy-preview`.
  - Confirm that secret keys differ per context.
  - Confirm that variables needed at runtime are not set only in netlify.toml.
- Read netlify.toml:
  - The environment blocks hold no secrets.
  - Note any `[[plugins]]` pin.
  - Note any `[build] ignore` command.
- Find variables that leak to the browser: `git grep -nE 'NEXT_PUBLIC_[A-Z0-9_]*(SECRET|PRIVATE|TOKEN|SERVICE_ROLE)'`. Each hit is a finding.
- Find committed env files: `git ls-files -- ':(glob)**/.env*'`. Review every hit except example files.
- Deploy history: `netlify api listSiteDeploys --data '{"site_id":"<siteId>","per_page":20}'`.
  - In Windows PowerShell 5.1, escape the inner quotes: `'{\"site_id\":\"<siteId>\",\"per_page\":20}'`.
  - Filter the output to state, context and timestamps.
- Credits (dashboard, Team Owner or Billing Admin):
  - Usage & billing > Credit balance shows balance, grants and expiry. Configure auto recharge there shows whether it is Enabled.
  - Credit usage breakdown (`.../billing/general#credit-usage-breakdown`).
  - Account usage insights > Credits shows daily usage per meter.
- Project configuration > Developer settings > Continuous deployment:
  - Build settings: Build status (Active or Stopped)
  - Branches and deploy contexts
  - Untrusted deploys policy
- Deploys list: if it offers "Unlock to start auto publishing", production is locked.
- Forms on Next.js:
  - Forms > Form detection is enabled.
  - A static file in `public/` (for example `public/__forms.html`) declares every form and every field.
  - The component POSTs to that static path, URL-encoded (`application/x-www-form-urlencoded`), with a hidden `form-name` field.
  - Check Forms > Spam submissions too.
- Functions region: Cloud compute > Functions > Region. The default is `cmh` (US East, Ohio); sites created before 2023-10-04 may differ. The region should sit near the database.
- Rollback (WRITE, needs an explicit yes):
  - Deploys > open a successful deploy > Publish deploy (API: `restoreSiteDeploy`). It is instant, does not rebuild and costs 0 credits.
  - Then Lock to stop auto publishing. Otherwise the next Git-triggered production deploy overwrites the rollback.
  - Unlock once the fix ships.
  - The database and other external state do not roll back. Verify env-dependent behavior after a rollback.

## Limits that bite
- Functions. Next.js SSR, Route Handlers and Server Actions run as functions through the adapter, so these limits apply to them.

  | Limit | Value |
  |---|---|
  | Synchronous execution | 60 s, not configurable |
  | Scheduled execution | 30 s |
  | Background execution | 15 min. The caller gets an empty 202 at once; on error, retries after 1 min and again 2 min later |
  | Buffered payload | 6 MB. Binary uploads are about 4.5 MB because of base64 |
  | Streamed response | 20 MB |
  | Background payload | 256 KB |
  | Memory | 1024 MB default. 1024-4096 MB only on credit-based Pro and Enterprise |
  | Region | Changeable on Pro and Enterprise. Needs a redeploy; old deploys keep the old region |

- Edge Functions: 50 ms CPU per request, 512 MB memory per set, 20 MB compressed code, 40 s response-header timeout.
- Next.js middleware runs "via Edge Functions" in Netlify's feature table. The docs do not cover `proxy.ts` separately.
- Next.js on Netlify:
  - SSR pages on the edge runtime run as Node.js in the functions region.
  - Rewrites cannot target files in `public/`.
  - Headers and redirects are evaluated after middleware.
  - Node.js middleware cannot use C++ addons or the filesystem.
- Environment variables:
  - Changes take effect only after a new build and deploy.
  - Variables set in netlify.toml get only the Builds and Post processing scopes, so functions cannot see them at runtime.
  - netlify.toml values override UI, CLI and API values with the same key.
  - Custom scopes and shared variables need Pro or Enterprise.
  - Keys are limited to 255 characters and values to 5,000.
- Forms:
  - Netlify detects forms only in static HTML at deploy time.
  - Adapter v5 fails the build when React code has `netlify` or `data-netlify` form attributes and `public/` has no static form file. `NETLIFY_NEXT_VERIFY_FORMS=false` only postpones the failure.
  - Requests are capped at 8 MB, one file per field, and uploads time out after 30 s.
  - Paused projects accept no submissions.
- Builds:
  - Concurrent builds: Free 1; Personal 1 (3 with a paid add-on); Pro 3.
  - `[build] ignore`: exit 0 skips the build, exit 1 builds. It never cancels a build-hook build and runs on Node 18.
  - Stopped builds block production, preview and branch deploys alike.
- Deploy retention: 30 days, or 90 on paid plans. The published deploy, the latest successful production deploy and the latest deploy per branch are always kept. An older rollback target may already be deleted (its link returns 404).
- Rate limiting: below Enterprise it is code-only, set in the function's `config.rateLimit` or in `[redirects.rate_limit]`. Limit: 2 rules per project on Free and Personal, 5 on Pro.

## Cost and caps
- Credit-based plans (re-check https://www.netlify.com/pricing/ before quoting):
  - Free: $0, 300 credits/month. Hard limit; you cannot buy more.
  - Personal: $9/month, 1,000 credits.
  - Pro: $20/month, 3,000 credits (tiers up to 20,000), unlimited members.
  - Enterprise: custom.
- Credit rates:

  | Item | Credits |
  |---|---|
  | Production deploy | 15 per successful deploy. Failed deploys and rollbacks cost 0 |
  | Deploy Preview or branch deploy | 0 |
  | Compute | 10 per GB-hour. A default 1 GB function costs 10 per hour of execution |
  | Bandwidth | 20 per GB |
  | Web requests | 2 per 10,000. Edge Functions bill here, not as compute |
  | Forms | Free and unlimited on credit plans |
  | AI inference | 180 per USD of model usage |

  At the Pro credit-pack rate that is about $0.10 per deploy, $0.13 per GB and $0.07 per GB-hour.
- What 300 Free credits buy: 20 production deploys with no traffic at all, or 15 GB of bandwidth, or 1.5M requests.
- The 0-credit rate covers the preview deploy itself. The docs do not say preview traffic or preview function time is free, so never promise that it is.
- There is no hard dollar limit:
  - Auto recharge off (the default) is the cap. At zero credits, every project on the team pauses, on paid plans too.
  - Auto recharge on: only a Team Owner can enable it, and it applies to the whole team. It buys Personal 500 credits for $5 or Pro 1,500 for $10, charged to the card on file, with no documented ceiling.
  - Other levers: disable a high-usage project, or set an AI Credit Usage Limit (it stops agent runs).
- Record one decision per team: recharge off (cost wins, and the whole team can go dark) or recharge on (uptime wins, and the bill is open-ended). One project's spike pauses every project on the team. Engineering judgement, not from the docs: put an app that must stay up on its own team.
- Rollover: monthly credits roll over only on Pro 5,000+, and only for one month. Credit packs and auto-recharge credits roll over.
- Alerts: email and in-app notices at 50%, 75% and 100% (the billing FAQ also lists 90%). Usage is reported per team only. For per-project function data use Analytics & metrics > Observability.
- Practical rule: iterate on Deploy Previews (0 credits per deploy) and batch merges to the production branch.
  - `netlify deploy` creates a draft unless you pass `--prod`.
  - Use `[build] ignore` to skip builds for docs-only changes.
  - The docs do not say whether a locked, built but unpublished production deploy costs 15 credits, so do not use locking to save credits.

## "Platform state, not a bug"
| Symptom | Cause | Fix |
|---|---|---|
| Every project on the team shows "Site not available"; forms reject; no deploys run, previews included | Credits exhausted; the team is paused | Free: upgrade, or wait for the next cycle (projects resume automatically). Paid: a Team Owner buys a credit pack, enables auto recharge or upgrades. Confirm the sites are back |
| Build is green but the live site is unchanged | Deploys are locked, or it was a draft or preview deploy | Unlock, or publish that deploy (needs a yes) |
| The bad version came back after a rollback | A Git-triggered production deploy overwrote the rollback | Roll back again, then lock |
| No builds at all | Build status is Stopped, `ignore` exits 0, a fork PR is waiting for approval at the top of the Deploys list, or the team is paused | Fix that setting, approve the PR, or restore credits |
| Builds sit queued | Concurrent build limit (1 on Free and Personal) | Wait, or add capacity |
| Build fails and the deploy log names a secret's location | Secret scanning found the value in code or build output | Remove the exposure; never turn scanning off |
| Forms build failure after a Next.js adapter v5 upgrade | No static form file in `public/` | Add the static form file |
| Form submissions missing | Form detection off or not redeployed; filed under Spam submissions; dropped silently by a honeypot or reCAPTCHA; or a Next.js form posts to a page instead of the static file | Fix the matching cause |
| Form notification emails not arriving at an address outside the team | Since Nov 2026 the recipient must click Confirm first | Have the recipient confirm |
| An env var change is ignored | Not rebuilt yet, set only in netlify.toml (no Functions scope), or overridden by netlify.toml | Rebuild and deploy, or move the variable to the UI with the right scope |
| A function dies at about 60 s, or a large upload is rejected | Hard limits | Move the work to a background function, or upload straight to storage |
| Middleware errors on CPU-heavy logic | 50 ms Edge Function CPU limit | Move the heavy logic out of middleware |
| Next.js is patched but still affected on Netlify | The pinned adapter is older than the advisory requires | Bump the adapter and redeploy |
| CLI or MCP access denied on an SSO team | The token is not authorized for that team | Authorize the token for the team |
| An old deploy link returns 404 | Deploy retention deleted it | Pick a newer rollback target |
| No password-protection option | Credit-based Free or Personal plan | Upgrade to protect previews |

## Sources
- https://www.netlify.com/pricing/
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/monitor-usage-for-credit-based-plans/
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/
- https://docs.netlify.com/manage/accounts-and-billing/billing/resume-paused-projects/
- https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
- https://opennext.js.org/netlify
- https://opennext.js.org/netlify/forms
- https://www.netlify.com/changelog/2026-11-03-nextjs-security-vulnerabilities/
- https://www.netlify.com/blog/the-next-js-adapter-api-just-shipped-here-s-what-comes-next/
- https://www.netlify.com/changelog/ (2026-11-09 entry: email verification for form notifications)
- https://docs.netlify.com/manage/forms/setup/
- https://docs.netlify.com/manage/forms/spam-filters/
- https://docs.netlify.com/manage/forms/troubleshooting-tips/
- https://docs.netlify.com/build/functions/configuration/
- https://docs.netlify.com/build/functions/background-functions/
- https://docs.netlify.com/build/functions/usage-and-billing/
- https://docs.netlify.com/build/server/
- https://docs.netlify.com/build/edge-functions/limits/
- https://docs.netlify.com/build/environment-variables/overview/
- https://docs.netlify.com/build/environment-variables/get-started/
- https://docs.netlify.com/build/environment-variables/secrets-controller/
- https://docs.netlify.com/manage/security/secret-scanning/
- https://docs.netlify.com/resources/checklists/security-checklist/
- https://docs.netlify.com/manage/security/secure-access-to-sites/password-protection/
- https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/
- https://docs.netlify.com/deploy/deploy-overview/
- https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/
- https://docs.netlify.com/build/configure-builds/ignore-builds/
- https://docs.netlify.com/build/configure-builds/stop-or-activate-builds/
- https://docs.netlify.com/build/configure-builds/file-based-configuration/
- https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/
- https://cli.netlify.com/commands/env/
- https://cli.netlify.com/commands/deploy/
- https://cli.netlify.com/commands/api/
- https://cli.netlify.com/commands/status/
- https://open-api.netlify.com/
- https://docs.netlify.com/build/build-with-ai/netlify-mcp-server/
- https://docs.netlify.com/build/build-with-ai/agent-setup-guides/set-up-claude-code-for-netlify/
- https://docs.netlify.com/build/build-with-ai/agent-setup-guides/set-up-codex-for-netlify/
- https://github.com/netlify/netlify-mcp (README: PAT env var, Node 22+)
- https://registry.npmjs.org/@netlify/mcp/latest
- https://nextjs.org/docs/app/guides/environment-variables
