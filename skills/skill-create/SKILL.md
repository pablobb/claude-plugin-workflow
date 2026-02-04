# Skill Create from Git History

Analyze git history to auto-generate project-specific skills based on commit patterns and conventions.

## Usage
```
/workflow:skill-create [--output=<path>] [--commits=<n>]
```

## Options
- `--output=<path>` - Where to save generated skills (default: `.claude/skills/`)
- `--commits=<n>` - Number of commits to analyze (default: 100)

## What This Does

1. Analyzes git commit history for patterns
2. Identifies recurring conventions and workflows
3. Generates SKILL.md files for discovered patterns
4. Creates project-specific coding guidelines

## Input
$ARGUMENTS

---

## Instructions

You are analyzing git history to extract project conventions and create reusable skills.

### Step 1: Gather Git Data

```bash
# Get recent commits with stats
git log --oneline -n 100 --stat

# Get commit message patterns
git log --oneline -n 100 | cut -d' ' -f2- | sort | uniq -c | sort -rn | head -20

# Get frequently changed files together
git log --name-only --pretty=format: -n 50 | sort | uniq -c | sort -rn | head -30

# Get commit message prefixes (conventional commits)
git log --oneline -n 100 | grep -oE '^[a-f0-9]+ [a-z]+(\([^)]+\))?:' | cut -d: -f1 | cut -d' ' -f2 | sort | uniq -c | sort -rn
```

### Step 2: Identify Patterns

Look for:

#### Commit Message Conventions
```bash
# Check for conventional commits
git log --oneline -n 50 | head -10
# Look for: feat:, fix:, chore:, docs:, refactor:, test:, etc.
```

#### File Co-Change Patterns
```bash
# Files that change together often indicate architectural patterns
git log --name-only --pretty=format: -n 30 | xargs -n2 echo 2>/dev/null | sort | uniq -c | sort -rn | head -10
```

#### Directory Structure Patterns
```bash
# Understand project organization
find . -type d -not -path '*/\.*' -not -path '*/node_modules/*' -not -path '*/vendor/*' | head -30
```

#### Testing Patterns
```bash
# How tests are organized
find . -name "*.test.*" -o -name "*.spec.*" -o -name "*_test.*" 2>/dev/null | head -20
```

### Step 3: Generate Skills

Create skill files based on discovered patterns.

#### Commit Convention Skill
If conventional commits detected:

```markdown
# Commit Conventions

## Pattern
This project uses conventional commits.

## Prefixes
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Maintenance

## Scope
Use scope for affected area: `feat(auth):`, `fix(api):`

## Examples from this repo
<actual examples from git log>
```

#### Architecture Skill
Based on directory structure:

```markdown
# Project Architecture

## Structure
<detected structure>

## Patterns
- <where services go>
- <where tests go>
- <where types go>

## File Naming
<detected naming conventions>
```

#### Workflow Skill
Based on co-change patterns:

```markdown
# Development Workflow

## Common Changes
When modifying X, also update:
- Y (co-changed 80% of time)
- Z (co-changed 60% of time)

## Test Requirements
<detected test patterns>
```

### Step 4: Save Skills

```bash
# Create output directory
mkdir -p .claude/skills

# Save each skill
# File: .claude/skills/<skill-name>.md
```

### Step 5: Report

```
┌─────────────────────────────────────────────────────────┐
│ SKILLS GENERATED FROM GIT HISTORY                       │
├─────────────────────────────────────────────────────────┤
│ Analyzed: 100 commits                                   │
│ Patterns detected: 5                                    │
│                                                         │
│ Skills Created:                                         │
│ ✓ .claude/skills/commit-conventions.md                  │
│ ✓ .claude/skills/project-architecture.md                │
│ ✓ .claude/skills/testing-patterns.md                    │
│ ✓ .claude/skills/file-naming.md                         │
│                                                         │
│ Key Findings:                                           │
│ • Uses conventional commits (feat/fix/chore)            │
│ • Tests co-located with source files                    │
│ • Service-repository pattern detected                   │
│                                                         │
│ These skills will be auto-loaded for this project.      │
└─────────────────────────────────────────────────────────┘
```

## Example Output

### commit-conventions.md
```markdown
# Commit Conventions

> Generated: 2024-01-15
> Source: Git history analysis (100 commits)

## Format

This project uses **conventional commits**.

## Detected Prefixes (by frequency)

| Prefix | Count | Usage |
|--------|-------|-------|
| feat | 35 | New features |
| fix | 28 | Bug fixes |
| chore | 15 | Maintenance |
| docs | 12 | Documentation |
| refactor | 10 | Refactoring |

## Scopes Used

- `(api)` - API changes
- `(ui)` - Frontend changes
- `(auth)` - Authentication
- `(db)` - Database

## Real Examples

```
feat(api): add user registration endpoint
fix(auth): resolve token refresh race condition
chore: update dependencies to latest versions
```
```

### project-architecture.md
```markdown
# Project Architecture

> Generated: 2024-01-15
> Source: Git history + directory analysis

## Directory Structure

```
src/
├── api/          # API routes and controllers
├── services/     # Business logic
├── repositories/ # Data access
├── models/       # Data models/types
├── utils/        # Shared utilities
└── config/       # Configuration
```

## Patterns

### Service-Repository Pattern
- Services contain business logic
- Repositories handle data persistence
- Controllers orchestrate requests

### Co-Change Patterns
When modifying a service, these files typically change together:
- `src/services/*.ts` + `src/repositories/*.ts` (85%)
- `src/api/*.ts` + `src/services/*.ts` (72%)
- `*.ts` + `*.test.ts` (68%)

## Naming Conventions

- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
```

## When to Run

- **Once per project** - Run when starting work on a new codebase
- **After major changes** - Re-run after significant architectural changes
- **Periodically** - Monthly refresh to capture evolving patterns

## Integration

Generated skills are automatically loaded by Claude Code when working in the project directory. They complement the codebase-analyzer context with historical patterns.
