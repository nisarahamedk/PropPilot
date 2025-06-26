# Claude Code Command Engineering Scratchpad

_A comprehensive guide to writing surgical Claude Code commands and SDK patterns_

## Part I: Effective Claude Command Guidelines

### 1. Linguistic Precision Patterns

#### Action-Verb Specificity

```markdown
# Surgical Commands

- `refactor` → restructure code architecture
- `fix` → repair broken functionality
- `optimize` → improve performance/efficiency
- `validate` → verify correctness/compliance
- `extract` → isolate specific components
- `migrate` → convert between systems/versions
- `audit` → comprehensive security/quality review
```

#### Contextual Anchoring

```markdown
# Before (vague)

"Fix the auth code"

# After (surgical)

"Refactor the authentication logic in `src/auth/` to use dependency injection,
maintaining backward compatibility with existing session management"
```

#### Scoped Constraints

```markdown
# File-level constraints

"Only modify files matching pattern `*.service.ts` in the `src/api/` directory"

# Function-level constraints

"Target the `validateInput` function specifically, preserving existing error handling"

# Pattern-level constraints

"Apply to all React components using `useState` but exclude HOCs"
```

### 2. LLM Reliability Principles

#### Constraint Declaration (YAML Frontmatter)

```yaml
---
allowed-tools: Read, Edit, Bash(npm test)
scope: frontend/src/components/
max-files: 5
success-criteria: "TypeScript errors = 0, tests pass, no console warnings"
---
```

#### Conditional Logic Patterns

```markdown
# Branching logic

If TypeScript errors exist → fix them before proceeding
If tests exist → run them after changes
If no tests exist → create minimal test coverage
If pre-commit hooks fail → address violations before commit
```

#### Success Criteria Definition

```markdown
## Success Criteria

- [ ] All TypeScript errors resolved
- [ ] Existing tests maintain 100% pass rate
- [ ] No new console warnings/errors
- [ ] Code follows project style guide
- [ ] Performance metrics unchanged or improved
```

### 3. Instruction Following Maximization

#### Structured Prompt Architecture

```markdown
## Context

[Current state analysis]

## Objective

[Specific, measurable goal]

## Constraints

[Explicit limitations and requirements]

## Validation

[How to verify success]

## Rollback Plan

[What to do if things go wrong]
```

#### Explicit Expectation Setting

```markdown
# Template

Expected behavior: [Specific outcome]
Forbidden actions: [Explicit no-go list]
Edge cases to handle: [Specific scenarios]
Error handling: [How to handle failures]
```

### 4. Confusion Minimization Techniques

#### Single Responsibility Principle

```markdown
# Good: One clear objective

"Convert all class components in `src/ui/` to functional components using hooks"

# Bad: Multiple objectives

"Refactor components, fix bugs, add tests, and improve performance"
```

#### Disambiguation Patterns

```markdown
# When using ambiguous terms, provide explicit definitions

"Optimize" means: reduce bundle size by 20%
"Clean up" means: remove unused imports and dead code
"Modernize" means: upgrade to latest React patterns (hooks, suspense)
```

#### Context Hierarchy

```markdown
1. Primary Context: Current file/component being modified
2. Secondary Context: Related files that might be affected
3. Tertiary Context: Broader system implications
```

### 5. Context Management Strategies

#### Information Scoping

```markdown
# Relevant scope limiting

Focus on: authentication flow in `src/auth/`
Ignore: unrelated UI components
Consider: database session management implications
```

#### Cognitive Load Reduction

```markdown
# Break complex tasks into phases

Phase 1: Analyze current implementation
Phase 2: Design new architecture  
Phase 3: Implement core changes
Phase 4: Add error handling
Phase 5: Validate and test
```

### 6. Side Quest Prevention

#### Focus Directives

```markdown
# Explicit focus boundaries

Primary task: Implement user authentication
Do NOT: Redesign UI components
Do NOT: Optimize database queries  
Do NOT: Add new features beyond scope
```

#### Scope Containment

```markdown
# If you discover related issues:

1. Note them in comments
2. Complete primary objective first
3. Ask user about addressing related issues
```

## Part II: Claude CLI Usage Patterns

### 1. CLI Command Reference

#### Essential Commands

```bash
# Interactive modes
claude                           # Start REPL
claude "initial prompt"          # REPL with context
claude -p "query"                # Print mode (non-interactive)

# Session management
claude -c                        # Continue recent conversation
claude -r "<session-id>" "query" # Resume specific session
claude --max-turns 5             # Limit iteration depth

# Tool control
claude --allowedTools "Read,Edit,Bash"
claude --disallowedTools "Write,WebFetch"
claude --dangerously-skip-permissions
```

#### Advanced Usage Patterns

```bash
# Piped input processing
cat requirements.txt | claude -p "analyze dependencies"

# Multiple directory context
claude --add-dir "/src" --add-dir "/tests" "run full test suite"

# Structured output
claude -p "audit code" --output-format json > audit.json
```

### 2. Custom System Prompts

#### Prompt Engineering Patterns

```markdown
# Role-based prompts

You are a senior TypeScript developer specializing in React performance optimization.
Your task is to identify and fix performance bottlenecks without breaking existing functionality.

# Constraint-based prompts

You MUST preserve all existing API contracts.
You MUST NOT modify files outside the specified directory.
You MUST run tests before declaring success.
```

#### Context Injection

```markdown
# Project-specific context

This codebase uses:

- Zustand for state management
- React Query for data fetching
- Tailwind for styling
- Jest + React Testing Library for tests

Follow existing patterns and conventions.
```

### 3. Tool Configuration Strategies

#### Precision Tool Selection

```bash
# CLI equivalent - targeted tool control
claude -p "Refactor authentication logic" \
  --allowedTools "Read,Edit,Bash(npm test),Grep" \
  --max-turns 3
```

#### MCP Integration Patterns

```bash

# Using MCP resources in commands
claude -p "analyze @filesystem:file:///src/main.py"
claude -p "review @git:branch://main"

# MCP slash commands
claude "/mcp__filesystem__list_files"
claude "/mcp__git__commit_history"

# Allow specific MCP tools
claude -p "audit codebase" --allowedTools "mcp__filesystem__*,Read"
```

### 4. Advanced CLI Patterns

#### Streaming Output Handling

```bash
# Stream JSON output for real-time processing
claude -p "Complex refactoring task" \
  --output-format stream-json \
  --max-turns 10 | jq -r '.content'

# Pipe to processing script
claude -p "analyze codebase" \
  --output-format json | python process_results.py
```

#### Error Handling & Recovery

```bash
# Robust CLI pattern with error handling
claude -p "refactor auth" --allowedTools "Read,Edit" --max-turns 5 || {
  echo "Claude failed, attempting rollback..."
  git checkout -- .
  exit 1
}
```

#### Session Management

```bash
# Resume patterns
claude -r "session_2024_01_15_auth_refactor" "continue where we left off"

# Session naming convention
claude -p "start auth refactor" --session-name "auth_refactor_$(date +%Y%m%d)"
```

### 5. Model-Specific Optimizations

#### Claude 4 Architectural Considerations

```markdown
# Claude 4 excels at:

- Long-form reasoning with extended thinking
- Multi-step planning and execution
- Code pattern recognition
- Maintaining context across conversations

# Optimization strategies:

- Use structured prompts for complex tasks
- Leverage tool calling for precise actions
- Provide clear success criteria
- Break complex tasks into logical phases
```

#### Performance Tuning

```bash
# Optimized CLI pattern for surgical modifications
claude -p "Surgical code modification" \
  --max-turns 3 \
  --allowedTools "Read,Edit" \
  --verbose  # Monitor performance
```

### 6. Production Patterns

#### CI/CD Integration

```yaml
# GitHub Actions example
- name: Claude Code Review
  run: |
    claude -p "Review this PR for security issues" \
      --allowedTools "Read,Grep" \
      --output-format json > review.json
```

#### Automated Code Quality

```bash
# Pre-commit hook
claude -p "Check code quality before commit" \
  --allowedTools "Read,Bash(npm run lint)" \
  --max-turns 2
```

---

## Quick Reference Card

### Command Patterns

- **Analysis**: `claude -p "analyze X" --allowedTools "Read,Grep"`
- **Refactoring**: `claude "refactor X to Y" --max-turns 5`
- **Testing**: `claude -p "run tests" --allowedTools "Bash(npm test)"`
- **Review**: `claude -p "review code" --output-format json`

### Best Practices Checklist

- [ ] Clear, specific objective
- [ ] Explicit constraints and scope
- [ ] Success criteria defined
- [ ] Appropriate tool selection
- [ ] Error handling considered
- [ ] Rollback plan available

_This scratchpad evolves with Claude Code development. Update regularly based on new patterns and learnings._
