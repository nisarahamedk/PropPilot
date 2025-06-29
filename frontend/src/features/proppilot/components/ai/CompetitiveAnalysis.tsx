'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConversationState, ProjectContext } from '../../types';

interface CompetitorProfile {
  id: string;
  name: string;
  description: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  pricing: {
    model: string;
    range: string;
    value: 'low' | 'medium' | 'high';
  };
  differentiators: string[];
  riskLevel: 'low' | 'medium' | 'high';
  relevanceScore: number;
}

interface CompetitiveInsight {
  type: 'opportunity' | 'threat' | 'strength' | 'weakness';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendations: string[];
}

interface CompetitiveAnalysisProps {
  conversationState: ConversationState;
  onInsightApplied: (insight: CompetitiveInsight) => void;
}

const CompetitiveAnalysis: React.FC<CompetitiveAnalysisProps> = ({
  conversationState,
  onInsightApplied
}) => {
  const [competitors, setCompetitors] = useState<CompetitorProfile[]>([]);
  const [insights, setInsights] = useState<CompetitiveInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);

  const analyzeCompetitors = async () => {
    setLoading(true);
    
    try {
      // Simulate API call to competitive analysis service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock competitive data based on project context
      const mockCompetitors: CompetitorProfile[] = [
        {
          id: 'comp-1',
          name: 'Industry Leader Co.',
          description: 'Market leader with established enterprise solutions',
          marketShare: 35,
          strengths: ['Brand recognition', 'Enterprise features', 'Large team'],
          weaknesses: ['High costs', 'Slow innovation', 'Complex onboarding'],
          pricing: { model: 'Enterprise', range: '$50k-200k', value: 'high' },
          differentiators: ['24/7 support', 'Global presence', 'Integration suite'],
          riskLevel: 'high',
          relevanceScore: 92
        },
        {
          id: 'comp-2',
          name: 'Startup Innovator',
          description: 'Fast-growing startup with modern tech stack',
          marketShare: 12,
          strengths: ['Modern UI/UX', 'Fast implementation', 'Competitive pricing'],
          weaknesses: ['Limited features', 'Small team', 'No enterprise track record'],
          pricing: { model: 'SaaS', range: '$5k-25k', value: 'medium' },
          differentiators: ['AI-powered features', 'Mobile-first', 'API-first'],
          riskLevel: 'medium',
          relevanceScore: 78
        },
        {
          id: 'comp-3',
          name: 'Boutique Solutions',
          description: 'Specialized provider for niche markets',
          marketShare: 8,
          strengths: ['Industry expertise', 'Custom solutions', 'Personal service'],
          weaknesses: ['Limited scale', 'Higher costs', 'Technology debt'],
          pricing: { model: 'Custom', range: '$25k-100k', value: 'high' },
          differentiators: ['Industry specialization', 'Custom development', 'Consultative approach'],
          riskLevel: 'low',
          relevanceScore: 65
        }
      ];

      const mockInsights: CompetitiveInsight[] = [
        {
          type: 'opportunity',
          title: 'Price Competitiveness Gap',
          description: 'Your proposed pricing is 30% more competitive than the market leader while offering similar value.',
          impact: 'high',
          actionable: true,
          recommendations: [
            'Emphasize cost savings in executive summary',
            'Include ROI calculator in proposal',
            'Highlight value proposition vs. competitors'
          ]
        },
        {
          type: 'threat',
          title: 'Feature Parity Challenge',
          description: 'Competitors offer advanced analytics features that are not in your current scope.',
          impact: 'medium',
          actionable: true,
          recommendations: [
            'Consider adding analytics module',
            'Highlight your unique differentiators',
            'Position as phase 2 enhancement'
          ]
        },
        {
          type: 'strength',
          title: 'Implementation Speed Advantage',
          description: 'Your proposed timeline is 40% faster than typical competitor implementations.',
          impact: 'high',
          actionable: true,
          recommendations: [
            'Highlight fast time-to-value',
            'Include implementation methodology',
            'Show comparative timeline chart'
          ]
        }
      ];

      setCompetitors(mockCompetitors);
      setInsights(mockInsights);
      setLastAnalyzed(new Date());
    } catch (error) {
      console.error('Competitive analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-analyze if we have enough project context
    const { projectContext } = conversationState;
    if (
      projectContext.industry && 
      projectContext.requirements.length > 2 &&
      !lastAnalyzed
    ) {
      analyzeCompetitors();
    }
  }, [conversationState.projectContext, lastAnalyzed]);

  const getInsightIcon = (type: CompetitiveInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'threat':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'strength':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'weakness':
        return <XCircle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!conversationState.projectContext.industry) {
    return (
      <Card className="p-6 text-center">
        <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Competitive Analysis</h3>
        <p className="text-muted-foreground mb-4">
          Add industry and project details to enable competitive analysis
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Competitive Analysis</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {lastAnalyzed && (
            <span className="text-xs text-muted-foreground">
              Updated {lastAnalyzed.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeCompetitors}
            disabled={loading}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="h-4 w-4" />
              </motion.div>
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {loading ? 'Analyzing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Key Insights</TabsTrigger>
          <TabsTrigger value="competitors">Competitor Profiles</TabsTrigger>
          <TabsTrigger value="positioning">Market Position</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <AnimatePresence>
            {insights.map((insight, index) => (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 border-l-4 border-l-primary">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getInsightIcon(insight.type)}
                      <span className="font-medium capitalize">{insight.type}</span>
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact} impact
                      </Badge>
                    </div>
                    
                    {insight.actionable && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onInsightApplied(insight)}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Apply
                      </Button>
                    )}
                  </div>

                  <h4 className="font-semibold mb-2">{insight.title}</h4>
                  <p className="text-muted-foreground mb-3">{insight.description}</p>

                  {insight.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Recommendations:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {insight.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          {competitors.map((competitor, index) => (
            <motion.div
              key={competitor.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{competitor.name}</h4>
                    <p className="text-muted-foreground">{competitor.description}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm text-muted-foreground">Risk:</span>
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(competitor.riskLevel)}`} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {competitor.marketShare}% market share
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="font-medium text-green-600 mb-2">Strengths</h5>
                    <ul className="text-sm space-y-1">
                      {competitor.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-red-600 mb-2">Weaknesses</h5>
                    <ul className="text-sm space-y-1">
                      {competitor.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="flex items-center">
                          <XCircle className="h-3 w-3 text-red-500 mr-2" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-muted-foreground">Pricing: </span>
                    <span className="font-medium">{competitor.pricing.range}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({competitor.pricing.model})
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Relevance:</span>
                    <Progress value={competitor.relevanceScore} className="w-20" />
                    <span className="text-sm font-medium">{competitor.relevanceScore}%</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="positioning" className="space-y-4">
          <Card className="p-6">
            <h4 className="font-semibold mb-4">Your Competitive Position</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">Strong</div>
                <div className="text-sm text-muted-foreground">Price Competitiveness</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">Good</div>
                <div className="text-sm text-muted-foreground">Feature Completeness</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">Excellent</div>
                <div className="text-sm text-muted-foreground">Implementation Speed</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h5 className="font-medium mb-2">Key Differentiators to Emphasize:</h5>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 40% faster implementation than industry average</li>
                  <li>• 30% cost savings compared to market leader</li>
                  <li>• Modern technology stack with AI integration</li>
                  <li>• Dedicated account management</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default CompetitiveAnalysis;