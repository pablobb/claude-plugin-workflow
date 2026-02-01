# Workflow Status

Check the status of active or recent workflows.

## Usage
```
/workflow-status [workflow_id]
```

## Input
$ARGUMENTS

## Instructions

### 1. List Active Workflows

If no `$ARGUMENTS` provided, list all active workflows:

```bash
ls -la ~/.claude/workflows/active/*.org
```

For each workflow, extract and display:
- Workflow ID
- Type
- Description (first line)
- Current step
- Started at
- Last updated

### 2. Show Specific Workflow

If `$ARGUMENTS` contains a workflow ID:

1. Read the full org file
2. Parse all steps and their statuses
3. Display a summary:

```
Workflow: <ID>
Type: <type>
Description: <description>
Branch: <branch>
Started: <timestamp>
Status: <active|paused|completed>

Steps:
  [✓] Step 0: Planning - completed
  [✓] Step 1: Implementation - completed
  [→] Step 2: Code Review - in progress (iteration 2/3)
  [ ] Step 3: Security Audit - pending
  [ ] Step 4: Test Writing - pending
  [ ] Step 5: Completion - pending

Current: Code Review (iteration 2, found 3 issues)

Org file: ~/.claude/workflows/active/<id>.org
```

### 3. Show Recent Completed

If `$ARGUMENTS` is "completed" or "history":

```bash
ls -la ~/.claude/workflows/completed/*.org
```

Show last 5 completed workflows with their summaries.
