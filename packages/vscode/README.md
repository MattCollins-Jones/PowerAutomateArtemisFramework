# Power Automate Standards - VS Code Extension

This is a working VS Code extension package for the Power Automate Standards skill.

## What This Does

- Adds a VS Code command to open the Power Automate Standards skill
- Displays the skill markdown in a webview panel
- Provides an explorer view for browsing standards topics

## Installation

### From VSIX (Recommended)
```bash
code --install-extension power-automate-standards-1.2.0.vsix
```

### From Source
```bash
npm install
npm run build
code --install-extension
```

### From GitHub
```bash
git clone https://github.com/MattCollins-Jones/PowerAutomateArtemisFramework.git
cd packages/vscode
npm install
npm run build
code --install-extension
```

## Building the Extension

```bash
npm install
npm run build
# Creates power-automate-standards-1.2.0.vsix
```

## Usage

In VS Code:
1. Open the command palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "Open Power Automate Standards Skill"
3. The skill opens in a side panel with full markdown rendering

## Architecture

- `extension.js` — main extension entry point and command handler
- `package.json` — VS Code extension manifest with commands and views
- Reads skill content from `../../skills/power-automate-standards/SKILL.md`
- Uses `marked.js` for markdown rendering in a webview

## Dependencies

- vscode (built-in)
- marked (CDN-loaded for markdown parsing)

## Future Enhancements

- Topic-based tree view for browsing standards
- Search across standards
- Quick reference panel
- Integration with flow designer for inline hints
