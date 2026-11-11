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

The public edition reuses the repository `iambigd60/greybeard`. On 2026-11-11 its history was replaced with this release's commits, authored with the GitHub no-reply address, and the 2.x branches were removed. The remaining steps are the owner's:

1. In the repository's GitHub settings, change the visibility to **public**.
2. Tag and push `v3.0.0` on `main` (step 5 above), then confirm the release appears with `greybeard-skill.zip` attached.
3. Test from a machine without GitHub credentials:
   - `claude plugin install greybeard --marketplace iambigd60/greybeard`
   - `/plugin` lists `greybeard`, and `/mcp` shows no servers added by it.
4. On the owner's machines:
   - remove the 2.x Greybeard marketplace and plugin. The 2.x marketplace has a different name but the same repository address, and its plugin bundles MCP servers;
   - add the marketplace `iambigd60/greybeard` again and install `greybeard@crusher-labs`;
   - put the Crusher Labs context (`examples/crusher-labs.context.md`) under `## Greybeard context` in the user-level `CLAUDE.md`.
5. Next: the Greybeard page on crusherlabs.ai.

Delete this section once these steps are done.
