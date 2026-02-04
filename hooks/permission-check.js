#!/usr/bin/env node
/**
 * Workflow permission check hook (cross-platform)
 * Called by PreToolUse hook for Bash commands
 * Blocks dangerous commands, allows workflow operations
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Read hook input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    processHook(input);
  } catch (err) {
    // On error, let Claude Code's normal permission system handle it
    process.exit(0);
  }
});

function processHook(rawInput) {
  let hookData;
  try {
    hookData = JSON.parse(rawInput);
  } catch {
    // Invalid JSON, let normal permission system handle
    process.exit(0);
  }

  const command = hookData?.tool_input?.command || '';
  if (!command) {
    process.exit(0);
  }

  // Check if we're in an active workflow
  const inWorkflow = checkActiveWorkflow();

  // ALWAYS BLOCKED - regardless of mode
  const blockedStartPatterns = [
    'git push',
    'git reset --hard',
    'sudo rm',
  ];

  const blockedAnywherePatterns = [
    'rm -rf /',
    'rm -rf ~',
    'rm -rf $HOME',
    'rm -rf %USERPROFILE%',  // Windows
    ':(){:|:&};:',
    'mkfs',
    'dd if=',
    '> /dev/sd',
    'format c:',  // Windows
    'del /f /s /q c:',  // Windows
  ];

  // Check blocked patterns at start
  for (const pattern of blockedStartPatterns) {
    if (command.startsWith(pattern)) {
      outputDecision('deny', `Blocked: ${pattern} is not allowed. User must run manually.`);
      return;
    }
  }

  // Check blocked patterns anywhere
  for (const pattern of blockedAnywherePatterns) {
    if (command.includes(pattern)) {
      outputDecision('deny', `Blocked: ${pattern} is not allowed. User must run manually.`);
      return;
    }
  }

  // SAFE COMMANDS - always auto-approve
  const safeCommands = [
    // Git (read operations and branch management)
    'git branch',
    'git checkout -b',
    'git switch -c',
    'git stash',
    'git status',
    'git diff',
    'git log',
    'git add',
    'git commit',
    'git worktree',
    // Package managers
    'npm',
    'npx',
    'yarn',
    'pnpm',
    'composer',
    'pip',
    'cargo',
    // Validation commands
    'php -l',
    'python -m py_compile',
    'python3 -m py_compile',
    'python -c',
    'python3 -c',
    'node -e',
    'node --check',
    'tsc --noEmit',
    'eslint',
    'prettier',
    // Read operations (Unix)
    'ls',
    'find',
    'head',
    'tail',
    'cat',
    'wc',
    'grep',
    'pwd',
    'which',
    'type',
    'file',
    'stat',
    // Read operations (Windows)
    'dir',
    'where',
    'findstr',
    // Safe file operations
    'mkdir',
    'cp',
    'mv',
    'touch',
    'echo',
    'test',
    '[',
    // Windows equivalents
    'copy',
    'move',
    'md',
    'xcopy',
  ];

  for (const allowed of safeCommands) {
    if (command.startsWith(allowed)) {
      outputDecision('allow', 'Auto-approved safe command');
      return;
    }
  }

  // For all other commands, let Claude Code's normal permission system handle it
  process.exit(0);
}

function checkActiveWorkflow() {
  const homeDir = os.homedir();
  const workflowDir = path.join(homeDir, '.claude', 'workflows', 'active');

  try {
    if (!fs.existsSync(workflowDir)) {
      return false;
    }

    const files = fs.readdirSync(workflowDir)
      .filter(f => f.endsWith('.org'))
      .map(f => {
        const fullPath = path.join(workflowDir, f);
        const stat = fs.statSync(fullPath);
        return { path: fullPath, mtime: stat.mtimeMs };
      })
      .sort((a, b) => b.mtime - a.mtime);

    if (files.length === 0) {
      return false;
    }

    // Check if most recent workflow was updated in last 30 minutes
    const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
    return files[0].mtime > thirtyMinutesAgo;
  } catch {
    return false;
  }
}

function outputDecision(decision, reason) {
  const output = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: decision,
      permissionDecisionReason: reason
    }
  };
  console.log(JSON.stringify(output));
  process.exit(0);
}
