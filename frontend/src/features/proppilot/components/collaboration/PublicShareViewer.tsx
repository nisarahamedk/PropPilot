'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  MessageSquare, 
  Download, 
  Share2,
  Lock,
  User,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  ArrowLeft,
  MoreVertical,
  Edit3,
  Flag,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { TouchButton } from '../mobile/TouchOptimizedComponents';
import { ConversationState, ProposalSection } from '../../types';
import { ShareLink, SharePermissions } from './ShareDraftSystem';
import { CommentThread } from './CommentSystem';
import { CollaborationComment, CollaborationUser } from '../../services/collaborationService';

// Public viewer types
export interface SharedDraft {
  id: string;
  title: string;
  description?: string;
  conversation: ConversationState;
  shareLink: ShareLink;
  metadata: {
    createdAt: Date;
    lastModified: Date;
    version: number;
    wordCount: number;
    readingTime: number;
    completionPercentage: number;
  };
  branding?: {
    logo?: string;
    primaryColor?: string;
    companyName?: string;
  };
}

export interface ViewerSession {
  id: string;
  viewerId: string;
  startTime: Date;
  permissions: SharePermissions;
  isAuthenticated: boolean;
  viewerInfo?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

// Main public viewer component
interface PublicShareViewerProps {
  shareToken: string;
  onAccessDenied?: () => void;
  onError?: (error: string) => void;
}

export const PublicShareViewer: React.FC<PublicShareViewerProps> = ({
  shareToken,
  onAccessDenied,
  onError,
}) => {
  const [sharedDraft, setSharedDraft] = useState<SharedDraft | null>(null);
  const [viewerSession, setViewerSession] = useState<ViewerSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'outline' | 'full' | 'comments'>('outline');
  const [comments, setComments] = useState<CollaborationComment[]>([]);
  const [showCommentThread, setShowCommentThread] = useState(false);

  useEffect(() => {
    loadSharedDraft();
  }, [shareToken]);

  const loadSharedDraft = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchSharedDraft(shareToken, password);
      
      if (result.requiresPassword) {
        setPasswordRequired(true);
        setLoading(false);
        return;
      }
      
      if (result.draft && result.session) {
        setSharedDraft(result.draft);
        setViewerSession(result.session);
        setComments(result.comments || []);
        
        // Track view
        await trackView(shareToken, result.session.id);
      } else {
        throw new Error('Invalid share link or expired');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load shared draft');
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadSharedDraft();
  };

  const handleAddComment = async (content: string, sectionId: string, parentId?: string) => {
    if (!viewerSession || !viewerSession.permissions.canComment) return;
    
    try {
      const comment = await addComment({
        shareToken,
        sectionId,
        content,
        parentId,
        viewerId: viewerSession.viewerId,
      });
      
      setComments(prev => [...prev, comment]);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'html') => {
    if (!viewerSession?.permissions.canExport || !sharedDraft) return;
    
    try {
      const exportUrl = await generateExport(shareToken, format);
      window.open(exportUrl, '_blank');
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const handleFeedback = async (type: 'positive' | 'negative', sectionId?: string) => {
    if (!viewerSession) return;
    
    try {
      await submitFeedback({
        shareToken,
        viewerId: viewerSession.viewerId,
        type,
        sectionId,
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">Loading shared draft...</div>
          <div className="text-sm text-gray-600">Please wait while we prepare your document</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <TouchButton
            onPress={() => window.history.back()}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </TouchButton>
        </div>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Password Required</h1>
            <p className="text-gray-600">This shared draft is password protected</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <TouchButton
              variant="primary"
              className="w-full"
              disabled={!password.trim()}
            >
              Access Draft
            </TouchButton>
          </form>
        </div>
      </div>
    );
  }

  if (!sharedDraft || !viewerSession) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SharedDraftHeader
        draft={sharedDraft}
        session={viewerSession}
        onExport={handleExport}
        onViewModeChange={setViewMode}
        currentViewMode={viewMode}
      />

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation sidebar */}
          <div className="lg:col-span-1">
            <DraftNavigation
              draft={sharedDraft}
              activeSection={activeSection}
              onSectionSelect={setActiveSection}
              comments={comments}
              canComment={viewerSession.permissions.canComment}
            />
          </div>

          {/* Content area */}
          <div className="lg:col-span-3">
            {viewMode === 'outline' && (
              <OutlineView
                draft={sharedDraft}
                session={viewerSession}
                activeSection={activeSection}
                onSectionSelect={setActiveSection}
                onAddComment={handleAddComment}
                comments={comments}
              />
            )}
            
            {viewMode === 'full' && (
              <FullDraftView
                draft={sharedDraft}
                session={viewerSession}
                onAddComment={handleAddComment}
                comments={comments}
              />
            )}
            
            {viewMode === 'comments' && (
              <CommentsView
                draft={sharedDraft}
                session={viewerSession}
                comments={comments}
                onAddComment={handleAddComment}
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating feedback */}
      {viewerSession.permissions.canComment && (
        <FloatingFeedbackPanel
          onFeedback={handleFeedback}
          onOpenComments={() => setShowCommentThread(true)}
        />
      )}

      {/* Comment thread modal */}
      {showCommentThread && (
        <CommentThread
          comments={comments}
          sectionId={activeSection || 'general'}
          users={[]} // Public viewer doesn't show user details
          currentUserId={viewerSession.viewerId}
          onAddComment={handleAddComment}
          onEditComment={() => {}} // Not allowed in public view
          onDeleteComment={() => {}} // Not allowed in public view
          onResolveComment={() => {}} // Not allowed in public view
          isOpen={showCommentThread}
          onClose={() => setShowCommentThread(false)}
        />
      )}
    </div>
  );
};

// Header component
interface SharedDraftHeaderProps {
  draft: SharedDraft;
  session: ViewerSession;
  onExport: (format: 'pdf' | 'docx' | 'html') => void;
  onViewModeChange: (mode: 'outline' | 'full' | 'comments') => void;
  currentViewMode: string;
}

const SharedDraftHeader: React.FC<SharedDraftHeaderProps> = ({
  draft,
  session,
  onExport,
  onViewModeChange,
  currentViewMode,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {draft.branding?.logo && (
              <img
                src={draft.branding.logo}
                alt={draft.branding.companyName}
                className="h-8 w-auto"
              />
            )}
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{draft.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <FileText className="w-3 h-3" />
                  <span>{draft.metadata.wordCount} words</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{draft.metadata.readingTime} min read</span>
                </span>
                <span className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>{draft.metadata.completionPercentage}% complete</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* View mode selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: 'outline', label: 'Outline', icon: FileText },
                { id: 'full', label: 'Full', icon: Eye },
                { id: 'comments', label: 'Comments', icon: MessageSquare },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => onViewModeChange(mode.id as any)}
                  className={`
                    flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors
                    ${currentViewMode === mode.id 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <mode.icon className="w-3 h-3" />
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>

            {/* Export menu */}
            {session.permissions.canExport && (
              <div className="relative">
                <TouchButton
                  onPress={() => setShowExportMenu(!showExportMenu)}
                  variant="secondary"
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </TouchButton>

                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      {[
                        { format: 'pdf', label: 'PDF Document', icon: FileText },
                        { format: 'docx', label: 'Word Document', icon: FileText },
                        { format: 'html', label: 'Web Page', icon: ExternalLink },
                      ].map((option) => (
                        <button
                          key={option.format}
                          onClick={() => {
                            onExport(option.format as any);
                            setShowExportMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <option.icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Share button */}
            <TouchButton
              onPress={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              variant="ghost"
              className="flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </TouchButton>
          </div>
        </div>
      </div>
    </div>
  );
};

// Navigation sidebar
interface DraftNavigationProps {
  draft: SharedDraft;
  activeSection: string | null;
  onSectionSelect: (sectionId: string) => void;
  comments: CollaborationComment[];
  canComment: boolean;
}

const DraftNavigation: React.FC<DraftNavigationProps> = ({
  draft,
  activeSection,
  onSectionSelect,
  comments,
  canComment,
}) => {
  const sections = Object.entries(draft.conversation.proposalSections || {});
  
  const getCommentCount = (sectionId: string) => {
    return comments.filter(c => c.sectionId === sectionId && !c.resolved).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-medium text-gray-900 mb-4">Document Outline</h3>
      
      <div className="space-y-2">
        {sections.map(([sectionId, section]) => {
          const commentCount = getCommentCount(sectionId);
          const isActive = activeSection === sectionId;
          
          return (
            <button
              key={sectionId}
              onClick={() => onSectionSelect(sectionId)}
              className={`
                w-full text-left p-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'hover:bg-gray-50 border border-transparent'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">
                    {section.title || sectionId.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {section.content ? `${section.content.length} chars` : 'Empty'}
                  </div>
                </div>
                
                {commentCount > 0 && canComment && (
                  <div className="flex items-center space-x-1 text-orange-600">
                    <MessageSquare className="w-3 h-3" />
                    <span className="text-xs font-medium">{commentCount}</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-600 space-y-1">
          <div>Last updated: {draft.metadata.lastModified.toLocaleDateString()}</div>
          <div>Version: {draft.metadata.version}</div>
        </div>
      </div>
    </div>
  );
};

// Outline view
interface OutlineViewProps {
  draft: SharedDraft;
  session: ViewerSession;
  activeSection: string | null;
  onSectionSelect: (sectionId: string) => void;
  onAddComment: (content: string, sectionId: string, parentId?: string) => void;
  comments: CollaborationComment[];
}

const OutlineView: React.FC<OutlineViewProps> = ({
  draft,
  session,
  activeSection,
  onSectionSelect,
  onAddComment,
  comments,
}) => {
  const sections = Object.entries(draft.conversation.proposalSections || {});

  return (
    <div className="space-y-6">
      {sections.map(([sectionId, section]) => {
        const sectionComments = comments.filter(c => c.sectionId === sectionId);
        const isActive = activeSection === sectionId;
        
        return (
          <div
            key={sectionId}
            className={`
              bg-white rounded-lg shadow-sm border transition-colors
              ${isActive ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'}
            `}
          >
            <div
              className="p-6 cursor-pointer"
              onClick={() => onSectionSelect(isActive ? '' : sectionId)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {section.title || sectionId.replace('_', ' ')}
                </h3>
                
                <div className="flex items-center space-x-2">
                  {sectionComments.length > 0 && (
                    <div className="flex items-center space-x-1 text-orange-600">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">{sectionComments.length}</span>
                    </div>
                  )}
                  
                  <div className={`w-3 h-3 rounded-full ${section.content ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              </div>
              
              <div className="text-gray-600 text-sm line-clamp-3">
                {section.content || 'This section is empty'}
              </div>
            </div>
            
            {isActive && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-200 p-6"
              >
                <div className="prose prose-sm max-w-none mb-4">
                  {section.content ? (
                    <div dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br>') }} />
                  ) : (
                    <div className="text-gray-500 italic">This section is empty</div>
                  )}
                </div>
                
                {session.permissions.canComment && (
                  <div className="pt-4 border-t border-gray-100">
                    <CommentSection
                      sectionId={sectionId}
                      comments={sectionComments}
                      onAddComment={onAddComment}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Full draft view
interface FullDraftViewProps {
  draft: SharedDraft;
  session: ViewerSession;
  onAddComment: (content: string, sectionId: string, parentId?: string) => void;
  comments: CollaborationComment[];
}

const FullDraftView: React.FC<FullDraftViewProps> = ({
  draft,
  session,
  onAddComment,
  comments,
}) => {
  const sections = Object.entries(draft.conversation.proposalSections || {});

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Document header */}
      <div className="p-8 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{draft.title}</h1>
        {draft.description && (
          <p className="text-lg text-gray-600">{draft.description}</p>
        )}
        
        <div className="flex items-center space-x-6 mt-6 text-sm text-gray-600">
          <span>Version {draft.metadata.version}</span>
          <span>{draft.metadata.wordCount} words</span>
          <span>{draft.metadata.readingTime} min read</span>
          <span>Last updated {draft.metadata.lastModified.toLocaleDateString()}</span>
        </div>
      </div>

      {/* Document content */}
      <div className="p-8 space-y-8">
        {sections.map(([sectionId, section]) => (
          <div key={sectionId} className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {section.title || sectionId.replace('_', ' ')}
              </h2>
              
              {session.permissions.canComment && (
                <TouchButton
                  onPress={() => {
                    const comment = prompt('Add a comment for this section:');
                    if (comment) {
                      onAddComment(comment, sectionId);
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MessageSquare className="w-4 h-4" />
                </TouchButton>
              )}
            </div>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              {section.content ? (
                <div dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br>') }} />
              ) : (
                <div className="text-gray-500 italic">This section is empty</div>
              )}
            </div>

            {/* Section comments */}
            {comments.filter(c => c.sectionId === sectionId).length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm font-medium text-yellow-800 mb-2">
                  Comments ({comments.filter(c => c.sectionId === sectionId).length})
                </div>
                <div className="space-y-2">
                  {comments.filter(c => c.sectionId === sectionId).slice(0, 2).map((comment) => (
                    <div key={comment.id} className="text-sm text-yellow-700">
                      "{comment.content}"
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Comments view
interface CommentsViewProps {
  draft: SharedDraft;
  session: ViewerSession;
  comments: CollaborationComment[];
  onAddComment: (content: string, sectionId: string, parentId?: string) => void;
}

const CommentsView: React.FC<CommentsViewProps> = ({
  draft,
  session,
  comments,
  onAddComment,
}) => {
  const [selectedSection, setSelectedSection] = useState<string>('all');
  
  const filteredComments = selectedSection === 'all' 
    ? comments 
    : comments.filter(c => c.sectionId === selectedSection);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Comments ({filteredComments.length})
        </h3>
        
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All sections</option>
          {Object.keys(draft.conversation.proposalSections || {}).map((sectionId) => (
            <option key={sectionId} value={sectionId}>
              {sectionId.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {filteredComments.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h4>
          <p className="text-gray-600">
            {session.permissions.canComment 
              ? 'Be the first to leave feedback on this draft'
              : 'Comments will appear here once reviewers add them'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Anonymous</span>
                  <span className="text-xs text-gray-500">
                    {comment.timestamp.toLocaleString()}
                  </span>
                </div>
                
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {comment.sectionId.replace('_', ' ')}
                </span>
              </div>
              
              <div className="text-gray-700">{comment.content}</div>
              
              {comment.position && (
                <div className="mt-2 text-xs text-gray-500 bg-gray-100 rounded px-2 py-1 inline-block">
                  Selected text: position {comment.position.start}-{comment.position.end}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Comment section for outline view
interface CommentSectionProps {
  sectionId: string;
  comments: CollaborationComment[];
  onAddComment: (content: string, sectionId: string, parentId?: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  sectionId,
  comments,
  onAddComment,
}) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim(), sectionId);
      setNewComment('');
    }
  };

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-3 h-3 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-700">{comment.content}</div>
            <div className="text-xs text-gray-500 mt-1">
              {comment.timestamp.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
      
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-3 h-3 text-blue-600" />
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </div>
  );
};

// Floating feedback panel
interface FloatingFeedbackPanelProps {
  onFeedback: (type: 'positive' | 'negative', sectionId?: string) => void;
  onOpenComments: () => void;
}

const FloatingFeedbackPanel: React.FC<FloatingFeedbackPanelProps> = ({
  onFeedback,
  onOpenComments,
}) => {
  return (
    <div className="fixed bottom-6 right-6 flex items-center space-x-2">
      <TouchButton
        onPress={() => onFeedback('positive')}
        variant="ghost"
        className="bg-white shadow-lg border border-gray-200 text-green-600 hover:bg-green-50"
      >
        <ThumbsUp className="w-4 h-4" />
      </TouchButton>
      
      <TouchButton
        onPress={() => onFeedback('negative')}
        variant="ghost"
        className="bg-white shadow-lg border border-gray-200 text-red-600 hover:bg-red-50"
      >
        <ThumbsDown className="w-4 h-4" />
      </TouchButton>
      
      <TouchButton
        onPress={onOpenComments}
        variant="primary"
        className="shadow-lg"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Comment
      </TouchButton>
    </div>
  );
};

// Mock API functions
async function fetchSharedDraft(shareToken: string, password?: string): Promise<{
  draft?: SharedDraft;
  session?: ViewerSession;
  comments?: CollaborationComment[];
  requiresPassword?: boolean;
}> {
  // Mock implementation
  return {
    requiresPassword: false,
    draft: {} as SharedDraft,
    session: {} as ViewerSession,
    comments: [],
  };
}

async function trackView(shareToken: string, sessionId: string): Promise<void> {
  // Mock implementation
}

async function addComment(data: {
  shareToken: string;
  sectionId: string;
  content: string;
  parentId?: string;
  viewerId: string;
}): Promise<CollaborationComment> {
  // Mock implementation
  return {} as CollaborationComment;
}

async function generateExport(shareToken: string, format: string): Promise<string> {
  // Mock implementation
  return 'https://example.com/export.pdf';
}

async function submitFeedback(data: {
  shareToken: string;
  viewerId: string;
  type: 'positive' | 'negative';
  sectionId?: string;
}): Promise<void> {
  // Mock implementation
}