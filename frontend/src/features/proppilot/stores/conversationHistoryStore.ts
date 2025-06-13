import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ConversationState } from '../types';

interface ConversationSummary {
  id: string;
  title: string;
  lastUpdated: Date;
  messageCount: number;
  readinessScore: number;
  projectTitle?: string;
  clientName?: string;
  tags: string[];
  isStarred: boolean;
  isArchived: boolean;
}

interface ConversationHistoryState {
  conversations: ConversationSummary[];
  recentConversations: string[]; // IDs of recently accessed conversations
  starredConversations: string[]; // IDs of starred conversations
  archivedConversations: string[]; // IDs of archived conversations
  searchQuery: string;
  selectedTags: string[];
  sortBy: 'lastUpdated' | 'created' | 'title' | 'readinessScore';
  sortOrder: 'asc' | 'desc';
  currentConversationId?: string;
}

interface ConversationHistoryActions {
  // Conversation management
  addConversation: (conversation: ConversationState) => void;
  updateConversation: (conversation: ConversationState) => void;
  deleteConversation: (conversationId: string) => void;
  duplicateConversation: (conversationId: string) => Promise<string>;
  
  // Access tracking
  accessConversation: (conversationId: string) => void;
  setCurrentConversation: (conversationId: string) => void;
  
  // Organization
  starConversation: (conversationId: string, starred: boolean) => void;
  archiveConversation: (conversationId: string, archived: boolean) => void;
  tagConversation: (conversationId: string, tags: string[]) => void;
  
  // Search and filtering
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSortBy: (sortBy: ConversationHistoryState['sortBy']) => void;
  setSortOrder: (order: ConversationHistoryState['sortOrder']) => void;
  clearFilters: () => void;
  
  // Bulk operations
  bulkArchive: (conversationIds: string[]) => void;
  bulkDelete: (conversationIds: string[]) => void;
  bulkTag: (conversationIds: string[], tags: string[]) => void;
  
  // Data management
  exportConversations: (conversationIds?: string[]) => Promise<Blob>;
  importConversations: (file: File) => Promise<number>;
  cleanup: (olderThanDays: number) => number;
  
  // Getters
  getFilteredConversations: () => ConversationSummary[];
  getAllTags: () => string[];
  getConversationById: (id: string) => ConversationSummary | undefined;
}

interface ConversationHistoryStore extends ConversationHistoryState {
  actions: ConversationHistoryActions;
}

const createConversationSummary = (conversation: ConversationState): ConversationSummary => ({
  id: conversation.id,
  title: conversation.metadata.conversationTitle || 
         conversation.projectContext.projectTitle || 
         `Conversation ${conversation.messages.length} messages`,
  lastUpdated: conversation.metadata.updatedAt,
  messageCount: conversation.messages.length,
  readinessScore: conversation.projectContext.readinessScore,
  projectTitle: conversation.projectContext.projectTitle,
  clientName: conversation.projectContext.clientName,
  tags: conversation.metadata.tags,
  isStarred: false,
  isArchived: false,
});

const filterConversations = (
  conversations: ConversationSummary[],
  searchQuery: string,
  selectedTags: string[],
  sortBy: ConversationHistoryState['sortBy'],
  sortOrder: ConversationHistoryState['sortOrder']
): ConversationSummary[] => {
  let filtered = [...conversations];

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      conv =>
        conv.title.toLowerCase().includes(query) ||
        conv.projectTitle?.toLowerCase().includes(query) ||
        conv.clientName?.toLowerCase().includes(query) ||
        conv.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  // Apply tag filter
  if (selectedTags.length > 0) {
    filtered = filtered.filter(conv =>
      selectedTags.some(tag => conv.tags.includes(tag))
    );
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'lastUpdated':
        aValue = a.lastUpdated.getTime();
        bValue = b.lastUpdated.getTime();
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'readinessScore':
        aValue = a.readinessScore;
        bValue = b.readinessScore;
        break;
      default:
        aValue = a.lastUpdated.getTime();
        bValue = b.lastUpdated.getTime();
    }

    if (sortOrder === 'desc') {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    } else {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
  });

  return filtered;
};

export const useConversationHistoryStore = create<any>()(
  persist(
    immer((set: any, get: any) => {
      const actions: ConversationHistoryActions = {
        addConversation: (conversation) => {
          const summary = createConversationSummary(conversation);
          
          set((state: any) => {
            // Remove if already exists
            state.conversations = state.conversations.filter(c => c.id !== conversation.id);
            // Add to beginning
            state.conversations.unshift(summary);
            // Keep only last 1000 conversations
            state.conversations = state.conversations.slice(0, 1000);
          });
        },

        updateConversation: (conversation) => {
          const summary = createConversationSummary(conversation);
          
          set((state: any) => {
            const index = state.conversations.findIndex(c => c.id === conversation.id);
            if (index !== -1) {
              // Preserve starred and archived status
              const existing = state.conversations[index];
              state.conversations[index] = {
                ...summary,
                isStarred: existing.isStarred,
                isArchived: existing.isArchived,
              };
            } else {
              state.conversations.unshift(summary);
            }
          });
        },

        deleteConversation: (conversationId) => {
          set((state: any) => {
            state.conversations = state.conversations.filter(c => c.id !== conversationId);
            state.recentConversations = state.recentConversations.filter(id => id !== conversationId);
            state.starredConversations = state.starredConversations.filter(id => id !== conversationId);
            state.archivedConversations = state.archivedConversations.filter(id => id !== conversationId);
            
            if (state.currentConversationId === conversationId) {
              state.currentConversationId = undefined;
            }
          });

          // Also remove from localStorage
          localStorage.removeItem(`conversation-${conversationId}`);
        },

        duplicateConversation: async (conversationId) => {
          const stored = localStorage.getItem(`conversation-${conversationId}`);
          if (!stored) throw new Error('Conversation not found');

          const original = JSON.parse(stored);
          const duplicate = {
            ...original,
            id: crypto.randomUUID(),
            metadata: {
              ...original.metadata,
              conversationTitle: `${original.metadata.conversationTitle || 'Untitled'} (Copy)`,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            messages: [], // Start with empty messages
          };

          localStorage.setItem(`conversation-${duplicate.id}`, JSON.stringify(duplicate));
          
          const summary = createConversationSummary(duplicate);
          set((state: any) => {
            state.conversations.unshift(summary);
          });

          return duplicate.id;
        },

        accessConversation: (conversationId) => {
          set((state: any) => {
            // Remove from recent if already there
            state.recentConversations = state.recentConversations.filter(id => id !== conversationId);
            // Add to beginning
            state.recentConversations.unshift(conversationId);
            // Keep only last 20
            state.recentConversations = state.recentConversations.slice(0, 20);
          });
        },

        setCurrentConversation: (conversationId) => {
          set((state: any) => {
            state.currentConversationId = conversationId;
          });
          actions.accessConversation(conversationId);
        },

        starConversation: (conversationId, starred) => {
          set((state: any) => {
            const conversation = state.conversations.find(c => c.id === conversationId);
            if (conversation) {
              conversation.isStarred = starred;
            }

            if (starred) {
              if (!state.starredConversations.includes(conversationId)) {
                state.starredConversations.push(conversationId);
              }
            } else {
              state.starredConversations = state.starredConversations.filter(id => id !== conversationId);
            }
          });
        },

        archiveConversation: (conversationId, archived) => {
          set((state: any) => {
            const conversation = state.conversations.find(c => c.id === conversationId);
            if (conversation) {
              conversation.isArchived = archived;
            }

            if (archived) {
              if (!state.archivedConversations.includes(conversationId)) {
                state.archivedConversations.push(conversationId);
              }
            } else {
              state.archivedConversations = state.archivedConversations.filter(id => id !== conversationId);
            }
          });
        },

        tagConversation: (conversationId, tags) => {
          set((state: any) => {
            const conversation = state.conversations.find(c => c.id === conversationId);
            if (conversation) {
              conversation.tags = tags;
            }
          });
        },

        setSearchQuery: (query) => {
          set((state: any) => {
            state.searchQuery = query;
          });
        },

        setSelectedTags: (tags) => {
          set((state: any) => {
            state.selectedTags = tags;
          });
        },

        setSortBy: (sortBy) => {
          set((state: any) => {
            state.sortBy = sortBy;
          });
        },

        setSortOrder: (order) => {
          set((state: any) => {
            state.sortOrder = order;
          });
        },

        clearFilters: () => {
          set((state: any) => {
            state.searchQuery = '';
            state.selectedTags = [];
          });
        },

        bulkArchive: (conversationIds) => {
          conversationIds.forEach(id => actions.archiveConversation(id, true));
        },

        bulkDelete: (conversationIds) => {
          conversationIds.forEach(id => actions.deleteConversation(id));
        },

        bulkTag: (conversationIds, tags) => {
          conversationIds.forEach(id => actions.tagConversation(id, tags));
        },

        exportConversations: async (conversationIds) => {
          const state = get();
          const toExport = conversationIds || state.conversations.map(c => c.id);
          
          const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            conversations: await Promise.all(
              toExport.map(async (id) => {
                const stored = localStorage.getItem(`conversation-${id}`);
                return stored ? JSON.parse(stored) : null;
              })
            ).then(results => results.filter(Boolean)),
          };

          const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json',
          });

          return blob;
        },

        importConversations: async (file) => {
          const text = await file.text();
          const importData = JSON.parse(text);
          
          let importedCount = 0;
          
          if (importData.conversations && Array.isArray(importData.conversations)) {
            for (const conversation of importData.conversations) {
              const newId = crypto.randomUUID();
              const updatedConversation = {
                ...conversation,
                id: newId,
                metadata: {
                  ...conversation.metadata,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              };
              
              localStorage.setItem(`conversation-${newId}`, JSON.stringify(updatedConversation));
              actions.addConversation(updatedConversation);
              importedCount++;
            }
          }
          
          return importedCount;
        },

        cleanup: (olderThanDays) => {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
          
          const state = get();
          const toDelete = state.conversations.filter(
            c => !c.isStarred && !c.isArchived && c.lastUpdated < cutoffDate
          );
          
          toDelete.forEach(conversation => {
            actions.deleteConversation(conversation.id);
          });
          
          return toDelete.length;
        },

        getFilteredConversations: () => {
          const state = get();
          return filterConversations(
            state.conversations,
            state.searchQuery,
            state.selectedTags,
            state.sortBy,
            state.sortOrder
          );
        },

        getAllTags: () => {
          const state = get();
          const allTags = new Set<string>();
          state.conversations.forEach(conv => {
            conv.tags.forEach(tag => allTags.add(tag));
          });
          return Array.from(allTags).sort();
        },

        getConversationById: (id) => {
          const state = get();
          return state.conversations.find(c => c.id === id);
        },
      };

      return {
        conversations: [],
        recentConversations: [],
        starredConversations: [],
        archivedConversations: [],
        searchQuery: '',
        selectedTags: [],
        sortBy: 'lastUpdated',
        sortOrder: 'desc',
        actions,
      };
    }),
    {
      name: 'conversation-history-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        recentConversations: state.recentConversations,
        starredConversations: state.starredConversations,
        archivedConversations: state.archivedConversations,
        searchQuery: state.searchQuery,
        selectedTags: state.selectedTags,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        currentConversationId: state.currentConversationId,
      }),
    }
  )
);

// Utility hooks
export const useRecentConversations = () => {
  const store = useConversationHistoryStore();
  return store.recentConversations
    .map(id => store.conversations.find(c => c.id === id))
    .filter(Boolean) as ConversationSummary[];
};

export const useStarredConversations = () => {
  const store = useConversationHistoryStore();
  return store.conversations.filter(c => c.isStarred);
};

export const useArchivedConversations = () => {
  const store = useConversationHistoryStore();
  return store.conversations.filter(c => c.isArchived);
};

export const useActiveConversations = () => {
  const store = useConversationHistoryStore();
  return store.conversations.filter(c => !c.isArchived);
};