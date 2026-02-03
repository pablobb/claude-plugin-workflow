# Auto Mode Detection Patterns

This document defines the keyword patterns and complexity indicators used for automatic mode selection.

## Explicit Mode Triggers

These keywords at the START of the task description immediately select the mode:

### Thorough Mode
```
thorough:
careful:
production:
prod:
critical:
audit:
secure:
```

Example: `thorough: implement payment processing`

### Turbo Mode
```
quick:
fast:
prototype:
draft:
spike:
poc:
try:
experiment:
```

Example: `quick: prototype a webhook handler`

### Eco Mode
```
eco:
budget:
simple:
minor:
tiny:
trivial:
```

Example: `eco: fix typo in error message`

## Natural Language Triggers

These phrases anywhere in the description influence mode selection:

### Thorough Mode Phrases
- "make sure it's perfect"
- "production ready"
- "security critical"
- "needs thorough review"
- "this is important"
- "cannot have bugs"
- "compliance requirement"
- "audit trail"
- "no mistakes"

### Turbo Mode Phrases
- "just get it working"
- "rough draft"
- "proof of concept"
- "don't worry about edge cases"
- "quick and dirty"
- "throwaway code"
- "experiment with"

### Eco Mode Phrases
- "small change"
- "quick fix"
- "one liner"
- "simple update"
- "just rename"
- "minor tweak"

## Complexity Keywords

### HIGH Complexity (→ thorough)
Security & Auth:
- auth, authentication, authorize, authorization
- login, logout, session, token, jwt, oauth
- password, credential, secret, key
- permission, role, access control, rbac
- encrypt, decrypt, hash, salt, crypto

Financial:
- payment, billing, invoice, subscription
- transaction, refund, charge, stripe, paypal
- money, currency, price, cost

Data & Infrastructure:
- migrate, migration, schema, database
- infrastructure, deploy, kubernetes, docker
- api (when modifying), endpoint, contract
- queue, kafka, rabbitmq, redis

Compliance:
- gdpr, pii, hipaa, sox, pci
- audit, compliance, regulation
- data protection, privacy

### MEDIUM Complexity (→ standard)
Features:
- feature, implement, add, create, build
- component, module, service, handler
- refactor, restructure, reorganize
- integrate, connect, hook

Bugs:
- bug, fix, issue, error, exception
- broken, failing, crash

Testing:
- test, spec, coverage, mock

### LOW Complexity (→ eco)
Documentation:
- doc, docs, readme, comment
- typo, spelling, grammar

Cosmetic:
- style, css, color, font, spacing
- rename, move, reorganize (files only)
- config, configuration, env, environment

Minor:
- text, label, message, string
- log, logging, debug
- bump, update version

## File Pattern Triggers

Certain file paths indicate complexity:

### HIGH (→ thorough)
```
**/auth/**
**/security/**
**/payment/**
**/billing/**
**/migrations/**
**/infrastructure/**
**/deploy/**
**.env**
**/*secret*
**/*credential*
```

### LOW (→ eco)
```
README.md
CHANGELOG.md
docs/**
*.css (only)
*.md (only)
.gitignore
```

## Scope-Based Adjustment

### File Count Impact
- 1 file: -1 complexity
- 2-5 files: no change
- 6-10 files: +1 complexity
- 11+ files: +2 complexity

### Line Count Impact (estimated)
- < 50 lines: -1 complexity
- 50-200 lines: no change
- 200-500 lines: +1 complexity
- 500+ lines: +2 complexity

## Override Rules

1. **Security keywords ALWAYS win** - Any security-related keyword bumps to thorough
2. **Explicit prefix ALWAYS wins** - `quick:` overrides even security keywords
3. **User flag ALWAYS wins** - `--mode=eco` overrides everything

## Decision Matrix

| Thorough Score | Standard Score | Eco Score | Result |
|----------------|----------------|-----------|--------|
| ≥ 4 | any | any | thorough |
| 2-3 | any | any | thorough |
| 1 | ≥ 2 | any | standard |
| 0 | ≥ 1 | any | standard |
| 0 | 0 | ≥ 2 | eco |
| 0 | 0 | 0-1 | standard |

## Examples

### "Add user authentication with JWT tokens"
- Keywords: auth (+2), JWT (+2), token (+1)
- Thorough score: 5
- **Result: thorough**

### "Fix button alignment on login page"
- Keywords: fix (+1), style implied (+1 eco)
- login page (not auth logic)
- **Result: eco**

### "Refactor the payment service to use Stripe"
- Keywords: refactor (+1), payment (+2), service (+1)
- Thorough score: 3
- **Result: thorough**

### "quick: Add a debug endpoint"
- Explicit prefix: quick
- **Result: turbo** (overrides any analysis)

### "Update README with new installation steps"
- Keywords: README (+1 eco), docs implied
- **Result: eco**
