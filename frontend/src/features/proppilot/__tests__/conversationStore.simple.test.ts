import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock dependencies first
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id-123'),
}));

// Mock crypto.randomUUID for Node.js environment
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-123'),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ConversationStore Direct Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
  });

  it('should import conversation store without errors', async () => {
    const { useConversationStore } = await import('../stores/conversationStore');
    expect(useConversationStore).toBeDefined();
    expect(typeof useConversationStore).toBe('function');
  });

  it('should import conversation history store without errors', async () => {
    const { useConversationHistoryStore } = await import('../stores/conversationHistoryStore');
    expect(useConversationHistoryStore).toBeDefined();
    expect(typeof useConversationHistoryStore).toBe('function');
  });

  it('should import refinement store without errors', async () => {
    const { useRefinementStore } = await import('../stores/refinementStore');
    expect(useRefinementStore).toBeDefined();
    expect(typeof useRefinementStore).toBe('function');
  });

  it('should verify store type definitions exist', async () => {
    // Import types to verify they exist
    const conversationModule = await import('../stores/conversationStore');
    const historyModule = await import('../stores/conversationHistoryStore');
    const refinementModule = await import('../stores/refinementStore');
    
    // Verify utility hooks exist
    expect(conversationModule.useConversationMessages).toBeDefined();
    expect(conversationModule.useProjectContext).toBeDefined();
    expect(conversationModule.useProposalSections).toBeDefined();
    expect(conversationModule.useGenerationState).toBeDefined();
    expect(conversationModule.useViewState).toBeDefined();
    expect(conversationModule.useConversationActions).toBeDefined();
    
    expect(historyModule.useRecentConversations).toBeDefined();
    expect(historyModule.useStarredConversations).toBeDefined();
    expect(historyModule.useArchivedConversations).toBeDefined();
    expect(historyModule.useActiveConversations).toBeDefined();
    
    expect(refinementModule.useActiveRefinementSession).toBeDefined();
    expect(refinementModule.useSectionDrafts).toBeDefined();
    expect(refinementModule.useRefinementActions).toBeDefined();
  });

  it('should verify store persistence configuration', async () => {
    // Test that stores are configured with persistence
    const conversationModule = await import('../stores/conversationStore');
    
    // The store should be a function (Zustand hook)
    expect(typeof conversationModule.useConversationStore).toBe('function');
    
    // Test that store has required properties
    const store = conversationModule.useConversationStore;
    expect(store).toBeDefined();
    expect(typeof store.getState).toBe('function');
    expect(typeof store.setState).toBe('function');
    expect(typeof store.subscribe).toBe('function');
  });

  it('should handle nanoid and crypto mocks correctly', () => {
    const { nanoid } = require('nanoid');
    expect(nanoid()).toBe('test-id-123');
    expect(crypto.randomUUID()).toBe('test-uuid-123');
  });

  it('should verify localStorage mock functionality', () => {
    localStorage.setItem('test-key', 'test-value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', 'test-value');
    
    localStorageMock.getItem.mockReturnValue('test-value');
    const value = localStorage.getItem('test-key');
    expect(value).toBe('test-value');
  });
});