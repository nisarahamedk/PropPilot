import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import {
  ConversationState,
  ConversationActions,
  ConversationStore,
  Message,
  ProjectContext,
  ProposalSection,
  GenerationState,
  DEFAULT_SECTIONS,
  READINESS_WEIGHTS,
  ReadinessCategory,
} from '../types';

interface HistoryState {
  past: ConversationState[];
  present: ConversationState;
  future: ConversationState[];
}

const createInitialState = (): ConversationState => ({
  id: nanoid(),
  messages: [],
  projectContext: {
    requirements: [],
    objectives: [],
    constraints: [],
    readinessScore: 0,
  },
  proposalSections: Object.entries(DEFAULT_SECTIONS).reduce(
    (acc, [key, section]) => {
      acc[key] = {
        ...section,
        id: key,
        lastUpdated: new Date(),
      };
      return acc;
    },
    {} as Record<string, ProposalSection>
  ),
  generationState: {
    isGenerating: false,
    currentPhase: 'planning',
    progress: 0,
  },
  viewState: {
    showPreview: false,
    layout: 'chat-only',
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
});

const calculateReadinessScore = (context: ProjectContext): number => {
  let totalScore = 0;
  let maxScore = 0;

  Object.entries(READINESS_WEIGHTS).forEach(([key, weight]) => {
    maxScore += weight;
    const value = context[key as ReadinessCategory];
    
    if (Array.isArray(value)) {
      if (value.length > 0) totalScore += weight;
    } else if (value && value.trim().length > 0) {
      totalScore += weight;
    }
  });

  return Math.round((totalScore / maxScore) * 100);
};

const saveToStorage = async (state: ConversationState): Promise<void> => {
  try {
    const serializedState = {
      ...state,
      persistence: {
        ...state.persistence,
        lastSaved: new Date(),
        isDirty: false,
      },
    };
    
    localStorage.setItem(`conversation-${state.id}`, JSON.stringify(serializedState));
    
    // Also save to conversation list
    const existingConversations = JSON.parse(
      localStorage.getItem('conversations-list') || '[]'
    );
    
    const conversationSummary = {
      id: state.id,
      title: state.metadata.conversationTitle || 
             state.projectContext.projectTitle || 
             `Conversation ${state.messages.length} messages`,
      lastUpdated: new Date(),
      messageCount: state.messages.length,
      readinessScore: state.projectContext.readinessScore,
    };
    
    const updatedList = existingConversations.filter((c: any) => c.id !== state.id);
    updatedList.unshift(conversationSummary);
    
    localStorage.setItem('conversations-list', JSON.stringify(updatedList.slice(0, 50))); // Keep last 50
  } catch (error) {
    console.error('Failed to save conversation:', error);
    throw error;
  }
};

const loadFromStorage = async (conversationId: string): Promise<ConversationState | null> => {
  try {
    const stored = localStorage.getItem(`conversation-${conversationId}`);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Convert date strings back to Date objects
    return {
      ...parsed,
      messages: parsed.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
      proposalSections: Object.entries(parsed.proposalSections).reduce(
        (acc, [key, section]: [string, any]) => {
          acc[key] = {
            ...section,
            lastUpdated: new Date(section.lastUpdated),
          };
          return acc;
        },
        {} as Record<string, ProposalSection>
      ),
      persistence: {
        ...parsed.persistence,
        lastSaved: new Date(parsed.persistence.lastSaved),
      },
      metadata: {
        ...parsed.metadata,
        createdAt: new Date(parsed.metadata.createdAt),
        updatedAt: new Date(parsed.metadata.updatedAt),
      },
    };
  } catch (error) {
    console.error('Failed to load conversation:', error);
    return null;
  }
};

export const useConversationStore = create<any>()(
  persist(
    immer((set: any, get: any) => {
      let autoSaveTimeout: NodeJS.Timeout | null = null;
      let history: HistoryState = {
        past: [],
        present: createInitialState(),
        future: [],
      };

      const triggerAutoSave = () => {
        const state = get();
        if (!state.persistence.autoSaveEnabled) return;

        if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
        
        autoSaveTimeout = setTimeout(async () => {
          try {
            await state.actions.save();
          } catch (error) {
            console.error('Auto-save failed:', error);
          }
        }, 2000); // 2 second debounce
      };

      const updateHistory = (newState: ConversationState) => {
        history = {
          past: [...history.past, history.present].slice(-50), // Keep last 50 states
          present: newState,
          future: [],
        };
      };

      const markDirty = () => {
        set((state: any) => {
          state.persistence.isDirty = true;
          state.persistence.version += 1;
          state.metadata.updatedAt = new Date();
        });
        triggerAutoSave();
      };

      const actions: ConversationActions = {
        // Message management
        addMessage: (message) => {
          const newMessage: Message = {
            ...message,
            id: nanoid(),
            timestamp: new Date(),
          };

          set((state: any) => {
            updateHistory(state);
            state.messages.push(newMessage);
            
            // Update readiness score if this is a user message
            if (message.role === 'user') {
              state.projectContext.readinessScore = calculateReadinessScore(state.projectContext);
            }
          });
          markDirty();
        },

        updateMessage: (messageId, updates) => {
          set((state: any) => {
            updateHistory(state);
            const messageIndex = state.messages.findIndex(m => m.id === messageId);
            if (messageIndex !== -1) {
              Object.assign(state.messages[messageIndex], updates);
            }
          });
          markDirty();
        },

        deleteMessage: (messageId) => {
          set((state: any) => {
            updateHistory(state);
            state.messages = state.messages.filter(m => m.id !== messageId);
          });
          markDirty();
        },

        // Project context management
        updateProjectContext: (updates) => {
          set((state: any) => {
            updateHistory(state);
            Object.assign(state.projectContext, updates);
            state.projectContext.readinessScore = calculateReadinessScore(state.projectContext);
          });
          markDirty();
        },

        calculateReadinessScore: () => {
          const state = get();
          return calculateReadinessScore(state.projectContext);
        },

        // Section management
        updateSection: (sectionId, updates) => {
          set((state: any) => {
            updateHistory(state);
            if (state.proposalSections[sectionId]) {
              Object.assign(state.proposalSections[sectionId], {
                ...updates,
                lastUpdated: new Date(),
              });
              
              // Calculate word count and completion percentage
              if (updates.content !== undefined) {
                const section = state.proposalSections[sectionId];
                section.wordCount = updates.content.split(/\s+/).filter(word => word.length > 0).length;
                section.completionPercentage = Math.min(100, Math.round((section.wordCount / 200) * 100)); // Assume 200 words is complete
              }
            }
          });
          markDirty();
        },

        addSection: (section) => {
          const newSection: ProposalSection = {
            ...section,
            id: nanoid(),
            lastUpdated: new Date(),
          };

          set((state: any) => {
            updateHistory(state);
            state.proposalSections[newSection.id] = newSection;
          });
          markDirty();
        },

        removeSection: (sectionId) => {
          set((state: any) => {
            updateHistory(state);
            delete state.proposalSections[sectionId];
          });
          markDirty();
        },

        reorderSections: (sectionIds) => {
          set((state: any) => {
            updateHistory(state);
            const newSections: Record<string, ProposalSection> = {};
            sectionIds.forEach(id => {
              if (state.proposalSections[id]) {
                newSections[id] = state.proposalSections[id];
              }
            });
            state.proposalSections = newSections;
          });
          markDirty();
        },

        // Generation state management
        startGeneration: (phase) => {
          set((state: any) => {
            updateHistory(state);
            state.generationState = {
              isGenerating: true,
              currentPhase: phase,
              progress: 0,
              error: undefined,
            };
          });
          markDirty();
        },

        updateGenerationProgress: (progress, activeSection) => {
          set((state: any) => {
            state.generationState.progress = Math.max(0, Math.min(100, progress));
            if (activeSection) {
              state.generationState.activeSection = activeSection;
            }
          });
        },

        completeGeneration: () => {
          set((state: any) => {
            state.generationState = {
              isGenerating: false,
              currentPhase: 'complete',
              progress: 100,
              error: undefined,
            };
          });
          markDirty();
        },

        setGenerationError: (error) => {
          set((state: any) => {
            state.generationState.isGenerating = false;
            state.generationState.error = error;
          });
          markDirty();
        },

        // View state management
        togglePreview: () => {
          set((state: any) => {
            state.viewState.showPreview = !state.viewState.showPreview;
            if (state.viewState.showPreview && state.viewState.layout === 'chat-only') {
              state.viewState.layout = 'split-view';
            } else if (!state.viewState.showPreview) {
              state.viewState.layout = 'chat-only';
            }
          });
        },

        setActiveSection: (sectionId) => {
          set((state: any) => {
            state.viewState.activeSection = sectionId;
          });
        },

        setLayout: (layout) => {
          set((state: any) => {
            state.viewState.layout = layout;
            state.viewState.showPreview = layout !== 'chat-only';
          });
        },

        setMobileView: (isMobile) => {
          set((state: any) => {
            state.viewState.isMobile = isMobile;
            if (isMobile && state.viewState.layout === 'split-view') {
              state.viewState.layout = 'chat-only';
            }
          });
        },

        // Persistence management
        save: async () => {
          const state = get();
          await saveToStorage(state);
          
          set((draft) => {
            draft.persistence.lastSaved = new Date();
            draft.persistence.isDirty = false;
          });
        },

        load: async (conversationId) => {
          const loadedState = await loadFromStorage(conversationId);
          if (loadedState) {
            set(() => loadedState);
            history = {
              past: [],
              present: loadedState,
              future: [],
            };
          }
        },

        enableAutoSave: (enabled) => {
          set((state: any) => {
            state.persistence.autoSaveEnabled = enabled;
          });
        },

        createSnapshot: () => {
          const state = get();
          return JSON.parse(JSON.stringify(state));
        },

        restoreSnapshot: (snapshot) => {
          set(() => snapshot);
          history = {
            past: [],
            present: snapshot,
            future: [],
          };
        },

        // History management
        undo: () => {
          if (history.past.length === 0) return;
          
          const previous = history.past[history.past.length - 1];
          const newPast = history.past.slice(0, -1);
          
          history = {
            past: newPast,
            present: previous,
            future: [history.present, ...history.future],
          };
          
          set(() => previous);
        },

        redo: () => {
          if (history.future.length === 0) return;
          
          const next = history.future[0];
          const newFuture = history.future.slice(1);
          
          history = {
            past: [...history.past, history.present],
            present: next,
            future: newFuture,
          };
          
          set(() => next);
        },

        canUndo: () => history.past.length > 0,
        canRedo: () => history.future.length > 0,
      };

      const initialState = createInitialState();
      history.present = initialState;

      return {
        ...initialState,
        actions,
      };
    }),
    {
      name: 'conversation-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        id: state.id,
        messages: state.messages,
        projectContext: state.projectContext,
        proposalSections: state.proposalSections,
        generationState: state.generationState,
        viewState: state.viewState,
        persistence: state.persistence,
        metadata: state.metadata,
      }),
    }
  )
);

// Utility hooks for specific parts of the store
export const useConversationMessages = () => useConversationStore((state) => state.messages);
export const useProjectContext = () => useConversationStore((state) => state.projectContext);
export const useProposalSections = () => useConversationStore((state) => state.proposalSections);
export const useGenerationState = () => useConversationStore((state) => state.generationState);
export const useViewState = () => useConversationStore((state) => state.viewState);
export const useConversationActions = () => useConversationStore((state) => state.actions);

// Selector hooks for performance
export const useActiveSection = () => useConversationStore((state) => {
  const activeSectionId = state.viewState.activeSection;
  return activeSectionId ? state.proposalSections[activeSectionId] : undefined;
});

export const useReadinessScore = () => useConversationStore((state) => state.projectContext.readinessScore);

export const useIsDirty = () => useConversationStore((state) => state.persistence.isDirty);

export const useCanGenerateDraft = () => useConversationStore((state) => 
  state.projectContext.readinessScore >= 30 && !state.generationState.isGenerating
);