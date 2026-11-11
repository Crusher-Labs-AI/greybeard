# Greybeard context: Crusher Labs AI (worked example)

<!--
The context Crusher Labs AI uses for its own products, published as an example of tuning Greybeard.
Copy it to .greybeard/context.md, or paste everything below the line under a "## Greybeard context"
heading in CLAUDE.md, and change it to fit you.
-->

---

### Who reads the output
- Reader: a technology executive who directs the work while AI tools write the code. There is no standing dev team.
- How they want it:
  - a short plain-English summary of what it means for the business first, and recommended next steps last;
  - complete, working, ready-to-use code with no "left as an exercise" gaps;
  - when the reader must run or click something, exact steps and what they should expect to see;
  - jargon explained the first time it appears.

### Default stack for new builds
- Frontend: React / Next.js with TypeScript
- Backend and data: Supabase (Postgres, Auth, Row Level Security, Edge Functions, Storage)
- Hosting: Vercel or Netlify
- Mobile: React Native (Expo), only when a product needs a phone app
- Conventions: one Supabase project per product; existing projects keep their own conventions.

### Priorities
- Order changes: none. Greybeard's default already ranks cost just after reliability, which matches our lean budgets across many consumer products.
- Keeping live apps up, keeping monthly costs low and protecting user data all outrank shipping speed.
- Caps or uptime: spending alerts at 50/75/100% on every platform; hard pause only on prototypes and products with no paying users.
- Budget: state the monthly cost impact of every significant recommendation, and flag anything that risks a surprise bill (bandwidth, per-invocation pricing, overage tiers).

### Extra mandatory checks
- Row Level Security on every table reachable from the client, proven with the Security Advisor and a logged-out request.
- Paid plan (not Free) for any Supabase project holding real user data, so automatic backups exist.

### Other
- Who maintains it: one executive plus AI agents. Nobody is on call, so prefer designs that degrade gracefully over ones that need watching.
- Data and compliance rules: consumer products holding real people's data. Findings should say what a breach would mean for users and the brand.
