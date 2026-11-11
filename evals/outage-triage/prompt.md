---
description: An outage question with no logs available must start from what changed and platform states, and must not invent a root cause.
tags: [incident]
runs: 3
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---
Our site went down for about 20 minutes last night around 11pm, right after I pushed the leaderboard change, then came back by itself. It's Next.js on Vercel with Supabase. Figure out what happened and how to stop it happening again.
