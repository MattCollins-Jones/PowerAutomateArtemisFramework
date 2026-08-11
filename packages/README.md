# Installable Packages for Power Automate Standards Skill

This folder contains complete, installable package distributions for different ecosystems.

## What's Here

### Generic Package (`generic/`)
- **package.json** — NPM/generic package metadata
- **INSTALL.md** — Installation instructions for multiple platforms
- **Use case**: Generic AI agents, Claude, or any host that accepts Markdown skills

### VS Code Extension (`vscode/`)
- **package.json** — VS Code extension manifest
- **extension.js** — Actual extension code that opens the skill in a webview
- **README.md** — Build and installation instructions
- **Use case**: VS Code users who want an integrated skill viewer
- **Status**: Installable now; requires `npm install` and `npm run build` to create `.vsix`

### MCP Server (`mcp/`)
- **package.json** — MCP server manifest with tool definitions
- **server.js** — Working MCP server implementation with `load_skill` and `search_standards` tools
- **README.md** — Installation and usage instructions
- **Use case**: MCP-compatible hosts (Claude Desktop, custom agents, etc.)
- **Status**: Installable now; run with `node server.js`

### GitHub Copilot (`copilot/`)
- **package.json** — Copilot-style skill metadata
- **README.md** — Installation and capability documentation
- **Use case**: GitHub Copilot, Copilot Chat, Copilot Extensions
- **Status**: Installable metadata; awaiting native Copilot host support

## How They Differ

| Package | Entry Point | Runtime | Installation | Status |
|---------|------------|---------|--------------|--------|
| Generic | Markdown file | None (metadata only) | Copy/download | Production-ready |
| VS Code | extension.js | Node.js + Electron | VSIX or source build | Production-ready |
| MCP | server.js | Node.js stdio | npm + node command | Production-ready |
| Copilot | Skill metadata | Copilot host | Platform-specific | Awaiting host support |

## Quick Start

### Use the Generic Package
```bash
# Download from release
unzip power-automate-standards-v1.2-generic.zip
cp -r power-automate-standards/skills/power-automate-standards /path/to/your/skills/
```

### Use the MCP Server
```bash
cd packages/mcp
npm install
node server.js
```

### Build the VS Code Extension
```bash
cd packages/vscode
npm install
npm run build
# Creates power-automate-standards-1.2.0.vsix
code --install-extension power-automate-standards-1.2.0.vsix
```

### Use with GitHub Copilot
1. When Copilot skill import is available, use the Copilot package
2. Point to the v1.2-copilot release
3. Select `skills/power-automate-standards/SKILL.md` as the entry point

## Next Steps

1. **Test the MCP server**: Run it and verify the tools respond
2. **Build the VS Code extension**: Run `npm run build` to create a .vsix file
3. **Publish to registries**: When ready, publish to npm, VS Code Marketplace, etc.
4. **Integration with Copilot**: Coordinate with GitHub when native skill support is available

## Versioning

All packages version together and follow semantic versioning:
- PATCH (1.2.x): Clarifications, bug fixes
- MINOR (1.x.0): New standards, new topics
- MAJOR (x.0.0): Breaking changes

## Architecture

All packages reference the same skill source at `../../skills/power-automate-standards/SKILL.md`:
- Single source of truth for content
- Changes to the skill are reflected in all packages
- Version bumps in each package.json are synchronized
