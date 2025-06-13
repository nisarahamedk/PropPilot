'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Copy, 
  Mail, 
  Link, 
  Users, 
  Clock, 
  Eye,
  Settings,
  Shield,
  Calendar,
  MessageSquare,
  Download,
  QrCode,
  Globe,
  Lock,
  UserPlus,
  Check,
  X,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { TouchButton } from '../mobile/TouchOptimizedComponents';
import { ConversationState } from '../../types';
import { CollaborationUser } from '../../services/collaborationService';

// Share types
export interface ShareLink {
  id: string;
  conversationId: string;
  token: string;
  permissions: SharePermissions;
  settings: ShareSettings;
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  accessCount: number;
  lastAccessedAt?: Date;
  recipients: ShareRecipient[];
}

export interface SharePermissions {
  canView: boolean;
  canComment: boolean;
  canSuggest: boolean;
  canExport: boolean;
  requireAuth: boolean;
  allowAnonymous: boolean;
}

export interface ShareSettings {
  requirePassword: boolean;
  password?: string;
  allowDownload: boolean;
  trackViews: boolean;
  notifyOnAccess: boolean;
  watermark: boolean;
  expirationDays?: number;
  maxViews?: number;
}

export interface ShareRecipient {
  id: string;
  email: string;
  name?: string;
  role: 'viewer' | 'commenter' | 'editor';
  invitedAt: Date;
  viewedAt?: Date;
  status: 'pending' | 'viewed' | 'expired';
}

export interface ShareStats {
  totalViews: number;
  uniqueViewers: number;
  comments: number;
  suggestions: number;
  lastActivity: Date;
  averageTimeSpent: number;
}

// Main share system component
interface ShareDraftSystemProps {
  conversation: ConversationState;
  isOpen: boolean;
  onClose: () => void;
  onShareCreated: (shareLink: ShareLink) => void;
}

export const ShareDraftSystem: React.FC<ShareDraftSystemProps> = ({
  conversation,
  isOpen,
  onClose,
  onShareCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'analytics'>('create');
  const [existingShares, setExistingShares] = useState<ShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadExistingShares();
    }
  }, [isOpen]);

  const loadExistingShares = async () => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual API
      const shares = await fetchShareLinks(conversation.id);
      setExistingShares(shares);
    } catch (error) {
      console.error('Failed to load share links:', error);
    } finally {
      setIsLoading(false);
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
          className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Share2 className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Share Draft</h2>
                <p className="text-sm text-gray-600">
                  Share your proposal draft for review and feedback
                </p>
              </div>
            </div>

            <TouchButton
              onPress={onClose}
              variant="ghost"
              className="w-10 h-10 p-0 rounded-full"
            >
              <X className="w-5 h-5" />
            </TouchButton>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'create', label: 'Create Share', icon: Share2 },
              { id: 'manage', label: 'Manage Links', icon: Settings },
              { id: 'analytics', label: 'Analytics', icon: Eye },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 px-6 py-3 font-medium text-sm transition-colors
                  ${activeTab === tab.id 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'create' && (
              <CreateShareTab
                conversation={conversation}
                onShareCreated={onShareCreated}
                onClose={onClose}
              />
            )}
            {activeTab === 'manage' && (
              <ManageSharesTab
                shares={existingShares}
                onShareUpdated={loadExistingShares}
                isLoading={isLoading}
              />
            )}
            {activeTab === 'analytics' && (
              <ShareAnalyticsTab
                shares={existingShares}
                conversation={conversation}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Create share tab
interface CreateShareTabProps {
  conversation: ConversationState;
  onShareCreated: (shareLink: ShareLink) => void;
  onClose: () => void;
}

const CreateShareTab: React.FC<CreateShareTabProps> = ({
  conversation,
  onShareCreated,
  onClose,
}) => {
  const [shareType, setShareType] = useState<'link' | 'email' | 'embed'>('link');
  const [permissions, setPermissions] = useState<SharePermissions>({
    canView: true,
    canComment: true,
    canSuggest: false,
    canExport: false,
    requireAuth: false,
    allowAnonymous: true,
  });
  const [settings, setSettings] = useState<ShareSettings>({
    requirePassword: false,
    allowDownload: true,
    trackViews: true,
    notifyOnAccess: true,
    watermark: false,
    expirationDays: 30,
  });
  const [recipients, setRecipients] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  const handleCreateShare = async () => {
    setIsCreating(true);
    try {
      const shareLink = await createShareLink({
        conversationId: conversation.id,
        permissions,
        settings,
        recipients: recipients.map(email => ({ email, role: 'viewer' as const })),
      });
      
      setCreatedLink(shareLink.url);
      onShareCreated(shareLink);
    } catch (error) {
      console.error('Failed to create share link:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const addRecipient = () => {
    if (emailInput.trim() && !recipients.includes(emailInput.trim())) {
      setRecipients(prev => [...prev, emailInput.trim()]);
      setEmailInput('');
    }
  };

  const removeRecipient = (email: string) => {
    setRecipients(prev => prev.filter(e => e !== email));
  };

  const copyLink = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink);
      // Add toast notification
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      {createdLink ? (
        // Share created success view
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Share Link Created!
            </h3>
            <p className="text-gray-600">
              Your proposal draft is now ready to share
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-3">
                <div className="text-sm font-medium text-gray-700 mb-1">Share URL</div>
                <div className="text-sm text-gray-600 truncate">{createdLink}</div>
              </div>
              <TouchButton
                onPress={copyLink}
                variant="secondary"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </TouchButton>
            </div>
          </div>

          <div className="flex space-x-3">
            <TouchButton
              onPress={() => setCreatedLink(null)}
              variant="ghost"
              className="flex-1"
            >
              Create Another
            </TouchButton>
            <TouchButton
              onPress={onClose}
              variant="primary"
              className="flex-1"
            >
              Done
            </TouchButton>
          </div>
        </div>
      ) : (
        // Create share form
        <div className="space-y-6">
          {/* Share type selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">How do you want to share?</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'link', label: 'Share Link', icon: Link, desc: 'Generate a shareable URL' },
                { id: 'email', label: 'Email Invite', icon: Mail, desc: 'Send direct invitations' },
                { id: 'embed', label: 'Embed Code', icon: QrCode, desc: 'Embed in website' },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setShareType(type.id as any)}
                  className={`
                    p-4 rounded-lg border-2 transition-colors text-left
                    ${shareType === type.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <type.icon className={`w-6 h-6 mb-2 ${shareType === type.id ? 'text-blue-600' : 'text-gray-600'}`} />
                  <div className="font-medium text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-600">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Email recipients (for email type) */}
          {shareType === 'email' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recipients</h4>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
                    placeholder="Enter email address..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <TouchButton
                    onPress={addRecipient}
                    variant="secondary"
                    disabled={!emailInput.trim()}
                  >
                    <UserPlus className="w-4 h-4" />
                  </TouchButton>
                </div>
                
                {recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recipients.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {email}
                        <button
                          onClick={() => removeRecipient(email)}
                          className="ml-2 hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Permissions */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Permissions</h4>
            <div className="space-y-3">
              {[
                { key: 'canView', label: 'Can view draft', icon: Eye },
                { key: 'canComment', label: 'Can add comments', icon: MessageSquare },
                { key: 'canSuggest', label: 'Can suggest edits', icon: Users },
                { key: 'canExport', label: 'Can export/download', icon: Download },
              ].map((perm) => (
                <label key={perm.key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={permissions[perm.key as keyof SharePermissions] as boolean}
                    onChange={(e) => setPermissions(prev => ({
                      ...prev,
                      [perm.key]: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <perm.icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Security settings */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Security & Access</h4>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.requirePassword}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    requirePassword: e.target.checked
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Lock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Require password</span>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expires in (days)
                  </label>
                  <select
                    value={settings.expirationDays || 30}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      expirationDays: parseInt(e.target.value)
                    }))}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 day</option>
                    <option value={7}>1 week</option>
                    <option value={30}>1 month</option>
                    <option value={90}>3 months</option>
                    <option value={0}>Never</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max views
                  </label>
                  <input
                    type="number"
                    value={settings.maxViews || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      maxViews: e.target.value ? parseInt(e.target.value) : undefined
                    }))}
                    placeholder="Unlimited"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Create button */}
          <div className="pt-4 border-t border-gray-200">
            <TouchButton
              onPress={handleCreateShare}
              variant="primary"
              className="w-full"
              disabled={isCreating}
            >
              {isCreating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Share Link...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Share2 className="w-4 h-4" />
                  <span>Create Share Link</span>
                </div>
              )}
            </TouchButton>
          </div>
        </div>
      )}
    </div>
  );
};

// Manage shares tab
interface ManageSharesTabProps {
  shares: ShareLink[];
  onShareUpdated: () => void;
  isLoading: boolean;
}

const ManageSharesTab: React.FC<ManageSharesTabProps> = ({
  shares,
  onShareUpdated,
  isLoading,
}) => {
  const [selectedShare, setSelectedShare] = useState<ShareLink | null>(null);

  const toggleShareStatus = async (shareId: string) => {
    try {
      await updateShareLink(shareId, { isActive: !shares.find(s => s.id === shareId)?.isActive });
      onShareUpdated();
    } catch (error) {
      console.error('Failed to update share:', error);
    }
  };

  const deleteShare = async (shareId: string) => {
    try {
      await deleteShareLink(shareId);
      onShareUpdated();
    } catch (error) {
      console.error('Failed to delete share:', error);
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : shares.length === 0 ? (
        <div className="text-center py-12">
          <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shares created yet</h3>
          <p className="text-gray-600">Create your first share link in the "Create Share" tab</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Share Links</h3>
          
          {shares.map((share) => (
            <div
              key={share.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${share.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <div className="font-medium text-gray-900">
                        Share Link #{share.id.slice(-6)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Created {share.createdAt.toLocaleDateString()} • {share.accessCount} views
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{share.recipients.length} recipients</span>
                    </span>
                    {share.expiresAt && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Expires {share.expiresAt.toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <TouchButton
                    onPress={() => setSelectedShare(share)}
                    variant="ghost"
                    size="sm"
                  >
                    <Eye className="w-4 h-4" />
                  </TouchButton>
                  
                  <TouchButton
                    onPress={() => toggleShareStatus(share.id)}
                    variant="ghost"
                    size="sm"
                    className={share.isActive ? 'text-red-600' : 'text-green-600'}
                  >
                    {share.isActive ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  </TouchButton>
                  
                  <TouchButton
                    onPress={() => deleteShare(share.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </TouchButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share details modal */}
      {selectedShare && (
        <ShareDetailsModal
          share={selectedShare}
          onClose={() => setSelectedShare(null)}
          onUpdate={onShareUpdated}
        />
      )}
    </div>
  );
};

// Share analytics tab
interface ShareAnalyticsTabProps {
  shares: ShareLink[];
  conversation: ConversationState;
}

const ShareAnalyticsTab: React.FC<ShareAnalyticsTabProps> = ({
  shares,
  conversation,
}) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [analytics, setAnalytics] = useState<ShareStats | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const stats = await fetchShareAnalytics(conversation.id, timeRange);
      setAnalytics(stats);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Share Analytics</h3>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="day">Last 24 hours</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
        </select>
      </div>

      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{analytics.totalViews}</div>
            <div className="text-sm text-blue-700">Total Views</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{analytics.uniqueViewers}</div>
            <div className="text-sm text-green-700">Unique Viewers</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{analytics.comments}</div>
            <div className="text-sm text-purple-700">Comments</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">{Math.round(analytics.averageTimeSpent / 60)}m</div>
            <div className="text-sm text-orange-700">Avg. Time</div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
          <div className="space-y-3">
            {shares.slice(0, 5).map((share) => (
              <div key={share.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    Share Link #{share.id.slice(-6)} accessed
                  </div>
                  <div className="text-xs text-gray-600">
                    {share.lastAccessedAt?.toLocaleString() || 'Never accessed'}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {share.accessCount} views
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Share details modal
interface ShareDetailsModalProps {
  share: ShareLink;
  onClose: () => void;
  onUpdate: () => void;
}

const ShareDetailsModal: React.FC<ShareDetailsModalProps> = ({
  share,
  onClose,
  onUpdate,
}) => {
  const copyShareUrl = () => {
    const url = `${window.location.origin}/shared/${share.token}`;
    navigator.clipboard.writeText(url);
  };

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Share Details</h3>
            <TouchButton
              onPress={onClose}
              variant="ghost"
              className="w-8 h-8 p-0 rounded-full"
            >
              <X className="w-4 h-4" />
            </TouchButton>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Share URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={`${window.location.origin}/shared/${share.token}`}
                  readOnly
                  className="flex-1 p-2 border border-gray-300 rounded bg-gray-50 text-sm"
                />
                <TouchButton
                  onPress={copyShareUrl}
                  variant="secondary"
                  size="sm"
                >
                  <Copy className="w-4 h-4" />
                </TouchButton>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Views
                </label>
                <div className="text-lg font-semibold text-gray-900">{share.accessCount}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className={`text-sm font-medium ${share.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {share.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>

            {share.recipients.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients ({share.recipients.length})
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {share.recipients.map((recipient) => (
                    <div key={recipient.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900">{recipient.email}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        recipient.status === 'viewed' 
                          ? 'bg-green-100 text-green-700'
                          : recipient.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {recipient.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 mt-6">
            <TouchButton
              onPress={onClose}
              variant="ghost"
              className="flex-1"
            >
              Close
            </TouchButton>
            <TouchButton
              onPress={() => {
                copyShareUrl();
                onClose();
              }}
              variant="primary"
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Share
            </TouchButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Mock API functions (replace with actual API calls)
async function fetchShareLinks(conversationId: string): Promise<ShareLink[]> {
  // Mock implementation
  return [];
}

async function createShareLink(data: {
  conversationId: string;
  permissions: SharePermissions;
  settings: ShareSettings;
  recipients: { email: string; role: string }[];
}): Promise<ShareLink & { url: string }> {
  // Mock implementation
  const shareLink: ShareLink = {
    id: crypto.randomUUID(),
    conversationId: data.conversationId,
    token: crypto.randomUUID(),
    permissions: data.permissions,
    settings: data.settings,
    createdBy: 'current-user',
    createdAt: new Date(),
    expiresAt: data.settings.expirationDays ? new Date(Date.now() + data.settings.expirationDays * 24 * 60 * 60 * 1000) : undefined,
    isActive: true,
    accessCount: 0,
    recipients: data.recipients.map(r => ({
      id: crypto.randomUUID(),
      email: r.email,
      role: r.role as 'viewer',
      invitedAt: new Date(),
      status: 'pending' as const,
    })),
  };

  return {
    ...shareLink,
    url: `${window.location.origin}/shared/${shareLink.token}`,
  };
}

async function updateShareLink(shareId: string, updates: Partial<ShareLink>): Promise<void> {
  // Mock implementation
}

async function deleteShareLink(shareId: string): Promise<void> {
  // Mock implementation
}

async function fetchShareAnalytics(conversationId: string, timeRange: string): Promise<ShareStats> {
  // Mock implementation
  return {
    totalViews: 42,
    uniqueViewers: 28,
    comments: 7,
    suggestions: 3,
    lastActivity: new Date(),
    averageTimeSpent: 180, // seconds
  };
}