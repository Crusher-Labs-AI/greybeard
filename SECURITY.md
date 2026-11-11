# Security policy

Greybeard is a set of Markdown instructions. It ships no code that runs on your machine, no MCP servers and no network calls. Your agent's own tools (and any connectors you add yourself) do the work.

## Reporting a problem

Report through GitHub's **private vulnerability reporting** on this repository (Security tab, then "Report a vulnerability"). Do not open a public issue for anything exploitable. Please include the file and wording involved and what an agent did, or could be led to do, because of it.

Treat as security issues:

- instructions that could lead an agent to take destructive or costly actions without asking;
- instructions that could lead an agent to leak secrets;
- instructions that weaken the agent's handling of untrusted content;
- wrong security guidance, such as a check that passes when data is actually exposed.

## Scope of the skill's own guidance

Greybeard gives defensive guidance for systems the user controls. It tells the agent to treat production as read-only by default and to get explicit approval, after describing the change and how to undo it, before changing a live system.

Greybeard is not a substitute for a professional security audit or penetration test.
