import { useRef, useEffect, useCallback, useState } from 'react';

export interface SwipeConfig {
  threshold?: number;
  velocity?: number;
  preventDefaultTouchmoveEvent?: boolean;
  trackMouse?: boolean;
  trackTouch?: boolean;
  delta?: number;
  rotationAngle?: number;
}

export interface SwipeEventData {
  event: TouchEvent | MouseEvent;
  absX: number;
  absY: number;
  deltaX: number;
  deltaY: number;
  directionX: 'Left' | 'Right' | '';
  directionY: 'Up' | 'Down' | '';
  velocity: number;
  first: boolean;
  last: boolean;
}

export interface SwipeHandlers {
  onSwiped?: (eventData: SwipeEventData) => void;
  onSwipedLeft?: (eventData: SwipeEventData) => void;
  onSwipedRight?: (eventData: SwipeEventData) => void;
  onSwipedUp?: (eventData: SwipeEventData) => void;
  onSwipedDown?: (eventData: SwipeEventData) => void;
  onSwipeStart?: (eventData: SwipeEventData) => void;
  onSwiping?: (eventData: SwipeEventData) => void;
  onSwipeEnd?: (eventData: SwipeEventData) => void;
  onTap?: (eventData: SwipeEventData) => void;
}

const defaultConfig: Required<SwipeConfig> = {
  threshold: 50,
  velocity: 0.3,
  preventDefaultTouchmoveEvent: false,
  trackMouse: false,
  trackTouch: true,
  delta: 10,
  rotationAngle: 0,
};

export const useSwipeGestures = (
  handlers: SwipeHandlers,
  config: SwipeConfig = {}
) => {
  const handlerRef = useRef<SwipeHandlers>(handlers);
  const configRef = useRef<Required<SwipeConfig>>({ ...defaultConfig, ...config });
  const stateRef = useRef({
    xy: [0, 0],
    swiping: false,
    start: 0,
    deltaX: 0,
    deltaY: 0,
    absX: 0,
    absY: 0,
    velocity: 0,
  });

  // Update refs when handlers or config change
  useEffect(() => {
    handlerRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    configRef.current = { ...defaultConfig, ...config };
  }, [config]);

  const getEventData = useCallback((event: TouchEvent | MouseEvent): SwipeEventData => {
    const state = stateRef.current;
    const config = configRef.current;
    
    return {
      event,
      absX: state.absX,
      absY: state.absY,
      deltaX: state.deltaX,
      deltaY: state.deltaY,
      directionX: state.absX > config.threshold ? (state.deltaX > 0 ? 'Right' : 'Left') : '',
      directionY: state.absY > config.threshold ? (state.deltaY > 0 ? 'Down' : 'Up') : '',
      velocity: state.velocity,
      first: !state.swiping,
      last: false,
    };
  }, []);

  const handleSwipeStart = useCallback((event: TouchEvent | MouseEvent) => {
    const { clientX, clientY } = 'touches' in event ? event.touches[0] : event;
    
    stateRef.current = {
      xy: [clientX, clientY],
      swiping: false,
      start: Date.now(),
      deltaX: 0,
      deltaY: 0,
      absX: 0,
      absY: 0,
      velocity: 0,
    };

    const eventData = getEventData(event);
    handlerRef.current.onSwipeStart?.(eventData);
  }, [getEventData]);

  const handleSwipeMove = useCallback((event: TouchEvent | MouseEvent) => {
    const config = configRef.current;
    const state = stateRef.current;
    
    if (!state.xy[0] && !state.xy[1]) return;

    const { clientX, clientY } = 'touches' in event ? event.touches[0] : event;
    const deltaX = clientX - state.xy[0];
    const deltaY = clientY - state.xy[1];
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const time = Date.now() - state.start;
    const velocity = Math.sqrt(absX * absX + absY * absY) / time;

    state.deltaX = deltaX;
    state.deltaY = deltaY;
    state.absX = absX;
    state.absY = absY;
    state.velocity = velocity;

    const eventData = getEventData(event);

    // Check if we should start swiping
    if (!state.swiping && (absX > config.delta || absY > config.delta)) {
      state.swiping = true;
    }

    if (state.swiping) {
      handlerRef.current.onSwiping?.(eventData);

      if (config.preventDefaultTouchmoveEvent) {
        event.preventDefault();
      }
    }
  }, [getEventData]);

  const handleSwipeEnd = useCallback((event: TouchEvent | MouseEvent) => {
    const config = configRef.current;
    const state = stateRef.current;
    const handlers = handlerRef.current;

    if (!state.swiping && state.absX < config.delta && state.absY < config.delta) {
      // This was a tap, not a swipe
      const eventData = getEventData(event);
      handlers.onTap?.(eventData);
      return;
    }

    const eventData = { ...getEventData(event), last: true };

    if (state.swiping) {
      // Determine if this was a valid swipe
      const validSwipe = state.velocity >= config.velocity || 
                         state.absX >= config.threshold || 
                         state.absY >= config.threshold;

      if (validSwipe) {
        handlers.onSwiped?.(eventData);

        // Determine direction and call appropriate handler
        if (state.absX > state.absY) {
          // Horizontal swipe
          if (state.deltaX > 0) {
            handlers.onSwipedRight?.(eventData);
          } else {
            handlers.onSwipedLeft?.(eventData);
          }
        } else {
          // Vertical swipe
          if (state.deltaY > 0) {
            handlers.onSwipedDown?.(eventData);
          } else {
            handlers.onSwipedUp?.(eventData);
          }
        }
      }

      handlers.onSwipeEnd?.(eventData);
    }

    // Reset state
    stateRef.current = {
      xy: [0, 0],
      swiping: false,
      start: 0,
      deltaX: 0,
      deltaY: 0,
      absX: 0,
      absY: 0,
      velocity: 0,
    };
  }, [getEventData]);

  const ref = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    const config = configRef.current;

    // Touch events
    if (config.trackTouch) {
      element.addEventListener('touchstart', handleSwipeStart, { passive: false });
      element.addEventListener('touchmove', handleSwipeMove, { passive: !config.preventDefaultTouchmoveEvent });
      element.addEventListener('touchend', handleSwipeEnd, { passive: false });
      element.addEventListener('touchcancel', handleSwipeEnd, { passive: false });
    }

    // Mouse events (for testing on desktop)
    if (config.trackMouse) {
      element.addEventListener('mousedown', handleSwipeStart);
      element.addEventListener('mousemove', handleSwipeMove);
      element.addEventListener('mouseup', handleSwipeEnd);
      element.addEventListener('mouseleave', handleSwipeEnd);
    }

    return () => {
      if (config.trackTouch) {
        element.removeEventListener('touchstart', handleSwipeStart);
        element.removeEventListener('touchmove', handleSwipeMove);
        element.removeEventListener('touchend', handleSwipeEnd);
        element.removeEventListener('touchcancel', handleSwipeEnd);
      }

      if (config.trackMouse) {
        element.removeEventListener('mousedown', handleSwipeStart);
        element.removeEventListener('mousemove', handleSwipeMove);
        element.removeEventListener('mouseup', handleSwipeEnd);
        element.removeEventListener('mouseleave', handleSwipeEnd);
      }
    };
  }, [handleSwipeStart, handleSwipeMove, handleSwipeEnd]);

  return ref;
};

// Specialized hook for mobile navigation
export const useMobileNavigation = () => {
  const [currentView, setCurrentView] = useState<'chat' | 'preview' | 'settings'>('chat');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const swipeHandlers: SwipeHandlers = {
    onSwipedLeft: () => {
      if (isTransitioning) return;
      
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 300);
      
      if (currentView === 'chat') {
        setCurrentView('preview');
      } else if (currentView === 'preview') {
        setCurrentView('settings');
      }
    },
    onSwipedRight: () => {
      if (isTransitioning) return;
      
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 300);
      
      if (currentView === 'settings') {
        setCurrentView('preview');
      } else if (currentView === 'preview') {
        setCurrentView('chat');
      }
    },
  };

  const swipeRef = useSwipeGestures(swipeHandlers, {
    threshold: 80,
    velocity: 0.5,
    trackMouse: true, // Enable for desktop testing
  });

  return {
    currentView,
    setCurrentView,
    isTransitioning,
    swipeRef,
  };
};

// Hook for card-based swiping (dismiss, archive, etc.)
export const useCardSwipe = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold: number = 100
) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isResetAnimating, setIsResetAnimating] = useState(false);

  const resetPosition = useCallback(() => {
    setIsResetAnimating(true);
    setSwipeOffset(0);
    setTimeout(() => setIsResetAnimating(false), 200);
  }, []);

  const swipeHandlers: SwipeHandlers = {
    onSwiping: (eventData) => {
      if (!isResetAnimating) {
        setSwipeOffset(eventData.deltaX);
      }
    },
    onSwipeEnd: (eventData) => {
      const { deltaX, absX, velocity } = eventData;
      
      if (absX > threshold || velocity > 0.5) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else {
        resetPosition();
      }
    },
  };

  const swipeRef = useSwipeGestures(swipeHandlers, {
    threshold: 10, // Low threshold to start tracking immediately
    preventDefaultTouchmoveEvent: true,
  });

  return {
    swipeRef,
    swipeOffset,
    isResetAnimating,
    resetPosition,
  };
};

// Hook for pull-to-refresh functionality
export const usePullToRefresh = (
  onRefresh: () => Promise<void>,
  threshold: number = 60
) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setIsPulling(false);
      setPullDistance(0);
    }
  }, [onRefresh]);

  const swipeHandlers: SwipeHandlers = {
    onSwipeStart: () => {
      // Only start pulling if we're at the top of the container
      if (containerRef.current && containerRef.current.scrollTop === 0) {
        setIsPulling(true);
      }
    },
    onSwiping: (eventData) => {
      if (isPulling && eventData.deltaY > 0) {
        const distance = Math.min(eventData.deltaY, threshold * 1.5);
        setPullDistance(distance);
        
        // Add haptic feedback when reaching threshold
        if (distance >= threshold && 'vibrate' in navigator) {
          navigator.vibrate(10);
        }
      }
    },
    onSwipeEnd: (eventData) => {
      if (isPulling) {
        if (pullDistance >= threshold) {
          handleRefresh();
        } else {
          setIsPulling(false);
          setPullDistance(0);
        }
      }
    },
  };

  const swipeRef = useSwipeGestures(swipeHandlers, {
    threshold: 10,
    preventDefaultTouchmoveEvent: false,
  });

  const combinedRef = useCallback((element: HTMLElement | null) => {
    containerRef.current = element;
    swipeRef(element);
  }, [swipeRef]);

  return {
    ref: combinedRef,
    isPulling,
    isRefreshing,
    pullDistance,
    progress: Math.min(pullDistance / threshold, 1),
  };
};