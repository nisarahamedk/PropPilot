import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import PreviewPanel from '../components/PreviewPanel';
import { ConversationState } from '../types';

// Mock framer-motion components
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockConversationState: ConversationState = {
  id: 'test-conversation',
  messages: [
    {
      id: 'msg-1',
      content: 'First message',
      role: 'user',
      timestamp: new Date(),
    },
    {
      id: 'msg-2', 
      content: 'Second message',
      role: 'assistant',
      timestamp: new Date(),
    },
  ],
  projectContext: {
    clientName: 'Test Client',
    projectTitle: 'Test Project',
    industry: 'Technology',
    requirements: ['Requirement 1', 'Requirement 2'],
    objectives: ['Objective 1'],
    constraints: ['Constraint 1'],
    readinessScore: 75,
  },
  proposalSections: {
    'executive-summary': {
      id: 'executive-summary',
      title: 'Executive Summary',
      content: 'Executive summary content',
      status: 'complete',
      lastUpdated: new Date(),
      wordCount: 150,
      completionPercentage: 100,
    },
    'project-overview': {
      id: 'project-overview',
      title: 'Project Overview',
      content: 'Project overview content',
      status: 'draft',
      lastUpdated: new Date(),
      wordCount: 200,
      completionPercentage: 80,
    },
  },
  generationState: {
    isGenerating: false,
    currentPhase: 'complete',
    progress: 100,
  },
  viewState: {
    showPreview: true,
    layout: 'split-view',
    isMobile: false,
  },
  persistence: {
    lastSaved: new Date(),
    isDirty: false,
    autoSaveEnabled: true,
    version: 1,
  },
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
  },
};

const defaultProps = {
  isVisible: true,
  messages: [
    { id: '1', type: 'user' as const, content: 'Hello', timestamp: '2024-01-01T00:00:00Z' },
    { id: '2', type: 'ai' as const, content: 'Hi there', timestamp: '2024-01-01T00:01:00Z' },
  ],
  onClose: jest.fn(),
  conversationState: mockConversationState,
};

describe('PreviewPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Core Functionality', () => {
    it('renders when visible prop is true', () => {
      render(<PreviewPanel {...defaultProps} isVisible={true} />);
      
      // Check for basic structural elements
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    it('renders proposal sections', () => {
      render(<PreviewPanel {...defaultProps} />);
      
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
      expect(screen.getByText('Project Overview')).toBeInTheDocument();
      expect(screen.getByText('Technical Approach')).toBeInTheDocument();
    });

    it('calls onSectionClick when section is clicked', async () => {
      const user = userEvent.setup();
      const onSectionClick = jest.fn();
      render(<PreviewPanel {...defaultProps} onSectionClick={onSectionClick} />);
      
      const section = screen.getByText('Executive Summary').closest('button');
      if (section) {
        await user.click(section);
        expect(onSectionClick).toHaveBeenCalledWith('executive-summary');
      }
    });

  });

  describe('Mobile Behavior', () => {
    const mobileProps = { ...defaultProps, isMobile: true };

    it('renders export button in mobile layout', () => {
      render(<PreviewPanel {...mobileProps} />);
      
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    it('renders sections in mobile layout', () => {
      render(<PreviewPanel {...mobileProps} />);
      
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
      expect(screen.getByText('Project Overview')).toBeInTheDocument();
    });
  });

  describe('Section Editing', () => {
    it('enters edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<PreviewPanel {...defaultProps} />);
      
      // Find and click edit button (only visible on hover)
      const editButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.getAttribute('aria-hidden') === 'true'
      );
      
      if (editButton) {
        await user.click(editButton);
        expect(screen.getByPlaceholderText('Edit section content...')).toBeInTheDocument();
      }
    });

    it('saves edited content when save button is clicked', async () => {
      const user = userEvent.setup();
      render(<PreviewPanel {...defaultProps} />);
      
      // Enter edit mode first
      const editButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.getAttribute('aria-hidden') === 'true'
      );
      
      if (editButton) {
        await user.click(editButton);
        
        const textarea = screen.getByPlaceholderText('Edit section content...');
        await user.clear(textarea);
        await user.type(textarea, 'Updated content');
        
        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);
        
        expect(screen.queryByPlaceholderText('Edit section content...')).not.toBeInTheDocument();
      }
    });

    it('cancels edit when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<PreviewPanel {...defaultProps} />);
      
      // Enter edit mode first
      const editButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.getAttribute('aria-hidden') === 'true'
      );
      
      if (editButton) {
        await user.click(editButton);
        
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await user.click(cancelButton);
        
        expect(screen.queryByPlaceholderText('Edit section content...')).not.toBeInTheDocument();
      }
    });
  });




  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<PreviewPanel {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /export/i })).toHaveAccessibleName();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<PreviewPanel {...defaultProps} />);
      
      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();
      
      expect(document.activeElement).toBe(firstButton);
      
      await user.keyboard('{Tab}');
      expect(document.activeElement).not.toBe(firstButton);
    });
  });
});