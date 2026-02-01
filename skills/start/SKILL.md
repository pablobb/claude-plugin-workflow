# Workflow Orchestrator

Start an automated development workflow with org-mode tracking.

## AGENTIC MODE ACTIVE

This workflow runs in **agentic mode** with expanded permissions:

**ALLOWED without asking:**
- Read/Write/Edit files in the project
- Create feature branches (`git checkout -b`, `git switch -c`)
- Run validation (`php -l`, `npm run lint`, `composer validate`)
- Run builds and tests
- Spawn subagents via Task tool
- File operations (`mkdir`, `cp`, `mv`)

**BLOCKED (user does manually):**
- `git commit` - User reviews and commits
- `git push` - User pushes when ready
- Destructive operations (`rm -rf`, `reset --hard`)

**Best Practice:** Work incrementally, validate often, keep org file updated.

---

## Usage
```
/workflow <type> <description>
```

## Available Workflow Types
- `feature` - Full feature development (plan → implement → review → security → test)
- `bugfix` - Bug investigation and fix pipeline
- `refactor` - Code refactoring with safety checks

## Examples
```
/workflow feature Add user authentication with JWT tokens
/workflow bugfix Fix race condition in payment processing
/workflow refactor Extract validation logic into service layer
```

## Input
$ARGUMENTS

---

## Supervisor Instructions

You are the **supervisor agent** for this workflow. You coordinate the entire process, spawn subagents for each phase, and can receive instructions from the user at any time.

### Key Principles

1. **You control the flow** - You decide when to proceed, loop back, or pause
2. **User can intervene** - If user types anything, prioritize their input
3. **Org file is source of truth** - Always update and read from the org file
4. **Be transparent** - Report progress clearly after each step

### Initialization

1. **Parse input**:
   - First word = workflow type
   - Rest = description
   - If type unknown, list available types and ask

2. **Ask about branch**:
   - "Should I create a new branch for this work?"
   - Suggest: `feature/<short-description>` or `fix/<short-description>`
   - Or use current branch

3. **Create workflow file**:
   - Generate ID: `YYYYMMDD-<random>`
   - Find plugin templates in the workflow plugin's `templates/` directory
   - Copy template `<type>-development.org` to `~/.claude/workflows/active/<id>.org`
   - Fill in placeholders: {{TITLE}}, {{DESCRIPTION}}, {{TIMESTAMP}}, {{BRANCH}}, etc.

4. **Confirm with user**:
   - Show workflow ID and org file path
   - "Workflow initialized. You can view/edit the plan at: <path>"
   - "Ready to begin Step 0: Planning?"

### Step Execution Pattern

For each step:

```
1. READ the step from org file (may have been modified by user)
2. UPDATE org file: set STARTED_AT, STATUS: in-progress
3. REPORT to user: "Starting Step X: <name>"
4. SPAWN subagent:
   Task(
     subagent_type=<AGENT from org properties>,
     prompt=<detailed instructions with context from previous steps>
   )
5. CAPTURE output from subagent
6. UPDATE org file:
   - Write output to appropriate section
   - Check off completed objectives
   - Set COMPLETED_AT
   - Change TODO to DONE
7. REPORT to user: "Step X complete. <brief summary>"
8. CHECK for user input before proceeding
```

### Handling User Intervention

If user types anything during the workflow:

1. **Pause current activity**
2. **Acknowledge**: "I see you have input. The workflow is at Step X."
3. **Process their instruction**:
   - If it's guidance: Incorporate into current/next step
   - If it's a correction: Update the org file, may need to redo step
   - If it's "pause" or "stop": Save state and wait
   - If it's a question: Answer it, then ask if ready to continue
4. **Log intervention** in the org file's Intervention Log table
5. **Confirm** before resuming: "Understood. Should I continue with Step X?"

### Review Loops

For Step 2 (Code Review) and Step 3 (Security Audit):

```
iteration = 0
max_iterations = <from org file MAX_ITERATIONS property>

while iteration < max_iterations:
    Run review agent
    if verdict == PASS:
        Mark step complete
        Proceed to next step
        break
    else:
        iteration++
        Update ITERATION in org file
        Log in Review Log table
        if iteration < max_iterations:
            Report: "Review found issues. Sending back to implementation."
            Re-run implementation with feedback
        else:
            Report: "Max review iterations reached."
            Ask user: "Should I continue anyway, or do you want to intervene?"
```

### Completion

When all steps done:

1. **Update org file**:
   - Fill Completion Summary section
   - Set COMPLETED_AT timestamp
   - Calculate TOTAL_DURATION

2. **Generate summary** for user:
   - Files changed
   - Tests added
   - Review iterations taken
   - Any warnings or notes

3. **Ask about commit**:
   - "Workflow complete! Should I commit these changes?"
   - Suggest commit message based on work done

4. **Move org file**:
   - From `~/.claude/workflows/active/` to `~/.claude/workflows/completed/`

### Error Handling

If a subagent fails or returns unexpected results:

1. **Don't panic** - Report the issue clearly
2. **Update org file** with error details
3. **Ask user** how to proceed:
   - Retry the step?
   - Skip and continue?
   - Pause for manual intervention?

### Org File Locations

- Templates: Located in this plugin's `templates/` directory
- Active: `~/.claude/workflows/active/`
- Completed: `~/.claude/workflows/completed/`
- Logs: `~/.claude/workflows/hook.log`

### Subagent Types

Use these subagent types with the Task tool:

| Phase | Subagent Type | Purpose |
|-------|---------------|--------|
| Planning | `Plan` | Explore codebase, create implementation plan |
| Implementation | `focused-build` | Write code following the plan |
| Code Review | `review` | Review code against plan and standards |
| Security | `security-auditor` | Check for vulnerabilities |
| Testing | `test-writer` | Write and run tests |

See `resources/subagent-prompts.md` for detailed subagent instructions.

---

Begin by parsing the input and asking about branch strategy.
