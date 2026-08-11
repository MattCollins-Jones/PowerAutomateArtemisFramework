const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let skillPanel = undefined;

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    'powerAutomateStandards.openSkill',
    () => {
      if (skillPanel) {
        skillPanel.reveal(vscode.ViewColumn.Beside);
      } else {
        skillPanel = vscode.window.createWebviewPanel(
          'powerAutomateSkill',
          'Power Automate Standards Skill',
          vscode.ViewColumn.Beside,
          { enableScripts: true }
        );

        const skillPath = path.join(
          context.extensionPath,
          '..',
          '..',
          'skills',
          'power-automate-standards',
          'SKILL.md'
        );

        try {
          const skillContent = fs.readFileSync(skillPath, 'utf8');
          skillPanel.webview.html = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; padding: 20px; }
                  pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
                  code { font-family: 'Courier New', monospace; }
                  h1, h2, h3 { color: #0066cc; }
                  table { border-collapse: collapse; width: 100%; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                </style>
              </head>
              <body>
                <div id="content"></div>
                <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
                <script>
                  document.getElementById('content').innerHTML = marked.parse(\`${skillContent.replace(/`/g, '\\`')}\`);
                <\/script>
              </body>
            </html>
          `;
        } catch (err) {
          skillPanel.webview.html = `<p>Error loading skill: ${err.message}</p>`;
        }

        skillPanel.onDidDispose(() => {
          skillPanel = undefined;
        });
      }
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
