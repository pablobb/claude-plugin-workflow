# Resume Workflow

Resume an interrupted or paused workflow from its current state.

## Usage
```
/workflow-resume [workflow_id]
```

If no workflow_id is provided, resumes the most recent active workflow.

## Input
$ARGUMENTS

## Instructions

You are the **supervisor agent** resuming a workflow.

### 1. Find the Workflow

First, get the absolute home path:
```bash
echo $HOME
```

Then find the workflow file. **Never use `~` in tool calls** - always use the absolute path:
```
Glob(pattern="<HOME>/.claude/workflows/active/*")
```
(Replace `<HOME>` with the actual path, e.g., `/home/zashboy`)

- If `$ARGUMENTS` is empty: Find most recent `.org` or `.md` file in the active directory
- If `$ARGUMENTS` provided: Look for matching workflow ID

### 2. Read and Parse the Org File

Read the workflow org file and determine:
- Which step is currently in progress (has STARTED_AT but no COMPLETED_AT)
- Which step is next (first TODO step after completed ones)
- Any pending review iterations
- The original task description

### 3. Report Status to User

Before resuming, output:
```
Resuming workflow: <ID>
Type: <workflow_type>
Task: <description>
Current step: <step_name>
Progress: <X of Y steps completed>
```

### 4. Check for User Modifications

Ask the user:
> "I found the workflow at step X. Before continuing:
> - Have you modified the plan or any step in the org file?
> - Do you want to add any instructions before I continue?
> - Or should I proceed from where we left off?"

### 5. Continue Execution

Once user confirms:
- Read any modifications from the org file
- Continue from the current step
- Follow the same workflow logic as the main `/workflow` command
- Update the org file after each step

### 6. Handle Partial Steps

If a step was started but not completed:
- Ask user if they want to restart that step or skip it
- "Step 2 (Code Review) was started but not completed. Should I:
   a) Restart it from the beginning
   b) Skip it and move to the next step
   c) Mark it as complete (if you finished it manually)"
