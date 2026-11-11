# Installing Greybeard

Greybeard is an [Agent Skills](https://agentskills.io) skill: the folder `skills/greybeard/` (a `SKILL.md` plus `references/` and `assets/`). The repository is also a Claude Code plugin and plugin marketplace named `crusher-labs`.

Pick your AI:

- [Claude Code](#claude-code)
- [Claude.ai and the Claude desktop app](#claudeai-and-the-claude-desktop-app)
- [OpenAI Codex](#openai-codex)
- [ChatGPT](#chatgpt)
- [GitHub Copilot](#github-copilot)
- [Google Gemini](#google-gemini) (Gemini CLI, Antigravity and the Gemini app)
- [xAI Grok](#xai-grok)
- [Other Agent Skills clients](#other-agent-skills-clients) and [tools without skill support](#tools-without-skill-support)

The steps for each platform were checked against that vendor's official docs on 2026-11-11. Menus, version numbers and plan lists change. If a step doesn't match what you see, the linked official docs win.

Most platforms below take the same skill folder. Download `greybeard-skill.zip` from the [latest release](https://github.com/Crusher-Labs-AI/greybeard/releases/latest); its top level is the `greybeard/` folder. Or clone the repository and use `skills/greybeard/`. Wherever it goes, the result must be `.../skills/greybeard/SKILL.md`, and the folder name must stay `greybeard`.

## Claude Code

### As a plugin (recommended: easy updates)

In a Claude Code session:

```shell
/plugin marketplace add Crusher-Labs-AI/greybeard
/plugin install greybeard@crusher-labs
```

From a terminal:

```bash
claude plugin marketplace add Crusher-Labs-AI/greybeard
claude plugin install greybeard@crusher-labs
```

This two-step install works on every version of Claude Code. To install it for the current project only, add `--scope project` to the terminal install command:

```bash
claude plugin install greybeard@crusher-labs --scope project
```

**One step on newer versions.** Recent versions can add the marketplace and install in a single command. Check yours with `claude --version`.
- Claude Code v2.1.275 or later, in a session:

  ```shell
  /plugin install greybeard --marketplace Crusher-Labs-AI/greybeard
  ```

- Claude Code v2.1.292 or later, from a terminal:

  ```bash
  claude plugin install greybeard --marketplace Crusher-Labs-AI/greybeard
  ```

The skill appears as `greybeard:greybeard`. It triggers on its own when a request matches, and you can also invoke it with `/greybeard:greybeard`.

**Updating.** Third-party marketplaces do not auto-update by default. Either update by hand:

```shell
/plugin marketplace update crusher-labs
```

or turn on auto-update under `/plugin` > Marketplaces > crusher-labs > Enable auto-update.

### As a plain skill (no plugin)

Download `greybeard-skill.zip` from the [latest release](https://github.com/Crusher-Labs-AI/greybeard/releases/latest) and unzip it into your skills folder:

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

Official docs: [Discover and install plugins](https://code.claude.com/docs/en/discover-plugins).

## Claude.ai and the Claude desktop app

Skills work on every Claude plan, including Free. On Team and Enterprise, an admin must first enable them under **Organization settings > Plugins & skills**.

1. Turn on **Code execution and file creation** in **Settings > Capabilities**. Skills need it.
2. Download `greybeard-skill.zip` from the [latest release](https://github.com/Crusher-Labs-AI/greybeard/releases/latest) and upload it as it is. Its top level is the `greybeard/` folder, which is what Claude expects. If you build your own zip, zip the `greybeard` folder itself, not the files inside it.
3. Go to **Customize > Skills**, click **+**, then **+ Create skill > Upload a skill**, and choose the zip.
4. Toggle Greybeard on in your skills list.

To update, upload the newer zip.

## OpenAI Codex

Unzip `greybeard-skill.zip` (or copy `skills/greybeard/` from a clone) into a Codex skills folder:

```bash
# All projects
unzip greybeard-skill.zip -d ~/.agents/skills/
# One project (run this in the repository)
unzip greybeard-skill.zip -d .agents/skills/
```

Codex also looks for `.agents/skills/` in parent folders, up to the repository root. A copy at the root of a repository therefore covers work in any of its subfolders.

**AGENTS.md alternative.** Codex also reads instruction files called `AGENTS.md`: a global one at `~/.codex/AGENTS.md`, and one per project at the project root. Copy [`adapters/codex/AGENTS.md`](../adapters/codex/AGENTS.md) into a project root, or append it to `~/.codex/AGENTS.md`. Use it *instead of* the skill folder, not as well.
- It is generated from SKILL.md and starts with the skill's own scope, so it applies only to matching requests.
- It works alone, without the playbooks.
- By default Codex reads at most 32 KiB of AGENTS.md content in total, global and project combined. The setting is `project_doc_max_bytes`. Greybeard's file is about 13 KB, so keep everything else within the space left.

Official docs: [Build skills](https://learn.chatgpt.com/docs/build-skills).

## ChatGPT

The plan list below comes from OpenAI's help article, checked on 2026-11-11. OpenAI may change it.

**Business, Enterprise, Healthcare and Edu: install the skill.** On Enterprise and Edu, an admin must enable skills first.
1. Unzip `greybeard-skill.zip`, or clone the repository and use `skills/greybeard/`.
2. Go to **Skills > Create** and upload the `greybeard` folder.

**Free, Go, Plus and Pro: paste the instructions.** These plans don't have skills. Paste [`adapters/SYSTEM_PROMPT.md`](../adapters/SYSTEM_PROMPT.md) into one of these:
- a Project's instructions, so it applies to every chat in that Project;
- a custom GPT's instructions.

## GitHub Copilot

### VS Code (agent mode)

Put the `greybeard` folder in one of the skills folders Copilot reads:

| Scope | Main folder | Also read |
|---|---|---|
| One project | `.github/skills/` | `.claude/skills/`, `.agents/skills/` |
| All your projects | `~/.copilot/skills/` | `~/.claude/skills/`, `~/.agents/skills/` |

```bash
# One project (run this in the repository)
unzip greybeard-skill.zip -d .github/skills/
# All your projects
unzip greybeard-skill.zip -d ~/.copilot/skills/
```

If you already installed Greybeard as a plain skill for Claude Code or Codex in one of the "also read" folders, Copilot uses that copy. You don't need a second one.

### Copilot CLI

The CLI reads the same project folders. For all your projects it reads `~/.copilot/skills/` or `~/.agents/skills/`. Or add the skill with a command, pointing it at the unzipped `greybeard` folder:

```bash
copilot skill add <directory>
```

Then run `/skills` in a Copilot CLI session. It lists your skills and lets you turn each one on or off. Check that Greybeard is there and on.

### Copilot cloud agent

The cloud agent reads project skills in `.github/skills/`. Commit the folder to your repository as `.github/skills/greybeard/`.

### Instructions only

If you'd rather not install a skill, Copilot also reads instruction files: `.github/copilot-instructions.md` or `AGENTS.md`. Copy [`adapters/codex/AGENTS.md`](../adapters/codex/AGENTS.md) to `AGENTS.md` in the project root, or paste [`adapters/SYSTEM_PROMPT.md`](../adapters/SYSTEM_PROMPT.md) into `.github/copilot-instructions.md`. Both start with the skill's own scope, so they apply only to matching requests. Use one of these *instead of* the skill folder, not as well.

Official docs: [Agent skills in VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-skills) and [Add skills to Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills).

## Google Gemini

### Gemini CLI

Install straight from GitHub:

```bash
gemini skills install https://github.com/Crusher-Labs-AI/greybeard.git --path skills/greybeard --consent
```

- `--path skills/greybeard` picks the skill folder inside the repository.
- `--consent` confirms you accept the risks of installing a skill and skips the confirmation prompt. Leave it off if you want to be asked.
- By default it installs for all your projects (`--scope user`). Add `--scope workspace` to install it for the current project only.

Or copy the `greybeard` folder by hand:

```bash
# All projects
unzip greybeard-skill.zip -d ~/.gemini/skills/
# One project (run this in the project folder)
unzip greybeard-skill.zip -d .gemini/skills/
```

Run `/skills` in a Gemini CLI session to check and manage it.

Official docs: [Gemini CLI skills](https://geminicli.com/docs/cli/skills/).

### Antigravity

On 2026-06-18, Antigravity replaced Gemini CLI for unpaid-tier and Google One users. In Antigravity, put the folder in your project's `.agents/skills/`:

```bash
# Run this in the project folder
unzip greybeard-skill.zip -d .agents/skills/
```

Antigravity doesn't document a skills folder that covers all projects, so install it per project.

### Gemini app (web and Mac)

For now, skills in the Gemini app are only for personal Google accounts of people aged 18 or over.

1. Unzip `greybeard-skill.zip`. The app takes the `greybeard` folder, not the zip.
2. Go to **Customize > Skills > Create** and upload the `greybeard` folder.

Google converts Gems to skills on 2026-11-17. If you set Greybeard up as a Gem before then, check **Customize > Skills** afterwards.

Official docs: [Gemini app skills](https://support.google.com/gemini/answer/18560919).

## xAI Grok

### Grok Build CLI

Grok Build is in early beta, on SuperGrok and X Premium Plus.

```bash
# All projects
unzip greybeard-skill.zip -d ~/.grok/skills/
# One project (run this in the project folder)
unzip greybeard-skill.zip -d .grok/skills/
```

The result must be `~/.grok/skills/greybeard/` or `./.grok/skills/greybeard/`. Run `grok inspect` to check that Grok sees it.

Grok Build also reads `AGENTS.md`, so the [AGENTS.md alternative](#openai-codex) works there too. Use one or the other, not both.

Official docs: [Skills, plugins and marketplaces](https://docs.x.ai/build/features/skills-plugins-marketplaces).

### Grok app and web

As of 2026-11-11, xAI documents no skills support in the Grok app or on the web. Paste [`adapters/SYSTEM_PROMPT.md`](../adapters/SYSTEM_PROMPT.md) into Grok's custom instructions instead.

## Other Agent Skills clients

Unzip `greybeard-skill.zip` (or copy `skills/greybeard/` from a clone) into the client's skills folder. The result must be `<skills folder>/greybeard/SKILL.md`.

## Tools without skill support

Paste [`adapters/SYSTEM_PROMPT.md`](../adapters/SYSTEM_PROMPT.md) into the tool's system, project or custom instructions. It is generated from SKILL.md. Without the playbook files it uses the built-in mode rules.

## Tuning it to you

Copy `skills/greybeard/assets/context-template.md` to `.greybeard/context.md` in your project and fill in what applies. Alternatively, paste it under a `## Greybeard context` heading in your project or user-level `CLAUDE.md` or `AGENTS.md`. See [`examples/crusher-labs.context.md`](../examples/crusher-labs.context.md).

## Check that it works

Ask something it should handle, for example: *"Is this app ready to launch? Keep it plain."* in a project folder.

Platform checks:
- **Claude Code:** `/plugin` should list `greybeard` as enabled, and `/mcp` should show no servers added by it. Greybeard bundles none.
- **Copilot CLI and Gemini CLI:** `/skills` should list `greybeard`.
- **Grok Build:** `grok inspect` should show it.
