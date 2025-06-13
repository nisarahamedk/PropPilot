'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Eye,
  MessageSquare,
  FileText,
  Clock,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  X,
  RefreshCw,
  Filter,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { TouchButton } from '../mobile/TouchOptimizedComponents';
import { ConversationState, Message, ProposalSection } from '../../types';

// AI suggestion types
export interface AISuggestion {
  id: string;
  type: 'content' | 'structure' | 'tone' | 'clarity' | 'persuasion' | 'completeness';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'writing' | 'business' | 'technical' | 'design' | 'strategy';
  title: string;
  description: string;
  reasoning: string;
  impact: {
    score: number; // 1-10
    areas: string[];
    timeToImplement: number; // minutes
  };
  suggestions: SuggestionAction[];
  context: {
    sectionId?: string;
    messageId?: string;
    textRange?: { start: number; end: number };
    relatedData?: any;
  };
  timestamp: Date;
  isApplied: boolean;
  userFeedback?: 'positive' | 'negative' | 'applied';
}

export interface SuggestionAction {
  id: string;
  type: 'replace' | 'insert' | 'rewrite' | 'expand' | 'restructure';
  label: string;
  description: string;
  preview: string;
  confidence: number; // 0-1
  originalText?: string;
  suggestedText: string;
}

export interface AIAnalysisContext {
  conversationHistory: Message[];
  currentSections: Record<string, ProposalSection>;
  projectContext: {
    industry?: string;
    clientType?: string;
    proposalType?: string;
    budget?: number;
    timeline?: string;
    objectives?: string[];
  };
  userBehavior: {
    writingStyle: string;
    preferredTone: string;
    commonPatterns: string[];
    strengths: string[];
    improvements: string[];
  };
  competitiveContext?: {
    marketPosition: string;
    uniqueValueProps: string[];
    competitorAnalysis: any[];
  };
}

// Main context-aware suggestions component
interface ContextAwareSuggestionsProps {
  conversation: ConversationState;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onApplySuggestion: (suggestionId: string, actionId: string) => void;
  onDismissSuggestion: (suggestionId: string) => void;
  position?: 'sidebar' | 'floating' | 'inline';
}

export const ContextAwareSuggestions: React.FC<ContextAwareSuggestionsProps> = ({
  conversation,
  isVisible,
  onToggleVisibility,
  onApplySuggestion,
  onDismissSuggestion,
  position = 'sidebar',
}) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | AISuggestion['type']>('all');
  const [activePriority, setActivePriority] = useState<'all' | AISuggestion['priority']>('all');
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [analysisContext, setAnalysisContext] = useState<AIAnalysisContext | null>(null);

  // Generate suggestions when conversation changes
  useEffect(() => {
    if (isVisible && conversation) {
      generateSuggestions();
    }
  }, [conversation, isVisible]);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const context = await analyzeConversationContext(conversation);
      setAnalysisContext(context);
      
      const newSuggestions = await generateAISuggestions(conversation, context);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter suggestions based on active filters
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(suggestion => {
      const typeMatch = activeFilter === 'all' || suggestion.type === activeFilter;
      const priorityMatch = activePriority === 'all' || suggestion.priority === activePriority;
      return typeMatch && priorityMatch && !suggestion.isApplied;
    });
  }, [suggestions, activeFilter, activePriority]);

  // Group suggestions by priority
  const groupedSuggestions = useMemo(() => {
    const groups: Record<string, AISuggestion[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    };
    
    filteredSuggestions.forEach(suggestion => {
      groups[suggestion.priority].push(suggestion);
    });
    
    return groups;
  }, [filteredSuggestions]);

  const handleApplySuggestion = async (suggestionId: string, actionId: string) => {
    try {
      await onApplySuggestion(suggestionId, actionId);
      
      // Mark suggestion as applied
      setSuggestions(prev => prev.map(s => 
        s.id === suggestionId ? { ...s, isApplied: true, userFeedback: 'applied' } : s
      ));
      
      // Regenerate suggestions after applying
      setTimeout(generateSuggestions, 1000);
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
    }
  };

  const handleFeedback = (suggestionId: string, feedback: 'positive' | 'negative') => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, userFeedback: feedback } : s
    ));
    
    // Send feedback to AI service for learning
    submitSuggestionFeedback(suggestionId, feedback);
  };

  if (!isVisible) {
    return (
      <FloatingSuggestionsButton
        onToggle={onToggleVisibility}
        suggestionCount={filteredSuggestions.length}
        hasCritical={groupedSuggestions.critical.length > 0}
      />
    );
  }

  const containerClass = position === 'sidebar' 
    ? 'w-80 h-full bg-white border-l border-gray-200'
    : position === 'floating'
    ? 'fixed top-20 right-4 w-96 max-h-[80vh] bg-white rounded-lg shadow-xl border border-gray-200 z-50'
    : 'w-full bg-white border border-gray-200 rounded-lg';

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">AI Suggestions</h3>
            {filteredSuggestions.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                {filteredSuggestions.length}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <TouchButton
              onPress={generateSuggestions}
              variant="ghost"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </TouchButton>
            
            {position !== 'sidebar' && (
              <TouchButton
                onPress={onToggleVisibility}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4" />
              </TouchButton>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-3 space-y-2">
          <div className="flex space-x-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'content', label: 'Content' },
              { id: 'structure', label: 'Structure' },
              { id: 'clarity', label: 'Clarity' },
              { id: 'persuasion', label: 'Persuasion' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                className={`
                  px-2 py-1 text-xs rounded-full transition-colors
                  ${activeFilter === filter.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
          
          <div className="flex space-x-1">
            {[
              { id: 'all', label: 'All Priority', color: 'gray' },
              { id: 'critical', label: 'Critical', color: 'red' },
              { id: 'high', label: 'High', color: 'orange' },
              { id: 'medium', label: 'Medium', color: 'yellow' },
            ].map((priority) => (
              <button
                key={priority.id}
                onClick={() => setActivePriority(priority.id as any)}
                className={`
                  px-2 py-1 text-xs rounded-full transition-colors
                  ${activePriority === priority.id 
                    ? `bg-${priority.color}-100 text-${priority.color}-700` 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {priority.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div className="text-sm text-gray-600">Analyzing your proposal...</div>
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <div className="p-8 text-center">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">No suggestions right now</h4>
            <p className="text-sm text-gray-600">
              {suggestions.length > 0 
                ? 'All suggestions have been applied or dismissed'
                : 'Continue working on your proposal to get AI-powered suggestions'
              }
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {Object.entries(groupedSuggestions).map(([priority, prioritySuggestions]) => {
              if (prioritySuggestions.length === 0) return null;
              
              return (
                <div key={priority}>
                  <h4 className={`
                    text-sm font-medium mb-2 flex items-center space-x-2
                    ${priority === 'critical' ? 'text-red-700' :
                      priority === 'high' ? 'text-orange-700' :
                      priority === 'medium' ? 'text-yellow-700' :
                      'text-gray-700'
                    }
                  `}>
                    <span className={`
                      w-2 h-2 rounded-full
                      ${priority === 'critical' ? 'bg-red-500' :
                        priority === 'high' ? 'bg-orange-500' :
                        priority === 'medium' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }
                    `} />
                    <span>{priority.charAt(0).toUpperCase() + priority.slice(1)} Priority</span>
                    <span className="text-xs text-gray-500">({prioritySuggestions.length})</span>
                  </h4>
                  
                  <div className="space-y-3">
                    {prioritySuggestions.map((suggestion) => (
                      <SuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        isExpanded={expandedSuggestion === suggestion.id}
                        onToggleExpanded={() => setExpandedSuggestion(
                          expandedSuggestion === suggestion.id ? null : suggestion.id
                        )}
                        onApply={handleApplySuggestion}
                        onDismiss={() => onDismissSuggestion(suggestion.id)}
                        onFeedback={handleFeedback}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Analysis Context */}
      {analysisContext && (
        <AnalysisContextPanel
          context={analysisContext}
          isVisible={!!analysisContext}
        />
      )}
    </div>
  );
};

// Individual suggestion card
interface SuggestionCardProps {
  suggestion: AISuggestion;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onApply: (suggestionId: string, actionId: string) => void;
  onDismiss: (suggestionId: string) => void;
  onFeedback: (suggestionId: string, feedback: 'positive' | 'negative') => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  isExpanded,
  onToggleExpanded,
  onApply,
  onDismiss,
  onFeedback,
}) => {
  const priorityColors = {
    critical: 'border-red-200 bg-red-50',
    high: 'border-orange-200 bg-orange-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-gray-200 bg-gray-50',
  };

  const typeIcons = {
    content: FileText,
    structure: BarChart3,
    tone: MessageSquare,
    clarity: Eye,
    persuasion: Target,
    completeness: CheckCircle,
  };

  const TypeIcon = typeIcons[suggestion.type];

  return (
    <motion.div
      className={`border rounded-lg transition-all duration-200 ${priorityColors[suggestion.priority]}`}
      layout
    >
      {/* Card header */}
      <div
        className="p-3 cursor-pointer"
        onClick={onToggleExpanded}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center
              ${suggestion.priority === 'critical' ? 'bg-red-100' :
                suggestion.priority === 'high' ? 'bg-orange-100' :
                suggestion.priority === 'medium' ? 'bg-yellow-100' :
                'bg-gray-100'
              }
            `}>
              <TypeIcon className="w-4 h-4" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">{suggestion.title}</h4>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {suggestion.description}
              </p>
              
              <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Impact: {suggestion.impact.score}/10</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{suggestion.impact.timeToImplement}m</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {!isExpanded && suggestion.suggestions.length > 0 && (
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {suggestion.suggestions.length} actions
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
              {/* Reasoning */}
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Why this matters:</h5>
                <p className="text-sm text-gray-700">{suggestion.reasoning}</p>
              </div>

              {/* Impact areas */}
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Impact areas:</h5>
                <div className="flex flex-wrap gap-1">
                  {suggestion.impact.areas.map((area) => (
                    <span
                      key={area}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">
                  Suggested actions ({suggestion.suggestions.length}):
                </h5>
                <div className="space-y-2">
                  {suggestion.suggestions.map((action) => (
                    <SuggestionAction
                      key={action.id}
                      action={action}
                      onApply={() => onApply(suggestion.id, action.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <TouchButton
                    onPress={() => onFeedback(suggestion.id, 'positive')}
                    variant="ghost"
                    size="sm"
                    className={`w-8 h-8 p-0 ${
                      suggestion.userFeedback === 'positive' 
                        ? 'text-green-600 bg-green-50' 
                        : 'text-gray-400 hover:text-green-600'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </TouchButton>
                  
                  <TouchButton
                    onPress={() => onFeedback(suggestion.id, 'negative')}
                    variant="ghost"
                    size="sm"
                    className={`w-8 h-8 p-0 ${
                      suggestion.userFeedback === 'negative' 
                        ? 'text-red-600 bg-red-50' 
                        : 'text-gray-400 hover:text-red-600'
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </TouchButton>
                </div>
                
                <TouchButton
                  onPress={() => onDismiss(suggestion.id)}
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

// Individual suggestion action
interface SuggestionActionProps {
  action: SuggestionAction;
  onApply: () => void;
}

const SuggestionAction: React.FC<SuggestionActionProps> = ({
  action,
  onApply,
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const actionIcons = {
    replace: RefreshCw,
    insert: ArrowRight,
    rewrite: RefreshCw,
    expand: ArrowRight,
    restructure: BarChart3,
  };

  const ActionIcon = actionIcons[action.type as keyof typeof actionIcons] || FileText;

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <ActionIcon className="w-4 h-4 text-gray-600" />
          <div className="flex-1">
            <div className="font-medium text-sm text-gray-900">{action.label}</div>
            <div className="text-xs text-gray-600">{action.description}</div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="text-xs text-gray-500">
                Confidence: {Math.round(action.confidence * 100)}%
              </div>
              {action.confidence > 0.8 && (
                <Star className="w-3 h-3 text-yellow-500" />
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <TouchButton
            onPress={() => setShowPreview(!showPreview)}
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
            Apply
          </TouchButton>
        </div>
      </div>

      {/* Preview */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 pt-3 border-t border-gray-100"
          >
            <div className="space-y-2">
              {action.originalText && (
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-1">Original:</div>
                  <div className="text-xs text-gray-600 bg-red-50 p-2 rounded border-l-2 border-red-300">
                    {action.originalText}
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">Suggested:</div>
                <div className="text-xs text-gray-800 bg-green-50 p-2 rounded border-l-2 border-green-300">
                  {action.suggestedText}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Floating suggestions button
interface FloatingSuggestionsButtonProps {
  onToggle: () => void;
  suggestionCount: number;
  hasCritical: boolean;
}

const FloatingSuggestionsButton: React.FC<FloatingSuggestionsButtonProps> = ({
  onToggle,
  suggestionCount,
  hasCritical,
}) => {
  return (
    <motion.div
      className="fixed bottom-20 right-6 z-40"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
    >
      <TouchButton
        onPress={onToggle}
        variant="primary"
        className={`
          relative rounded-full w-14 h-14 p-0 shadow-lg
          ${hasCritical ? 'bg-red-600 hover:bg-red-700' : ''}
        `}
      >
        <Brain className="w-6 h-6" />
        
        {suggestionCount > 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {suggestionCount > 9 ? '9+' : suggestionCount}
            </span>
          </div>
        )}
        
        {hasCritical && (
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

// Analysis context panel
interface AnalysisContextPanelProps {
  context: AIAnalysisContext;
  isVisible: boolean;
}

const AnalysisContextPanel: React.FC<AnalysisContextPanelProps> = ({
  context,
  isVisible,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        <span>Analysis Context</span>
        <ArrowRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-3 space-y-3 text-xs"
          >
            {context.projectContext.industry && (
              <div>
                <span className="font-medium text-gray-700">Industry:</span>
                <span className="ml-2 text-gray-600">{context.projectContext.industry}</span>
              </div>
            )}
            
            {context.userBehavior.writingStyle && (
              <div>
                <span className="font-medium text-gray-700">Writing Style:</span>
                <span className="ml-2 text-gray-600">{context.userBehavior.writingStyle}</span>
              </div>
            )}
            
            {context.userBehavior.strengths.length > 0 && (
              <div>
                <span className="font-medium text-gray-700">Strengths:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {context.userBehavior.strengths.map((strength) => (
                    <span
                      key={strength}
                      className="bg-green-100 text-green-700 px-2 py-1 rounded-full"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Mock AI analysis functions
async function analyzeConversationContext(conversation: ConversationState): Promise<AIAnalysisContext> {
  // Mock implementation - replace with actual AI analysis
  return {
    conversationHistory: conversation.messages,
    currentSections: conversation.proposalSections,
    projectContext: {
      industry: 'Technology',
      clientType: 'Enterprise',
      proposalType: 'Service',
      objectives: ['Increase efficiency', 'Reduce costs'],
    },
    userBehavior: {
      writingStyle: 'Professional',
      preferredTone: 'Confident',
      commonPatterns: ['Data-driven', 'Solution-focused'],
      strengths: ['Clear structure', 'Strong evidence'],
      improvements: ['More persuasive language', 'Better flow'],
    },
  };
}

async function generateAISuggestions(
  conversation: ConversationState, 
  context: AIAnalysisContext
): Promise<AISuggestion[]> {
  // Mock implementation - replace with actual AI suggestion generation
  return [
    {
      id: 'suggestion-1',
      type: 'persuasion',
      priority: 'high',
      category: 'business',
      title: 'Strengthen value proposition',
      description: 'Add quantifiable benefits to make your proposal more compelling',
      reasoning: 'Your proposal lacks specific metrics and ROI calculations that decision-makers need to justify investment.',
      impact: {
        score: 8,
        areas: ['Persuasiveness', 'Credibility', 'Decision-making'],
        timeToImplement: 15,
      },
      suggestions: [
        {
          id: 'action-1',
          type: 'insert',
          label: 'Add ROI calculation',
          description: 'Insert specific return on investment metrics',
          preview: 'Expected ROI of 300% within 12 months...',
          confidence: 0.9,
          suggestedText: 'Based on industry benchmarks, this solution typically delivers a 300% ROI within 12 months, translating to $450,000 in cost savings annually.',
        },
      ],
      context: {
        sectionId: 'executive_summary',
      },
      timestamp: new Date(),
      isApplied: false,
    },
    {
      id: 'suggestion-2',
      type: 'clarity',
      priority: 'medium',
      category: 'writing',
      title: 'Simplify technical language',
      description: 'Replace jargon with clearer explanations for better understanding',
      reasoning: 'Some technical terms may confuse non-technical stakeholders who influence the decision.',
      impact: {
        score: 6,
        areas: ['Readability', 'Accessibility', 'Understanding'],
        timeToImplement: 10,
      },
      suggestions: [
        {
          id: 'action-2',
          type: 'replace',
          label: 'Simplify technical terms',
          description: 'Replace complex terminology with plain English',
          preview: 'Our cloud-based system instead of our SaaS infrastructure...',
          confidence: 0.8,
          originalText: 'Our enterprise-grade SaaS infrastructure leverages microservices architecture',
          suggestedText: 'Our cloud-based system uses a flexible, modular design',
        },
      ],
      context: {
        sectionId: 'technical_approach',
      },
      timestamp: new Date(),
      isApplied: false,
    },
  ];
}

async function submitSuggestionFeedback(suggestionId: string, feedback: 'positive' | 'negative'): Promise<void> {
  // Mock implementation - send feedback to AI service for learning
  console.log(`Feedback for ${suggestionId}: ${feedback}`);
}