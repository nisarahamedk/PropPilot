'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  FileText, 
  X, 
  Maximize2, 
  Minimize2, 
  Share, 
  Download, 
  Edit,
  ChevronDown,
  ChevronUp,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { FloatingActionButton, TouchButton } from './TouchOptimizedComponents';
import { useConversationStore } from '../../stores/conversationStore';

// Floating preview button that shows draft status
interface FloatingPreviewButtonProps {
  onPress: () => void;
  draftStatus: 'none' | 'building' | 'ready' | 'error';
  progress?: number;
  sectionCount?: number;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export const FloatingPreviewButton: React.FC<FloatingPreviewButtonProps> = ({
  onPress,
  draftStatus,
  progress = 0,
  sectionCount = 0,
  position = 'bottom-right',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide/show button on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const getButtonConfig = () => {
    switch (draftStatus) {
      case 'building':
        return {
          icon: <Clock className="w-6 h-6" />,
          label: `Building... ${Math.round(progress)}%`,
          variant: 'secondary' as const,
          pulse: true,
        };
      case 'ready':
        return {
          icon: <FileText className="w-6 h-6" />,
          label: `Preview (${sectionCount})`,
          variant: 'primary' as const,
          pulse: false,
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-6 h-6" />,
          label: 'Preview Error',
          variant: 'secondary' as const,
          pulse: true,
        };
      default:
        return {
          icon: <FileText className="w-6 h-6" />,
          label: 'No Draft',
          variant: 'secondary' as const,
          pulse: false,
        };
    }
  };

  const config = getButtonConfig();

  return (
    <AnimatePresence>
      {isVisible && draftStatus !== 'none' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <FloatingActionButton
            onPress={onPress}
            icon={config.icon}
            label={config.label}
            position={position}
            variant={config.variant}
            size="lg"
          />
          
          {/* Progress indicator for building state */}
          {draftStatus === 'building' && (
            <motion.div
              className="fixed bottom-20 right-6 w-16 h-1 bg-gray-200 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="h-full bg-blue-600"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          )}
          
          {/* Pulse animation for certain states */}
          {config.pulse && (
            <motion.div
              className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 rounded-full opacity-20"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modal overlay for full-screen preview
interface MobilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: Array<{
    id: string;
    title: string;
    content: string;
    status: 'empty' | 'draft' | 'building' | 'complete' | 'needs_refinement';
    wordCount: number;
    completionPercentage: number;
  }>;
  onSectionEdit?: (sectionId: string) => void;
  onExport?: () => void;
  onShare?: () => void;
}

export const MobilePreviewModal: React.FC<MobilePreviewModalProps> = ({
  isOpen,
  onClose,
  sections,
  onSectionEdit,
  onExport,
  onShare,
}) => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'outline' | 'full'>('outline');
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const getSectionStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-700 border-green-300';
      case 'draft': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'building': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'needs_refinement': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const totalWords = sections.reduce((sum, section) => sum + section.wordCount, 0);
  const averageCompletion = sections.length > 0 
    ? sections.reduce((sum, section) => sum + section.completionPercentage, 0) / sections.length 
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            ref={modalRef}
            className="fixed inset-0 z-50 flex flex-col bg-white safe-area"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <TouchButton
                  onPress={onClose}
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 p-0 rounded-full"
                >
                  <X className="w-6 h-6" />
                </TouchButton>
                
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Proposal Preview
                  </h2>
                  <p className="text-sm text-gray-500">
                    {totalWords} words • {Math.round(averageCompletion)}% complete
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* View mode toggle */}
                <TouchButton
                  onPress={() => setViewMode(viewMode === 'outline' ? 'full' : 'outline')}
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 p-0 rounded-full"
                >
                  {viewMode === 'outline' ? (
                    <Maximize2 className="w-5 h-5" />
                  ) : (
                    <Minimize2 className="w-5 h-5" />
                  )}
                </TouchButton>
                
                {/* Share button */}
                {onShare && (
                  <TouchButton
                    onPress={onShare}
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 p-0 rounded-full"
                  >
                    <Share className="w-5 h-5" />
                  </TouchButton>
                )}
                
                {/* Export button */}
                {onExport && (
                  <TouchButton
                    onPress={onExport}
                    variant="primary"
                    size="sm"
                    className="px-4"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </TouchButton>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {viewMode === 'outline' ? (
                <OutlineView 
                  sections={sections}
                  selectedSection={selectedSection}
                  onSectionSelect={setSelectedSection}
                  onSectionEdit={onSectionEdit}
                  getSectionStatusColor={getSectionStatusColor}
                />
              ) : (
                <FullView 
                  sections={sections}
                  getSectionStatusColor={getSectionStatusColor}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Outline view component
const OutlineView: React.FC<{
  sections: any[];
  selectedSection: string | null;
  onSectionSelect: (id: string | null) => void;
  onSectionEdit?: (id: string) => void;
  getSectionStatusColor: (status: string) => string;
}> = ({ sections, selectedSection, onSectionSelect, onSectionEdit, getSectionStatusColor }) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-3">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            className={`
              border rounded-lg overflow-hidden transition-all duration-200
              ${selectedSection === section.id 
                ? 'border-blue-500 shadow-md' 
                : 'border-gray-200'
              }
            `}
            layout
          >
            {/* Section header */}
            <div
              className="p-4 cursor-pointer active:bg-gray-50"
              onClick={() => onSectionSelect(
                selectedSection === section.id ? null : section.id
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {section.title}
                  </h3>
                  
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span>{section.wordCount} words</span>
                    <span>{section.completionPercentage}% complete</span>
                    
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium border
                      ${getSectionStatusColor(section.status)}
                    `}>
                      {section.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {onSectionEdit && (
                    <TouchButton
                      onPress={(e) => {
                        e?.stopPropagation();
                        onSectionEdit(section.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 rounded-full"
                    >
                      <Edit className="w-4 h-4" />
                    </TouchButton>
                  )}
                  
                  {selectedSection === section.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${section.completionPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
            
            {/* Expandable content */}
            <AnimatePresence>
              {selectedSection === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-200"
                >
                  <div className="p-4">
                    {section.content ? (
                      <div className="prose prose-sm max-w-none text-gray-700">
                        {section.content.length > 300 
                          ? `${section.content.substring(0, 300)}...`
                          : section.content
                        }
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">No content yet</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Full preview view component
const FullView: React.FC<{
  sections: any[];
  getSectionStatusColor: (status: string) => string;
}> = ({ sections, getSectionStatusColor }) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {sections.map((section) => (
          <div key={section.id} className="space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {section.title}
              </h2>
              
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium border
                ${getSectionStatusColor(section.status)}
              `}>
                {section.status.replace('_', ' ')}
              </span>
            </div>
            
            {/* Section content */}
            <div className="prose prose-base max-w-none">
              {section.content ? (
                <div className="text-gray-700 leading-relaxed">
                  {section.content}
                </div>
              ) : (
                <div className="text-gray-400 italic py-8 text-center">
                  This section is empty. Continue the conversation to build it out.
                </div>
              )}
            </div>
            
            {/* Section divider */}
            {sections.indexOf(section) < sections.length - 1 && (
              <hr className="border-gray-200 my-8" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Hook to integrate with conversation store
export const useMobilePreview = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const conversationStore = useConversationStore();
  
  const sections = Object.values(conversationStore.proposalSections || {});
  const generationState = conversationStore.generationState;
  
  const draftStatus = generationState?.isGenerating 
    ? 'building' 
    : sections.length > 0 && sections.some(s => (s as any).status !== 'empty')
      ? 'ready'
      : 'none';
  
  const sectionCount = sections.filter(s => (s as any).status !== 'empty').length;
  const progress = generationState?.progress || 0;

  return {
    isModalOpen,
    setIsModalOpen,
    sections: sections as any[],
    draftStatus,
    sectionCount,
    progress,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
  };
};