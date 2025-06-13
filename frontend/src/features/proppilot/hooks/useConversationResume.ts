import { useEffect, useCallback, useState } from 'react';
import { useConversationStore, useConversationActions } from '../stores/conversationStore';
import { useConversationHistoryStore } from '../stores/conversationHistoryStore';
import { useRefinementStore } from '../stores/refinementStore';
import { ConversationState, Message } from '../types';

interface ResumePoint {
  id: string;
  conversationId: string;
  messageIndex: number;
  timestamp: Date;
  description: string;
  context: {
    readinessScore: number;
    sectionsComplete: number;
    totalSections: number;
    generationPhase: string;
  };
  snapshot: ConversationState;
}

interface UseConversationResumeOptions {
  autoSaveResumePoints?: boolean;
  maxResumePoints?: number;
  resumePointInterval?: number; // minutes
}

interface UseConversationResumeReturn {
  // Resume points management
  resumePoints: ResumePoint[];
  currentResumePoint?: ResumePoint;
  
  // Actions
  createResumePoint: (description?: string) => void;
  resumeFromPoint: (resumePointId: string) => Promise<void>;
  deleteResumePoint: (resumePointId: string) => void;
  
  // Auto-resume functionality
  findBestResumePoint: () => ResumePoint | undefined;
  resumeFromLastSave: () => Promise<void>;
  resumeFromMessageIndex: (messageIndex: number) => Promise<void>;
  
  // State
  isResuming: boolean;
  resumeError?: string;
  
  // Context recovery
  recoverConversationContext: (conversationId: string) => Promise<boolean>;
  validateResumePoint: (resumePoint: ResumePoint) => boolean;
}

const STORAGE_KEY = 'proppilot-resume-points';

export const useConversationResume = (
  options: UseConversationResumeOptions = {}
): UseConversationResumeReturn => {
  const {
    autoSaveResumePoints = true,
    maxResumePoints = 50,
    resumePointInterval = 5, // 5 minutes
  } = options;

  const [resumePoints, setResumePoints] = useState<ResumePoint[]>([]);
  const [currentResumePoint, setCurrentResumePoint] = useState<ResumePoint>();
  const [isResuming, setIsResuming] = useState(false);
  const [resumeError, setResumeError] = useState<string>();

  const conversationStore = useConversationStore();
  const conversationActions = useConversationActions();
  const historyStore = useConversationHistoryStore();
  const refinementStore = useRefinementStore();

  // Load resume points from storage on mount
  useEffect(() => {
    const loadResumePoints = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const points = parsed.map((point: any) => ({
            ...point,
            timestamp: new Date(point.timestamp),
            snapshot: {
              ...point.snapshot,
              messages: point.snapshot.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              })),
              persistence: {
                ...point.snapshot.persistence,
                lastSaved: new Date(point.snapshot.persistence.lastSaved),
              },
              metadata: {
                ...point.snapshot.metadata,
                createdAt: new Date(point.snapshot.metadata.createdAt),
                updatedAt: new Date(point.snapshot.metadata.updatedAt),
              },
            },
          }));
          setResumePoints(points);
        }
      } catch (error) {
        console.error('Failed to load resume points:', error);
      }
    };

    loadResumePoints();
  }, []);

  // Save resume points to storage
  const saveResumePoints = useCallback((points: ResumePoint[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
    } catch (error) {
      console.error('Failed to save resume points:', error);
    }
  }, []);

  // Auto-create resume points at intervals
  useEffect(() => {
    if (!autoSaveResumePoints) return;

    const interval = setInterval(() => {
      if (conversationStore.messages.length > 0) {
        createResumePoint('Auto-saved resume point');
      }
    }, resumePointInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoSaveResumePoints, resumePointInterval, conversationStore.messages.length]);

  const createResumePoint = useCallback((description?: string) => {
    const snapshot = conversationActions.createSnapshot();
    const sectionsComplete = Object.values(snapshot.proposalSections).filter(
      (section: any) => section.status === 'complete'
    ).length;
    
    const resumePoint: ResumePoint = {
      id: crypto.randomUUID(),
      conversationId: snapshot.id,
      messageIndex: snapshot.messages.length - 1,
      timestamp: new Date(),
      description: description || `Resume point at message ${snapshot.messages.length}`,
      context: {
        readinessScore: snapshot.projectContext.readinessScore,
        sectionsComplete,
        totalSections: Object.keys(snapshot.proposalSections).length,
        generationPhase: snapshot.generationState.currentPhase,
      },
      snapshot,
    };

    setResumePoints(prev => {
      const newPoints = [resumePoint, ...prev].slice(0, maxResumePoints);
      saveResumePoints(newPoints);
      return newPoints;
    });

    setCurrentResumePoint(resumePoint);
  }, [conversationActions, maxResumePoints, saveResumePoints]);

  const resumeFromPoint = useCallback(async (resumePointId: string) => {
    setIsResuming(true);
    setResumeError(undefined);

    try {
      const resumePoint = resumePoints.find(point => point.id === resumePointId);
      if (!resumePoint) {
        throw new Error('Resume point not found');
      }

      // Validate the resume point
      if (!validateResumePoint(resumePoint)) {
        throw new Error('Resume point is invalid or corrupted');
      }

      // Restore the conversation state
      conversationActions.restoreSnapshot(resumePoint.snapshot);

      // Update history store
      historyStore.actions.updateConversation(resumePoint.snapshot);
      historyStore.actions.setCurrentConversation(resumePoint.conversationId);

      // Restore refinement session if active
      const activeSession = Object.values(refinementStore.sessions).find(
        (session: any) => session.conversationId === resumePoint.conversationId && session.isActive
      );
      
      if (activeSession) {
        refinementStore.actions.resumeRefinementSession(activeSession.id);
      }

      setCurrentResumePoint(resumePoint);
    } catch (error) {
      setResumeError(error instanceof Error ? error.message : 'Failed to resume from point');
      console.error('Resume failed:', error);
    } finally {
      setIsResuming(false);
    }
  }, [resumePoints, conversationActions, historyStore, refinementStore]);

  const deleteResumePoint = useCallback((resumePointId: string) => {
    setResumePoints(prev => {
      const newPoints = prev.filter(point => point.id !== resumePointId);
      saveResumePoints(newPoints);
      return newPoints;
    });

    if (currentResumePoint?.id === resumePointId) {
      setCurrentResumePoint(undefined);
    }
  }, [currentResumePoint, saveResumePoints]);

  const findBestResumePoint = useCallback((): ResumePoint | undefined => {
    if (resumePoints.length === 0) return undefined;

    // Find the most recent resume point with highest readiness score
    return resumePoints.reduce((best, current) => {
      if (!best) return current;
      
      // Prefer higher readiness score, then more recent timestamp
      if (current.context.readinessScore > best.context.readinessScore) {
        return current;
      } else if (
        current.context.readinessScore === best.context.readinessScore &&
        current.timestamp > best.timestamp
      ) {
        return current;
      }
      
      return best;
    });
  }, [resumePoints]);

  const resumeFromLastSave = useCallback(async () => {
    const lastResumePoint = resumePoints[0]; // Most recent
    if (lastResumePoint) {
      await resumeFromPoint(lastResumePoint.id);
    }
  }, [resumePoints, resumeFromPoint]);

  const resumeFromMessageIndex = useCallback(async (messageIndex: number) => {
    // Find resume point closest to the message index
    const closestPoint = resumePoints.find(
      point => point.messageIndex <= messageIndex
    );
    
    if (closestPoint) {
      await resumeFromPoint(closestPoint.id);
      
      // If the resume point is before the target message, we need to replay messages
      if (closestPoint.messageIndex < messageIndex) {
        // This would require message replay functionality
        console.warn('Message replay not yet implemented');
      }
    }
  }, [resumePoints, resumeFromPoint]);

  const recoverConversationContext = useCallback(async (conversationId: string): Promise<boolean> => {
    try {
      // Try to load from conversation store persistence
      await conversationActions.load(conversationId);
      
      // Update current conversation in history
      historyStore.actions.setCurrentConversation(conversationId);
      
      // Create a recovery resume point
      createResumePoint('Recovered conversation context');
      
      return true;
    } catch (error) {
      console.error('Failed to recover conversation context:', error);
      setResumeError('Failed to recover conversation context');
      return false;
    }
  }, [conversationActions, historyStore, createResumePoint]);

  const validateResumePoint = useCallback((resumePoint: ResumePoint): boolean => {
    try {
      // Basic validation checks
      if (!resumePoint.snapshot || !resumePoint.snapshot.id) return false;
      if (!Array.isArray(resumePoint.snapshot.messages)) return false;
      if (!resumePoint.snapshot.projectContext) return false;
      if (!resumePoint.snapshot.proposalSections) return false;
      
      // Validate message structure
      const invalidMessage = resumePoint.snapshot.messages.find(msg => 
        !msg.id || !msg.content || !msg.role || !msg.timestamp
      );
      if (invalidMessage) return false;
      
      // Validate sections structure
      const invalidSection = Object.values(resumePoint.snapshot.proposalSections).find(section =>
        !section.id || !section.title || section.status === undefined
      );
      if (invalidSection) return false;
      
      return true;
    } catch (error) {
      console.error('Resume point validation failed:', error);
      return false;
    }
  }, []);

  // Cleanup old resume points periodically
  useEffect(() => {
    const cleanup = () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep for 30 days
      
      setResumePoints(prev => {
        const filtered = prev.filter(point => point.timestamp > cutoffDate);
        if (filtered.length !== prev.length) {
          saveResumePoints(filtered);
        }
        return filtered;
      });
    };

    // Run cleanup on mount and then every 24 hours
    cleanup();
    const interval = setInterval(cleanup, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [saveResumePoints]);

  return {
    resumePoints,
    currentResumePoint,
    createResumePoint,
    resumeFromPoint,
    deleteResumePoint,
    findBestResumePoint,
    resumeFromLastSave,
    resumeFromMessageIndex,
    isResuming,
    resumeError,
    recoverConversationContext,
    validateResumePoint,
  };
};

// Utility hook for auto-recovery on app start
export const useAutoRecovery = () => {
  const { recoverConversationContext, findBestResumePoint, resumeFromPoint } = useConversationResume();
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryComplete, setRecoveryComplete] = useState(false);

  useEffect(() => {
    const attemptAutoRecovery = async () => {
      if (recoveryComplete) return;
      
      setIsRecovering(true);
      
      try {
        // Check if there's a current conversation in URL or storage
        const urlParams = new URLSearchParams(window.location.search);
        const conversationId = urlParams.get('conversation');
        
        if (conversationId) {
          await recoverConversationContext(conversationId);
        } else {
          // Try to resume from the best available resume point
          const bestPoint = findBestResumePoint();
          if (bestPoint) {
            await resumeFromPoint(bestPoint.id);
          }
        }
      } catch (error) {
        console.error('Auto-recovery failed:', error);
      } finally {
        setIsRecovering(false);
        setRecoveryComplete(true);
      }
    };

    attemptAutoRecovery();
  }, [recoverConversationContext, findBestResumePoint, resumeFromPoint, recoveryComplete]);

  return { isRecovering, recoveryComplete };
};