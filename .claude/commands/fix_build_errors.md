# Sub-Agent Fix Build Command

Orchestrates multiple specialized sub-agents to fix all build and lint errors in frontend applications by analyzing error patterns, deploying parallel fixes, and verifying solutions with strict quality standards.

## Command Syntax

```bash
sub-agent-fix-build [options]

# Aliases
@fix-build [options]
@safb [options]
```

## Parameters

### Optional Parameters

- `--project-path` - Path to the frontend project (default: ./frontend)
- `--error-file` - Path to build errors file (default: build_errors.txt)

## Default Behavior

The command operates with aggressive fixing and strict verification:

- **Parallel Agents**: 5 agents per round
- **Max Retries**: 3 attempts per file
- **Verification**: Strict mode (full syntax, type, and lint checking)
- **Fix Strategy**: Aggressive (fixes all errors, allows refactoring)
- **TypeScript**: Strict mode fixes
- **Auto-imports**: Enabled
- **Verbose Logging**: Enabled for progress tracking

## Examples

```bash
# Fix all build errors in default location
sub-agent-fix-build

# Fix build errors in specific project
sub-agent-fix-build --project-path ./apps/web

# Use custom error file location
sub-agent-fix-build --error-file ./build-output.txt

# Both custom paths
sub-agent-fix-build --project-path ./frontend --error-file ./errors.log
```

## Stage 1: Error Analysis Agent

```
Analyze build errors from: [ERROR_FILE_PATH]
Project path: [PROJECT_PATH]

Tasks:
1. Parse error file:
   - Extract all unique errors
   - Categorize by error type:
     * TypeScript errors (type mismatches, missing types)
     * Import/export errors
     * Lint errors (ESLint, formatting)
     * React-specific errors (hooks, props)
     * Build configuration errors

2. File grouping:
   - Group errors by file path
   - Identify error dependencies
   - Determine fix order (some errors cascade)
   - Calculate error severity

3. Parallel processing plan:
   - Identify independent files (can be fixed in parallel)
   - Group dependent files (must be fixed sequentially)
   - Prioritize by:
     * Number of dependent files
     * Error count
     * Error severity

4. Context gathering:
   - For each file, gather:
     * All errors in that file
     * Import dependencies
     * Exported items used elsewhere
     * Related type definitions
     * Package.json dependencies

Return:
- Categorized error list with counts
- File dependency graph
- Parallel processing groups (max 5 per round)
- Context map for each file
- Recommended fix order
```

## Stage 2: Orchestrator Agent

```
Based on error analysis: [ANALYSIS_RESULTS]
Manage parallel fixing process with STRICT quality control

Orchestration tasks:
1. Deploy strategy:
   - Create agent deployment queue
   - Deploy up to 5 parallel agents
   - Set priority order
   - Track agent status

2. Agent context preparation:
   - For each file agent, prepare COMPLETE context:
     * Specific errors to fix
     * Full file content
     * Related type definitions
     * Import/export context
     * Project configuration (tsconfig, eslint)
     * Common patterns in codebase
     * Dependencies and their types

3. Progress monitoring:
   - Track active agents in real-time
   - Monitor fix attempts
   - Queue verification agents immediately
   - Handle failures with retry (max 3)

4. State management:
   - Maintain fixed files list
   - Track remaining errors
   - Update dependency graph
   - Manage retry counts

Execute orchestration loop until ALL errors resolved.
```

## Stage 3: File Fix Agents (Parallel - Max 5)

### Sub-Agent Instructions Template

```
You are a specialized fix agent for: [FILE_PATH]

CONTEXT PROVIDED:
- Current file content: [FULL_FILE_CONTENT]
- Errors to fix: [DETAILED_ERROR_LIST]
- Related types: [TYPE_DEFINITIONS]
- Import map: [PROJECT_IMPORTS]
- TSConfig: [TSCONFIG]
- ESLint rules: [ESLINT_CONFIG]
- Example patterns: [CODE_PATTERNS]

YOUR MISSION:
Fix ALL errors in this file using AGGRESSIVE strategy:
1. Fix all TypeScript errors - add types, fix mismatches
2. Fix all import/export issues - find correct paths
3. Fix all lint errors - apply all rules
4. Refactor if needed for better code quality
5. Ensure no functionality is broken

REQUIREMENTS:
- Fix EVERY error listed
- Use proper TypeScript types (no 'any' unless necessary)
- Follow project's import patterns
- Maintain or improve code quality
- Make the code production-ready

Return a SUMMARY/REPORT of the fix.
```

<examples>
### TypeScript Error Fix Agent

```
Fix TypeScript errors aggressively in: [FILE_PATH]
Errors: [ERROR_LIST]
Full context: [CONTEXT]

Strategies:
1. Type errors:
   - Add all missing type annotations
   - Fix ALL type mismatches
   - Add proper generics
   - Create interfaces/types as needed
   - Use utility types effectively

2. Missing properties:
   - Add all required properties
   - Fix optional vs required
   - Handle discriminated unions
   - Resolve type narrowing

3. Function signatures:
   - Add return types to ALL functions
   - Type all parameters
   - Handle async/Promise types
   - Fix overload signatures

4. React components:
   - Type all props with interfaces
   - Add proper event handler types
   - Fix hook dependencies
   - Type children properly

Return SUMMARY of the fix.
```

### Import/Export Fix Agent

```
Fix ALL import/export errors in: [FILE_PATH]
Errors: [ERROR_LIST]
Project structure: [FULL_PROJECT_CONTEXT]

Aggressive fix approach:
1. Missing imports:
   - Search entire project for exports
   - Check all node_modules
   - Fix ALL relative paths
   - Add barrel imports if helpful
   - Create missing exports if needed

2. Path resolution:
   - Convert to correct relative paths
   - Fix all aliases
   - Handle monorepo paths
   - Update deep imports

3. Export structure:
   - Add all missing exports
   - Convert to named exports for clarity
   - Fix re-export syntax
   - Ensure tree-shaking friendly

Return SUMMARY of the fix.
```

### Lint Fix Agent

```
Fix ALL lint errors aggressively in: [FILE_PATH]
Apply STRICT linting rules: [ESLINT_CONFIG]

Fix everything:
1. Code style:
   - Perfect indentation
   - Consistent quotes
   - Proper spacing
   - Sorted imports

2. Best practices:
   - Fix ALL hook dependencies
   - Remove ALL unused code
   - Add proper error handling
   - Apply ALL performance optimizations

3. Code quality:
   - No console.logs
   - Proper naming conventions
   - Extract magic numbers
   - Add JSDoc where helpful

Return SUMMARY of the fix.
```

</examples>

## Stage 4: Verification Agents (Deployed after EVERY fix)

```
STRICT VERIFICATION for: [FILE_PATH]
Applied fixes: [FIX_SUMMARY]

Verification checklist:
1. Syntax check:
   - File parses without errors
   - Valid TypeScript/JSX syntax
   - No syntax errors

2. Type verification:
   - Run tsc --noEmit on file
   - ALL types resolve
   - No type errors remain

3. Import verification:
   - ALL imports resolve
   - No circular dependencies
   - All exports accessible

4. Lint verification:
   - Run ESLint with --max-warnings 0
   - ZERO errors
   - ZERO warnings

5. Semantic verification:
   - Original functionality preserved
   - No logic changes
   - API compatibility maintained

Return:
- PASS/FAIL status
- If FAIL: detailed error list for re-fix
- If PASS: confirm ready for build
```

## Stage 5: Final Build Verification

```
After ALL files report verification success:

1. Clean build environment:
   - Clear all caches
   - Remove node_modules/.cache
   - Clean build directory

2. Run final build:
   - Execute: npm run build
   - Capture complete output
   - Parse for ANY errors

3. Success criteria:
   - Build exits with code 0
   - NO TypeScript errors
   - NO lint errors
   - NO warnings
   - Bundle generated successfully

4. If any errors remain:
   - Return to Stage 1
   - Analyze new/cascading errors
   - Deploy new fix agents

5. Final report:
   - Total errors fixed
   - Files modified
   - Time taken
   - Build status: SUCCESS
```

## Execution Flow

```
START
  ↓
[Analyze Errors] → Identify 23 errors in 8 files
  ↓
[Deploy Round 1] → 5 parallel agents fixing independent files
  ↓
[Agent 1] Fixing Button.tsx (3 TS errors)
[Agent 2] Fixing api.ts (5 import errors)
[Agent 3] Fixing Dashboard.tsx (4 lint errors)
[Agent 4] Fixing types.ts (2 type errors)
[Agent 5] Fixing hooks.ts (3 errors)
  ↓
[Verify 1] ✓ Button.tsx verified
[Verify 2] ✓ api.ts verified
[Verify 3] ✗ Dashboard.tsx - 1 error remains
[Verify 4] ✓ types.ts verified
[Verify 5] ✓ hooks.ts verified
  ↓
[Re-deploy] → Agent 6 fixing Dashboard.tsx
  ↓
[Verify 6] ✓ Dashboard.tsx verified
  ↓
[Deploy Round 2] → 3 remaining files
  ↓
... continue until all fixed ...
  ↓
[Final Build] → npm run build
  ↓
✓ BUILD SUCCESSFUL - No errors
```

## Error Handling

- **Agent Failures**: Retry up to 3 times with enhanced context
- **Verification Failures**: Immediate re-deployment with specific error focus
- **Cascading Errors**: Re-analyze and adjust fix order
- **Build Failures**: Full restart from Stage 1
