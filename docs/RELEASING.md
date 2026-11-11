# Releasing Greybeard

## Every release

1. Make the changes, then run `node scripts/build.mjs`. It regenerates `adapters/` from SKILL.md and runs the checks.
2. Bump `version` in `.claude-plugin/plugin.json` and `metadata.version` in `skills/greybeard/SKILL.md`, then add a dated entry at the top of `CHANGELOG.md`. The build fails if these three disagree.
3. Run `claude plugin validate --strict .` and `claude plugin eval . --scaffold`.
4. Run `node scripts/build.mjs --release`. It must pass with no problems; it also builds `dist/greybeard-skill.zip` for a local check.
5. Merge to `main`, then tag on `main`:

   ```bash
   git tag v<version>
   git push origin v<version>
   ```

   The `release` workflow rebuilds the zip and publishes the GitHub release. It refuses tags that are not on `main` or do not match the version.

## First publication (3.0.0): steps still to do

On 2026-11-11 the private repository `iambigd60/greybeard` had its history replaced with this release's commits, authored with the GitHub no-reply address, and its 2.x branches removed. It was made public, `v3.0.0` was released, and it was transferred to `Crusher-Labs-AI/greybeard`. GitHub redirects the old address. The remaining steps are the owner's:

1. Test from a machine without GitHub credentials:
   - `claude plugin install greybeard --marketplace Crusher-Labs-AI/greybeard`
   - `/plugin` lists `greybeard`, and `/mcp` shows no servers added by it.
2. On each of the owner's machines that still has 2.x:
   - remove the 2.x Greybeard marketplace and plugin, which bundles MCP servers;
   - add the marketplace `Crusher-Labs-AI/greybeard` and install `greybeard@crusher-labs`;
   - put the Crusher Labs context (`examples/crusher-labs.context.md`) under `## Greybeard context` in the user-level `CLAUDE.md`.
3. Next: the Greybeard page on crusherlabs.ai.

Delete this section once these steps are done.
