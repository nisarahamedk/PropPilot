import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ProposalSection } from '../types';

interface RefinementSession {
  id: string;
  conversationId: string;
  startedAt: Date;
  lastModified: Date;
  originalSections: Record<string, ProposalSection>;
  currentSections: Record<string, ProposalSection>;
  changes: RefinementChange[];
  isActive: boolean;
  title: string;
}

interface RefinementChange {
  id: string;
  sectionId: string;
  timestamp: Date;
  changeType: 'content' | 'structure' | 'style' | 'delete' | 'create';
  beforeValue: any;
  afterValue: any;
  description: string;
  userAction: 'manual_edit' | 'ai_suggestion' | 'bulk_operation';
}

interface RefinementDraft {
  id: string;
  sessionId: string;
  sectionId: string;
  content: string;
  timestamp: Date;
  isAutoSave: boolean;
  wordCount: number;
  changes: number; // Number of changes from original
}

interface RefinementState {
  sessions: Record<string, RefinementSession>;
  drafts: Record<string, RefinementDraft[]>; // Key: sectionId, Value: array of drafts
  activeSessionId?: string;
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // in seconds
  maxDraftsPerSection: number;
  maxSessions: number;
}

interface RefinementActions {
  // Session management
  startRefinementSession: (conversationId: string, sections: Record<string, ProposalSection>) => string;
  endRefinementSession: (sessionId: string) => void;
  pauseRefinementSession: (sessionId: string) => void;
  resumeRefinementSession: (sessionId: string) => void;
  deleteRefinementSession: (sessionId: string) => void;
  
  // Change tracking
  recordChange: (sessionId: string, change: Omit<RefinementChange, 'id' | 'timestamp'>) => void;
  undoChange: (sessionId: string, changeId: string) => void;
  redoChange: (sessionId: string, changeId: string) => void;
  
  // Draft management
  saveDraft: (sessionId: string, sectionId: string, content: string, isAutoSave?: boolean) => void;
  loadDraft: (sectionId: string, draftId: string) => RefinementDraft | undefined;
  deleteDraft: (sectionId: string, draftId: string) => void;
  restoreDraft: (sessionId: string, sectionId: string, draftId: string) => void;
  
  // Section operations
  updateSectionInSession: (sessionId: string, sectionId: string, updates: Partial<ProposalSection>) => void;
  revertSectionToOriginal: (sessionId: string, sectionId: string) => void;
  compareSectionVersions: (sessionId: string, sectionId: string) => { original: ProposalSection; current: ProposalSection; changes: RefinementChange[] };
  
  // Bulk operations
  saveAllDrafts: (sessionId: string) => void;
  revertAllSections: (sessionId: string) => void;
  applyAllChanges: (sessionId: string) => Record<string, ProposalSection>;
  
  // Settings
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
  setMaxDraftsPerSection: (max: number) => void;
  
  // Utilities
  getSessionHistory: (conversationId: string) => RefinementSession[];
  getSessionStats: (sessionId: string) => { totalChanges: number; sectionsModified: number; timeSpent: number };
  cleanupOldSessions: (olderThanDays: number) => number;
  exportSession: (sessionId: string) => Blob;
}

interface RefinementStore extends RefinementState {
  actions: RefinementActions;
}

const calculateWordCount = (content: string): number => {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
};

const calculateChanges = (original: string, current: string): number => {
  // Simple change calculation - could be enhanced with proper diff algorithm
  const originalWords = original.trim().split(/\s+/);
  const currentWords = current.trim().split(/\s+/);
  
  return Math.abs(originalWords.length - currentWords.length) + 
         Math.abs(original.length - current.length);
};

export const useRefinementStore = create<any>()(
  persist(
    immer((set: any, get: any) => {
      let autoSaveTimeouts: Record<string, NodeJS.Timeout> = {};

      const triggerAutoSave = (sessionId: string, sectionId: string, content: string) => {
        const state = get();
        if (!state.autoSaveEnabled) return;

        const timeoutKey = `${sessionId}-${sectionId}`;
        if (autoSaveTimeouts[timeoutKey]) {
          clearTimeout(autoSaveTimeouts[timeoutKey]);
        }

        autoSaveTimeouts[timeoutKey] = setTimeout(() => {
          const actions = get().actions;
          actions.saveDraft(sessionId, sectionId, content, true);
          delete autoSaveTimeouts[timeoutKey];
        }, state.autoSaveInterval * 1000);
      };

      const actions: RefinementActions = {
        startRefinementSession: (conversationId, sections) => {
          const sessionId = crypto.randomUUID();
          const now = new Date();
          
          const session: RefinementSession = {
            id: sessionId,
            conversationId,
            startedAt: now,
            lastModified: now,
            originalSections: JSON.parse(JSON.stringify(sections)), // Deep copy
            currentSections: JSON.parse(JSON.stringify(sections)), // Deep copy
            changes: [],
            isActive: true,
            title: `Refinement Session ${now.toLocaleString()}`,
          };

          set((state: any) => {
            state.sessions[sessionId] = session;
            state.activeSessionId = sessionId;
            
            // Clean up old sessions if we exceed max
            const sessionCount = Object.keys(state.sessions).length;
            if (sessionCount > state.maxSessions) {
              const sortedSessions = Object.values(state.sessions)
                .sort((a, b) => a.lastModified.getTime() - b.lastModified.getTime());
              
              const toDelete = sortedSessions.slice(0, sessionCount - state.maxSessions);
              toDelete.forEach(session => {
                delete state.sessions[session.id];
                if (state.activeSessionId === session.id) {
                  state.activeSessionId = undefined;
                }
              });
            }
          });

          return sessionId;
        },

        endRefinementSession: (sessionId) => {
          set((state: any) => {
            if (state.sessions[sessionId]) {
              state.sessions[sessionId].isActive = false;
              if (state.activeSessionId === sessionId) {
                state.activeSessionId = undefined;
              }
            }
          });
          
          // Clear any pending auto-saves for this session
          Object.keys(autoSaveTimeouts).forEach(key => {
            if (key.startsWith(sessionId)) {
              clearTimeout(autoSaveTimeouts[key]);
              delete autoSaveTimeouts[key];
            }
          });
        },

        pauseRefinementSession: (sessionId) => {
          set((state: any) => {
            if (state.sessions[sessionId]) {
              state.sessions[sessionId].isActive = false;
            }
          });
        },

        resumeRefinementSession: (sessionId) => {
          set((state: any) => {
            if (state.sessions[sessionId]) {
              state.sessions[sessionId].isActive = true;
              state.activeSessionId = sessionId;
            }
          });
        },

        deleteRefinementSession: (sessionId) => {
          set((state: any) => {
            delete state.sessions[sessionId];
            if (state.activeSessionId === sessionId) {
              state.activeSessionId = undefined;
            }
            
            // Clean up drafts for this session
            Object.keys(state.drafts).forEach(sectionId => {
              state.drafts[sectionId] = state.drafts[sectionId].filter(
                draft => draft.sessionId !== sessionId
              );
              if (state.drafts[sectionId].length === 0) {
                delete state.drafts[sectionId];
              }
            });
          });
        },

        recordChange: (sessionId, change) => {
          const changeRecord: RefinementChange = {
            ...change,
            id: crypto.randomUUID(),
            timestamp: new Date(),
          };

          set((state: any) => {
            if (state.sessions[sessionId]) {
              state.sessions[sessionId].changes.push(changeRecord);
              state.sessions[sessionId].lastModified = new Date();
            }
          });
        },

        undoChange: (sessionId, changeId) => {
          set((state: any) => {
            const session = state.sessions[sessionId];
            if (!session) return;

            const changeIndex = session.changes.findIndex(c => c.id === changeId);
            if (changeIndex === -1) return;

            const change = session.changes[changeIndex];
            const section = session.currentSections[change.sectionId];
            
            if (section && change.changeType === 'content') {
              Object.assign(section, { content: change.beforeValue });
            }
            
            // Mark change as undone (could add a status field)
            session.changes[changeIndex].description += ' (undone)';
          });
        },

        redoChange: (sessionId, changeId) => {
          set((state: any) => {
            const session = state.sessions[sessionId];
            if (!session) return;

            const change = session.changes.find(c => c.id === changeId);
            if (!change) return;

            const section = session.currentSections[change.sectionId];
            
            if (section && change.changeType === 'content') {
              Object.assign(section, { content: change.afterValue });
            }
          });
        },

        saveDraft: (sessionId, sectionId, content, isAutoSave = false) => {
          const draft: RefinementDraft = {
            id: crypto.randomUUID(),
            sessionId,
            sectionId,
            content,
            timestamp: new Date(),
            isAutoSave,
            wordCount: calculateWordCount(content),
            changes: 0, // Will be calculated below
          };

          set((state: any) => {
            // Get original content for comparison
            const session = state.sessions[sessionId];
            if (session) {
              const originalSection = session.originalSections[sectionId];
              if (originalSection) {
                draft.changes = calculateChanges(originalSection.content, content);
              }
            }

            if (!state.drafts[sectionId]) {
              state.drafts[sectionId] = [];
            }
            
            state.drafts[sectionId].unshift(draft);
            
            // Keep only max drafts per section
            if (state.drafts[sectionId].length > state.maxDraftsPerSection) {
              state.drafts[sectionId] = state.drafts[sectionId].slice(0, state.maxDraftsPerSection);
            }
          });

          // Record the change
          if (sessionId) {
            const state = get();
            const session = state.sessions[sessionId];
            if (session) {
              const originalContent = session.originalSections[sectionId]?.content || '';
              actions.recordChange(sessionId, {
                sectionId,
                changeType: 'content',
                beforeValue: originalContent,
                afterValue: content,
                description: isAutoSave ? 'Auto-saved draft' : 'Manual draft save',
                userAction: isAutoSave ? 'ai_suggestion' : 'manual_edit',
              });
            }
          }
        },

        loadDraft: (sectionId, draftId) => {
          const state = get();
          const drafts = state.drafts[sectionId];
          return drafts?.find(draft => draft.id === draftId);
        },

        deleteDraft: (sectionId, draftId) => {
          set((state: any) => {
            if (state.drafts[sectionId]) {
              state.drafts[sectionId] = state.drafts[sectionId].filter(
                draft => draft.id !== draftId
              );
              if (state.drafts[sectionId].length === 0) {
                delete state.drafts[sectionId];
              }
            }
          });
        },

        restoreDraft: (sessionId, sectionId, draftId) => {
          const draft = actions.loadDraft(sectionId, draftId);
          if (draft) {
            actions.updateSectionInSession(sessionId, sectionId, {
              content: draft.content,
            });
          }
        },

        updateSectionInSession: (sessionId, sectionId, updates) => {
          set((state: any) => {
            const session = state.sessions[sessionId];
            if (!session || !session.currentSections[sectionId]) return;

            const section = session.currentSections[sectionId];
            const beforeValue = { ...section };
            
            Object.assign(section, {
              ...updates,
              lastUpdated: new Date(),
            });

            session.lastModified = new Date();
          });

          // Trigger auto-save if content changed
          if (updates.content) {
            triggerAutoSave(sessionId, sectionId, updates.content);
          }
        },

        revertSectionToOriginal: (sessionId, sectionId) => {
          set((state: any) => {
            const session = state.sessions[sessionId];
            if (!session) return;

            const original = session.originalSections[sectionId];
            if (original) {
              session.currentSections[sectionId] = JSON.parse(JSON.stringify(original));
              session.lastModified = new Date();
            }
          });
        },

        compareSectionVersions: (sessionId, sectionId) => {
          const state = get();
          const session = state.sessions[sessionId];
          if (!session) {
            throw new Error('Session not found');
          }

          const original = session.originalSections[sectionId];
          const current = session.currentSections[sectionId];
          const changes = session.changes.filter(c => c.sectionId === sectionId);

          return { original, current, changes };
        },

        saveAllDrafts: (sessionId) => {
          const state = get();
          const session = state.sessions[sessionId];
          if (!session) return;

          Object.entries(session.currentSections).forEach(([sectionId, section]) => {
            actions.saveDraft(sessionId, sectionId, section.content, false);
          });
        },

        revertAllSections: (sessionId) => {
          const state = get();
          const session = state.sessions[sessionId];
          if (!session) return;

          Object.keys(session.currentSections).forEach(sectionId => {
            actions.revertSectionToOriginal(sessionId, sectionId);
          });
        },

        applyAllChanges: (sessionId) => {
          const state = get();
          const session = state.sessions[sessionId];
          if (!session) return {};

          return JSON.parse(JSON.stringify(session.currentSections));
        },

        setAutoSaveEnabled: (enabled) => {
          set((state: any) => {
            state.autoSaveEnabled = enabled;
          });
        },

        setAutoSaveInterval: (interval) => {
          set((state: any) => {
            state.autoSaveInterval = Math.max(5, Math.min(300, interval)); // Between 5 and 300 seconds
          });
        },

        setMaxDraftsPerSection: (max) => {
          set((state: any) => {
            state.maxDraftsPerSection = Math.max(1, Math.min(50, max)); // Between 1 and 50
          });
        },

        getSessionHistory: (conversationId) => {
          const state = get();
          return Object.values(state.sessions)
            .filter(session => session.conversationId === conversationId)
            .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
        },

        getSessionStats: (sessionId) => {
          const state = get();
          const session = state.sessions[sessionId];
          if (!session) return { totalChanges: 0, sectionsModified: 0, timeSpent: 0 };

          const totalChanges = session.changes.length;
          const sectionsModified = new Set(session.changes.map(c => c.sectionId)).size;
          const timeSpent = new Date().getTime() - session.startedAt.getTime();

          return { totalChanges, sectionsModified, timeSpent };
        },

        cleanupOldSessions: (olderThanDays) => {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

          const state = get();
          const oldSessions = Object.values(state.sessions).filter(
            session => session.lastModified < cutoffDate && !session.isActive
          );

          oldSessions.forEach(session => {
            actions.deleteRefinementSession(session.id);
          });

          return oldSessions.length;
        },

        exportSession: (sessionId) => {
          const state = get();
          const session = state.sessions[sessionId];
          if (!session) throw new Error('Session not found');

          const exportData = {
            session,
            drafts: Object.entries(state.drafts).reduce((acc, [sectionId, drafts]) => {
              const sessionDrafts = drafts.filter(d => d.sessionId === sessionId);
              if (sessionDrafts.length > 0) {
                acc[sectionId] = sessionDrafts;
              }
              return acc;
            }, {} as Record<string, RefinementDraft[]>),
            exportDate: new Date().toISOString(),
          };

          return new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json',
          });
        },
      };

      return {
        sessions: {},
        drafts: {},
        autoSaveEnabled: true,
        autoSaveInterval: 30, // 30 seconds
        maxDraftsPerSection: 20,
        maxSessions: 100,
        actions,
      };
    }),
    {
      name: 'refinement-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        drafts: state.drafts,
        autoSaveEnabled: state.autoSaveEnabled,
        autoSaveInterval: state.autoSaveInterval,
        maxDraftsPerSection: state.maxDraftsPerSection,
        maxSessions: state.maxSessions,
        activeSessionId: state.activeSessionId,
      }),
    }
  )
);

// Utility hooks
export const useActiveRefinementSession = () => {
  const store = useRefinementStore();
  return store.activeSessionId ? store.sessions[store.activeSessionId] : undefined;
};

export const useSectionDrafts = (sectionId: string) => {
  const store = useRefinementStore();
  return store.drafts[sectionId] || [];
};

export const useRefinementActions = () => useRefinementStore(state => state.actions);