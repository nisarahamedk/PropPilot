# User Stories to Technical Design Generator

Transform user stories into comprehensive technical design documents ready for implementation.

## Usage
```
Please create technical design from user stories at $ARGUMENTS using our tech stack
```

## Output Location

All generated technical designs should be saved to: `.taskmaster/docs/technical-design/`

## Tech Stack Reference
```yaml
Frontend: Next.js 15.2 + shadcn/ui + Tailwind CSS
Backend: FastAPI + Supabase (PostgreSQL + Realtime + Storage)
Auth: Supabase Auth (social logins ready)
Workflows: Temporal.io (AI workflows + human-in-loop)
AI: LangGraph + Temporal.io
Deployment: Railway
```

## Instructions

When creating technical design from user stories at $ARGUMENTS:

1. **Analyze User Stories**: Group related stories and identify technical patterns

2. **Design Data Models**: Create schemas that support all acceptance criteria

3. **Define APIs**: Design endpoints that enable the user interactions

4. **Architecture Decisions**: Choose patterns and approaches

5. **Consider Non-Functional Requirements**: Performance, security, scalability

## Output Format

```markdown
# Technical Design: [Feature Name]

## Overview
Brief description of the technical approach

## Data Models

### PostgreSQL Schema
```sql
-- Table definitions with RLS policies
CREATE TABLE table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

-- Enable Realtime if needed
ALTER TABLE table_name REPLICA IDENTITY FULL;
```

### Type Definitions
```typescript
interface ModelName {
  id: string;
  ...
}
```

## API Design

### REST Endpoints
```yaml
POST /api/resource
  Request:
    field: type
  Response:
    field: type
    
GET /api/resource/{id}
  Response:
    field: type
```

### Temporal Workflows
```python
@workflow.defn
class WorkflowName:
    @workflow.run
    async def run(self, input: InputType) -> OutputType:
        # Workflow logic
```

## Frontend Architecture

### Components
```
- PageComponent
  - ChildComponent
    - SubComponent
```

### State Management
```typescript
// Zustand store or React Context
interface StoreState {
  data: Type;
  actions: {
    fetchData: () => Promise<void>;
  };
}
```

## System Architecture

### Sequence Diagram
```
User -> Frontend: Action
Frontend -> FastAPI: Request
FastAPI -> Temporal: Start workflow
Temporal -> LangGraph: Process
LangGraph -> Supabase: Store result
Supabase -> Frontend: Realtime update
```

### Data Flow
1. Step by step data flow
2. Error handling paths
3. Retry logic

## Non-Functional Requirements

### Performance
- Response time targets
- Concurrent user limits
- Data volume considerations

### Security
- Authentication flow
- Authorization rules
- Data encryption

### Scalability
- Bottlenecks and solutions
- Caching strategy
- Database optimization

## Implementation Considerations

### Dependencies
- External services
- Third-party libraries
- API rate limits

### Error Handling
- User-facing errors
- System errors
- Recovery strategies

### Testing Strategy
- Unit test approach
- Integration test points
- E2E test scenarios

## Migration Plan
(If modifying existing features)
```

## Command Examples

```bash
# Create full technical design
@.claude/commands/user-stories-to-technical-design.md @docs/user-stories/chat-feature.md

# Focus on backend architecture
@.claude/commands/user-stories-to-technical-design.md @docs/user-stories/auth.md focusing on backend

# Design Temporal workflows only
@.claude/commands/user-stories-to-technical-design.md @docs/user-stories/ai-processing.md for Temporal workflows
```

## Output Instructions

1. Create the directory if it doesn't exist: `.taskmaster/docs/technical-design/`
2. Name the output file based on the feature (e.g., `chat-interface-technical-design.md`)
3. Save the complete technical design to this location
4. Include a table of contents for easy navigation
5. Link back to the original user stories document

## Best Practices

1. **Use existing services**: Leverage Supabase features before building custom
2. **Async by default**: Use Temporal for any long-running operations
3. **Real-time when needed**: Use Supabase Realtime for live updates
4. **Type safety**: Define TypeScript types for all data structures
5. **RLS policies**: Always define Row Level Security for multi-tenancy

## Design Principles

- **Idempotent operations**: Especially in Temporal workflows
- **Optimistic UI**: Update frontend immediately, reconcile with backend
- **Progressive enhancement**: Basic functionality works without JavaScript
- **Accessibility first**: WCAG 2.1 AA compliance
- **Mobile responsive**: Design for mobile-first experiences

## Common Patterns

### File Upload Pattern
```python
# 1. Get presigned URL from Supabase Storage
# 2. Upload from frontend directly
# 3. Process file in Temporal workflow
```

### Human-in-Loop Pattern
```python
# 1. Temporal workflow pauses
# 2. Send notification (email/in-app)
# 3. Resume on human input
```

### Batch Processing Pattern
```python
# 1. Queue items in PostgreSQL
# 2. Temporal workflow processes in batches
# 3. Update progress via Realtime
```