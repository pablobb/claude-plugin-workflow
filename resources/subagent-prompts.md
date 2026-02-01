# Subagent Prompt Templates

Use these templates when invoking subagents. Customize with actual values.

## Planning Agent

```
subagent_type: Plan
prompt: |
  ## Task
  Create a detailed implementation plan for: {task_description}

  ## Requirements
  1. Explore the codebase to understand existing patterns
  2. Identify all files that need to be created or modified
  3. Break down into specific, actionable steps
  4. Consider edge cases and error handling
  5. Note any dependencies or prerequisites

  ## Output
  Save your plan to: {plan_file_path}

  Format:
  - Overview of the feature/change
  - List of files to modify/create with specific changes
  - Implementation order (dependencies first)
  - Testing considerations
  - Potential risks or concerns
```

## Implementation Agent

```
subagent_type: focused-build
prompt: |
  ## Task
  Implement the following plan: {plan_file_path}

  ## Context
  Workflow ID: {workflow_id}
  Previous phase: Planning (completed)

  ## Instructions
  1. Read the plan file thoroughly
  2. Implement each step in order
  3. Follow existing code patterns in the codebase
  4. Do not add unnecessary features or abstractions
  5. Focus on clean, working code

  ## Previous Review Feedback (if any)
  {review_feedback}

  ## Output
  - Implement all changes
  - Report which files were modified/created
  - Note any deviations from the plan with justification
```

## Code Review Agent

```
subagent_type: review
prompt: |
  ## Task
  Review the implementation for: {task_description}

  ## Context
  Workflow ID: {workflow_id}
  Plan file: {plan_file_path}
  Changed files: {changed_files_list}
  Review iteration: {iteration_number}

  ## Review Criteria
  1. Does implementation match the plan?
  2. Code quality and readability
  3. Error handling
  4. Edge cases covered
  5. No unnecessary complexity
  6. Follows project conventions

  ## Output Format
  Provide a structured review:

  VERDICT: PASS or FAIL

  ISSUES (if FAIL):
  - [CRITICAL] issue description - file:line
  - [MAJOR] issue description - file:line
  - [MINOR] issue description - file:line

  SUGGESTIONS (optional improvements, not blocking):
  - suggestion description

  SUMMARY:
  Brief overall assessment
```

## Security Review Agent

```
subagent_type: security-auditor
prompt: |
  ## Task
  Security audit for: {task_description}

  ## Context
  Workflow ID: {workflow_id}
  Changed files: {changed_files_list}

  ## Audit Focus
  1. OWASP Top 10 vulnerabilities
  2. Input validation and sanitization
  3. Authentication/authorization issues
  4. Sensitive data exposure
  5. Injection vulnerabilities (SQL, command, XSS)
  6. Insecure dependencies

  ## Output Format
  VERDICT: PASS or FAIL

  FINDINGS:
  - [CRITICAL] vulnerability - file:line - remediation
  - [HIGH] vulnerability - file:line - remediation
  - [MEDIUM] vulnerability - file:line - remediation
  - [LOW] vulnerability - file:line - remediation

  RECOMMENDATIONS:
  - Security improvements not blocking but advised
```

## Test Writing Agent

```
subagent_type: test-writer
prompt: |
  ## Task
  Write tests for: {task_description}

  ## Context
  Workflow ID: {workflow_id}
  Implementation files: {changed_files_list}
  Existing test patterns: {test_directory}

  ## Requirements
  1. Follow existing test patterns in the project
  2. Cover happy path scenarios
  3. Cover edge cases and error conditions
  4. Use appropriate test framework (detect from project)
  5. Tests should be deterministic and isolated

  ## Output
  - Create test files following project conventions
  - Run the tests to verify they pass
  - Report test coverage if tooling available
```

## Notification Template

```
## Workflow Complete

**Workflow ID:** {workflow_id}
**Type:** {workflow_type}
**Task:** {task_description}
**Duration:** {duration}

### Summary
{brief_summary}

### Changes Made
| File | Action | Description |
|------|--------|-------------|
{file_changes_table}

### Tests
- Tests created: {test_count}
- All tests passing: {tests_pass}

### Review History
- Code review iterations: {review_iterations}
- Security review iterations: {security_iterations}

### Next Steps
1. Review the changes manually
2. Run integration tests if applicable
3. Test in staging environment
4. Merge when satisfied

### Artifacts
- Plan: {plan_file_path}
- State: .claude/workflow-state.json
```
