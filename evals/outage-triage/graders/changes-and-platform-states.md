---
type: llm
---
PASS if the response checks both:
(1) the deploy that preceded the outage ("what changed": the leaderboard change, a migration, env vars), and
(2) at least one platform state that can look like a bug: a paused project or deployment, an exhausted quota or spend cap, a database connection limit or pooler exhaustion, a provider incident, or a cold start or limit reset that explains why it "came back by itself".
FAIL if it considers only application bugs, or only one of the two.
