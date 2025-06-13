'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Plus, 
  X, 
  Check, 
  Reply, 
  MoreVertical,
  Edit3,
  Trash2,
  AlertCircle,
  Clock,
  User
} from 'lucide-react';
import { TouchButton } from '../mobile/TouchOptimizedComponents';
import { CollaborationComment, CollaborationUser } from '../../services/collaborationService';

// Comment thread component
interface CommentThreadProps {
  comments: CollaborationComment[];
  sectionId: string;
  users: CollaborationUser[];
  currentUserId: string;
  onAddComment: (content: string, parentId?: string) => void;
  onEditComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onResolveComment: (commentId: string) => void;
  position?: { top: number; left: number };
  isOpen: boolean;
  onClose: () => void;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  sectionId,
  users,
  currentUserId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onResolveComment,
  position,
  isOpen,
  onClose,
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  // Filter comments for this section
  const sectionComments = comments.filter(comment => comment.sectionId === sectionId);
  const unresolvedComments = sectionComments.filter(comment => !comment.resolved);

  // Auto-focus textarea when opening
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Position thread near the cursor
  useEffect(() => {
    if (isOpen && position && threadRef.current) {
      const thread = threadRef.current;
      const rect = thread.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { top, left } = position;

      // Adjust if thread would go off-screen
      if (left + 320 > viewportWidth) {
        left = viewportWidth - 320 - 20;
      }
      if (top + rect.height > viewportHeight) {
        top = viewportHeight - rect.height - 20;
      }

      thread.style.top = `${Math.max(20, top)}px`;
      thread.style.left = `${Math.max(20, left)}px`;
    }
  }, [isOpen, position]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim(), replyToId || undefined);
      setNewComment('');
      setReplyToId(null);
    }
  };

  const handleEdit = (commentId: string, content: string) => {
    setEditingId(commentId);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      onEditComment(editingId, editContent.trim());
      setEditingId(null);
      setEditContent('');
    }
  };

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={threadRef}
        className="fixed z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">
              Comments ({unresolvedComments.length})
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            {unresolvedComments.length > 0 && (
              <TouchButton
                onPress={() => {
                  unresolvedComments.forEach(comment => {
                    onResolveComment(comment.id);
                  });
                }}
                variant="ghost"
                size="sm"
                className="text-green-600 hover:bg-green-50"
              >
                <Check className="w-4 h-4 mr-1" />
                Resolve All
              </TouchButton>
            )}
            
            <TouchButton
              onPress={onClose}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 rounded-full"
            >
              <X className="w-4 h-4" />
            </TouchButton>
          </div>
        </div>

        {/* Comments list */}
        <div className="max-h-96 overflow-y-auto">
          {sectionComments.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">No comments yet</p>
              <p className="text-gray-500 text-xs mt-1">
                Start a discussion about this section
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {sectionComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  user={getUserById(comment.userId)}
                  currentUserId={currentUserId}
                  isEditing={editingId === comment.id}
                  editContent={editContent}
                  onEdit={() => handleEdit(comment.id, comment.content)}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onSetEditContent={setEditContent}
                  onDelete={() => onDeleteComment(comment.id)}
                  onResolve={() => onResolveComment(comment.id)}
                  onReply={() => setReplyToId(comment.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* New comment form */}
        <div className="p-4 border-t border-gray-200">
          {replyToId && (
            <div className="flex items-center justify-between mb-2 p-2 bg-blue-50 rounded">
              <span className="text-sm text-blue-700">
                Replying to comment
              </span>
              <TouchButton
                onPress={() => setReplyToId(null)}
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0 rounded-full"
              >
                <X className="w-3 h-3" />
              </TouchButton>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              rows={2}
            />
            
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-500">
                @mention users with @ symbol
              </div>
              
              <div className="flex space-x-2">
                <TouchButton
                  onPress={() => setNewComment('')}
                  variant="ghost"
                  size="sm"
                  disabled={!newComment.trim()}
                >
                  Cancel
                </TouchButton>
                
                <TouchButton
                  onPress={() => {}}
                  variant="primary"
                  size="sm"
                  disabled={!newComment.trim()}
                >
                  {replyToId ? 'Reply' : 'Comment'}
                </TouchButton>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Individual comment item
interface CommentItemProps {
  comment: CollaborationComment;
  user?: CollaborationUser;
  currentUserId: string;
  isEditing: boolean;
  editContent: string;
  onEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onSetEditContent: (content: string) => void;
  onDelete: () => void;
  onResolve: () => void;
  onReply: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  user,
  currentUserId,
  isEditing,
  editContent,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onSetEditContent,
  onDelete,
  onResolve,
  onReply,
}) => {
  const [showActions, setShowActions] = useState(false);
  const isOwner = comment.userId === currentUserId;
  const timeAgo = getTimeAgo(comment.timestamp);

  return (
    <div className={`
      p-3 rounded-lg border transition-colors
      ${comment.resolved 
        ? 'bg-green-50 border-green-200' 
        : 'bg-gray-50 border-gray-200'
      }
    `}>
      {/* Comment header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
            ) : (
              <User className="w-3 h-3 text-blue-600" />
            )}
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-900">
              {user?.name || 'Unknown User'}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              {timeAgo}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {comment.resolved && (
            <div className="flex items-center space-x-1 text-green-600">
              <Check className="w-3 h-3" />
              <span className="text-xs">Resolved</span>
            </div>
          )}

          <TouchButton
            onPress={() => setShowActions(!showActions)}
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0 rounded-full"
          >
            <MoreVertical className="w-3 h-3" />
          </TouchButton>
        </div>
      </div>

      {/* Comment content */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => onSetEditContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          
          <div className="flex space-x-2">
            <TouchButton
              onPress={onSaveEdit}
              variant="primary"
              size="sm"
              className="text-xs"
            >
              Save
            </TouchButton>
            
            <TouchButton
              onPress={onCancelEdit}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              Cancel
            </TouchButton>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed">
          {comment.content}
        </div>
      )}

      {/* Position indicator */}
      {comment.position && (
        <div className="mt-2 text-xs text-gray-500 bg-gray-100 rounded px-2 py-1 inline-block">
          Selected text: position {comment.position.start}-{comment.position.end}
        </div>
      )}

      {/* Actions menu */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex items-center space-x-2"
          >
            <TouchButton
              onPress={onReply}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </TouchButton>

            {!comment.resolved && (
              <TouchButton
                onPress={onResolve}
                variant="ghost"
                size="sm"
                className="text-xs text-green-600 hover:bg-green-50"
              >
                <Check className="w-3 h-3 mr-1" />
                Resolve
              </TouchButton>
            )}

            {isOwner && (
              <>
                <TouchButton
                  onPress={onEdit}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Edit
                </TouchButton>

                <TouchButton
                  onPress={onDelete}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </TouchButton>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              user={user} // This should be the reply user
              currentUserId={currentUserId}
              isEditing={false}
              editContent=""
              onEdit={() => {}}
              onSaveEdit={() => {}}
              onCancelEdit={() => {}}
              onSetEditContent={() => {}}
              onDelete={onDelete}
              onResolve={onResolve}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Comment indicator for sections
interface CommentIndicatorProps {
  commentCount: number;
  unresolvedCount: number;
  onClick: () => void;
  position?: 'top-right' | 'bottom-right' | 'inline';
}

export const CommentIndicator: React.FC<CommentIndicatorProps> = ({
  commentCount,
  unresolvedCount,
  onClick,
  position = 'top-right',
}) => {
  const positionClasses = {
    'top-right': 'absolute top-2 right-2',
    'bottom-right': 'absolute bottom-2 right-2',
    'inline': 'inline-flex',
  };

  return (
    <TouchButton
      onPress={onClick}
      variant="ghost"
      size="sm"
      className={`
        ${positionClasses[position]}
        relative flex items-center space-x-1 bg-white border border-gray-300 rounded-full
        ${unresolvedCount > 0 ? 'text-orange-600 border-orange-300' : 'text-gray-600'}
      `}
    >
      <MessageCircle className="w-4 h-4" />
      <span className="text-xs font-medium">{commentCount}</span>
      
      {unresolvedCount > 0 && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">!</span>
        </div>
      )}
    </TouchButton>
  );
};

// Utility function for time formatting
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Comment overlay for text selection
interface CommentOverlayProps {
  isVisible: boolean;
  position: { top: number; left: number };
  selectedText: string;
  onAddComment: () => void;
  onClose: () => void;
}

export const CommentOverlay: React.FC<CommentOverlayProps> = ({
  isVisible,
  position,
  selectedText,
  onAddComment,
  onClose,
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2"
      style={{ top: position.top, left: position.left }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="flex items-center space-x-2">
        <TouchButton
          onPress={onAddComment}
          variant="primary"
          size="sm"
          className="text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Comment
        </TouchButton>
        
        <TouchButton
          onPress={onClose}
          variant="ghost"
          size="sm"
          className="w-6 h-6 p-0 rounded-full"
        >
          <X className="w-3 h-3" />
        </TouchButton>
      </div>
      
      {selectedText && (
        <div className="mt-2 text-xs text-gray-600 max-w-xs truncate">
          "{selectedText}"
        </div>
      )}
    </motion.div>
  );
};