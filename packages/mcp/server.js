#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class PowerAutomateStandardsServer {
  constructor() {
    this.skillPath = path.join(__dirname, '..', '..', 'skills', 'power-automate-standards', 'SKILL.md');
    this.skillContent = null;
    this.loadSkill();
  }

  loadSkill() {
    try {
      this.skillContent = fs.readFileSync(this.skillPath, 'utf8');
    } catch (err) {
      console.error(`Error loading skill: ${err.message}`);
      process.exit(1);
    }
  }

  async handleToolCall(toolName, toolInput) {
    switch (toolName) {
      case 'load_skill':
        return this.loadSkillTool(toolInput);
      case 'search_standards':
        return this.searchStandardsTool(toolInput);
      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  }

  loadSkillTool(input) {
    if (!this.skillContent) {
      return { error: 'Skill not loaded' };
    }
    return {
      success: true,
      skill: this.skillContent,
      sessionId: input.sessionId || null,
      timestamp: new Date().toISOString()
    };
  }

  searchStandardsTool(input) {
    if (!this.skillContent || !input.query) {
      return { error: 'Invalid search input' };
    }

    const query = input.query.toLowerCase();
    const lines = this.skillContent.split('\n');
    const results = [];

    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(query)) {
        results.push({
          lineNumber: index + 1,
          content: line.trim(),
          context: lines.slice(Math.max(0, index - 1), Math.min(lines.length, index + 2)).join('\n')
        });
      }
    });

    return {
      success: true,
      query: input.query,
      resultsCount: results.length,
      results: results.slice(0, 10)
    };
  }

  async start() {
    console.log('Power Automate Standards MCP Server starting...');
    console.log(`Loaded skill from: ${this.skillPath}`);

    if (process.stdin.isTTY) {
      console.log('Server ready. Available tools:');
      console.log('  - load_skill: Load the full Power Automate Standards');
      console.log('  - search_standards: Search for a topic or keyword');
      console.log('\nWaiting for MCP host connection...');
    }
  }
}

const server = new PowerAutomateStandardsServer();
server.start().catch(err => {
  console.error('Server error:', err);
  process.exit(1);
});

process.on('message', async (message) => {
  if (message.type === 'tool_call') {
    const result = await server.handleToolCall(message.toolName, message.toolInput);
    process.send({ type: 'tool_result', result });
  }
});
