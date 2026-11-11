# Installing Greybeard

Greybeard is an [Agent Skills](https://agentskills.io) skill: the folder `skills/greybeard/` (a `SKILL.md` plus `references/` and `assets/`). The repository is also a Claude Code plugin and plugin marketplace named `crusher-labs`.

## Claude Code

### As a plugin (recommended: easy updates)

```shell
/plugin marketplace add iambigd60/greybeard
/plugin install greybeard@crusher-labs
```

From a terminal, in one step:

```bash
claude plugin install greybeard --marketplace iambigd60/greybeard
```

The skill appears as `greybeard:greybeard`. It triggers on its own when a request matches, and you can also invoke it with `/greybeard:greybeard`.

**Updating.** Third-party marketplaces do not auto-update by default. Either update by hand:

```shell
/plugin marketplace update crusher-labs
```

or turn on auto-update under `/plugin` > Marketplaces > crusher-labs > Enable auto-update.

### As a plain skill (no plugin)

Download `greybeard-skill.zip` from the [latest release](https://github.com/iambigd60/greybeard/releases/latest) and unzip it into your skills folder:

```bash
# All projects
unzip greybeard-skill.zip -d ~/.claude/skills/
# One project
unzip greybeard-skill.zip -d .claude/skills/
```

On Windows (PowerShell):

```powershell
Expand-Archive greybeard-skill.zip -DestinationPath "$env:USERPROFILE\.claude\skills"
```

The result must be `.../skills/greybeard/SKILL.md`, and the folder name must stay `greybeard`. Update by replacing the folder with a newer release.

### Trying a local checkout

```bash
claude --plugin-dir /path/to/greybeard
claude plugin validate /path/to/greybeard
```

## Claude.ai and the Claude desktop app

1. Make sure code execution is enabled. On Free, Pro and Max this is in Settings > Capabilities. On Team and Enterprise, an owner allows skills under Organization settings.
2. Download `greybeard-skill.zip` from the [latest release](https://github.com/iambigd60/greybeard/releases/latest).
3. Go to **Customize > Skills > + > Create skill > Upload a skill** and choose the zip.

To update, upload the newer zip.

## OpenAI Codex and other Agent Skills clients

Unzip `greybeard-skill.zip` (or copy `skills/greybeard/` from a clone) into the client's skills folder. For Codex:

```bash
# All projects
unzip greybeard-skill.zip -d ~/.agents/skills/
# One project
unzip greybeard-skill.zip -d .agents/skills/
```

**AGENTS.md alternative for Codex.** Copy [`adapters/codex/AGENTS.md`](../adapters/codex/AGENTS.md) into a project root, or append it to `~/.codex/AGENTS.md`. Use it *instead of* the skill folder, not as well.
- It is generated from SKILL.md and starts with the skill's own scope, so it applies only to matching requests.
- It works alone, without the playbooks.
- Keep your combined AGENTS.md content under Codex's 32 KiB instruction limit.

## Tools without skill support

Paste [`adapters/SYSTEM_PROMPT.md`](../adapters/SYSTEM_PROMPT.md) into the tool's system, project or custom instructions. It is generated from SKILL.md. Without the playbook files it uses the built-in mode rules.

## Tuning it to you

Copy `skills/greybeard/assets/context-template.md` to `.greybeard/context.md` in your project and fill in what applies. Alternatively, paste it under a `## Greybeard context` heading in your project or user-level `CLAUDE.md` or `AGENTS.md`. See [`examples/crusher-labs.context.md`](../examples/crusher-labs.context.md).

## Check that it works

Ask something it should handle, for example: *"Is this app ready to launch? Keep it plain."* in a project folder. In Claude Code, `/plugin` should list `greybeard` as enabled, and `/mcp` should show no servers added by it. Greybeard bundles none.
