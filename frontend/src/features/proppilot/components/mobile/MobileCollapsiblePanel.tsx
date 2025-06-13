'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { ChevronUp, ChevronDown, X, Maximize2, Minimize2 } from 'lucide-react';

interface MobileCollapsiblePanelProps {
  children: ReactNode;
  title: string;
  defaultExpanded?: boolean;
  height?: 'auto' | 'half' | 'full';
  position?: 'bottom' | 'top';
  allowSwipeClose?: boolean;
  showHeader?: boolean;
  onToggle?: (expanded: boolean) => void;
  onClose?: () => void;
  className?: string;
}

export const MobileCollapsiblePanel: React.FC<MobileCollapsiblePanelProps> = ({
  children,
  title,
  defaultExpanded = false,
  height = 'half',
  position = 'bottom',
  allowSwipeClose = true,
  showHeader = true,
  onToggle,
  onClose,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isDragging, setIsDragging] = useState(false);
  const [panelHeight, setPanelHeight] = useState<'collapsed' | 'half' | 'full'>('collapsed');
  
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate heights based on viewport
  const getHeights = () => {
    const vh = window.innerHeight;
    return {
      collapsed: 60, // Header height only
      half: vh * 0.5,
      full: vh * 0.9,
    };
  };

  const heights = getHeights();

  useEffect(() => {
    setIsExpanded(defaultExpanded);
    setPanelHeight(defaultExpanded ? (height === 'full' ? 'full' : 'half') : 'collapsed');
  }, [defaultExpanded, height]);

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    if (newExpanded) {
      setPanelHeight(height === 'full' ? 'full' : 'half');
    } else {
      setPanelHeight('collapsed');
    }
    
    onToggle?.(newExpanded);
  };

  const handleHeightToggle = () => {
    if (panelHeight === 'half') {
      setPanelHeight('full');
    } else if (panelHeight === 'full') {
      setPanelHeight('half');
    }
  };

  const handlePanEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    const { offset, velocity } = info;
    const threshold = 50;
    
    if (position === 'bottom') {
      // Swiping down
      if (offset.y > threshold || velocity.y > 500) {
        if (panelHeight === 'full') {
          setPanelHeight('half');
        } else if (panelHeight === 'half') {
          setPanelHeight('collapsed');
          setIsExpanded(false);
          onToggle?.(false);
        } else if (allowSwipeClose) {
          onClose?.();
        }
      }
      // Swiping up
      else if (offset.y < -threshold || velocity.y < -500) {
        if (panelHeight === 'collapsed') {
          setPanelHeight('half');
          setIsExpanded(true);
          onToggle?.(true);
        } else if (panelHeight === 'half') {
          setPanelHeight('full');
        }
      }
    }
  };

  const handlePanStart = () => {
    setIsDragging(true);
  };

  const panelVariants = {
    collapsed: {
      height: heights.collapsed,
      y: position === 'bottom' ? 0 : -heights.collapsed,
    },
    half: {
      height: heights.half,
      y: position === 'bottom' ? 0 : -heights.half,
    },
    full: {
      height: heights.full,
      y: position === 'bottom' ? 0 : -heights.full,
    },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5 },
  };

  const currentHeight = heights[panelHeight];

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 bg-black z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => {
              setPanelHeight('collapsed');
              setIsExpanded(false);
              onToggle?.(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Panel Container */}
      <motion.div
        ref={containerRef}
        className={`fixed left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 ${
          position === 'bottom' ? 'bottom-0' : 'top-0'
        } ${className}`}
        style={{
          borderTopLeftRadius: position === 'bottom' ? '16px' : '0',
          borderTopRightRadius: position === 'bottom' ? '16px' : '0',
          borderBottomLeftRadius: position === 'top' ? '16px' : '0',
          borderBottomRightRadius: position === 'top' ? '16px' : '0',
        }}
        animate={panelVariants[panelHeight]}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300,
          duration: isDragging ? 0 : undefined,
        }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onPanStart={handlePanStart}
        onPanEnd={handlePanEnd}
        whileDrag={{ cursor: 'grabbing' }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex-1 truncate">
              {title}
            </h3>
            
            <div className="flex items-center space-x-2">
              {/* Height Toggle */}
              {isExpanded && (
                <button
                  onClick={handleHeightToggle}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label={panelHeight === 'full' ? 'Minimize' : 'Maximize'}
                >
                  {panelHeight === 'full' ? (
                    <Minimize2 className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Maximize2 className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              )}

              {/* Expand/Collapse Toggle */}
              <button
                onClick={handleToggle}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Close Button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              ref={contentRef}
              className="flex-1 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                height: currentHeight - (showHeader ? 80 : 20), // Account for header and drag handle
              }}
            >
              <div className="h-full overflow-y-auto overscroll-contain">
                <div className="p-4">
                  {children}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

// Specialized panels for different use cases
export const MobileChatPanel: React.FC<{
  messages: any[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}> = ({ messages, onSendMessage, isLoading = false }) => {
  return (
    <MobileCollapsiblePanel
      title="Chat"
      defaultExpanded={true}
      height="half"
      showHeader={false}
      className="border-t-2 border-blue-500"
    >
      <div className="flex flex-col h-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-100 ml-4'
                  : 'bg-gray-100 mr-4'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          ))}
          
          {isLoading && (
            <div className="bg-gray-100 mr-4 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t pt-3">
          <MobileMessageInput onSend={onSendMessage} disabled={isLoading} />
        </div>
      </div>
    </MobileCollapsiblePanel>
  );
};

export const MobilePreviewPanel: React.FC<{
  sections: any[];
  onSectionClick?: (sectionId: string) => void;
}> = ({ sections, onSectionClick }) => {
  return (
    <MobileCollapsiblePanel
      title="Proposal Preview"
      defaultExpanded={false}
      height="full"
      className="border-t-2 border-green-500"
    >
      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className="border border-gray-200 rounded-lg p-4 active:bg-gray-50"
            onClick={() => onSectionClick?.(section.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{section.title}</h4>
              <span className={`px-2 py-1 rounded-full text-xs ${
                section.status === 'complete' ? 'bg-green-100 text-green-700' :
                section.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {section.status}
              </span>
            </div>
            
            {section.content && (
              <p className="text-sm text-gray-600 line-clamp-3">
                {section.content}
              </p>
            )}
            
            <div className="mt-2 text-xs text-gray-500">
              {section.wordCount} words • {section.completionPercentage}% complete
            </div>
          </div>
        ))}
      </div>
    </MobileCollapsiblePanel>
  );
};

// Mobile-optimized message input
const MobileMessageInput: React.FC<{
  onSend: (message: string) => void;
  disabled?: boolean;
}> = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120 // Max height
      )}px`;
    }
  }, [message]);

  return (
    <div className="flex items-end space-x-3">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder="Type your message..."
          disabled={disabled}
          className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          style={{ minHeight: '48px' }}
          rows={1}
        />
      </div>
      
      <button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="p-3 bg-blue-600 text-white rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95 transition-all duration-150"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  );
};