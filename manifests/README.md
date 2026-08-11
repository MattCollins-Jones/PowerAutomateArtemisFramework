# Manifest bundles

This folder contains a small set of ecosystem-specific manifest examples for the same skill package.

Available packages:

- `generic/power-automate-standards.manifest.json` — generic package/skill metadata
- `vscode/power-automate-standards.vscode.json` — VS Code extension-style manifest
- `copilot/power-automate-standards.copilot.json` — GitHub Copilot-style metadata bundle
- `mcp/power-automate-standards.mcp.json` — MCP-style server metadata

These are packaging templates for distribution. They do not automatically grant native support in an ecosystem; the host or marketplace must understand the manifest format.

Use the generic manifest as the canonical source of truth for the skill itself, and use the ecosystem-specific manifests when packaging the same content for a target host.
