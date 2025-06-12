# PropPilot Development Guidelines for Frontend

## Project Overview
This is a modern Next.js 15 + React 19 application with TypeScript, integrated with a FastAPI backend. The frontend serves as the user interface for PropPilot, featuring interactive components.

## Technology Stack
- **Framework**: Next.js 15.3.3 with App Router
- **React**: 19.0.0 with latest hooks (useActionState, useOptimistic)
- **TypeScript**: Latest with strict configuration
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **State Management**: Feature-based with Zustand for complex state
- **Testing**: Jest + Playwright for E2E
- **Backend Integration**: FastAPI via direct fetch calls

## Architecture Principles

### 1. Feature-Based Organization
- Organize code by features, not by technical layers
- Each feature should be self-contained with its own components, hooks, and types
- Prefer colocation of related functionality

### 2. Server Components First
- Use Server Components by default for better performance
- Only use Client Components when interactivity is required
- Leverage Server Actions for data mutations
- Use native fetch with Next.js 15 caching strategies

### 3. Modern React 19 Patterns
- Use `useActionState` for form handling and state management
- Implement `useOptimistic` for instant UI feedback
- Prefer React 19 hooks over external state management libraries when possible
- Use Server Actions instead of API routes when appropriate

### 4. State Management Strategy
- **Local State**: useState, useReducer for component-specific state
- **Form State**: useActionState with Server Actions
- **Global State**: Zustand for complex application state
- **Server State**: Native fetch with Next.js caching
- **UI State**: React Context for theme, auth status

## Directory Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── proppilot/          # Feature routes
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── shared/            # Cross-feature shared components
│   ├── features/              # Feature-based modules
│   │   └── proppilot/
│   │       ├── components/    # Feature-specific components
│   │       ├── hooks/         # Custom hooks
│   │       ├── actions.ts     # Server Actions
│   │       ├── queries.ts     # Data fetching functions
│   │       ├── stores/        # Zustand stores
│   │       └── types.ts       # TypeScript definitions
│   ├── lib/
│   │   ├── api.ts            # API client utilities
│   │   ├── auth.ts           # Authentication utilities
│   │   └── utils.ts          # General utilities
│   └── hooks/                # Shared custom hooks
├── tests/                    # Test files
├── CLAUDE.md                 # This file
└── package.json
```

## Development Guidelines

### Component Development
1. **Start with Server Components** unless client interactivity is needed
2. **Keep components focused** - single responsibility principle
3. **Use TypeScript strictly** - no `any` types allowed
4. **Implement proper error boundaries** for client components
5. **Follow naming conventions**: PascalCase for components, camelCase for functions

### State Management Rules
1. **Colocate state** as close to where it's used as possible
2. **Use Zustand** only for truly global state that multiple features need
3. **Prefer Server Actions** over client-side API calls for mutations
4. **Implement optimistic updates** with `useOptimistic` for better UX

### Testing Requirements
1. **Write tests first** (TDD approach) before implementing features
2. **Test business logic** in custom hooks and utility functions
3. **Use Playwright** for component and E2E testing
4. **Mock external dependencies** properly in tests
5. **Maintain high test coverage** (>80% for business logic)

### Performance Guidelines
1. **Lazy load heavy components** using dynamic imports
2. **Implement proper memoization** with React.memo, useMemo, useCallback
3. **Optimize bundle size** - avoid unnecessary dependencies
4. **Use Next.js Image component** for optimized images
5. **Implement proper caching** strategies for API calls

## Code Quality Standards

### TypeScript Usage
```typescript
// ✅ Good - Proper typing
interface ProposalDocument {
  id: string;
  title: string;
  clientName: string;
  status: 'draft' | 'pending_review' | 'approved';
}

// ❌ Bad - Using any
const proposal: any = fetchProposal();
```

### Component Structure
```typescript
// ✅ Good - Server Component with proper typing
interface Props {
  proposalId: string;
}

export default async function ProposalDetail({ proposalId }: Props) {
  const proposal = await fetchProposalData(proposalId);
  
  return (
    <div>
      <h1>{proposal.title}</h1>
      {/* Assuming ProposalStatusDisplay is a component that renders status */}
      <ProposalStatusDisplay status={proposal.status} />
    </div>
  );
}

// ✅ Good - Client Component when needed
'use client';

interface ProposalStatusUpdaterProps {
  onUpdateStatus: (status: ProposalDocument['status']) => void;
}

export function ProposalStatusUpdater({ onUpdateStatus }: ProposalStatusUpdaterProps) {
  const [currentStatus, setCurrentStatus] = useState<ProposalDocument['status']>('draft');
  
  return (
    // Conceptual example, actual UI element can vary
    <select value={currentStatus} onChange={(e) => {
      const newStatus = e.target.value as ProposalDocument['status'];
      setCurrentStatus(newStatus);
      onUpdateStatus(newStatus);
    }}>
      <option value="draft">Draft</option>
      <option value="pending_review">Pending Review</option>
      <option value="approved">Approved</option>
    </select>
  );
}
```

### Server Actions Pattern
```typescript
// actions.ts
'use server';

import { revalidatePath } from 'next/cache';

// Assuming ProposalDocument is imported or defined elsewhere
// import { ProposalDocument } from './types';

export async function updateProposalStatus(
  proposalId: string,
  newStatus: ProposalDocument['status']
) {
  // Validate input
  const validStatuses: ProposalDocument['status'][] = ['draft', 'pending_review', 'approved'];
  if (!validStatuses.includes(newStatus)) {
    return { error: 'Invalid status value' };
  }
  
  try {
    // Update via FastAPI
    await fetch(`${process.env.API_URL}/proposals/${proposalId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    
    revalidatePath(`/proposals/${proposalId}`); // Or a more general path like '/proposals'
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update proposal status' };
  }
}
```

## FastAPI Integration

### API Client Pattern
```typescript
// lib/api.ts
class APIClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL!;
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
  
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
}

export const apiClient = new APIClient();
```

## Testing Patterns

### Component Testing
```typescript
// components/ProposalCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProposalCard } from './ProposalCard'; // Assuming ProposalCard component
// Assuming ProposalDocument is imported
// import { ProposalDocument } from '../types';

describe('ProposalCard', () => {
  const mockProposal: ProposalDocument = {
    id: '1',
    title: 'New Marketing Campaign Proposal',
    clientName: 'Acme Corp',
    status: 'draft'
  };

  it('displays proposal information correctly', () => {
    render(<ProposalCard proposal={mockProposal} />);
    
    expect(screen.getByText('New Marketing Campaign Proposal')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    // Assuming ProposalCard renders status like "Status: Draft"
    expect(screen.getByText('Status: draft')).toBeInTheDocument();
  });
});
```

### Hook Testing
```typescript
// hooks/useProposalState.test.ts
import { renderHook, act } from '@testing-library/react';
import { useProposalState } from './useProposalState'; // Assuming useProposalState hook
// Assuming ProposalDocument is imported
// import { ProposalDocument } from '../types';

describe('useProposalState', () => {
  it('updates status correctly', async () => {
    // Assume useProposalState hook takes proposalId and initial state
    const { result } = renderHook(() => useProposalState('proposal-1', {
      id: 'proposal-1',
      title: 'Initial Proposal',
      clientName: 'Test Client',
      status: 'draft'
    }));
    
    await act(async () => {
      // Assume the hook exposes an updateStatus function
      await result.current.updateStatus('pending_review');
    });
    
    expect(result.current.status).toBe('pending_review');
  });
});
```

## Common Patterns to Follow

### Error Handling
```typescript
// ✅ Good - Proper error handling
async function fetchProposalDetails(proposalId: string) {
  try {
    const response = await apiClient.get(`/proposals/${proposalId}`);
    return { data: response, error: null };
  } catch (error) {
    console.error('Failed to fetch proposal:', error);
    return { data: null, error: 'Failed to load proposal data' };
  }
}
```

### Loading States
```typescript
// ✅ Good - Proper loading states
function ProposalList() {
  const [proposals, setProposals] = useState<ProposalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProposals() // Assuming fetchProposals returns { data?, error? }
      .then(({ data, error }) => {
        if (error) {
          setError(error);
        } else if (data) { // Ensure data is not null/undefined
          setProposals(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <div>
      {proposals.map(proposal => (
        <ProposalCard key={proposal.id} proposal={proposal} />
      ))}
    </div>
  );
}
```

## Refactoring Guidelines

When refactoring existing code:

1. **Write tests first** for the existing functionality
2. **Refactor incrementally** - don't change everything at once
3. **Maintain backward compatibility** during transitions
4. **Use feature flags** for gradual rollouts
5. **Monitor performance** before and after changes
6. **Update documentation** as you go

## Performance Optimization

1. **Bundle Analysis**: Run `npm run build` and analyze bundle sizes
2. **Code Splitting**: Use dynamic imports for large components
3. **Image Optimization**: Always use Next.js Image component
4. **Caching**: Implement proper caching strategies for API calls
5. **Lazy Loading**: Load components only when needed

## Security Considerations

1. **Input Validation**: Always validate user inputs
2. **XSS Prevention**: Sanitize user-generated content
3. **CSRF Protection**: Use Next.js built-in CSRF protection
4. **Environment Variables**: Never expose sensitive data to client
5. **Authentication**: Implement proper JWT token handling

## Commands to Remember

```bash
# Development
npm run dev --turbopack        # Start development server with Turbopack
npm run build                  # Build for production
npm run lint                   # Run ESLint
npm run test                   # Run Jest tests
npm run test:e2e              # Run Playwright E2E tests

# Testing specific components
npm test -- TrackCard         # Test specific component
npm test -- --watch          # Watch mode for tests

# Bundle analysis
npm run build && npm run analyze
```

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_API_URL`: FastAPI backend URL (exposed to client)
- `API_URL`: Internal API URL for Server Actions (server-only)
- `AUTH_SECRET`: JWT secret for authentication

## When to Ask for Help

Before implementing new features:
1. Check if similar patterns exist in the codebase
2. Consider if Server Components can be used instead of Client Components
3. Evaluate if new dependencies are really needed
4. Plan the testing strategy before writing code

Remember: **Server Components first, Client Components when necessary, Test-Driven Development always.**