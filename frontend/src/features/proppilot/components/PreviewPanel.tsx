'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XCircle, Edit3, Check, X, Navigation } from 'lucide-react';
import ExportButton from './export/ExportButton';
import { ConversationState } from '../types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

interface PreviewPanelProps {
  isVisible: boolean;
  messages: Message[];
  onClose: () => void;
  isMobile?: boolean;
  onSectionClick?: (sectionId: string) => void;
  activeSectionId?: string;
  conversationState?: ConversationState;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  isVisible, 
  messages, 
  onClose,
  isMobile = false,
  onSectionClick,
  activeSectionId,
  conversationState
}) => {
  const proposalSections = [
    { id: 'executive-summary', title: 'Executive Summary' },
    { id: 'project-overview', title: 'Project Overview' },
    { id: 'technical-approach', title: 'Technical Approach' },
    { id: 'timeline-deliverables', title: 'Timeline & Deliverables' },
    { id: 'team-expertise', title: 'Team & Expertise' },
    { id: 'investment', title: 'Investment' }
  ];

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showNavigation, setShowNavigation] = useState(false);

  const handleSectionClick = (sectionId: string) => {
    if (onSectionClick) {
      onSectionClick(sectionId);
    }
  };

  const handleEditSection = (sectionId: string, currentContent: string) => {
    setEditingSection(sectionId);
    setEditContent(currentContent);
  };

  const handleSaveEdit = () => {
    // In a real implementation, this would save to backend
    console.log(`Saving content for section ${editingSection}:`, editContent);
    setEditingSection(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditContent('');
  };

  const getSectionContent = (sectionId: string, index: number) => {
    if (index < (messages.length - 1)) {
      return "This section will contain detailed content generated from your conversation. Click the edit button to customize it further.";
    } else if (index === (messages.length - 1)) {
      return "Content is being built from your current discussion...";
    } else {
      return "Share more details in the chat to unlock this section.";
    }
  };

  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Mobile Preview Header */}
        <div className="p-4 border-b border-border bg-background/95">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Draft Preview</h2>
            <div className="flex items-center space-x-2">
              {conversationState && (
                <ExportButton 
                  conversationState={conversationState}
                  variant="outline"
                  size="sm"
                  showDropdown={false}
                />
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClose}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Preview Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <Card className="p-6 bg-background">
            <div className="space-y-4">
              <div className="text-center">
                <h1 className="text-xl font-bold text-foreground mb-2">
                  Proposal Draft
                </h1>
                <p className="text-muted-foreground text-sm">
                  Building as we chat...
                </p>
              </div>

              <div className="space-y-3">
                {proposalSections.map((section, index) => (
                  <motion.div 
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border rounded-lg p-3 transition-all cursor-pointer ${
                      activeSectionId === section.id 
                        ? 'border-primary bg-primary/10 ring-1 ring-primary/20' 
                        : 'border-border hover:bg-muted/20 hover:border-primary/30'
                    }`}
                    onClick={() => handleSectionClick(section.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-foreground text-sm">{section.title}</h3>
                      {index < (messages.length - 1) ? (
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      ) : index === (messages.length - 1) ? (
                        <motion.div 
                          className="w-1.5 h-1.5 bg-yellow-500 rounded-full"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      ) : (
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                      )}
                    </div>
                    {index < (messages.length - 1) ? (
                      <p className="text-xs text-muted-foreground">
                        ✓ Ready for generation
                      </p>
                    ) : index === (messages.length - 1) ? (
                      <p className="text-xs text-muted-foreground">
                        🔄 Building from chat
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        ⏳ Need more details
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Mobile Progress Indicator */}
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground">
                    Progress
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.min(100, Math.round((messages.length / proposalSections.length) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <motion.div 
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min(100, Math.round((messages.length / proposalSections.length) * 100))}%` 
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ 
        width: isVisible ? "60%" : 0, 
        opacity: isVisible ? 1 : 0 
      }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="border-l border-border bg-muted/10 overflow-hidden"
    >
      <div className="h-full flex flex-col">
        {/* Preview Header */}
        <div className="p-4 border-b border-border bg-background/95">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Draft Preview</h2>
            <div className="flex items-center space-x-2">
              {conversationState && (
                <ExportButton 
                  conversationState={conversationState}
                  variant="outline"
                  size="sm"
                />
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowNavigation(!showNavigation)}
                className={showNavigation ? 'text-primary' : ''}
              >
                <Navigation className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClose}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Navigation */}
          {showNavigation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border"
            >
              <p className="text-xs text-muted-foreground mb-2">Jump to section:</p>
              <div className="flex flex-wrap gap-1">
                {proposalSections.map((section, index) => (
                  <Button
                    key={section.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleSectionClick(section.id);
                      setShowNavigation(false);
                    }}
                    className={`text-xs min-h-[44px] px-2 ${
                      activeSectionId === section.id ? 'bg-primary text-primary-foreground' : ''
                    } ${
                      index < (messages.length - 1) ? 'border-green-200' : 
                      index === (messages.length - 1) ? 'border-yellow-200' : 'border-gray-200'
                    }`}
                  >
                    {section.title}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Preview Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-background">
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    Proposal Draft
                  </h1>
                  <p className="text-muted-foreground">
                    Building as we chat...
                  </p>
                </div>

                <div className="space-y-4">
                  {proposalSections.map((section, index) => (
                    <motion.div 
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`group border rounded-lg p-4 transition-all cursor-pointer ${
                        activeSectionId === section.id 
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20 shadow-md' 
                          : 'border-border hover:bg-muted/20 hover:border-primary/40 hover:shadow-sm'
                      }`}
                      onClick={() => handleSectionClick(section.id)}
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">{section.title}</h3>
                        <div className="flex items-center space-x-2">
                          {index < (messages.length - 1) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSection(section.id, getSectionContent(section.id, index));
                              }}
                              className="min-h-[44px] min-w-[44px] p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          )}
                          {index < (messages.length - 1) ? (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          ) : index === (messages.length - 1) ? (
                            <motion.div 
                              className="w-2 h-2 bg-yellow-500 rounded-full"
                              animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          ) : (
                            <div className="w-2 h-2 bg-gray-300 rounded-full" />
                          )}
                        </div>
                      </div>
                      
                      {editingSection === section.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[100px] text-sm"
                            placeholder="Edit section content..."
                          />
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={handleSaveEdit}>
                              <Check className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="group">
                          {index < (messages.length - 1) ? (
                            <p className="text-sm text-muted-foreground">
                              {getSectionContent(section.id, index)}
                            </p>
                          ) : index === (messages.length - 1) ? (
                            <p className="text-sm text-muted-foreground">
                              🔄 Building - Adding content from current discussion
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              ⏳ Waiting - Share more details to unlock this section
                            </p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Progress Indicator */}
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Completion Progress
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.min(100, Math.round((messages.length / proposalSections.length) * 100))}%
                    </span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <motion.div 
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min(100, Math.round((messages.length / proposalSections.length) * 100))}%` 
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PreviewPanel;