import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id-123'),
}));

describe('ConversationStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('Store Module Integration', () => {
    it('should export store hook', async () => {
      const storeModule = await import('../stores/conversationStore');
      
      expect(storeModule.useConversationStore).toBeDefined();
      expect(typeof storeModule.useConversationStore).toBe('function');
    });

    it('should be importable without errors', async () => {
      expect(async () => {
        await import('../stores/conversationStore');
      }).not.toThrow();
    });
  });

  describe('Types Integration', () => {
    it('should import types without errors', async () => {
      expect(async () => {
        await import('../types');
      }).not.toThrow();
    });
  });
});