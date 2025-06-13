// PropPilot conversation and state management types

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: {
    sectionUpdated?: string;
    actionType?: 'draft_generation' | 'section_update' | 'refinement';
    readinessScore?: number;
  };
}

export interface ProposalSection {
  id: string;
  title: string;
  content: string;
  status: 'empty' | 'draft' | 'building' | 'complete' | 'needs_refinement';
  lastUpdated: Date;
  wordCount: number;
  completionPercentage: number;
  dependencies?: string[]; // Other section IDs this section depends on
}

export interface ProjectContext {
  clientName?: string;
  projectTitle?: string;
  industry?: string;
  budget?: string;
  timeline?: string;
  requirements: string[];
  objectives: string[];
  constraints: string[];
  readinessScore: number; // 0-100
}

export interface GenerationState {
  isGenerating: boolean;
  currentPhase: 'planning' | 'drafting' | 'refining' | 'complete';
  activeSection?: string;
  progress: number; // 0-100
  estimatedTimeRemaining?: number;
  error?: string;
}

export interface ConversationState {
  id: string;
  messages: Message[];
  projectContext: ProjectContext;
  proposalSections: Record<string, ProposalSection>;
  generationState: GenerationState;
  viewState: {
    showPreview: boolean;
    activeSection?: string;
    layout: 'chat-only' | 'split-view' | 'preview-focused';
    isMobile: boolean;
  };
  persistence: {
    lastSaved: Date;
    isDirty: boolean;
    autoSaveEnabled: boolean;
    version: number;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    conversationTitle?: string;
    tags: string[];
  };
}

export interface ConversationActions {
  // Message management
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  
  // Project context management
  updateProjectContext: (updates: Partial<ProjectContext>) => void;
  calculateReadinessScore: () => number;
  
  // Section management
  updateSection: (sectionId: string, updates: Partial<ProposalSection>) => void;
  addSection: (section: Omit<ProposalSection, 'id' | 'lastUpdated'>) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (sectionIds: string[]) => void;
  
  // Generation state management
  startGeneration: (phase: GenerationState['currentPhase']) => void;
  updateGenerationProgress: (progress: number, activeSection?: string) => void;
  completeGeneration: () => void;
  setGenerationError: (error: string) => void;
  
  // View state management
  togglePreview: () => void;
  setActiveSection: (sectionId?: string) => void;
  setLayout: (layout: ConversationState['viewState']['layout']) => void;
  setMobileView: (isMobile: boolean) => void;
  
  // Persistence management
  save: () => Promise<void>;
  load: (conversationId: string) => Promise<void>;
  enableAutoSave: (enabled: boolean) => void;
  createSnapshot: () => ConversationState;
  restoreSnapshot: (snapshot: ConversationState) => void;
  
  // History management
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export interface ConversationStore extends ConversationState {
  actions: ConversationActions;
}

// Default section templates
export const DEFAULT_SECTIONS: Record<string, Omit<ProposalSection, 'id' | 'lastUpdated'>> = {
  executive_summary: {
    title: 'Executive Summary',
    content: '',
    status: 'empty',
    wordCount: 0,
    completionPercentage: 0,
  },
  project_overview: {
    title: 'Project Overview',
    content: '',
    status: 'empty',
    wordCount: 0,
    completionPercentage: 0,
    dependencies: ['executive_summary'],
  },
  scope_deliverables: {
    title: 'Scope & Deliverables',
    content: '',
    status: 'empty',
    wordCount: 0,
    completionPercentage: 0,
    dependencies: ['project_overview'],
  },
  timeline_milestones: {
    title: 'Timeline & Milestones',
    content: '',
    status: 'empty',
    wordCount: 0,
    completionPercentage: 0,
    dependencies: ['scope_deliverables'],
  },
  budget_pricing: {
    title: 'Budget & Pricing',
    content: '',
    status: 'empty',
    wordCount: 0,
    completionPercentage: 0,
    dependencies: ['scope_deliverables'],
  },
  team_expertise: {
    title: 'Team & Expertise',
    content: '',
    status: 'empty',
    wordCount: 0,
    completionPercentage: 0,
  },
  next_steps: {
    title: 'Next Steps',
    content: '',
    status: 'empty',
    wordCount: 0,
    completionPercentage: 0,
    dependencies: ['timeline_milestones', 'budget_pricing'],
  },
};

// Readiness calculation weights
export const READINESS_WEIGHTS = {
  clientName: 10,
  projectTitle: 10,
  industry: 5,
  budget: 15,
  timeline: 15,
  requirements: 20,
  objectives: 15,
  constraints: 10,
} as const;

export type ReadinessCategory = keyof typeof READINESS_WEIGHTS;
