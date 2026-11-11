# Optional connectors

Greybeard bundles no MCP servers and starts nothing. If you connect your database or hosting provider yourself, Greybeard uses those tools for evidence (logs, advisors, usage, configuration) instead of asking you to click through dashboards.

Its rules for live systems apply whatever you connect:

- **Production is read-only by default.** Greybeard reads freely and changes nothing.
- **Every change needs your explicit yes** after it has stated what will change and how to undo it. That covers deploys, rollbacks, environment variables, DNS, SQL writes, migrations, pausing or deleting anything, and purchases.

Even so, connect production with the **least access that still answers your questions**: read-only, and scoped to one project.

## Supabase

The Supabase MCP server takes URL parameters that limit what it can do:

- `project_ref=<your-project-ref>`: scope it to one project (this also removes account-level tools);
- `read_only=true`: run every query as a read-only Postgres user.

```bash
claude mcp add --transport http supabase "https://mcp.supabase.com/mcp?project_ref=<your-project-ref>&read_only=true"
```

Supabase recommends keeping manual approval of tool calls on for interactive work. Source: <https://supabase.com/docs/guides/getting-started/mcp>. If you already use the official Supabase plugin or connector, you do not need this.

## Vercel

```bash
claude mcp add --transport http vercel https://mcp.vercel.com
```

The Vercel MCP server acts with your full account access.

- It can deploy, roll back and promote deployments, change environment variables, and pause projects.
- Since July 2026 it can also make purchases after a confirmation step: domains, plan upgrades and credits.
- No documented setting turns off purchases or limits it to read-only.

Greybeard asks before any of these; review each tool call before approving it. Source: <https://vercel.com/docs/agent-resources/vercel-mcp>. If you already use the official Vercel plugin or connector, you do not need this.

## Netlify

```bash
claude mcp add --transport http netlify https://mcp.netlify.com/mcp
```

Authorize Netlify when prompted. No read-only mode or per-project scoping is documented: the server acts as you on every team you belong to, and can deploy, change access controls and manage environment variables. If you run the local package instead (`npx @netlify/mcp`), pin an exact version (`npx -y @netlify/mcp@<version>`) rather than taking whatever is latest. Source: <https://docs.netlify.com/build/build-with-ai/netlify-mcp-server/>.

## Checking what is connected

In Claude Code, `/mcp` lists your servers. Greybeard itself adds none.
