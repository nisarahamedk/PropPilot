'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Brain,
  Sparkles,
  BarChart3,
  Users,
  DollarSign,
  Award,
  Lightbulb,
  MessageSquare,
  FileText,
  Settings,
  Filter,
  X,
  Play,
  Pause,
  RefreshCw,
  Star,
  Shield,
  Rocket,
  Eye,
  Globe,
  Search
} from 'lucide-react';
import { TouchButton } from '../mobile/TouchOptimizedComponents';
import { ConversationState, Message } from '../../types';

// Proactive recommendation types
export interface ProactiveRecommendation {
  id: string;
  type: 'quality' | 'completion' | 'optimization' | 'competitive' | 'compliance' | 'engagement';
  trigger: 'time-based' | 'content-based' | 'behavior-based' | 'milestone-based' | 'external';
  urgency: 'immediate' | 'soon' | 'when-convenient' | 'future';
  title: string;
  description: string;
  rationale: string;
  benefits: string[];
  actions: RecommendationAction[];
  metrics: {
    impactScore: number; // 1-10
    effortRequired: number; // 1-10
    timeToValue: number; // days
    successProbability: number; // 0-1
  };
  context: {
    triggeredBy: string;
    relatedSections: string[];
    dataPoints: Record<string, any>;
    externalFactors?: string[];
  };
  scheduling: {
    suggestedTime?: Date;
    deadline?: Date;
    optimalTiming: string;
    dependencies: string[];
  };
  personalization: {
    userPreferences: string[];
    pastBehavior: string[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    industryRelevance: number; // 0-1
  };
  timestamp: Date;
  status: 'pending' | 'acknowledged' | 'in-progress' | 'completed' | 'dismissed' | 'snoozed';
  snoozeUntil?: Date;
  userInteractions: RecommendationInteraction[];
}

export interface RecommendationAction {
  id: string;
  type: 'edit' | 'add' | 'restructure' | 'research' | 'review' | 'optimize';
  title: string;
  description: string;
  estimatedTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  prerequisites: string[];
  steps: ActionStep[];
  automation?: {
    canAutomate: boolean;
    automationScript?: string;
    requiresConfirmation: boolean;
  };
}

export interface ActionStep {
  id: string;
  title: string;
  description: string;
  type: 'manual' | 'automated' | 'guided';
  estimatedTime: number;
  resources?: string[];
}

export interface RecommendationInteraction {
  id: string;
  type: 'view' | 'expand' | 'action' | 'feedback' | 'snooze' | 'dismiss';
  timestamp: Date;
  details?: any;
}

// Main proactive recommendations component
interface ProactiveRecommendationsProps {
  conversation: ConversationState;
  isActive: boolean;
  onToggleActive: () => void;
  onApplyRecommendation: (recommendationId: string, actionId: string) => void;
  onDismissRecommendation: (recommendationId: string) => void;
  onSnoozeRecommendation: (recommendationId: string, duration: number) => void;
  position?: 'sidebar' | 'floating' | 'banner';
}

export const ProactiveRecommendations: React.FC<ProactiveRecommendationsProps> = ({
  conversation,
  isActive,
  onToggleActive,
  onApplyRecommendation,
  onDismissRecommendation,
  onSnoozeRecommendation,
  position = 'sidebar',
}) => {
  const [recommendations, setRecommendations] = useState<ProactiveRecommendation[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>(['immediate', 'soon']);
  const [sortBy, setSortBy] = useState<string>('urgency');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Generate proactive recommendations
  useEffect(() => {
    if (isActive && conversation) {
      generateRecommendations();
      
      // Set up periodic regeneration
      const interval = setInterval(generateRecommendations, 5 * 60 * 1000); // Every 5 minutes
      return () => clearInterval(interval);
    }
  }, [conversation, isActive]);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const newRecommendations = await analyzeAndGenerateRecommendations(conversation);
      setRecommendations(prev => {
        // Merge with existing, avoiding duplicates
        const existing = prev.filter(r => r.status !== 'completed' && r.status !== 'dismissed');
        const merged = [...existing];
        
        newRecommendations.forEach(newRec => {
          if (!existing.find(r => r.id === newRec.id)) {
            merged.push(newRec);
          }
        });
        
        return merged;
      });
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter and sort recommendations
  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations.filter(rec => {
      if (rec.status === 'completed' || rec.status === 'dismissed') return false;
      if (rec.status === 'snoozed' && rec.snoozeUntil && rec.snoozeUntil > new Date()) return false;
      
      const urgencyMatch = activeFilters.length === 0 || activeFilters.includes(rec.urgency);
      const typeMatch = activeFilters.length === 0 || activeFilters.includes(rec.type);
      
      return urgencyMatch || typeMatch;
    });

    // Sort by selected criteria
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          const urgencyOrder = { immediate: 0, soon: 1, 'when-convenient': 2, future: 3 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        case 'impact':
          return b.metrics.impactScore - a.metrics.impactScore;
        case 'effort':
          return a.metrics.effortRequired - b.metrics.effortRequired;
        case 'time':
          return a.metrics.timeToValue - b.metrics.timeToValue;
        default:
          return 0;
      }
    });

    return filtered;
  }, [recommendations, activeFilters, sortBy]);

  // Handle user interactions
  const handleInteraction = (recommendationId: string, type: RecommendationInteraction['type'], details?: any) => {
    setRecommendations(prev => prev.map(rec => {
      if (rec.id === recommendationId) {
        return {
          ...rec,
          userInteractions: [
            ...rec.userInteractions,
            {
              id: crypto.randomUUID(),
              type,
              timestamp: new Date(),
              details,
            }
          ]
        };
      }
      return rec;
    }));
    
    // Track interaction for learning
    trackRecommendationInteraction(recommendationId, type, details);
  };

  const handleApplyAction = async (recommendationId: string, actionId: string) => {
    handleInteraction(recommendationId, 'action', { actionId });
    
    // Mark recommendation as in-progress
    setRecommendations(prev => prev.map(rec => 
      rec.id === recommendationId ? { ...rec, status: 'in-progress' } : rec
    ));
    
    await onApplyRecommendation(recommendationId, actionId);
  };

  const handleSnooze = (recommendationId: string, hours: number) => {
    const snoozeUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
    
    setRecommendations(prev => prev.map(rec => 
      rec.id === recommendationId 
        ? { ...rec, status: 'snoozed', snoozeUntil }
        : rec
    ));
    
    handleInteraction(recommendationId, 'snooze', { hours });
    onSnoozeRecommendation(recommendationId, hours);
  };

  if (!isActive) {
    return (
      <RecommendationsToggleButton
        onToggle={onToggleActive}
        recommendationCount={filteredRecommendations.length}
        hasUrgent={filteredRecommendations.some(r => r.urgency === 'immediate')}
      />
    );
  }

  const containerClass = position === 'banner'
    ? 'w-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg'
    : position === 'floating'
    ? 'fixed top-20 left-4 w-96 max-h-[80vh] bg-white rounded-lg shadow-xl border border-gray-200 z-50'
    : 'w-80 h-full bg-white border-r border-gray-200';

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <h3 className="font-medium">Smart Recommendations</h3>
            {filteredRecommendations.length > 0 && (
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                {filteredRecommendations.length}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <TouchButton
              onPress={() => setShowSettings(!showSettings)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4" />
            </TouchButton>
            
            <TouchButton
              onPress={generateRecommendations}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              disabled={isGenerating}
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </TouchButton>
            
            {position !== 'sidebar' && (
              <TouchButton
                onPress={onToggleActive}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </TouchButton>
            )}
          </div>
        </div>

        {/* Settings panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 pt-3 border-t border-white/20"
            >
              <RecommendationSettings
                activeFilters={activeFilters}
                sortBy={sortBy}
                onFiltersChange={setActiveFilters}
                onSortChange={setSortBy}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isGenerating && recommendations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div className="text-sm text-gray-600">Analyzing your proposal...</div>
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">You're doing great!</h4>
            <p className="text-sm text-gray-600">
              No urgent recommendations right now. Keep up the excellent work on your proposal.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {filteredRecommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                isExpanded={expandedRecommendation === recommendation.id}
                onToggleExpanded={() => setExpandedRecommendation(
                  expandedRecommendation === recommendation.id ? null : recommendation.id
                )}
                onApplyAction={handleApplyAction}
                onSnooze={handleSnooze}
                onDismiss={() => onDismissRecommendation(recommendation.id)}
                onInteraction={handleInteraction}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {filteredRecommendations.filter(r => r.urgency === 'immediate').length}
            </div>
            <div className="text-xs text-gray-600">Urgent</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-orange-600">
              {filteredRecommendations.filter(r => r.status === 'in-progress').length}
            </div>
            <div className="text-xs text-gray-600">In Progress</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {recommendations.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual recommendation card
interface RecommendationCardProps {
  recommendation: ProactiveRecommendation;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onApplyAction: (recommendationId: string, actionId: string) => void;
  onSnooze: (recommendationId: string, hours: number) => void;
  onDismiss: (recommendationId: string) => void;
  onInteraction: (recommendationId: string, type: RecommendationInteraction['type'], details?: any) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  isExpanded,
  onToggleExpanded,
  onApplyAction,
  onSnooze,
  onDismiss,
  onInteraction,
}) => {
  const urgencyColors = {
    immediate: 'border-red-300 bg-red-50',
    soon: 'border-orange-300 bg-orange-50',
    'when-convenient': 'border-yellow-300 bg-yellow-50',
    future: 'border-blue-300 bg-blue-50',
  };

  const typeIcons = {
    quality: Award,
    completion: CheckCircle,
    optimization: TrendingUp,
    competitive: Target,
    compliance: Shield,
    engagement: Users,
  };

  const TypeIcon = typeIcons[recommendation.type];
  const impactColor = recommendation.metrics.impactScore >= 8 ? 'text-green-600' : 
                     recommendation.metrics.impactScore >= 6 ? 'text-yellow-600' : 'text-gray-600';

  return (
    <motion.div
      className={`border rounded-lg transition-all duration-200 ${urgencyColors[recommendation.urgency]}`}
      layout
    >
      {/* Card header */}
      <div
        className="p-3 cursor-pointer"
        onClick={() => {
          onToggleExpanded();
          onInteraction(recommendation.id, isExpanded ? 'view' : 'expand');
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <TypeIcon className="w-4 h-4 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-gray-900 text-sm">{recommendation.title}</h4>
                {recommendation.urgency === 'immediate' && (
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                )}
              </div>
              
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                {recommendation.description}
              </p>
              
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                <span className={`flex items-center space-x-1 ${impactColor}`}>
                  <BarChart3 className="w-3 h-3" />
                  <span>Impact: {recommendation.metrics.impactScore}/10</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{recommendation.metrics.timeToValue}d</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>{Math.round(recommendation.metrics.successProbability * 100)}%</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {recommendation.actions.length > 0 && (
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {recommendation.actions.length} actions
              </span>
            )}
            <ArrowRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200"
          >
            <div className="p-4 space-y-4">
              {/* Rationale */}
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Why this matters:</h5>
                <p className="text-sm text-gray-700">{recommendation.rationale}</p>
              </div>

              {/* Benefits */}
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Benefits:</h5>
                <div className="space-y-1">
                  {recommendation.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-sm font-semibold text-gray-900">
                    {recommendation.metrics.impactScore}/10
                  </div>
                  <div className="text-xs text-gray-600">Impact</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-sm font-semibold text-gray-900">
                    {recommendation.metrics.effortRequired}/10
                  </div>
                  <div className="text-xs text-gray-600">Effort</div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">
                  Recommended actions ({recommendation.actions.length}):
                </h5>
                <div className="space-y-2">
                  {recommendation.actions.map((action) => (
                    <RecommendationAction
                      key={action.id}
                      action={action}
                      onApply={() => onApplyAction(recommendation.id, action.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Timing */}
              {recommendation.scheduling.optimalTiming && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Optimal timing:</span>
                    <span className="text-blue-700">{recommendation.scheduling.optimalTiming}</span>
                  </div>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <select
                    onChange={(e) => onSnooze(recommendation.id, parseInt(e.target.value))}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                    defaultValue=""
                  >
                    <option value="" disabled>Snooze...</option>
                    <option value={1}>1 hour</option>
                    <option value={4}>4 hours</option>
                    <option value={24}>1 day</option>
                    <option value={168}>1 week</option>
                  </select>
                </div>
                
                <TouchButton
                  onPress={() => onDismiss(recommendation.id)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Dismiss
                </TouchButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Individual recommendation action
interface RecommendationActionProps {
  action: RecommendationAction;
  onApply: () => void;
}

const RecommendationAction: React.FC<RecommendationActionProps> = ({
  action,
  onApply,
}) => {
  const [showSteps, setShowSteps] = useState(false);
  
  const difficultyColors = {
    easy: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    hard: 'text-red-600 bg-red-100',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm text-gray-900">{action.title}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[action.difficulty]}`}>
              {action.difficulty}
            </span>
          </div>
          <div className="text-xs text-gray-600 mb-2">{action.description}</div>
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span>{action.estimatedTime} min</span>
            <span>{action.steps.length} steps</span>
            {action.automation?.canAutomate && (
              <span className="text-blue-600">Can automate</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <TouchButton
            onPress={() => setShowSteps(!showSteps)}
            variant="ghost"
            size="sm"
          >
            <Eye className="w-3 h-3" />
          </TouchButton>
          
          <TouchButton
            onPress={onApply}
            variant="primary"
            size="sm"
          >
            {action.automation?.canAutomate ? (
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Auto</span>
              </div>
            ) : (
              'Apply'
            )}
          </TouchButton>
        </div>
      </div>

      {/* Action steps */}
      <AnimatePresence>
        {showSteps && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 pt-3 border-t border-gray-100"
          >
            <div className="space-y-2">
              {action.steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-600">{step.description}</div>
                    <div className="text-xs text-gray-500 mt-1">{step.estimatedTime} min</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Recommendation settings
interface RecommendationSettingsProps {
  activeFilters: string[];
  sortBy: string;
  onFiltersChange: (filters: string[]) => void;
  onSortChange: (sortBy: string) => void;
}

const RecommendationSettings: React.FC<RecommendationSettingsProps> = ({
  activeFilters,
  sortBy,
  onFiltersChange,
  onSortChange,
}) => {
  const filterOptions = [
    { id: 'immediate', label: 'Immediate', type: 'urgency' },
    { id: 'soon', label: 'Soon', type: 'urgency' },
    { id: 'quality', label: 'Quality', type: 'type' },
    { id: 'completion', label: 'Completion', type: 'type' },
    { id: 'optimization', label: 'Optimization', type: 'type' },
  ];

  const toggleFilter = (filterId: string) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(f => f !== filterId)
      : [...activeFilters, filterId];
    onFiltersChange(newFilters);
  };

  return (
    <div className="space-y-3 text-white">
      <div>
        <div className="text-sm font-medium mb-2">Filters:</div>
        <div className="flex flex-wrap gap-1">
          {filterOptions.map((filter) => (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              className={`
                text-xs px-2 py-1 rounded-full transition-colors
                ${activeFilters.includes(filter.id)
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <div className="text-sm font-medium mb-2">Sort by:</div>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="text-xs bg-white/20 border border-white/30 rounded px-2 py-1 text-white"
        >
          <option value="urgency">Urgency</option>
          <option value="impact">Impact</option>
          <option value="effort">Effort (Low to High)</option>
          <option value="time">Time to Value</option>
        </select>
      </div>
    </div>
  );
};

// Toggle button for recommendations
interface RecommendationsToggleButtonProps {
  onToggle: () => void;
  recommendationCount: number;
  hasUrgent: boolean;
}

const RecommendationsToggleButton: React.FC<RecommendationsToggleButtonProps> = ({
  onToggle,
  recommendationCount,
  hasUrgent,
}) => {
  return (
    <motion.div
      className="fixed bottom-32 right-6 z-40"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
    >
      <TouchButton
        onPress={onToggle}
        variant="primary"
        className={`
          relative rounded-full w-14 h-14 p-0 shadow-lg
          ${hasUrgent ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
        `}
      >
        <Zap className="w-6 h-6" />
        
        {recommendationCount > 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {recommendationCount > 9 ? '9+' : recommendationCount}
            </span>
          </div>
        )}
        
        {hasUrgent && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </TouchButton>
    </motion.div>
  );
};

// Mock AI analysis functions
async function analyzeAndGenerateRecommendations(conversation: ConversationState): Promise<ProactiveRecommendation[]> {
  // Mock implementation - replace with actual AI analysis
  return [
    {
      id: 'rec-1',
      type: 'quality',
      trigger: 'content-based',
      urgency: 'soon',
      title: 'Enhance executive summary impact',
      description: 'Your executive summary could be more compelling with stronger opening statements and clearer value propositions.',
      rationale: 'Executive summaries are often the only section decision-makers read in detail. A stronger opening increases your chances of approval by 40%.',
      benefits: [
        'Increase proposal approval probability',
        'Make stronger first impression',
        'Clearly communicate core value',
      ],
      actions: [
        {
          id: 'action-1',
          type: 'edit',
          title: 'Rewrite opening paragraph',
          description: 'Create a more compelling hook that immediately grabs attention',
          estimatedTime: 15,
          difficulty: 'medium',
          prerequisites: [],
          steps: [
            {
              id: 'step-1',
              title: 'Identify core value proposition',
              description: 'Determine the single most important benefit your solution provides',
              type: 'manual',
              estimatedTime: 5,
            },
            {
              id: 'step-2',
              title: 'Craft compelling opening',
              description: 'Write an attention-grabbing first sentence that leads with impact',
              type: 'guided',
              estimatedTime: 10,
            },
          ],
          automation: {
            canAutomate: false,
            requiresConfirmation: true,
          },
        },
      ],
      metrics: {
        impactScore: 8,
        effortRequired: 6,
        timeToValue: 1,
        successProbability: 0.8,
      },
      context: {
        triggeredBy: 'Content analysis detected weak opening',
        relatedSections: ['executive_summary'],
        dataPoints: {
          currentLength: 150,
          recommendedLength: 200,
          engagementScore: 6.2,
        },
      },
      scheduling: {
        optimalTiming: 'Before your next review session',
        dependencies: [],
      },
      personalization: {
        userPreferences: ['data-driven', 'concise'],
        pastBehavior: ['follows suggestions', 'prefers guided help'],
        skillLevel: 'intermediate',
        industryRelevance: 0.9,
      },
      timestamp: new Date(),
      status: 'pending',
      userInteractions: [],
    },
    {
      id: 'rec-2',
      type: 'completion',
      trigger: 'milestone-based',
      urgency: 'immediate',
      title: 'Add missing pricing section',
      description: 'Your proposal is missing detailed pricing information, which is critical for decision-making.',
      rationale: 'Proposals without clear pricing are 60% more likely to be rejected or require multiple revisions.',
      benefits: [
        'Avoid proposal rejection',
        'Reduce revision cycles',
        'Build trust with transparency',
      ],
      actions: [
        {
          id: 'action-2',
          type: 'add',
          title: 'Create pricing section',
          description: 'Add comprehensive pricing with breakdown and options',
          estimatedTime: 30,
          difficulty: 'medium',
          prerequisites: ['Cost calculations', 'Competitive research'],
          steps: [
            {
              id: 'step-3',
              title: 'Gather pricing components',
              description: 'List all cost elements including labor, materials, overhead',
              type: 'manual',
              estimatedTime: 15,
            },
            {
              id: 'step-4',
              title: 'Structure pricing table',
              description: 'Organize pricing in clear, easy-to-understand format',
              type: 'guided',
              estimatedTime: 15,
            },
          ],
          automation: {
            canAutomate: true,
            automationScript: 'pricing-template-generator',
            requiresConfirmation: true,
          },
        },
      ],
      metrics: {
        impactScore: 9,
        effortRequired: 7,
        timeToValue: 0,
        successProbability: 0.95,
      },
      context: {
        triggeredBy: 'Section completeness analysis',
        relatedSections: ['pricing', 'investment'],
        dataPoints: {
          sectionsComplete: 6,
          totalSections: 8,
          missingCritical: ['pricing'],
        },
      },
      scheduling: {
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        optimalTiming: 'As soon as possible',
        dependencies: [],
      },
      personalization: {
        userPreferences: ['structured', 'detailed'],
        pastBehavior: ['completes suggestions quickly'],
        skillLevel: 'advanced',
        industryRelevance: 1.0,
      },
      timestamp: new Date(),
      status: 'pending',
      userInteractions: [],
    },
  ];
}

async function trackRecommendationInteraction(
  recommendationId: string, 
  type: RecommendationInteraction['type'], 
  details?: any
): Promise<void> {
  // Mock implementation - send interaction data for learning
  console.log(`Interaction: ${recommendationId} - ${type}`, details);
}