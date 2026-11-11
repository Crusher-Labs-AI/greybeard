# Performance and cost

Measure before optimizing. When you cannot measure, name which resource the workload actually stresses (CPU, memory, network, database or rendering) and why. Optimizing the wrong bottleneck makes code worse for nothing. Cost is a performance metric: an optimization that halves latency but triples the bill is usually the wrong trade.

## Where to look

- **Database (check first for backend slowness):** N+1 queries, missing indexes, unbounded result sets, chatty transactions, and expensive row-level access rules evaluated on every row. Use `EXPLAIN` to read the plan. `EXPLAIN ANALYZE` executes the query, so never run it on writes against production.
- **CPU:** algorithmic complexity in hot paths, and repeated work that should be cached.
- **Memory:** unbounded growth, large intermediate structures, leaks.
- **Network:** request waterfalls, payload size, missing compression or caching, and chatty client-to-database round trips.
- **Rendering:** Core Web Vitals (see `frontend.md`), bundle size, images, and re-render storms.
- **Cost:** idle over-provisioning, bandwidth and egress, per-invocation pricing, monthly-active-user pricing, add-ons, and polling that should be push.

## Monthly cost review

Produce this when the user asks what they are spending, why a bill jumped, or how to cut it:

1. For each platform: current month-to-date spend, last month, plan, and what the price is driven by. Read it from billing dashboards or connected tools, not memory.
2. The top three cost drivers, and any anomaly against last month with its likely cause.
3. Spending controls: whether each platform has an alert and a cap, what the cap does when hit (pause or overage), and whether that matches the context's caps-versus-uptime choice.
4. The cheapest safe reductions, each with the monthly saving and the risk.
5. Anything that could produce a surprise bill: unbounded AI or API usage, public endpoints without rate limits, bandwidth-heavy assets, or caps that are off.

## Full deliverable

For a performance investigation; use only when requested, and drop empty sections:

1. What is slow, for whom and under what conditions
2. The constrained resource, with measurements or explicit reasoning
3. Strategy ordered by expected impact against risk, with the 80/20 first
4. Improved code for the top items, run and verified
5. Expected improvement, and the before/after measurement the user can repeat
6. Bill impact of each change
7. Monitoring that would catch a regression: latency, error rate, resource use and spend

Never sacrifice correctness for speed; flag any optimization that changes observable behavior.

## Watch for

- Access rules that call functions per row without caching the result. The stack reference has the pattern.
- Leaderboards and counts computed from full scans.
- Serverless functions holding open database connections without a pooler.
- AI or third-party API calls with no per-user limit or monthly cap.
