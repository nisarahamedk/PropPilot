'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  FileText, 
  Settings, 
  Home, 
  Search, 
  User,
  Menu,
  X,
  ChevronLeft,
  MoreHorizontal
} from 'lucide-react';
import { useMobileNavigation } from '../hooks/useSwipeGestures';
import { TouchButton } from './TouchOptimizedComponents';

// Bottom tab navigation
interface TabItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  disabled?: boolean;
}

interface MobileTabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const MobileTabNavigation: React.FC<MobileTabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  const handleTabPress = (tabId: string) => {
    if (tabId !== activeTab) {
      onTabChange(tabId);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 
      safe-area-pb z-40 ${className}
    `}>
      <div className="flex items-center justify-around px-2 py-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabPress(tab.id)}
            disabled={tab.disabled}
            className={`
              relative flex flex-col items-center justify-center p-2 min-w-[60px] min-h-[60px]
              transition-colors duration-200 rounded-lg touch-manipulation
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'active:bg-gray-100'}
              ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'}
            `}
          >
            <div className="relative">
              {tab.icon}
              
              {/* Badge */}
              {tab.badge && tab.badge > 0 && (
                <div className="
                  absolute -top-1 -right-1 bg-red-500 text-white text-xs
                  rounded-full min-w-[18px] h-[18px] flex items-center justify-center
                  font-medium
                ">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </div>
              )}
            </div>
            
            <span className="text-xs font-medium mt-1 text-center leading-tight">
              {tab.label}
            </span>
            
            {/* Active indicator */}
            {activeTab === tab.id && (
              <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                layoutId="activeTab"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Swipeable view container
interface SwipeableViewsProps {
  children: ReactNode[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  className?: string;
}

export const SwipeableViews: React.FC<SwipeableViewsProps> = ({
  children,
  activeIndex,
  onIndexChange,
  className = '',
}) => {
  const { swipeRef } = useMobileNavigation();
  
  // Handle swipe gestures
  useEffect(() => {
    const element = swipeRef.current;
    if (!element) return;

    const handleSwipe = (direction: 'left' | 'right') => {
      if (direction === 'left' && activeIndex < children.length - 1) {
        onIndexChange(activeIndex + 1);
      } else if (direction === 'right' && activeIndex > 0) {
        onIndexChange(activeIndex - 1);
      }
    };

    // Add swipe event listeners (simplified - full implementation in useSwipeGestures)
    element.addEventListener('touchstart', () => {});
    
    return () => {
      element.removeEventListener('touchstart', () => {});
    };
  }, [activeIndex, children.length, onIndexChange, swipeRef]);

  return (
    <div 
      ref={swipeRef as any}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.div
        className="flex w-full"
        animate={{ x: `-${activeIndex * 100}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children.map((child, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {child}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// Mobile app header
interface MobileHeaderProps {
  title?: string;
  leftAction?: {
    icon: ReactNode;
    onPress: () => void;
    label?: string;
  };
  rightActions?: Array<{
    icon: ReactNode;
    onPress: () => void;
    label?: string;
  }>;
  showBackButton?: boolean;
  onBack?: () => void;
  transparent?: boolean;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  leftAction,
  rightActions = [],
  showBackButton = false,
  onBack,
  transparent = false,
  className = '',
}) => {
  return (
    <div className={`
      fixed top-0 left-0 right-0 z-40 safe-area-pt
      ${transparent ? 'bg-transparent' : 'bg-white border-b border-gray-200'}
      ${className}
    `}>
      <div className="flex items-center justify-between px-4 py-3 min-h-[56px]">
        {/* Left side */}
        <div className="flex items-center">
          {showBackButton && onBack ? (
            <TouchButton
              onPress={onBack}
              variant="ghost"
              size="sm"
              className="mr-2 w-10 h-10 p-0 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </TouchButton>
          ) : leftAction ? (
            <TouchButton
              onPress={leftAction.onPress}
              variant="ghost"
              size="sm"
              className="mr-2 w-10 h-10 p-0 rounded-full"
              aria-label={leftAction.label}
            >
              {leftAction.icon}
            </TouchButton>
          ) : (
            <div className="w-10" /> // Spacer
          )}
        </div>

        {/* Center */}
        <div className="flex-1 text-center">
          {title && (
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h1>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {rightActions.map((action, index) => (
            <TouchButton
              key={index}
              onPress={action.onPress}
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 rounded-full"
              aria-label={action.label}
            >
              {action.icon}
            </TouchButton>
          ))}
        </div>
      </div>
    </div>
  );
};

// Drawer navigation
interface DrawerItem {
  id: string;
  label: string;
  icon: ReactNode;
  onPress: () => void;
  badge?: number;
  divider?: boolean;
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: DrawerItem[];
  header?: ReactNode;
  footer?: ReactNode;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  items,
  header,
  footer,
}) => {
  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
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
          
          {/* Drawer */}
          <motion.div
            className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 flex flex-col shadow-xl"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            {header && (
              <div className="p-4 border-b border-gray-200">
                {header}
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <button
                    onClick={() => {
                      item.onPress();
                      onClose();
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <div className="text-gray-600">
                      {item.icon}
                    </div>
                    
                    <span className="flex-1 text-gray-900 font-medium">
                      {item.label}
                    </span>
                    
                    {item.badge && item.badge > 0 && (
                      <div className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-medium">
                        {item.badge > 99 ? '99+' : item.badge}
                      </div>
                    )}
                  </button>
                  
                  {item.divider && <hr className="border-gray-200" />}
                </React.Fragment>
              ))}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-4 border-t border-gray-200">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Complete mobile layout wrapper
interface MobileLayoutProps {
  children: ReactNode;
  header?: {
    title?: string;
    leftAction?: MobileHeaderProps['leftAction'];
    rightActions?: MobileHeaderProps['rightActions'];
    showBackButton?: boolean;
    onBack?: () => void;
  };
  navigation?: {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
  };
  drawer?: {
    items: DrawerItem[];
    header?: ReactNode;
    footer?: ReactNode;
  };
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  header,
  navigation,
  drawer,
  className = '',
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const headerWithDrawer = header ? {
    ...header,
    leftAction: drawer ? {
      icon: <Menu className="w-6 h-6" />,
      onPress: () => setIsDrawerOpen(true),
      label: 'Open menu',
    } : header.leftAction,
  } : undefined;

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      {headerWithDrawer && <MobileHeader {...headerWithDrawer} />}
      
      {/* Main content */}
      <main className={`
        ${headerWithDrawer ? 'pt-[72px]' : ''}
        ${navigation ? 'pb-[80px]' : ''}
        min-h-screen
      `}>
        {children}
      </main>
      
      {/* Bottom navigation */}
      {navigation && <MobileTabNavigation {...navigation} />}
      
      {/* Drawer */}
      {drawer && (
        <MobileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          {...drawer}
        />
      )}
    </div>
  );
};

// PropPilot-specific mobile navigation
export const PropPilotMobileNavigation: React.FC<{
  activeView: 'chat' | 'preview' | 'settings';
  onViewChange: (view: 'chat' | 'preview' | 'settings') => void;
  messageCount?: number;
  draftReady?: boolean;
}> = ({ activeView, onViewChange, messageCount = 0, draftReady = false }) => {
  const tabs: TabItem[] = [
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageCircle className="w-6 h-6" />,
      badge: messageCount > 0 ? messageCount : undefined,
    },
    {
      id: 'preview',
      label: 'Preview',
      icon: <FileText className="w-6 h-6" />,
      badge: draftReady ? 1 : undefined,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-6 h-6" />,
    },
  ];

  return (
    <MobileTabNavigation
      tabs={tabs}
      activeTab={activeView}
      onTabChange={onViewChange as (tabId: string) => void}
      className="border-t-2 border-blue-500"
    />
  );
};