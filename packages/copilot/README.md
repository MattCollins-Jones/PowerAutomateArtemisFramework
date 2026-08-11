# Power Automate Standards - GitHub Copilot Skill Package

This is the GitHub Copilot-compatible package for the Power Automate Standards skill.

## What This Does

- Exposes the skill in a GitHub Copilot-compatible format
- Provides metadata for Copilot's skill discovery and loading system
- Declares capabilities (knowledge, coding standards, flow design, review)
- Specifies supported hosts and compatibility targets

## Installation

### For GitHub Copilot Chat
1. Open GitHub Copilot Chat or IDE integration
2. Use the skill loader to import from:
   ```
   https://github.com/MattCollins-Jones/PowerAutomateArtemisFramework/releases/download/v1.2-copilot/power-automate-standards-1.2.0.zip
   ```
3. Select the `skills/power-automate-standards/SKILL.md` entry point
4. Confirm installation

### For Custom Copilot Extensions
```json
{
  "skills": [
    {
      "name": "power-automate-standards",
      "source": "https://github.com/MattCollins-Jones/PowerAutomateArtemisFramework",
      "version": "1.2.0"
    }
  ]
}
```

### From Source
```bash
git clone https://github.com/MattCollins-Jones/PowerAutomateArtemisFramework.git
# Use the skill at packages/copilot/
```

## Usage

Once installed, the skill is automatically available when:
- You ask Copilot about Power Automate flows
- You request coding standards or best practices
- You want flow design guidance or review

Example prompts:
- "Review this Power Automate flow using the standards"
- "What naming conventions should I use for this flow?"
- "How should I structure error handling here?"

## Capabilities

- **knowledge**: Comprehensive Power Automate standards reference
- **coding-standards**: Rule-based flow design patterns
- **flow-design**: Architecture and design guidance
- **flow-review**: Best practice validation and feedback

## Supported Hosts

- GitHub Copilot (latest)
- Copilot Chat
- Copilot Extensions
- Custom Copilot-compatible agent hosts

## Package Contents

- `package.json` — Copilot skill metadata and capabilities
- `../../../skills/power-automate-standards/` — actual skill files
- Documentation for installation and usage

## Version

Current version: **1.2.0**

- Major version changes indicate breaking changes to structure
- Minor version changes add new standards or sections
- Patch version changes are clarifications and bug fixes

## Support

- Repository: https://github.com/MattCollins-Jones/PowerAutomateArtemisFramework
- Issues: https://github.com/MattCollins-Jones/PowerAutomateArtemisFramework/issues
- Wiki: https://github.com/MattCollins-Jones/PowerAutomateArtemisFramework/wiki
