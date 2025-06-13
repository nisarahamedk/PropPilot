'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Mic, 
  MicOff, 
  Plus, 
  Image, 
  Paperclip, 
  X,
  MoreVertical,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Zap
} from 'lucide-react';
import { TouchButton } from './TouchOptimizedComponents';
import { useSwipeGestures, usePullToRefresh } from '../hooks/useSwipeGestures';
import { useConversationStore, useConversationActions } from '../../stores/conversationStore';
import { MemoizedMessageItem } from '../MemoizedComponents';
import { useVirtualizedMessages } from '../hooks/useOptimizedPerformance';

interface MobileChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  metadata?: {
    sectionUpdated?: string;
    actionType?: string;
    readinessScore?: number;
  };
}

interface MobileChatInterfaceProps {
  messages: MobileChatMessage[];
  onSendMessage: (message: string) => void;
  onRegenerateResponse?: (messageId: string) => void;
  onCopyMessage?: (messageId: string) => void;
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
  isLoading?: boolean;
  placeholder?: string;
  showTypingIndicator?: boolean;
  maxInputHeight?: number;
  enableVoiceInput?: boolean;
  enableAttachments?: boolean;
}

export const MobileChatInterface: React.FC<MobileChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onRegenerateResponse,
  onCopyMessage,
  onFeedback,
  isLoading = false,
  placeholder = "Type your message...",
  showTypingIndicator = true,
  maxInputHeight = 120,
  enableVoiceInput = false,
  enableAttachments = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Virtual scrolling for large message lists
  const { visibleMessages, totalHeight } = useVirtualizedMessages(
    messagesContainerRef,
    80, // Average message height
    5   // Overscan
  );

  // Pull to refresh
  const { ref: pullToRefreshRef, isPulling, isRefreshing, pullDistance, progress } = usePullToRefresh(
    async () => {
      // Implement refresh logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && !isPulling) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isPulling]);

  // Auto-resize input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const newHeight = Math.min(inputRef.current.scrollHeight, maxInputHeight);
      inputRef.current.style.height = `${newHeight}px`;
    }
  }, [inputValue, maxInputHeight]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(15);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    setIsVoiceRecording(!isVoiceRecording);
    // Implement voice recording logic
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  };

  const handleMessageLongPress = (messageId: string) => {
    setSelectedMessageId(messageId);
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  // Swipe to dismiss message actions
  const swipeHandlers = useSwipeGestures({
    onSwipedLeft: () => setSelectedMessageId(null),
    onSwipedRight: () => setSelectedMessageId(null),
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {isPulling && (
          <motion.div
            className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-blue-50 z-10"
            initial={{ y: -60 }}
            animate={{ y: pullDistance - 60 }}
            style={{ height: pullDistance }}
          >
            <div className="flex items-center space-x-2 text-blue-600">
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : progress * 360 }}
                transition={{ duration: isRefreshing ? 1 : 0, repeat: isRefreshing ? Infinity : 0 }}
              >
                <RefreshCw className="w-5 h-5" />
              </motion.div>
              <span className="text-sm font-medium">
                {isRefreshing ? 'Refreshing...' : progress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages container */}
      <div 
        ref={(el) => {
          messagesContainerRef.current = el;
          pullToRefreshRef(el);
        }}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 overscroll-contain"
        style={{ height: totalHeight }}
      >
        {/* Welcome message for empty state */}
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome to PropPilot
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              Start by telling me about your project. I'll help you create a compelling proposal.
            </p>
          </div>
        )}

        {/* Virtualized messages */}
        {visibleMessages.map(({ message, index, offsetY }) => (
          <motion.div
            key={message.id}
            className="absolute left-0 right-0 px-4"
            style={{ transform: `translateY(${offsetY}px)` }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MobileChatMessage
              message={message}
              isSelected={selectedMessageId === message.id}
              onLongPress={() => handleMessageLongPress(message.id)}
              onCopy={() => onCopyMessage?.(message.id)}
              onRegenerate={() => onRegenerateResponse?.(message.id)}
              onFeedback={(type) => onFeedback?.(message.id, type)}
              showActions={message.role === 'assistant'}
            />
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isLoading && showTypingIndicator && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center space-x-3 px-4 py-3 bg-gray-100 rounded-2xl mr-12"
          >
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">AI is thinking...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white p-4 safe-area-pb">
        <div className="flex items-end space-x-3">
          {/* Attachment button */}
          {enableAttachments && (
            <TouchButton
              onPress={() => {/* Implement attachment logic */}}
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 rounded-full flex-shrink-0"
            >
              <Plus className="w-5 h-5" />
            </TouchButton>
          )}

          {/* Input field */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
              style={{ 
                minHeight: '48px',
                maxHeight: `${maxInputHeight}px`,
              }}
              rows={1}
            />
          </div>

          {/* Voice/Send button */}
          <div className="flex-shrink-0">
            {inputValue.trim() ? (
              <TouchButton
                onPress={handleSend}
                disabled={isLoading}
                variant="primary"
                size="sm"
                className="w-12 h-12 p-0 rounded-full"
              >
                <Send className="w-5 h-5" />
              </TouchButton>
            ) : enableVoiceInput ? (
              <TouchButton
                onPress={handleVoiceToggle}
                variant={isVoiceRecording ? "danger" : "secondary"}
                size="sm"
                className="w-12 h-12 p-0 rounded-full"
              >
                {isVoiceRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </TouchButton>
            ) : null}
          </div>
        </div>

        {/* Voice recording indicator */}
        <AnimatePresence>
          {isVoiceRecording && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-3 flex items-center justify-center space-x-2 text-red-600"
            >
              <motion.div
                className="w-2 h-2 bg-red-600 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-sm font-medium">Recording...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message actions overlay */}
      <AnimatePresence>
        {selectedMessageId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
            onClick={() => setSelectedMessageId(null)}
            {...swipeHandlers}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-white rounded-t-2xl p-4 safe-area-pb"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              
              <div className="space-y-2">
                {onCopyMessage && (
                  <TouchButton
                    onPress={() => {
                      onCopyMessage(selectedMessageId);
                      setSelectedMessageId(null);
                    }}
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <Copy className="w-5 h-5 mr-3" />
                    Copy message
                  </TouchButton>
                )}

                {onRegenerateResponse && (
                  <TouchButton
                    onPress={() => {
                      onRegenerateResponse(selectedMessageId);
                      setSelectedMessageId(null);
                    }}
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <RefreshCw className="w-5 h-5 mr-3" />
                    Regenerate response
                  </TouchButton>
                )}

                {onFeedback && (
                  <>
                    <TouchButton
                      onPress={() => {
                        onFeedback(selectedMessageId, 'positive');
                        setSelectedMessageId(null);
                      }}
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      <ThumbsUp className="w-5 h-5 mr-3" />
                      Good response
                    </TouchButton>

                    <TouchButton
                      onPress={() => {
                        onFeedback(selectedMessageId, 'negative');
                        setSelectedMessageId(null);
                      }}
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      <ThumbsDown className="w-5 h-5 mr-3" />
                      Poor response
                    </TouchButton>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Individual message component optimized for mobile
const MobileChatMessage: React.FC<{
  message: MobileChatMessage;
  isSelected?: boolean;
  onLongPress?: () => void;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onFeedback?: (type: 'positive' | 'negative') => void;
  showActions?: boolean;
}> = ({ message, isSelected, onLongPress, showActions }) => {
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      onLongPress?.();
    }, 500); // 500ms for long press
    setPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isSystem ? 'justify-center' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <div className={`
        max-w-[80%] px-4 py-3 rounded-2xl relative
        ${isUser 
          ? 'bg-blue-600 text-white rounded-br-md' 
          : isSystem
            ? 'bg-yellow-100 text-yellow-800 rounded-lg mx-auto max-w-[90%]'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        }
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${message.status === 'error' ? 'border-2 border-red-500' : ''}
      `}>
        {/* Message content */}
        <div className="text-base leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>

        {/* Message metadata */}
        <div className={`
          flex items-center justify-between mt-2 text-xs
          ${isUser ? 'text-blue-100' : 'text-gray-500'}
        `}>
          <span>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>

          {/* Status indicator */}
          {message.status && (
            <div className="flex items-center space-x-1">
              {message.status === 'sending' && (
                <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
              )}
              {message.status === 'error' && (
                <X className="w-3 h-3 text-red-500" />
              )}
            </div>
          )}
        </div>

        {/* AI metadata */}
        {message.metadata && !isUser && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            {message.metadata.sectionUpdated && (
              <div className="text-xs text-gray-500">
                Updated: {message.metadata.sectionUpdated}
              </div>
            )}
            {message.metadata.readinessScore && (
              <div className="text-xs text-gray-500">
                Readiness: {message.metadata.readinessScore}%
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// PropPilot-specific mobile chat wrapper
export const PropPilotMobileChat: React.FC = () => {
  const conversationStore = useConversationStore();
  const actions = useConversationActions();
  
  const messages = conversationStore.messages || [];
  const isGenerating = conversationStore.generationState?.isGenerating || false;

  const handleSendMessage = (content: string) => {
    actions.addMessage({
      content,
      role: 'user',
    });
  };

  const handleCopyMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      navigator.clipboard.writeText(message.content);
      // Show toast notification
    }
  };

  const handleRegenerateResponse = (messageId: string) => {
    // Implement regeneration logic
    console.log('Regenerating response for message:', messageId);
  };

  const handleFeedback = (messageId: string, type: 'positive' | 'negative') => {
    // Implement feedback logic
    console.log('Feedback for message:', messageId, type);
  };

  return (
    <MobileChatInterface
      messages={messages as MobileChatMessage[]}
      onSendMessage={handleSendMessage}
      onCopyMessage={handleCopyMessage}
      onRegenerateResponse={handleRegenerateResponse}
      onFeedback={handleFeedback}
      isLoading={isGenerating}
      enableVoiceInput={true}
      enableAttachments={true}
      placeholder="Tell me about your project..."
    />
  );
};