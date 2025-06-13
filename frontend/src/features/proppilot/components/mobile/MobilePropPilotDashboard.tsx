'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, FileText, MessageCircle, User, Menu } from 'lucide-react';

// Import all mobile components
import { MobileLayout, MobileHeader, PropPilotMobileNavigation } from './MobileNavigation';
import { PropPilotMobileChat } from './MobileChatInterface';
import { 
  FloatingPreviewButton, 
  MobilePreviewModal, 
  useMobilePreview 
} from './MobilePreviewSystem';
import { TouchButton } from './TouchOptimizedComponents';
import { useMobileInputOptimization } from '../hooks/useMobileKeyboard';
import { useMobileNavigation } from '../hooks/useSwipeGestures';

// Import stores
import { useConversationStore, useConversationActions } from '../../stores/conversationStore';
import { useConversationHistoryStore } from '../../stores/conversationHistoryStore';

interface MobilePropPilotDashboardProps {
  className?: string;
}

export const MobilePropPilotDashboard: React.FC<MobilePropPilotDashboardProps> = ({
  className = '',
}) => {
  const [currentView, setCurrentView] = useState<'chat' | 'preview' | 'settings'>('chat');
  const [showDrawer, setShowDrawer] = useState(false);
  
  // Hooks
  const { currentView: swipeView, setCurrentView: setSwipeView, swipeRef } = useMobileNavigation();
  const { keyboard, voice } = useMobileInputOptimization();
  const { 
    isModalOpen, 
    sections, 
    draftStatus, 
    sectionCount, 
    progress,
    openModal, 
    closeModal 
  } = useMobilePreview();

  // Store hooks
  const conversationStore = useConversationStore();
  const conversationActions = useConversationActions();
  const historyStore = useConversationHistoryStore();

  // Sync swipe navigation with tab navigation
  useEffect(() => {
    const views = ['chat', 'preview', 'settings'] as const;
    if (swipeView !== currentView) {
      const index = views.indexOf(currentView);
      if (index !== -1) {
        setSwipeView(views[index]);
      }
    }
  }, [currentView, swipeView, setSwipeView]);

  // Handle keyboard appearance
  useEffect(() => {
    if (keyboard.isVisible) {
      // Adjust UI for keyboard
      document.documentElement.classList.add('keyboard-visible');
    } else {
      document.documentElement.classList.remove('keyboard-visible');
    }
  }, [keyboard.isVisible]);

  const handleViewChange = (view: string) => {
    setCurrentView(view as 'chat' | 'preview' | 'settings');
  };

  const handleSectionEdit = (sectionId: string) => {
    // Switch to chat view and focus on section editing
    setCurrentView('chat');
    closeModal();
    
    // Trigger section editing in chat
    conversationActions.addMessage({
      content: `Edit the ${sectionId.replace('_', ' ')} section`,
      role: 'user',
    });
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting proposal...');
  };

  const handleShare = () => {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: 'PropPilot Proposal',
        text: 'Check out this proposal I created with PropPilot',
        url: window.location.href,
      });
    }
  };

  const drawerItems = [
    {
      id: 'new-conversation',
      label: 'New Conversation',
      icon: <MessageCircle className="w-6 h-6" />,
      onPress: () => {
        // Create new conversation
        window.location.reload();
      },
    },
    {
      id: 'conversation-history',
      label: 'Conversation History',
      icon: <FileText className="w-6 h-6" />,
      onPress: () => {
        // Navigate to history
        setCurrentView('settings');
      },
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-6 h-6" />,
      onPress: () => {
        setCurrentView('settings');
      },
      divider: true,
    },
  ];

  const messageCount = conversationStore.messages?.length || 0;
  const isDraftReady = sectionCount > 0;

  return (
    <div className={`${className} h-screen bg-gray-50`} ref={swipeRef}>
      <MobileLayout
        header={{
          title: 'PropPilot',
          leftAction: {
            icon: <Menu className="w-6 h-6" />,
            onPress: () => setShowDrawer(true),
            label: 'Open menu',
          },
          rightActions: voice.isSupported ? [
            {
              icon: voice.isListening ? (
                <motion.div
                  className="w-6 h-6 bg-red-600 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              ) : (
                <div className="w-6 h-6 bg-gray-400 rounded-full" />
              ),
              onPress: voice.toggleListening,
              label: voice.isListening ? 'Stop listening' : 'Start voice input',
            },
          ] : undefined,
        }}
        navigation={{
          tabs: [
            {
              id: 'chat',
              label: 'Chat',
              icon: <MessageCircle className="w-6 h-6" />,
              badge: messageCount > 10 ? messageCount : undefined,
            },
            {
              id: 'preview',
              label: 'Preview',
              icon: <FileText className="w-6 h-6" />,
              badge: isDraftReady ? sectionCount : undefined,
            },
            {
              id: 'settings',
              label: 'Settings',
              icon: <Settings className="w-6 h-6" />,
            },
          ],
          activeTab: currentView,
          onTabChange: handleViewChange,
        }}
        drawer={{
          items: drawerItems,
          header: (
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">PropPilot</h2>
              <p className="text-sm text-gray-600">AI-Powered Proposals</p>
            </div>
          ),
          footer: (
            <div className="text-center text-xs text-gray-500">
              Version 1.0.0
            </div>
          ),
        }}
      >
        {/* Main content area with swipeable views */}
        <div className="h-full relative overflow-hidden">
          <motion.div
            className="flex h-full"
            animate={{ x: `-${(['chat', 'preview', 'settings'].indexOf(currentView)) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Chat View */}
            <div className="w-full flex-shrink-0 h-full">
              <ChatView />
            </div>

            {/* Preview View */}
            <div className="w-full flex-shrink-0 h-full">
              <PreviewView 
                sections={sections}
                onSectionEdit={handleSectionEdit}
                onExport={handleExport}
                onShare={handleShare}
              />
            </div>

            {/* Settings View */}
            <div className="w-full flex-shrink-0 h-full">
              <SettingsView />
            </div>
          </motion.div>
        </div>

        {/* Floating Preview Button */}
        <FloatingPreviewButton
          onPress={openModal}
          draftStatus={draftStatus as any}
          progress={progress}
          sectionCount={sectionCount}
          position="bottom-right"
        />

        {/* Preview Modal */}
        <MobilePreviewModal
          isOpen={isModalOpen}
          onClose={closeModal}
          sections={sections}
          onSectionEdit={handleSectionEdit}
          onExport={handleExport}
          onShare={handleShare}
        />

        {/* Keyboard-aware spacing */}
        <div 
          className="transition-all duration-300"
          style={{ height: keyboard.isVisible ? keyboard.height : 0 }}
        />
      </MobileLayout>

      {/* Voice input overlay */}
      <AnimatePresence>
        {voice.isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          >
            <motion.div
              className="bg-white rounded-2xl p-8 mx-4 text-center"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <motion.div
                className="w-20 h-20 bg-red-600 rounded-full mx-auto mb-4 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div className="w-8 h-8 bg-white rounded-full" />
              </motion.div>
              
              <h3 className="text-lg font-semibold mb-2">Listening...</h3>
              <p className="text-gray-600 mb-4">Speak your message</p>
              
              {voice.transcript && (
                <div className="bg-gray-100 rounded-lg p-3 mb-4">
                  <p className="text-sm">{voice.transcript}</p>
                </div>
              )}

              <TouchButton
                onPress={voice.stopListening}
                variant="secondary"
              >
                Stop Recording
              </TouchButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Chat view component
const ChatView: React.FC = () => {
  return (
    <div className="h-full">
      <PropPilotMobileChat />
    </div>
  );
};

// Preview view component
const PreviewView: React.FC<{
  sections: any[];
  onSectionEdit: (sectionId: string) => void;
  onExport: () => void;
  onShare: () => void;
}> = ({ sections, onSectionEdit, onExport, onShare }) => {
  if (sections.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Preview Available
          </h3>
          <p className="text-gray-600 mb-6">
            Start a conversation to generate your proposal preview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Preview</h2>
          <div className="flex space-x-2">
            <TouchButton onPress={onShare} variant="ghost" size="sm">
              Share
            </TouchButton>
            <TouchButton onPress={onExport} variant="primary" size="sm">
              Export
            </TouchButton>
          </div>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-lg border border-gray-200 p-4"
            onClick={() => onSectionEdit(section.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">{section.title}</h3>
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
            
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>{section.wordCount} words</span>
              <span>{section.completionPercentage}% complete</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Settings view component
const SettingsView: React.FC = () => {
  const historyStore = useConversationHistoryStore();
  const conversations = historyStore.conversations.slice(0, 10); // Show recent 10

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-6">
        {/* Profile section */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Profile</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">User</p>
                <p className="text-sm text-gray-600">PropPilot User</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent conversations */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Conversations</h3>
          {conversations.length > 0 ? (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <p className="font-medium text-gray-900 text-sm">
                    {conversation.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    {conversation.lastUpdated.toLocaleDateString()} • {conversation.messageCount} messages
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No recent conversations</p>
          )}
        </div>

        {/* App info */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">About</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>PropPilot v1.0.0</p>
            <p>AI-powered proposal generation</p>
            <p>Built with Next.js and React</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobilePropPilotDashboard;