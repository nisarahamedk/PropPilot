'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  GitBranch, 
  Calendar, 
  User, 
  Eye, 
  RotateCcw, 
  Download, 
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Clock,
  Tag,
  X,
  Trash2
} from 'lucide-react';
import { TouchButton } from '../mobile/TouchOptimizedComponents';
import { ConversationState, ProposalSection } from '../../types';
import { CollaborationUser } from '../../services/collaborationService';

// Version history types
export interface ConversationVersion {
  id: string;
  conversationId: string;
  version: number;
  title: string;
  description?: string;
  timestamp: Date;
  userId: string;
  isAutoSave: boolean;
  isMajor: boolean;
  tags: string[];
  snapshot: ConversationState;
  changes: VersionChange[];
  stats: {
    sectionsModified: number;
    messagesAdded: number;
    wordsChanged: number;
    readinessScoreChange: number;
  };
}

export interface VersionChange {
  type: 'added' | 'modified' | 'removed';
  target: 'message' | 'section' | 'context';
  targetId: string;
  targetName: string;
  before?: any;
  after?: any;
  summary: string;
}

// Diff types for visualization
export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  content: string;
  lineNumber: number;
  highlight?: boolean;
}

interface VersionHistoryProps {
  conversationId: string;
  versions: ConversationVersion[];
  users: CollaborationUser[];
  currentVersion: ConversationState;
  onRestoreVersion: (versionId: string) => void;
  onCreateVersion: (title: string, description?: string, tags?: string[]) => void;
  onDeleteVersion: (versionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  conversationId,
  versions,
  users,
  currentVersion,
  onRestoreVersion,
  onCreateVersion,
  onDeleteVersion,
  isOpen,
  onClose,
}) => {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [createVersionModal, setCreateVersionModal] = useState(false);

  // Sort versions by timestamp (newest first)
  const sortedVersions = useMemo(() => {
    return [...versions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [versions]);

  // Get user by ID
  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  // Handle version selection for comparison
  const handleVersionSelect = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else if (prev.length < 2) {
        return [...prev, versionId];
      } else {
        return [prev[1], versionId]; // Replace first selection
      }
    });
  };

  // Toggle version expansion
  const toggleVersionExpansion = (versionId: string) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(versionId)) {
        newSet.delete(versionId);
      } else {
        newSet.add(versionId);
      }
      return newSet;
    });
  };

  // Compare two versions
  const compareVersions = () => {
    if (selectedVersions.length === 2) {
      setShowComparison(true);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-lg w-full max-w-6xl h-[80vh] flex flex-col"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <History className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
                <p className="text-sm text-gray-600">{versions.length} versions</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {selectedVersions.length === 2 && (
                <TouchButton
                  onPress={compareVersions}
                  variant="secondary"
                  className="flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  Compare
                </TouchButton>
              )}

              <TouchButton
                onPress={() => setCreateVersionModal(true)}
                variant="primary"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                Create Version
              </TouchButton>

              <TouchButton
                onPress={onClose}
                variant="ghost"
                className="w-10 h-10 p-0 rounded-full"
              >
                <X className="w-5 h-5" />
              </TouchButton>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {showComparison ? (
              <VersionComparison
                version1={versions.find(v => v.id === selectedVersions[0])!}
                version2={versions.find(v => v.id === selectedVersions[1])!}
                users={users}
                onClose={() => setShowComparison(false)}
              />
            ) : (
              <VersionList
                versions={sortedVersions}
                users={users}
                selectedVersions={selectedVersions}
                expandedVersions={expandedVersions}
                onVersionSelect={handleVersionSelect}
                onToggleExpansion={toggleVersionExpansion}
                onRestoreVersion={onRestoreVersion}
                onDeleteVersion={onDeleteVersion}
              />
            )}
          </div>

          {/* Create Version Modal */}
          <CreateVersionModal
            isOpen={createVersionModal}
            onClose={() => setCreateVersionModal(false)}
            onCreateVersion={onCreateVersion}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Version list component
interface VersionListProps {
  versions: ConversationVersion[];
  users: CollaborationUser[];
  selectedVersions: string[];
  expandedVersions: Set<string>;
  onVersionSelect: (versionId: string) => void;
  onToggleExpansion: (versionId: string) => void;
  onRestoreVersion: (versionId: string) => void;
  onDeleteVersion: (versionId: string) => void;
}

const VersionList: React.FC<VersionListProps> = ({
  versions,
  users,
  selectedVersions,
  expandedVersions,
  onVersionSelect,
  onToggleExpansion,
  onRestoreVersion,
  onDeleteVersion,
}) => {
  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-4">
        {versions.map((version, index) => {
          const user = getUserById(version.userId);
          const isExpanded = expandedVersions.has(version.id);
          const isSelected = selectedVersions.includes(version.id);
          const isCurrent = index === 0;

          return (
            <motion.div
              key={version.id}
              className={`
                border rounded-lg transition-all duration-200
                ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
                ${isCurrent ? 'ring-2 ring-green-500' : ''}
              `}
              layout
            >
              {/* Version header */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onVersionSelect(version.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />

                    <div className="flex items-center space-x-2">
                      <GitBranch className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        v{version.version}
                      </span>
                      
                      {isCurrent && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Current
                        </span>
                      )}
                      
                      {version.isMajor && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Major
                        </span>
                      )}

                      {version.isAutoSave && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Auto
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <TouchButton
                      onPress={() => onToggleExpansion(version.id)}
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 rounded-full"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </TouchButton>
                  </div>
                </div>

                {/* Version info */}
                <div className="mt-3">
                  <h3 className="font-medium text-gray-900">{version.title}</h3>
                  {version.description && (
                    <p className="text-sm text-gray-600 mt-1">{version.description}</p>
                  )}

                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{user?.name || 'Unknown'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{version.timestamp.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {version.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {version.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Version stats */}
                <div className="grid grid-cols-4 gap-4 mt-4 p-3 bg-gray-50 rounded">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {version.stats.sectionsModified}
                    </div>
                    <div className="text-xs text-gray-600">Sections</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {version.stats.messagesAdded}
                    </div>
                    <div className="text-xs text-gray-600">Messages</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {version.stats.wordsChanged}
                    </div>
                    <div className="text-xs text-gray-600">Words</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`
                      text-lg font-semibold
                      ${version.stats.readinessScoreChange > 0 ? 'text-green-600' : 
                        version.stats.readinessScoreChange < 0 ? 'text-red-600' : 'text-gray-900'}
                    `}>
                      {version.stats.readinessScoreChange > 0 && '+'}
                      {version.stats.readinessScoreChange}%
                    </div>
                    <div className="text-xs text-gray-600">Readiness</div>
                  </div>
                </div>
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-4 space-y-4">
                      {/* Changes list */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Changes</h4>
                        <div className="space-y-2">
                          {version.changes.map((change, changeIndex) => (
                            <div key={changeIndex} className="flex items-center space-x-2 text-sm">
                              <div className={`
                                w-2 h-2 rounded-full
                                ${change.type === 'added' ? 'bg-green-500' : 
                                  change.type === 'removed' ? 'bg-red-500' : 'bg-blue-500'}
                              `} />
                              <span className="text-gray-700">{change.summary}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                        <TouchButton
                          onPress={() => onRestoreVersion(version.id)}
                          variant="secondary"
                          size="sm"
                          disabled={isCurrent}
                          className="flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore</span>
                        </TouchButton>

                        <TouchButton
                          onPress={() => {}} // Implement preview
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Preview</span>
                        </TouchButton>

                        <TouchButton
                          onPress={() => {}} // Implement export
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export</span>
                        </TouchButton>

                        {!isCurrent && !version.isMajor && (
                          <TouchButton
                            onPress={() => onDeleteVersion(version.id)}
                            variant="ghost"
                            size="sm"
                            className="flex items-center space-x-1 text-red-600 hover:bg-red-50 ml-auto"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </TouchButton>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Version comparison component
interface VersionComparisonProps {
  version1: ConversationVersion;
  version2: ConversationVersion;
  users: CollaborationUser[];
  onClose: () => void;
}

const VersionComparison: React.FC<VersionComparisonProps> = ({
  version1,
  version2,
  users,
  onClose,
}) => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Generate diff for sections
  const sectionDiffs = useMemo(() => {
    const diffs: Record<string, DiffLine[]> = {};
    
    const sections1 = version1.snapshot.proposalSections;
    const sections2 = version2.snapshot.proposalSections;
    
    const allSectionIds = new Set([
      ...Object.keys(sections1),
      ...Object.keys(sections2),
    ]);

    allSectionIds.forEach(sectionId => {
      const section1 = sections1[sectionId];
      const section2 = sections2[sectionId];
      
      diffs[sectionId] = generateTextDiff(
        section1?.content || '',
        section2?.content || ''
      );
    });

    return diffs;
  }, [version1, version2]);

  return (
    <div className="h-full flex flex-col">
      {/* Comparison header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">
            Comparing v{version1.version} with v{version2.version}
          </h3>
          
          <TouchButton
            onPress={onClose}
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 rounded-full"
          >
            <X className="w-4 h-4" />
          </TouchButton>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="text-sm">
            <div className="font-medium text-gray-900">v{version1.version}</div>
            <div className="text-gray-600">{version1.timestamp.toLocaleString()}</div>
          </div>
          
          <div className="text-sm">
            <div className="font-medium text-gray-900">v{version2.version}</div>
            <div className="text-gray-600">{version2.timestamp.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Comparison content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Section list */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">Sections</h4>
            <div className="space-y-1">
              {Object.keys(sectionDiffs).map((sectionId) => {
                const hasChanges = sectionDiffs[sectionId].some(line => 
                  line.type === 'added' || line.type === 'removed' || line.type === 'modified'
                );
                
                return (
                  <button
                    key={sectionId}
                    onClick={() => setSelectedSection(sectionId)}
                    className={`
                      w-full text-left p-2 rounded text-sm transition-colors
                      ${selectedSection === sectionId 
                        ? 'bg-blue-100 text-blue-900' 
                        : 'hover:bg-gray-100'
                      }
                      ${hasChanges ? 'font-medium' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{sectionId.replace('_', ' ')}</span>
                      {hasChanges && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Diff view */}
        <div className="flex-1 overflow-y-auto">
          {selectedSection ? (
            <DiffViewer
              sectionId={selectedSection}
              diffLines={sectionDiffs[selectedSection]}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a section to view changes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Diff viewer component
interface DiffViewerProps {
  sectionId: string;
  diffLines: DiffLine[];
}

const DiffViewer: React.FC<DiffViewerProps> = ({ sectionId, diffLines }) => {
  return (
    <div className="p-4">
      <h4 className="font-medium text-gray-900 mb-4">
        {sectionId.replace('_', ' ')}
      </h4>
      
      <div className="font-mono text-sm border border-gray-300 rounded overflow-hidden">
        {diffLines.map((line, index) => (
          <div
            key={index}
            className={`
              flex items-start px-4 py-1 border-b border-gray-100 last:border-b-0
              ${line.type === 'added' ? 'bg-green-50 border-l-4 border-green-500' : ''}
              ${line.type === 'removed' ? 'bg-red-50 border-l-4 border-red-500' : ''}
              ${line.type === 'modified' ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''}
            `}
          >
            <div className="w-8 text-gray-400 text-right mr-4 flex-shrink-0">
              {line.lineNumber}
            </div>
            
            <div className="flex-shrink-0 w-6 mr-2">
              {line.type === 'added' && <Plus className="w-4 h-4 text-green-600" />}
              {line.type === 'removed' && <Minus className="w-4 h-4 text-red-600" />}
            </div>
            
            <div className="flex-1 whitespace-pre-wrap break-words">
              {line.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Create version modal
interface CreateVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateVersion: (title: string, description?: string, tags?: string[]) => void;
}

const CreateVersionModal: React.FC<CreateVersionModalProps> = ({
  isOpen,
  onClose,
  onCreateVersion,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreateVersion(
        title.trim(),
        description.trim() || undefined,
        tags.length > 0 ? tags : undefined
      );
      setTitle('');
      setDescription('');
      setTags([]);
      setTagInput('');
      onClose();
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-lg w-full max-w-md p-6"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Version
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Version title..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the changes..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (optional)
              </label>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add a tag..."
                  className="flex-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <TouchButton
                  onPress={addTag}
                  variant="ghost"
                  size="sm"
                >
                  Add
                </TouchButton>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <TouchButton
                onPress={onClose}
                variant="ghost"
                className="flex-1"
              >
                Cancel
              </TouchButton>
              
              <TouchButton
                onPress={() => {}}
                variant="primary"
                className="flex-1"
                disabled={!title.trim()}
              >
                Create Version
              </TouchButton>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Utility function to generate text diff
function generateTextDiff(text1: string, text2: string): DiffLine[] {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  const diffLines: DiffLine[] = [];
  
  // Simple line-by-line diff (in production, use a proper diff algorithm)
  const maxLines = Math.max(lines1.length, lines2.length);
  
  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i];
    const line2 = lines2[i];
    
    if (line1 === undefined) {
      // Line added in version 2
      diffLines.push({
        type: 'added',
        content: line2,
        lineNumber: i + 1,
      });
    } else if (line2 === undefined) {
      // Line removed from version 1
      diffLines.push({
        type: 'removed',
        content: line1,
        lineNumber: i + 1,
      });
    } else if (line1 !== line2) {
      // Line modified
      diffLines.push({
        type: 'removed',
        content: line1,
        lineNumber: i + 1,
      });
      diffLines.push({
        type: 'added',
        content: line2,
        lineNumber: i + 1,
      });
    } else {
      // Line unchanged
      diffLines.push({
        type: 'unchanged',
        content: line1,
        lineNumber: i + 1,
      });
    }
  }
  
  return diffLines;
}