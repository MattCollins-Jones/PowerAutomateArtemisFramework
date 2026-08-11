# Power Automate Standards Skill - Generic Package

This is the canonical, host-agnostic package for the Power Automate Standards skill.

## Installation

### From GitHub Release
```bash
# Download the release zip
unzip power-automate-standards-v1.2-generic.zip

# Copy to your tool's skill directory
cp -r power-automate-standards/skills/power-automate-standards /path/to/your/skills/
```

### From NPM (future)
```bash
npm install power-automate-standards
```

### From Git
```bash
git clone https://github.com/MattCollins-Jones/PowerAutomateArtemisFramework.git
cp -r PowerAutomateArtemisFramework/skills/power-automate-standards /path/to/your/skills/
```

## Usage

Once installed, the skill is available at:
```
skills/power-automate-standards/SKILL.md
```

Load this file into your AI assistant or agent, and it becomes available for Power Automate flow design and review tasks.

## What's Included

- `SKILL.md` — Main skill file with standards, rules, and patterns
- Supporting topic files covering:
  - Naming conventions
  - Variable and scope design
  - Error handling and logging
  - Performance and API calls
  - Security and secrets
  - Pagination and large data
  - Child flow contracts
  - And more

## Compatibility

This package works with any host that can:
- read Markdown files
- accept a file path as a skill/knowledge source
- feed the content to an AI model or agent

Tested/compatible with:
- Claude (via manual paste or file context)
- GitHub Copilot (with custom skill integration)
- Generic AI agents and chatbots
- MCP-compatible hosts (with appropriate loader)

## Updates

Check releases for new versions:
https://github.com/MattCollins-Jones/PowerAutomateArtemisFramework/releases

Version bumps follow semantic versioning:
- PATCH: typo fixes, clarifications
- MINOR: new standards or sections
- MAJOR: breaking changes to structure or terminology
