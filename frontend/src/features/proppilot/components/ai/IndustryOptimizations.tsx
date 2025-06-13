'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Factory, 
  Stethoscope, 
  GraduationCap,
  ShoppingCart,
  Landmark,
  Zap,
  Truck,
  Palette,
  Code,
  Briefcase,
  TrendingUp,
  Target,
  Users,
  Shield,
  Globe,
  Award,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Filter,
  Search,
  Settings,
  Star,
  Clock,
  BarChart3,
  PieChart,
  DollarSign,
  FileText,
  MessageSquare,
  Eye,
  Download,
  Bookmark
} from 'lucide-react';
import { TouchButton } from '../mobile/TouchOptimizedComponents';
import { ConversationState, ProposalSection } from '../../types';

// Industry types and data
export interface Industry {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  keyMetrics: string[];
  commonChallenges: string[];
  decisionFactors: string[];
  proposalTypes: string[];
  averageTimeline: number; // days
  budgetRanges: { min: number; max: number; currency: string };
  regulations: string[];
  stakeholders: string[];
}

export interface IndustryOptimization {
  id: string;
  industryId: string;
  type: 'content' | 'structure' | 'language' | 'compliance' | 'metrics' | 'stakeholder';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'regulatory' | 'business' | 'technical' | 'cultural' | 'competitive';
  title: string;
  description: string;
  rationale: string;
  implementation: OptimizationImplementation;
  compliance?: ComplianceRequirement;
  impact: {
    approvalRate: number; // percentage increase
    timeToDecision: number; // days reduction
    stakeholderBuyIn: number; // 1-10 score
    competitiveAdvantage: number; // 1-10 score
  };
  examples: string[];
  bestPractices: string[];
  commonMistakes: string[];
  resources: OptimizationResource[];
}

export interface OptimizationImplementation {
  steps: ImplementationStep[];
  templates: TemplateReference[];
  automations: AutomationOption[];
  validations: ValidationRule[];
}

export interface ImplementationStep {
  id: string;
  title: string;
  description: string;
  type: 'manual' | 'guided' | 'automated';
  estimatedTime: number; // minutes
  requirements: string[];
  deliverables: string[];
}

export interface TemplateReference {
  id: string;
  name: string;
  type: 'section' | 'language' | 'format' | 'checklist';
  description: string;
  content: string;
  variables: string[];
}

export interface AutomationOption {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  actions: string[];
  confidence: number; // 0-1
}

export interface ValidationRule {
  id: string;
  type: 'required' | 'format' | 'compliance' | 'content';
  description: string;
  criteria: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ComplianceRequirement {
  regulation: string;
  description: string;
  requirements: string[];
  penalties: string;
  lastUpdated: Date;
  authority: string;
}

export interface OptimizationResource {
  id: string;
  type: 'template' | 'guide' | 'regulation' | 'example' | 'tool';
  title: string;
  description: string;
  url?: string;
  content?: string;
  relevance: number; // 0-1
}

// Main industry optimizations component
interface IndustryOptimizationsProps {
  conversation: ConversationState;
  detectedIndustry?: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onApplyOptimization: (optimizationId: string) => void;
  onIndustryChange: (industryId: string) => void;
}

export const IndustryOptimizations: React.FC<IndustryOptimizationsProps> = ({
  conversation,
  detectedIndustry,
  isVisible,
  onToggleVisibility,
  onApplyOptimization,
  onIndustryChange,
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>(detectedIndustry || '');
  const [optimizations, setOptimizations] = useState<IndustryOptimization[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showIndustrySelector, setShowIndustrySelector] = useState(!detectedIndustry);
  const [expandedOptimization, setExpandedOptimization] = useState<string | null>(null);

  // Load optimizations when industry changes
  useEffect(() => {
    if (selectedIndustry) {
      loadIndustryOptimizations();
    }
  }, [selectedIndustry, conversation]);

  const loadIndustryOptimizations = async () => {
    setIsLoading(true);
    try {
      const industryOptimizations = await generateIndustryOptimizations(
        selectedIndustry,
        conversation
      );
      setOptimizations(industryOptimizations);
    } catch (error) {
      console.error('Failed to load industry optimizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndustrySelect = (industryId: string) => {
    setSelectedIndustry(industryId);
    setShowIndustrySelector(false);
    onIndustryChange(industryId);
  };

  // Filter optimizations
  const filteredOptimizations = useMemo(() => {
    return optimizations.filter(opt => {
      const categoryMatch = activeFilter === 'all' || opt.category === activeFilter;
      const searchMatch = searchQuery === '' || 
        opt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return categoryMatch && searchMatch;
    });
  }, [optimizations, activeFilter, searchQuery]);

  // Group optimizations by priority
  const groupedOptimizations = useMemo(() => {
    const groups: Record<string, IndustryOptimization[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    };
    
    filteredOptimizations.forEach(opt => {
      groups[opt.priority].push(opt);
    });
    
    return groups;
  }, [filteredOptimizations]);

  const selectedIndustryData = INDUSTRIES.find(ind => ind.id === selectedIndustry);

  if (!isVisible) {
    return (
      <FloatingIndustryButton
        onToggle={onToggleVisibility}
        industry={selectedIndustryData}
        optimizationCount={filteredOptimizations.length}
        hasCritical={groupedOptimizations.critical.length > 0}
      />
    );
  }

  return (
    <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {selectedIndustryData && <selectedIndustryData.icon className="w-5 h-5" />}
            <h3 className="font-medium">Industry Insights</h3>
            {filteredOptimizations.length > 0 && (
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                {filteredOptimizations.length}
              </span>
            )}
          </div>
          
          <TouchButton
            onPress={() => setShowIndustrySelector(!showIndustrySelector)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <Settings className="w-4 h-4" />
          </TouchButton>
        </div>

        {/* Industry selector */}
        <AnimatePresence>
          {showIndustrySelector && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 pt-3 border-t border-white/20"
            >
              <IndustrySelector
                selectedIndustry={selectedIndustry}
                onSelect={handleIndustrySelect}
                detectedIndustry={detectedIndustry}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and filters */}
        {selectedIndustry && (
          <div className="mt-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search optimizations..."
                className="w-full pl-7 pr-3 py-1 text-xs bg-white/20 border border-white/30 rounded text-white placeholder-white/60 focus:outline-none focus:bg-white/30"
              />
            </div>
            
            <div className="flex space-x-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'regulatory', label: 'Compliance' },
                { id: 'business', label: 'Business' },
                { id: 'technical', label: 'Technical' },
                { id: 'competitive', label: 'Competitive' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`
                    px-2 py-1 text-xs rounded-full transition-colors
                    ${activeFilter === filter.id 
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
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedIndustry ? (
          <div className="p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Select Your Industry</h4>
            <p className="text-sm text-gray-600 mb-4">
              Get tailored recommendations based on your industry's specific requirements and best practices.
            </p>
            <TouchButton
              onPress={() => setShowIndustrySelector(true)}
              variant="primary"
            >
              Choose Industry
            </TouchButton>
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div className="text-sm text-gray-600">
              Loading {selectedIndustryData?.name} optimizations...
            </div>
          </div>
        ) : filteredOptimizations.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Excellent work!</h4>
            <p className="text-sm text-gray-600">
              Your proposal already follows {selectedIndustryData?.name} best practices.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Industry overview */}
            {selectedIndustryData && (
              <IndustryOverview
                industry={selectedIndustryData}
                optimizationCount={filteredOptimizations.length}
              />
            )}

            {/* Optimizations by priority */}
            {Object.entries(groupedOptimizations).map(([priority, priorityOptimizations]) => {
              if (priorityOptimizations.length === 0) return null;
              
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
                    <span className="text-xs text-gray-500">({priorityOptimizations.length})</span>
                  </h4>
                  
                  <div className="space-y-3">
                    {priorityOptimizations.map((optimization) => (
                      <OptimizationCard
                        key={optimization.id}
                        optimization={optimization}
                        isExpanded={expandedOptimization === optimization.id}
                        onToggleExpanded={() => setExpandedOptimization(
                          expandedOptimization === optimization.id ? null : optimization.id
                        )}
                        onApply={() => onApplyOptimization(optimization.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Industry stats */}
      {selectedIndustryData && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <IndustryStats
            industry={selectedIndustryData}
            optimizations={optimizations}
          />
        </div>
      )}
    </div>
  );
};

// Industry selector component
interface IndustrySelectorProps {
  selectedIndustry: string;
  onSelect: (industryId: string) => void;
  detectedIndustry?: string;
}

const IndustrySelector: React.FC<IndustrySelectorProps> = ({
  selectedIndustry,
  onSelect,
  detectedIndustry,
}) => {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-white mb-2">Select Industry:</div>
      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
        {INDUSTRIES.map((industry) => (
          <button
            key={industry.id}
            onClick={() => onSelect(industry.id)}
            className={`
              p-2 rounded-lg border transition-colors text-left
              ${selectedIndustry === industry.id
                ? 'bg-white text-blue-600 border-white'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }
              ${detectedIndustry === industry.id ? 'ring-2 ring-yellow-400' : ''}
            `}
          >
            <div className="flex items-center space-x-2">
              <industry.icon className="w-4 h-4" />
              <span className="text-xs font-medium">{industry.name}</span>
            </div>
            {detectedIndustry === industry.id && (
              <div className="text-xs text-yellow-300 mt-1">Detected</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Industry overview component
interface IndustryOverviewProps {
  industry: Industry;
  optimizationCount: number;
}

const IndustryOverview: React.FC<IndustryOverviewProps> = ({
  industry,
  optimizationCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <industry.icon className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-900">{industry.name}</h4>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
            {optimizationCount} optimizations
          </span>
          <ArrowRight className={`w-4 h-4 text-blue-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 pt-3 border-t border-blue-200"
          >
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-blue-900 mb-1">Key Decision Factors:</div>
                <div className="flex flex-wrap gap-1">
                  {industry.decisionFactors.slice(0, 3).map((factor) => (
                    <span
                      key={factor}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="font-medium text-blue-900 mb-1">Common Challenges:</div>
                <div className="text-xs text-blue-700">
                  {industry.commonChallenges.slice(0, 2).join(', ')}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="font-medium text-blue-900">Avg. Timeline:</div>
                  <div className="text-blue-700">{industry.averageTimeline} days</div>
                </div>
                <div>
                  <div className="font-medium text-blue-900">Budget Range:</div>
                  <div className="text-blue-700">
                    {industry.budgetRanges.currency}{industry.budgetRanges.min}K-{industry.budgetRanges.max}K
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Optimization card component
interface OptimizationCardProps {
  optimization: IndustryOptimization;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onApply: () => void;
}

const OptimizationCard: React.FC<OptimizationCardProps> = ({
  optimization,
  isExpanded,
  onToggleExpanded,
  onApply,
}) => {
  const priorityColors = {
    critical: 'border-red-200 bg-red-50',
    high: 'border-orange-200 bg-orange-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-gray-200 bg-gray-50',
  };

  const categoryIcons = {
    regulatory: Shield,
    business: Briefcase,
    technical: Code,
    cultural: Users,
    competitive: Target,
  };

  const CategoryIcon = categoryIcons[optimization.category];

  return (
    <motion.div
      className={`border rounded-lg transition-all duration-200 ${priorityColors[optimization.priority]}`}
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
              ${optimization.priority === 'critical' ? 'bg-red-100' :
                optimization.priority === 'high' ? 'bg-orange-100' :
                optimization.priority === 'medium' ? 'bg-yellow-100' :
                'bg-gray-100'
              }
            `}>
              <CategoryIcon className="w-4 h-4" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">{optimization.title}</h4>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {optimization.description}
              </p>
              
              <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{optimization.impact.approvalRate}% approval</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>-{optimization.impact.timeToDecision}d decision</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {optimization.compliance && (
              <Shield className="w-3 h-3 text-blue-600" />
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
                <p className="text-sm text-gray-700">{optimization.rationale}</p>
              </div>

              {/* Impact metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-sm font-semibold text-green-600">
                    +{optimization.impact.approvalRate}%
                  </div>
                  <div className="text-xs text-gray-600">Approval Rate</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-sm font-semibold text-blue-600">
                    -{optimization.impact.timeToDecision}d
                  </div>
                  <div className="text-xs text-gray-600">Decision Time</div>
                </div>
              </div>

              {/* Best practices */}
              {optimization.bestPractices.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Best Practices:</h5>
                  <div className="space-y-1">
                    {optimization.bestPractices.slice(0, 3).map((practice, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{practice}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance */}
              {optimization.compliance && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Compliance: {optimization.compliance.regulation}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700">{optimization.compliance.description}</p>
                </div>
              )}

              {/* Implementation steps */}
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">
                  Implementation ({optimization.implementation.steps.length} steps):
                </h5>
                <div className="space-y-2">
                  {optimization.implementation.steps.slice(0, 2).map((step, index) => (
                    <div key={step.id} className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-900">{step.title}</div>
                        <div className="text-xs text-gray-600">{step.description}</div>
                      </div>
                    </div>
                  ))}
                  {optimization.implementation.steps.length > 2 && (
                    <div className="text-xs text-gray-500 ml-7">
                      +{optimization.implementation.steps.length - 2} more steps
                    </div>
                  )}
                </div>
              </div>

              {/* Apply button */}
              <div className="pt-3 border-t border-gray-100">
                <TouchButton
                  onPress={onApply}
                  variant="primary"
                  size="sm"
                  className="w-full"
                >
                  Apply Optimization
                </TouchButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Industry stats component
interface IndustryStatsProps {
  industry: Industry;
  optimizations: IndustryOptimization[];
}

const IndustryStats: React.FC<IndustryStatsProps> = ({
  industry,
  optimizations,
}) => {
  const completedOptimizations = optimizations.filter(opt => opt.priority === 'critical' || opt.priority === 'high').length;
  const complianceOptimizations = optimizations.filter(opt => opt.compliance).length;

  return (
    <div className="grid grid-cols-3 gap-3 text-center text-xs">
      <div>
        <div className="font-semibold text-gray-900">{completedOptimizations}</div>
        <div className="text-gray-600">Priority Items</div>
      </div>
      <div>
        <div className="font-semibold text-gray-900">{complianceOptimizations}</div>
        <div className="text-gray-600">Compliance</div>
      </div>
      <div>
        <div className="font-semibold text-gray-900">{industry.regulations.length}</div>
        <div className="text-gray-600">Regulations</div>
      </div>
    </div>
  );
};

// Floating industry button
interface FloatingIndustryButtonProps {
  onToggle: () => void;
  industry?: Industry;
  optimizationCount: number;
  hasCritical: boolean;
}

const FloatingIndustryButton: React.FC<FloatingIndustryButtonProps> = ({
  onToggle,
  industry,
  optimizationCount,
  hasCritical,
}) => {
  const Icon = industry?.icon || Building2;

  return (
    <motion.div
      className="fixed bottom-44 right-6 z-40"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
    >
      <TouchButton
        onPress={onToggle}
        variant="primary"
        className={`
          relative rounded-full w-14 h-14 p-0 shadow-lg
          ${hasCritical ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
        `}
      >
        <Icon className="w-6 h-6" />
        
        {optimizationCount > 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {optimizationCount > 9 ? '9+' : optimizationCount}
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

// Industry data
const INDUSTRIES: Industry[] = [
  {
    id: 'technology',
    name: 'Technology',
    icon: Code,
    description: 'Software, hardware, and IT services',
    keyMetrics: ['ROI', 'Implementation Time', 'Scalability', 'Security'],
    commonChallenges: ['Technical complexity', 'Rapid change', 'Security concerns'],
    decisionFactors: ['Technical merit', 'Cost-effectiveness', 'Timeline', 'Support'],
    proposalTypes: ['Software development', 'System integration', 'Consulting'],
    averageTimeline: 90,
    budgetRanges: { min: 50, max: 500, currency: '$' },
    regulations: ['GDPR', 'SOX', 'HIPAA'],
    stakeholders: ['CTO', 'IT Director', 'Security Team', 'End Users'],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: Stethoscope,
    description: 'Medical services, devices, and pharmaceuticals',
    keyMetrics: ['Patient outcomes', 'Compliance', 'Cost reduction', 'Safety'],
    commonChallenges: ['Regulatory compliance', 'Patient safety', 'Cost control'],
    decisionFactors: ['Clinical evidence', 'Regulatory approval', 'Cost-effectiveness'],
    proposalTypes: ['Medical devices', 'Healthcare services', 'Clinical trials'],
    averageTimeline: 180,
    budgetRanges: { min: 100, max: 1000, currency: '$' },
    regulations: ['FDA', 'HIPAA', 'HITECH', 'State medical boards'],
    stakeholders: ['Chief Medical Officer', 'Compliance', 'Procurement', 'Clinicians'],
  },
  {
    id: 'finance',
    name: 'Financial Services',
    icon: Landmark,
    description: 'Banking, insurance, and investment services',
    keyMetrics: ['Risk reduction', 'Compliance', 'Revenue impact', 'Efficiency'],
    commonChallenges: ['Regulatory compliance', 'Risk management', 'Digital transformation'],
    decisionFactors: ['Risk assessment', 'Regulatory compliance', 'ROI'],
    proposalTypes: ['Financial technology', 'Risk management', 'Compliance solutions'],
    averageTimeline: 120,
    budgetRanges: { min: 75, max: 750, currency: '$' },
    regulations: ['SOX', 'Dodd-Frank', 'Basel III', 'PCI DSS'],
    stakeholders: ['CFO', 'Risk Manager', 'Compliance Officer', 'Board'],
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: Factory,
    description: 'Industrial production and assembly',
    keyMetrics: ['Efficiency gains', 'Quality improvement', 'Cost reduction', 'Safety'],
    commonChallenges: ['Operational efficiency', 'Quality control', 'Supply chain'],
    decisionFactors: ['ROI', 'Implementation timeline', 'Minimal disruption'],
    proposalTypes: ['Process improvement', 'Equipment', 'Automation'],
    averageTimeline: 150,
    budgetRanges: { min: 100, max: 1500, currency: '$' },
    regulations: ['OSHA', 'EPA', 'ISO standards'],
    stakeholders: ['Plant Manager', 'Operations', 'Safety', 'Engineering'],
  },
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    description: 'Schools, universities, and training organizations',
    keyMetrics: ['Student outcomes', 'Cost per student', 'Engagement', 'Accessibility'],
    commonChallenges: ['Budget constraints', 'Technology adoption', 'Accessibility'],
    decisionFactors: ['Educational impact', 'Cost-effectiveness', 'Ease of use'],
    proposalTypes: ['Educational technology', 'Curriculum', 'Infrastructure'],
    averageTimeline: 90,
    budgetRanges: { min: 25, max: 250, currency: '$' },
    regulations: ['FERPA', 'ADA', 'State education codes'],
    stakeholders: ['Superintendent', 'IT Director', 'Teachers', 'Board'],
  },
  {
    id: 'retail',
    name: 'Retail',
    icon: ShoppingCart,
    description: 'Consumer goods and services',
    keyMetrics: ['Sales increase', 'Customer satisfaction', 'Operational efficiency'],
    commonChallenges: ['Customer experience', 'Inventory management', 'Omnichannel'],
    decisionFactors: ['Customer impact', 'ROI', 'Implementation speed'],
    proposalTypes: ['Point of sale', 'Customer experience', 'Supply chain'],
    averageTimeline: 60,
    budgetRanges: { min: 30, max: 300, currency: '$' },
    regulations: ['PCI DSS', 'Consumer protection laws'],
    stakeholders: ['CMO', 'Operations', 'IT', 'Store managers'],
  },
];

// Mock API functions
async function generateIndustryOptimizations(
  industryId: string,
  conversation: ConversationState
): Promise<IndustryOptimization[]> {
  // Mock implementation - replace with actual AI analysis
  const industry = INDUSTRIES.find(ind => ind.id === industryId);
  if (!industry) return [];

  // Mock optimizations based on industry
  const optimizations: IndustryOptimization[] = [];

  if (industryId === 'healthcare') {
    optimizations.push({
      id: 'healthcare-compliance-1',
      industryId,
      type: 'compliance',
      priority: 'critical',
      category: 'regulatory',
      title: 'Add HIPAA compliance section',
      description: 'Healthcare proposals must explicitly address HIPAA compliance requirements and data protection measures.',
      rationale: 'HIPAA compliance is mandatory for any healthcare solution handling patient data. Proposals without compliance details are automatically rejected.',
      implementation: {
        steps: [
          {
            id: 'step-1',
            title: 'Add HIPAA compliance section',
            description: 'Create dedicated section explaining how solution meets HIPAA requirements',
            type: 'guided',
            estimatedTime: 30,
            requirements: ['HIPAA knowledge', 'Technical specifications'],
            deliverables: ['Compliance section', 'Risk assessment'],
          },
        ],
        templates: [
          {
            id: 'hipaa-template',
            name: 'HIPAA Compliance Template',
            type: 'section',
            description: 'Standard HIPAA compliance section template',
            content: 'Our solution ensures full HIPAA compliance through...',
            variables: ['solution_name', 'data_types', 'security_measures'],
          },
        ],
        automations: [
          {
            id: 'hipaa-check',
            name: 'HIPAA Compliance Checker',
            description: 'Automatically validate HIPAA compliance elements',
            triggers: ['section_update'],
            actions: ['validate_requirements', 'flag_issues'],
            confidence: 0.9,
          },
        ],
        validations: [
          {
            id: 'hipaa-required',
            type: 'required',
            description: 'HIPAA compliance section is required',
            criteria: 'Must contain HIPAA compliance details',
            severity: 'error',
          },
        ],
      },
      compliance: {
        regulation: 'HIPAA',
        description: 'Health Insurance Portability and Accountability Act',
        requirements: [
          'Administrative safeguards',
          'Physical safeguards',
          'Technical safeguards',
          'Business associate agreements',
        ],
        penalties: 'Up to $1.5M per incident',
        lastUpdated: new Date('2023-01-01'),
        authority: 'HHS Office for Civil Rights',
      },
      impact: {
        approvalRate: 45,
        timeToDecision: 15,
        stakeholderBuyIn: 9,
        competitiveAdvantage: 8,
      },
      examples: [
        'Data encryption at rest and in transit',
        'Role-based access controls',
        'Audit logging and monitoring',
      ],
      bestPractices: [
        'Include specific technical controls',
        'Address all three safeguard categories',
        'Provide implementation timeline',
        'Include staff training plans',
      ],
      commonMistakes: [
        'Generic compliance statements',
        'Missing technical details',
        'No risk assessment',
      ],
      resources: [
        {
          id: 'hipaa-guide',
          type: 'guide',
          title: 'HIPAA Compliance Guide',
          description: 'Comprehensive guide to HIPAA requirements',
          relevance: 1.0,
        },
      ],
    });
  }

  return optimizations;
}