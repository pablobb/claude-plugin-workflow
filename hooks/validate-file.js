#!/usr/bin/env node
/**
 * File validation hook (cross-platform)
 * Called by PostToolUse hook after Edit/Write operations
 * Validates syntax for TypeScript, PHP, Python, and JSON files
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get file path from environment variable
const filePath = process.env.CLAUDE_FILE_PATH;

if (!filePath) {
  // No file path, nothing to validate
  process.exit(0);
}

const ext = path.extname(filePath).toLowerCase();

// Determine validation command based on file extension
const validators = {
  // TypeScript
  '.ts': { cmd: 'npx', args: ['tsc', '--noEmit', '--skipLibCheck'] },
  '.tsx': { cmd: 'npx', args: ['tsc', '--noEmit', '--skipLibCheck'] },

  // PHP
  '.php': { cmd: 'php', args: ['-l', filePath] },

  // Python
  '.py': { cmd: getPythonCommand(), args: ['-m', 'py_compile', filePath] },

  // JSON (use Node.js directly)
  '.json': { cmd: 'node', args: ['-e', `JSON.parse(require('fs').readFileSync('${filePath.replace(/\\/g, '\\\\')}', 'utf8'))`] },
};

// Get appropriate validator
const validator = validators[ext];

if (!validator) {
  // No validator for this file type
  process.exit(0);
}

// Check if the validation command exists
if (!commandExists(validator.cmd)) {
  // Command not available, skip validation silently
  process.exit(0);
}

// Run validation
runValidation(validator.cmd, validator.args, filePath);

function getPythonCommand() {
  // Try python3 first (Unix), then python (Windows/some systems)
  if (commandExists('python3')) {
    return 'python3';
  }
  return 'python';
}

function commandExists(cmd) {
  try {
    const isWindows = process.platform === 'win32';
    const checkCmd = isWindows ? 'where' : 'which';
    const result = require('child_process').spawnSync(checkCmd, [cmd], {
      encoding: 'utf8',
      timeout: 5000,
      shell: isWindows
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

function runValidation(cmd, args, file) {
  const isWindows = process.platform === 'win32';
  const fileName = path.basename(file);

  const proc = spawn(cmd, args, {
    encoding: 'utf8',
    timeout: 15000,
    shell: isWindows,
    cwd: path.dirname(file) || process.cwd()
  });

  let stdout = '';
  let stderr = '';

  proc.stdout.on('data', data => stdout += data);
  proc.stderr.on('data', data => stderr += data);

  proc.on('close', code => {
    const output = (stdout + stderr).trim();

    if (code !== 0 && output) {
      // Filter output to show only relevant lines (containing the filename)
      const relevantLines = output
        .split('\n')
        .filter(line => line.includes(fileName) || line.includes('error') || line.includes('Error'))
        .slice(0, 5)
        .join('\n');

      if (relevantLines) {
        console.error(`Validation errors in ${fileName}:\n${relevantLines}`);
      }
    }

    // Always exit 0 - we don't want to block the operation
    // Just report errors for awareness
    process.exit(0);
  });

  proc.on('error', () => {
    // Command failed to run, exit silently
    process.exit(0);
  });

  // Handle timeout
  setTimeout(() => {
    proc.kill();
    process.exit(0);
  }, 15000);
}
