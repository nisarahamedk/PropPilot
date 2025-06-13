import { 
  useMemo, 
  useCallback, 
  useRef, 
  useEffect, 
  useState,
  RefObject
} from 'react';
import { debounce, throttle } from 'lodash-es';
import { 
  useConversationStore, 
  useConversationMessages, 
  useProjectContext, 
  useProposalSections 
} from '../stores/conversationStore';
import { Message, ProposalSection, ProjectContext } from '../types';

// Virtual scrolling hook for large message lists
export const useVirtualizedMessages = (
  containerRef: RefObject<HTMLElement>,
  itemHeight: number = 80,
  overscan: number = 5
) => {
  const messages = useConversationMessages();
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Throttled scroll handler
  const handleScroll = useCallback(
    throttle((event: Event) => {
      const target = event.target as HTMLElement;
      setScrollTop(target.scrollTop);
    }, 16), // ~60fps
    []
  );

  // Observe container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height);
    });

    resizeObserver.observe(containerRef.current);
    containerRef.current.addEventListener('scroll', handleScroll);

    return () => {
      resizeObserver.disconnect();
      containerRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, handleScroll]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(messages.length, start + visibleCount + overscan * 2);
    
    return { start, end };
  }, [scrollTop, containerHeight, itemHeight, overscan, messages.length]);

  // Get visible messages with positioning
  const visibleMessages = useMemo(() => {
    return messages.slice(visibleRange.start, visibleRange.end).map((message: Message, index: number) => ({
      message,
      index: visibleRange.start + index,
      offsetY: (visibleRange.start + index) * itemHeight,
    }));
  }, [messages, visibleRange, itemHeight]);

  return {
    visibleMessages,
    totalHeight: messages.length * itemHeight,
    visibleRange,
    scrollTop,
  };
};

// Memoized section calculations
export const useMemoizedSectionMetrics = () => {
  const sections = useProposalSections();

  return useMemo(() => {
    const sectionArray = Object.values(sections) as ProposalSection[];
    
    const metrics = {
      totalSections: sectionArray.length,
      completedSections: sectionArray.filter((s: ProposalSection) => s.status === 'complete').length,
      totalWordCount: sectionArray.reduce((sum: number, s: ProposalSection) => sum + s.wordCount, 0),
      averageCompletion: sectionArray.reduce((sum: number, s: ProposalSection) => sum + s.completionPercentage, 0) / sectionArray.length || 0,
      sectionsInProgress: sectionArray.filter((s: ProposalSection) => s.status === 'building' || s.status === 'draft').length,
      sectionsNeedingWork: sectionArray.filter((s: ProposalSection) => s.status === 'needs_refinement' || s.status === 'empty').length,
    };

    return metrics;
  }, [sections]);
};

// Optimized readiness score calculation
export const useMemoizedReadinessScore = () => {
  const projectContext = useProjectContext();

  return useMemo(() => {
    const weights = {
      clientName: 10,
      projectTitle: 10,
      industry: 5,
      budget: 15,
      timeline: 15,
      requirements: 20,
      objectives: 15,
      constraints: 10,
    };

    let totalScore = 0;
    let maxScore = 0;

    Object.entries(weights).forEach(([key, weight]) => {
      maxScore += weight;
      const value = projectContext[key as keyof ProjectContext];
      
      if (Array.isArray(value)) {
        if (value.length > 0) totalScore += weight;
      } else if (value && String(value).trim().length > 0) {
        totalScore += weight;
      }
    });

    return Math.round((totalScore / maxScore) * 100);
  }, [projectContext]);
};

// Debounced search functionality
export const useDebouncedSearch = <T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  delay: number = 300
) => {
  const [filteredItems, setFilteredItems] = useState<T[]>(items);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useCallback(
    debounce((term: string, itemsToSearch: T[]) => {
      setIsSearching(true);
      
      if (!term.trim()) {
        setFilteredItems(itemsToSearch);
      } else {
        const lowercaseTerm = term.toLowerCase();
        const filtered = itemsToSearch.filter(item =>
          searchFields.some(field => {
            const value = item[field];
            return String(value).toLowerCase().includes(lowercaseTerm);
          })
        );
        setFilteredItems(filtered);
      }
      
      setIsSearching(false);
    }, delay),
    [searchFields, delay]
  );

  useEffect(() => {
    debouncedSearch(searchTerm, items);
  }, [searchTerm, items, debouncedSearch]);

  return { filteredItems, isSearching };
};

// Optimized message grouping
export const useMemoizedMessageGroups = (groupByTimeGap: number = 5 * 60 * 1000) => {
  const messages = useConversationMessages();

  return useMemo(() => {
    const groups: Message[][] = [];
    let currentGroup: Message[] = [];

    messages.forEach((message: Message, index: number) => {
      if (index === 0) {
        currentGroup = [message];
      } else {
        const prevMessage = messages[index - 1];
        const timeDiff = message.timestamp.getTime() - prevMessage.timestamp.getTime();
        
        if (timeDiff > groupByTimeGap || message.role !== prevMessage.role) {
          groups.push(currentGroup);
          currentGroup = [message];
        } else {
          currentGroup.push(message);
        }
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }, [messages, groupByTimeGap]);
};

// Intersection observer hook for lazy loading
export const useIntersectionObserver = (
  threshold: number = 0.1,
  rootMargin: string = '0px'
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      { threshold, rootMargin }
    );

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [threshold, rootMargin, hasIntersected]);

  return { targetRef, isIntersecting, hasIntersected };
};

// Optimized auto-save with smart batching
export const useOptimizedAutoSave = (
  saveFunction: () => Promise<void>,
  dependencies: any[],
  options: {
    delay?: number;
    maxBatchSize?: number;
    enableSmartBatching?: boolean;
  } = {}
) => {
  const {
    delay = 2000,
    maxBatchSize = 10,
    enableSmartBatching = true,
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<number>(0);

  const debouncedSave = useCallback(
    debounce(async () => {
      setIsSaving(true);
      try {
        await saveFunction();
        setPendingChanges(0);
        lastSaveRef.current = Date.now();
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, delay),
    [saveFunction, delay]
  );

  useEffect(() => {
    setPendingChanges(prev => prev + 1);

    if (enableSmartBatching) {
      // Smart batching: save immediately if we have many changes or it's been a while
      const timeSinceLastSave = Date.now() - lastSaveRef.current;
      const shouldSaveImmediately = 
        pendingChanges >= maxBatchSize || 
        timeSinceLastSave > delay * 3;

      if (shouldSaveImmediately) {
        debouncedSave.flush();
      } else {
        debouncedSave();
      }
    } else {
      debouncedSave();
    }
  }, dependencies);

  const forceSave = useCallback(() => {
    debouncedSave.flush();
  }, [debouncedSave]);

  return { isSaving, pendingChanges, forceSave };
};

// Memory usage monitoring
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
    memoryPressure: 'low' | 'medium' | 'high';
  }>({
    memoryPressure: 'low',
  });

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1048576;
        const totalMB = memory.totalJSHeapSize / 1048576;
        const limitMB = memory.jsHeapSizeLimit / 1048576;
        
        let memoryPressure: 'low' | 'medium' | 'high' = 'low';
        const usageRatio = usedMB / limitMB;
        
        if (usageRatio > 0.8) {
          memoryPressure = 'high';
        } else if (usageRatio > 0.6) {
          memoryPressure = 'medium';
        }

        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          memoryPressure,
        });
      }
    };

    // Update immediately and then every 30 seconds
    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 30000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

// Performance monitoring hook
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<{
    renderTime: number;
    componentCount: number;
    rerenderCount: number;
  }>({
    renderTime: 0,
    componentCount: 0,
    rerenderCount: 0,
  });

  const renderStartTime = useRef<number>(performance.now());
  const rerenderCount = useRef<number>(0);

  useEffect(() => {
    rerenderCount.current += 1;
    const renderTime = performance.now() - renderStartTime.current;
    
    setMetrics(prev => ({
      renderTime,
      componentCount: document.querySelectorAll('[data-component]').length,
      rerenderCount: rerenderCount.current,
    }));
    
    renderStartTime.current = performance.now();
  });

  return metrics;
};