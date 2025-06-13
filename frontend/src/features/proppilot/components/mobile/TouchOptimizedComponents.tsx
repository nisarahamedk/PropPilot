'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Plus, Minus, MoreVertical, Search, Filter, Star } from 'lucide-react';

// Touch-optimized button with haptic feedback
interface TouchButtonProps {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  haptic?: boolean;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  haptic = true,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => {
    if (disabled) return;
    setIsPressed(true);
    
    // Haptic feedback
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (!disabled) {
      onPress?.();
    }
  };

  const variants = {
    primary: 'bg-blue-600 text-white active:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 active:bg-gray-300',
    ghost: 'bg-transparent text-gray-700 active:bg-gray-100',
    danger: 'bg-red-600 text-white active:bg-red-700',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]',
  };

  return (
    <motion.button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-xl font-medium transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        touch-manipulation select-none
        ${className}
      `}
      disabled={disabled}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={() => setIsPressed(false)}
      animate={{ scale: isPressed ? 0.95 : 1 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  );
};

// Touch-optimized toggle switch
interface TouchToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TouchToggle: React.FC<TouchToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
}) => {
  const sizes = {
    sm: { switch: 'w-10 h-6', thumb: 'w-4 h-4', translate: 'translate-x-4' },
    md: { switch: 'w-12 h-7', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { switch: 'w-14 h-8', thumb: 'w-6 h-6', translate: 'translate-x-6' },
  };

  const currentSize = sizes[size];

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(15);
      }
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {label && (
        <span className="text-gray-700 font-medium">{label}</span>
      )}
      
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`
          ${currentSize.switch}
          relative inline-flex items-center rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          touch-manipulation
          ${checked ? 'bg-blue-600' : 'bg-gray-300'}
        `}
      >
        <motion.div
          className={`
            ${currentSize.thumb}
            bg-white rounded-full shadow-md
          `}
          animate={{
            x: checked ? currentSize.translate.replace('translate-x-', '') : '2px',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
};

// Touch-optimized slider
interface TouchSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
}

export const TouchSlider: React.FC<TouchSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleInteraction = (clientX: number) => {
    if (!sliderRef.current || disabled) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const newValue = min + (percentage / 100) * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    
    onChange(Math.max(min, Math.min(max, steppedValue)));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      handleInteraction(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleInteraction(e.clientX);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700 font-medium">{label}</span>
          {showValue && (
            <span className="text-gray-500 text-sm">{value}</span>
          )}
        </div>
      )}
      
      <div
        ref={sliderRef}
        className="relative h-12 flex items-center cursor-pointer"
        onTouchStart={(e) => {
          if (!disabled) {
            setIsDragging(true);
            handleInteraction(e.touches[0].clientX);
            
            // Haptic feedback
            if ('vibrate' in navigator) {
              navigator.vibrate(10);
            }
          }
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
        onMouseDown={(e) => {
          if (!disabled) {
            setIsDragging(true);
            handleInteraction(e.clientX);
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Track */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center">
          <div className="w-full h-2 bg-gray-300 rounded-full">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-150"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        
        {/* Thumb */}
        <motion.div
          className={`
            absolute w-6 h-6 bg-white border-2 border-blue-600 rounded-full shadow-md
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab active:cursor-grabbing'}
            ${isDragging ? 'scale-110' : 'scale-100'}
          `}
          style={{ left: `calc(${percentage}% - 12px)` }}
          animate={{ scale: isDragging ? 1.1 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  );
};

// Touch-optimized action sheet
interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: Array<{
    label: string;
    icon?: ReactNode;
    onPress: () => void;
    variant?: 'default' | 'destructive';
  }>;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  title,
  actions,
}) => {
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
          
          {/* Action Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 safe-area-pb"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            
            {title && (
              <div className="px-4 pb-2">
                <h3 className="text-lg font-semibold text-gray-900 text-center">
                  {title}
                </h3>
              </div>
            )}
            
            <div className="px-4 pb-8">
              {actions.map((action, index) => (
                <TouchButton
                  key={index}
                  onPress={() => {
                    action.onPress();
                    onClose();
                  }}
                  variant={action.variant === 'destructive' ? 'danger' : 'ghost'}
                  className="w-full mb-2 flex items-center justify-center space-x-2"
                >
                  {action.icon}
                  <span>{action.label}</span>
                </TouchButton>
              ))}
              
              <TouchButton
                onPress={onClose}
                variant="secondary"
                className="w-full mt-4"
              >
                Cancel
              </TouchButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Touch-optimized fab (floating action button)
interface FloatingActionButtonProps {
  onPress: () => void;
  icon: ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon,
  label,
  position = 'bottom-right',
  variant = 'primary',
  size = 'md',
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2',
  };

  const variants = {
    primary: 'bg-blue-600 text-white shadow-lg',
    secondary: 'bg-white text-gray-700 shadow-lg border border-gray-200',
  };

  const sizes = {
    md: label ? 'px-4 py-3' : 'w-14 h-14',
    lg: label ? 'px-6 py-4' : 'w-16 h-16',
  };

  const handlePress = () => {
    onPress();
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
  };

  return (
    <motion.button
      className={`
        fixed ${positions[position]} ${variants[variant]} ${sizes[size]}
        rounded-full flex items-center justify-center space-x-2
        font-medium transition-all duration-200
        touch-manipulation select-none z-50
      `}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={handlePress}
      animate={{ 
        scale: isPressed ? 0.9 : 1,
        rotate: isPressed ? 5 : 0,
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {icon}
      {label && <span className="whitespace-nowrap">{label}</span>}
    </motion.button>
  );
};

// Touch-optimized stepper
interface TouchStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
}

export const TouchStepper: React.FC<TouchStepperProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  disabled = false,
}) => {
  const canDecrease = value > min;
  const canIncrease = value < max;

  const handleDecrease = () => {
    if (canDecrease && !disabled) {
      onChange(Math.max(min, value - step));
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  const handleIncrease = () => {
    if (canIncrease && !disabled) {
      onChange(Math.min(max, value + step));
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {label && (
        <span className="text-gray-700 font-medium">{label}</span>
      )}
      
      <div className="flex items-center space-x-3">
        <TouchButton
          onPress={handleDecrease}
          disabled={!canDecrease || disabled}
          variant="secondary"
          size="sm"
          className="w-10 h-10 p-0 rounded-full"
        >
          <Minus className="w-4 h-4" />
        </TouchButton>
        
        <div className="min-w-[60px] text-center">
          <span className="text-lg font-semibold text-gray-900">{value}</span>
        </div>
        
        <TouchButton
          onPress={handleIncrease}
          disabled={!canIncrease || disabled}
          variant="secondary"
          size="sm"
          className="w-10 h-10 p-0 rounded-full"
        >
          <Plus className="w-4 h-4" />
        </TouchButton>
      </div>
    </div>
  );
};

// Touch-optimized chip/tag selector
interface TouchChipProps {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  variant?: 'default' | 'outlined';
  disabled?: boolean;
}

export const TouchChip: React.FC<TouchChipProps> = ({
  label,
  selected = false,
  onToggle,
  onRemove,
  variant = 'default',
  disabled = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    if (!disabled) {
      onToggle?.();
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(8);
      }
    }
  };

  const baseStyles = "inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-150 touch-manipulation select-none";
  
  const variantStyles = {
    default: selected 
      ? 'bg-blue-600 text-white' 
      : 'bg-gray-200 text-gray-700 active:bg-gray-300',
    outlined: selected
      ? 'border-2 border-blue-600 bg-blue-50 text-blue-700'
      : 'border-2 border-gray-300 bg-white text-gray-700 active:bg-gray-50',
  };

  return (
    <motion.button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      disabled={disabled}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={handlePress}
      animate={{ scale: isPressed ? 0.95 : 1 }}
      transition={{ duration: 0.1 }}
    >
      <span>{label}</span>
      
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 p-0.5 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </motion.button>
  );
};

// Touch-optimized search bar
interface TouchSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: () => void;
  onFilter?: () => void;
  showFilter?: boolean;
  disabled?: boolean;
}

export const TouchSearchBar: React.FC<TouchSearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  onSearch,
  onFilter,
  showFilter = true,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <div className={`
        flex items-center bg-gray-100 rounded-xl transition-all duration-200
        ${isFocused ? 'ring-2 ring-blue-500 bg-white' : ''}
        ${disabled ? 'opacity-50' : ''}
      `}>
        <Search className="w-5 h-5 text-gray-400 ml-4" />
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSearch?.();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-3 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-base"
          style={{ minHeight: '48px' }}
        />
        
        {value && (
          <TouchButton
            onPress={() => onChange('')}
            variant="ghost"
            size="sm"
            className="mr-2 w-8 h-8 p-0 rounded-full"
          >
            <X className="w-4 h-4" />
          </TouchButton>
        )}
        
        {showFilter && onFilter && (
          <TouchButton
            onPress={onFilter}
            variant="ghost"
            size="sm"
            className="mr-2 w-10 h-10 p-0 rounded-full"
          >
            <Filter className="w-5 h-5" />
          </TouchButton>
        )}
      </div>
    </div>
  );
};