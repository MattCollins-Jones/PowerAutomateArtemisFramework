# Power Automate Standards - MCP Server

This is a working MCP (Model Context Protocol) server implementation for the Power Automate Standards skill.

## What This Does

- Exposes the skill as MCP tools that a compatible host can call
- Provides `load_skill` tool to fetch the full skill content
- Provides `search_standards` tool to search for specific topics
- Makes skill resources available as MCP resources

## Installation

### From NPM
```bash
npm install power-automate-standards-mcp
```

### From Source
```bash
git clone https://github.com/MattCollins-Jones/PowerAutomateArtemisFramework.git
cd packages/mcp
npm install
```

## Usage with MCP-Compatible Host

### Configuration Example (Claude Desktop, etc.)
```json
{
  "mcpServers": {
    "power-automate-standards": {
      "command": "node",
      "args": [
        "/path/to/server.js"
      ]
    }
  }
}
```

### Programmatic Usage
```javascript
const { spawn } = require('child_process');

const server = spawn('node', ['server.js']);

server.on('message', (msg) => {
  if (msg.type === 'tool_result') {
    console.log('Tool result:', msg.result);
  }
});

// Call a tool
server.send({
  type: 'tool_call',
  toolName: 'load_skill',
  toolInput: { sessionId: 'my-session' }
});
```

## Available Tools

### load_skill
Loads the complete Power Automate Standards skill content.

**Input:**
```json
{
  "sessionId": "optional-session-id"
}
```

**Output:**
```json
{
  "success": true,
  "skill": "full-skill-content-here",
  "sessionId": "optional-session-id",
  "timestamp": "2026-08-11T22:10:00Z"
}
```

### search_standards
Searches the skill content for a specific topic or keyword.

**Input:**
```json
{
  "query": "naming"
}
```

**Output:**
```json
{
  "success": true,
  "query": "naming",
  "resultsCount": 5,
  "results": [
    {
      "lineNumber": 42,
      "content": "Rule: Name things so the intent is obvious",
      "context": "surrounding lines..."
    }
  ]
}
```

## Architecture

- `server.js` — MCP server implementation with tool handlers
- `package.json` — server metadata and tool definitions
- Loads skill from `../../skills/power-automate-standards/SKILL.md`
- Communicates via message passing for MCP protocol

## Dependencies

- node (>=14.0.0)
- fs, path (built-in)

## Future Enhancements

- More sophisticated search (regex, field-specific)
- Streaming large skill content
- Real-time skill updates
- Schema validation and type checking
