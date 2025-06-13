import React, { memo, useMemo, ReactNode } from 'react';
import { Message, ProposalSection, ProjectContext } from '../types';

// Memoized Message Component
interface MessageItemProps {
  message: Message;
  isSelected?: boolean;
  onSelect?: (messageId: string) => void;
  showTimestamp?: boolean;
  className?: string;
}

export const MemoizedMessageItem = memo<MessageItemProps>(({
  message,
  isSelected = false,
  onSelect,
  showTimestamp = true,
  className = '',
}) => {
  const handleClick = useMemo(() => {
    if (!onSelect) return undefined;
    return () => onSelect(message.id);
  }, [onSelect, message.id]);

  const formattedTime = useMemo(() => {
    return showTimestamp ? message.timestamp.toLocaleTimeString() : '';
  }, [message.timestamp, showTimestamp]);

  const roleStyles = useMemo(() => {
    const baseStyles = 'p-4 rounded-lg transition-colors duration-200';
    const roleSpecificStyles = {
      user: 'bg-blue-50 border-l-4 border-blue-500 ml-8',
      assistant: 'bg-gray-50 border-l-4 border-gray-500 mr-8',
      system: 'bg-yellow-50 border-l-4 border-yellow-500 mx-4 text-sm',
    };
    
    const selectedStyles = isSelected ? 'ring-2 ring-blue-300' : '';
    
    return `${baseStyles} ${roleSpecificStyles[message.role]} ${selectedStyles} ${className}`;
  }, [message.role, isSelected, className]);

  return (
    <div 
      className={roleStyles}
      onClick={handleClick}
      data-component="message-item"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="font-medium text-sm text-gray-600 capitalize">
          {message.role}
        </span>
        {showTimestamp && (
          <span className="text-xs text-gray-400">{formattedTime}</span>
        )}
      </div>
      <div className="prose prose-sm max-w-none">
        {message.content}
      </div>
      {message.metadata && (
        <div className="mt-2 text-xs text-gray-500">
          {message.metadata.actionType && (
            <span className="inline-block bg-gray-200 rounded px-2 py-1 mr-2">
              {message.metadata.actionType}
            </span>
          )}
          {message.metadata.readinessScore && (
            <span className="inline-block bg-blue-200 rounded px-2 py-1">
              Readiness: {message.metadata.readinessScore}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for optimization
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.showTimestamp === nextProps.showTimestamp &&
    prevProps.className === nextProps.className
  );
});

// Memoized Section Component
interface SectionItemProps {
  section: ProposalSection;
  isActive?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (sectionId: string) => void;
  onEdit?: (sectionId: string) => void;
  showMetrics?: boolean;
  className?: string;
}

export const MemoizedSectionItem = memo<SectionItemProps>(({
  section,
  isActive = false,
  isExpanded = false,
  onToggleExpand,
  onEdit,
  showMetrics = true,
  className = '',
}) => {
  const statusStyles = useMemo(() => {
    const statusColors = {
      empty: 'bg-gray-100 text-gray-600 border-gray-300',
      draft: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      building: 'bg-blue-100 text-blue-700 border-blue-300',
      complete: 'bg-green-100 text-green-700 border-green-300',
      needs_refinement: 'bg-red-100 text-red-700 border-red-300',
    };
    return statusColors[section.status];
  }, [section.status]);

  const handleToggleExpand = useMemo(() => {
    if (!onToggleExpand) return undefined;
    return () => onToggleExpand(section.id);
  }, [onToggleExpand, section.id]);

  const handleEdit = useMemo(() => {
    if (!onEdit) return undefined;
    return () => onEdit(section.id);
  }, [onEdit, section.id]);

  const progressBarWidth = useMemo(() => {
    return `${Math.max(0, Math.min(100, section.completionPercentage))}%`;
  }, [section.completionPercentage]);

  return (
    <div 
      className={`border rounded-lg transition-all duration-200 ${
        isActive ? 'ring-2 ring-blue-300 border-blue-300' : 'border-gray-200'
      } ${className}`}
      data-component="section-item"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">{section.title}</h3>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusStyles}`}>
              {section.status.replace('_', ' ')}
            </span>
            {onEdit && (
              <button
                onClick={handleEdit}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Edit section"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onToggleExpand && (
              <button
                onClick={handleToggleExpand}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                <svg 
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {showMetrics && (
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{section.completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: progressBarWidth }}
              />
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="mt-4 space-y-3">
            <div className="prose prose-sm max-w-none text-gray-700">
              {section.content || (
                <em className="text-gray-400">No content yet</em>
              )}
            </div>
            
            {showMetrics && (
              <div className="flex justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                <span>Words: {section.wordCount}</span>
                <span>Updated: {section.lastUpdated.toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.section.id === nextProps.section.id &&
    prevProps.section.content === nextProps.section.content &&
    prevProps.section.status === nextProps.section.status &&
    prevProps.section.completionPercentage === nextProps.section.completionPercentage &&
    prevProps.section.wordCount === nextProps.section.wordCount &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.showMetrics === nextProps.showMetrics &&
    prevProps.className === nextProps.className
  );
});

// Memoized Project Context Display
interface ProjectContextDisplayProps {
  context: ProjectContext;
  isEditable?: boolean;
  onEdit?: (field: keyof ProjectContext, value: any) => void;
  showReadinessScore?: boolean;
  className?: string;
}

export const MemoizedProjectContextDisplay = memo<ProjectContextDisplayProps>(({
  context,
  isEditable = false,
  onEdit,
  showReadinessScore = true,
  className = '',
}) => {
  const readinessColor = useMemo(() => {
    if (context.readinessScore >= 80) return 'text-green-600 bg-green-100';
    if (context.readinessScore >= 60) return 'text-yellow-600 bg-yellow-100';
    if (context.readinessScore >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  }, [context.readinessScore]);

  const completedFields = useMemo(() => {
    const fields = [
      'clientName', 'projectTitle', 'industry', 'budget', 'timeline'
    ];
    return fields.filter(field => {
      const value = context[field as keyof ProjectContext];
      return value && String(value).trim().length > 0;
    }).length;
  }, [context]);

  const arrayFields = useMemo(() => {
    return {
      requirements: context.requirements.length,
      objectives: context.objectives.length,
      constraints: context.constraints.length,
    };
  }, [context.requirements, context.objectives, context.constraints]);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`} data-component="project-context">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Project Context</h3>
        {showReadinessScore && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${readinessColor}`}>
            {context.readinessScore}% Ready
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Client Name</label>
            <p className="text-sm text-gray-900">{context.clientName || 'Not specified'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Project Title</label>
            <p className="text-sm text-gray-900">{context.projectTitle || 'Not specified'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Industry</label>
            <p className="text-sm text-gray-900">{context.industry || 'Not specified'}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Budget</label>
            <p className="text-sm text-gray-900">{context.budget || 'Not specified'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Timeline</label>
            <p className="text-sm text-gray-900">{context.timeline || 'Not specified'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Completion</label>
            <p className="text-sm text-gray-900">{completedFields}/5 fields completed</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{arrayFields.requirements}</p>
            <p className="text-sm text-gray-600">Requirements</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{arrayFields.objectives}</p>
            <p className="text-sm text-gray-600">Objectives</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{arrayFields.constraints}</p>
            <p className="text-sm text-gray-600">Constraints</p>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  const contextChanged = Object.keys(prevProps.context).some(key => {
    const prevValue = prevProps.context[key as keyof ProjectContext];
    const nextValue = nextProps.context[key as keyof ProjectContext];
    
    if (Array.isArray(prevValue) && Array.isArray(nextValue)) {
      return prevValue.length !== nextValue.length || 
             prevValue.some((item, index) => item !== nextValue[index]);
    }
    
    return prevValue !== nextValue;
  });

  return !contextChanged &&
         prevProps.isEditable === nextProps.isEditable &&
         prevProps.showReadinessScore === nextProps.showReadinessScore &&
         prevProps.className === nextProps.className;
});

// Memoized Container for reducing prop drilling
interface MemoizedContainerProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const MemoizedContainer = memo<MemoizedContainerProps>(({
  children,
  className = '',
  'data-testid': testId,
}) => (
  <div className={className} data-testid={testId} data-component="memoized-container">
    {children}
  </div>
));

// Performance monitoring wrapper
export const withPerformanceMonitoring = <T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
) => {
  return memo((props: T) => {
    const renderStart = performance.now();
    
    React.useEffect(() => {
      const renderTime = performance.now() - renderStart;
      
      if (renderTime > 16) { // Log slow renders (>16ms = <60fps)
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
      
      // Report to performance monitoring service if available
      if ((window as any).gtag) {
        (window as any).gtag('event', 'render_performance', {
          component_name: componentName,
          render_time: renderTime,
        });
      }
    });

    return <Component {...props} />;
  });
};

// Export all memoized components with display names for better debugging
MemoizedMessageItem.displayName = 'MemoizedMessageItem';
MemoizedSectionItem.displayName = 'MemoizedSectionItem';
MemoizedProjectContextDisplay.displayName = 'MemoizedProjectContextDisplay';
MemoizedContainer.displayName = 'MemoizedContainer';