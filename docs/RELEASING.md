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

The public edition was prepared on 2026-11-11 and saved as branch `public-edition-v3` of the private repository. It is one commit, authored with the GitHub no-reply address. The remaining steps change GitHub and need the owner's go-ahead:

1. Rename the private repository `iambigd60/greybeard` to `iambigd60/greybeard-internal`. It stays private and keeps the internal 2.x edition and its `codex` branch.
2. Create a new **public** repository `iambigd60/greybeard`, with no README or license (the commit already has them).
3. Push the saved commit as `main` of the public repository. From any checkout that has the `public-edition-v3` branch:

   ```bash
   git push https://github.com/iambigd60/greybeard.git public-edition-v3:main
   ```

   (Before the rename, that branch lives at `iambigd60/greybeard`; after it, at `iambigd60/greybeard-internal`.)
4. Tag and push `v3.0.0` on `main`, then confirm the release appears with `greybeard-skill.zip` attached.
5. Test from a machine without GitHub credentials:
   - `claude plugin install greybeard --marketplace iambigd60/greybeard`
   - `/plugin` lists `greybeard`, and `/mcp` shows no servers added by it.
6. On the owner's machines:
   - remove the old private Greybeard marketplace and plugin, which install from the old repository address and bundle MCP servers;
   - install `greybeard@crusher-labs`;
   - put the Crusher Labs context (`examples/crusher-labs.context.md`) under `## Greybeard context` in the user-level `CLAUDE.md`.
7. Next: the Greybeard page on crusherlabs.ai. The live site is the Next.js app in `iambigd60/crusherlabs-build-club`.
