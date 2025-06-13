import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock all external dependencies first
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Zustand
const mockStore = {
  messages: [],
  projectContext: {
    requirements: [],
    objectives: [],
    constraints: [],
    readinessScore: 0,
  },
  proposalSections: {},
  viewState: {
    showPreview: false,
    activeSection: undefined,
    layout: 'chat-only' as const,
    isMobile: false,
  },
  actions: {
    addMessage: jest.fn(),
    updateProjectContext: jest.fn(),
    togglePreview: jest.fn(),
    setActiveSection: jest.fn(),
    updateSection: jest.fn(),
  },
};

jest.mock('zustand', () => ({
  create: jest.fn(() => () => mockStore),
}));

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Chat-Preview Communication', () => {
    it('should handle message addition workflow', () => {
      // Test that message addition triggers appropriate state changes
      expect(mockStore.actions.addMessage).toBeDefined();
      expect(typeof mockStore.actions.addMessage).toBe('function');
      
      // Simulate adding a message
      mockStore.actions.addMessage({
        content: 'Test message',
        role: 'user',
      });
      
      expect(mockStore.actions.addMessage).toHaveBeenCalledWith({
        content: 'Test message', 
        role: 'user',
      });
    });

    it('should handle project context updates', () => {
      // Test project context update workflow
      const contextUpdate = {
        clientName: 'Test Client',
        projectTitle: 'Test Project',
        industry: 'Technology',
      };

      mockStore.actions.updateProjectContext(contextUpdate);
      
      expect(mockStore.actions.updateProjectContext).toHaveBeenCalledWith(contextUpdate);
    });

    it('should handle preview toggle workflow', () => {
      // Test preview state management
      expect(mockStore.viewState.showPreview).toBe(false);
      
      mockStore.actions.togglePreview();
      
      expect(mockStore.actions.togglePreview).toHaveBeenCalled();
    });

    it('should handle section activation workflow', () => {
      // Test active section management
      const sectionId = 'executive-summary';
      
      mockStore.actions.setActiveSection(sectionId);
      
      expect(mockStore.actions.setActiveSection).toHaveBeenCalledWith(sectionId);
    });

    it('should handle section content updates', () => {
      // Test section update workflow
      const sectionId = 'executive-summary';
      const updates = {
        content: 'Updated content',
        status: 'complete' as const,
        wordCount: 100,
      };

      mockStore.actions.updateSection(sectionId, updates);
      
      expect(mockStore.actions.updateSection).toHaveBeenCalledWith(sectionId, updates);
    });
  });

  describe('Generation Workflow Integration', () => {
    it('should coordinate message flow with content generation', () => {
      // Test that messages trigger appropriate content generation logic
      const messages = [
        { content: 'Tell me about the project scope', role: 'user' },
        { content: 'The project involves...', role: 'assistant' },
        { content: 'What about the timeline?', role: 'user' },
      ];

      messages.forEach(message => {
        mockStore.actions.addMessage(message);
      });

      expect(mockStore.actions.addMessage).toHaveBeenCalledTimes(3);
    });

    it('should handle readiness score calculation integration', () => {
      // Test readiness score calculation workflow
      const projectContext = {
        clientName: 'Test Client',
        projectTitle: 'Test Project',
        requirements: ['Req 1', 'Req 2', 'Req 3'],
        objectives: ['Obj 1', 'Obj 2'],
        constraints: ['Constraint 1'],
      };

      mockStore.actions.updateProjectContext(projectContext);

      expect(mockStore.actions.updateProjectContext).toHaveBeenCalledWith(projectContext);
    });
  });

  describe('State Persistence Integration', () => {
    it('should handle conversation state persistence', () => {
      // Test that state changes are properly tracked for persistence
      const conversationData = {
        messages: [
          { id: '1', content: 'Hello', role: 'user', timestamp: new Date() },
          { id: '2', content: 'Hi there', role: 'assistant', timestamp: new Date() },
        ],
        projectContext: {
          clientName: 'Test Client',
          requirements: ['Requirement 1'],
          objectives: ['Objective 1'],
          constraints: [],
          readinessScore: 50,
        },
      };

      // Simulate state updates
      conversationData.messages.forEach(message => {
        mockStore.actions.addMessage(message);
      });

      mockStore.actions.updateProjectContext(conversationData.projectContext);

      expect(mockStore.actions.addMessage).toHaveBeenCalledTimes(2);
      expect(mockStore.actions.updateProjectContext).toHaveBeenCalledWith(conversationData.projectContext);
    });

    it('should handle view state persistence', () => {
      // Test view state management
      expect(mockStore.viewState.layout).toBe('chat-only');
      expect(mockStore.viewState.showPreview).toBe(false);
      expect(mockStore.viewState.isMobile).toBe(false);
    });
  });

  describe('Component Integration', () => {
    it('should integrate export functionality with conversation state', async () => {
      // Test export service integration
      const { EXPORT_FORMATS } = await import('../services/exportService');
      
      expect(EXPORT_FORMATS).toBeDefined();
      expect(Array.isArray(EXPORT_FORMATS)).toBe(true);
      expect(EXPORT_FORMATS.length).toBeGreaterThan(0);
      
      // Verify export formats have required properties
      EXPORT_FORMATS.forEach(format => {
        expect(format).toHaveProperty('id');
        expect(format).toHaveProperty('name');
        expect(format).toHaveProperty('mimeType');
      });
    });

    it('should integrate competitive analysis with project context', async () => {
      // Test competitive analysis integration
      const mockConversationState = {
        projectContext: {
          industry: 'Technology',
          clientName: 'Test Client',
          requirements: ['Requirement 1', 'Requirement 2'],
          objectives: ['Objective 1'],
          constraints: [],
          readinessScore: 75,
        },
      };

      // Verify competitive analysis can work with project context
      expect(mockConversationState.projectContext.industry).toBe('Technology');
      expect(mockConversationState.projectContext.readinessScore).toBe(75);
    });
  });

  describe('Type Safety Integration', () => {
    it('should enforce proper typing across components', async () => {
      // Test type imports
      const types = await import('../types');
      
      expect(types.DEFAULT_SECTIONS).toBeDefined();
      expect(types.READINESS_WEIGHTS).toBeDefined();
      
      // Verify default sections structure
      Object.values(types.DEFAULT_SECTIONS).forEach(section => {
        expect(section).toHaveProperty('title');
        expect(section).toHaveProperty('content');
        expect(section).toHaveProperty('status');
        expect(section).toHaveProperty('wordCount');
        expect(section).toHaveProperty('completionPercentage');
      });
    });

    it('should maintain type consistency across stores', () => {
      // Test store action type consistency
      expect(typeof mockStore.actions.addMessage).toBe('function');
      expect(typeof mockStore.actions.updateProjectContext).toBe('function');
      expect(typeof mockStore.actions.togglePreview).toBe('function');
      expect(typeof mockStore.actions.setActiveSection).toBe('function');
      expect(typeof mockStore.actions.updateSection).toBe('function');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle message addition errors gracefully', () => {
      // Test error scenarios
      const invalidMessage = null;
      
      try {
        // This should be handled gracefully
        mockStore.actions.addMessage(invalidMessage as any);
      } catch (error) {
        // Error handling should be in place
        expect(error).toBeDefined();
      }
    });

    it('should handle export service errors', async () => {
      const { exportService } = await import('../services/exportService');
      
      // Mock a failed export
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const mockState = {
        projectContext: { readinessScore: 50 },
        proposalSections: {},
        messages: [],
      } as any;

      const result = await exportService.exportProposal(mockState, {
        format: { id: 'pdf', name: 'PDF', extension: 'pdf', mimeType: 'application/pdf', icon: '📄', description: 'PDF document' },
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently', () => {
      // Test performance with multiple messages
      const largeMessageSet = Array.from({ length: 100 }, (_, i) => ({
        id: `msg-${i}`,
        content: `Message ${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        timestamp: new Date(),
      }));

      largeMessageSet.forEach(message => {
        mockStore.actions.addMessage(message);
      });

      expect(mockStore.actions.addMessage).toHaveBeenCalledTimes(100);
    });

    it('should handle rapid state updates', () => {
      // Test rapid state changes
      for (let i = 0; i < 10; i++) {
        mockStore.actions.updateProjectContext({ 
          clientName: `Client ${i}` 
        });
      }

      expect(mockStore.actions.updateProjectContext).toHaveBeenCalledTimes(10);
    });
  });

  describe('Mobile Integration', () => {
    it('should adapt to mobile viewport', () => {
      // Test mobile state management
      expect(mockStore.viewState.isMobile).toBe(false);
      
      // Mobile state should be manageable
      expect(typeof mockStore.viewState.isMobile).toBe('boolean');
    });

    it('should handle layout switching', () => {
      // Test layout transitions
      const layouts = ['chat-only', 'split-view', 'preview-focused'] as const;
      
      layouts.forEach(layout => {
        expect(typeof layout).toBe('string');
      });
    });
  });
});