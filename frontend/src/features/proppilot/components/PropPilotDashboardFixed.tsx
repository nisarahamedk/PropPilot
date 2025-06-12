'use client';

import React, { useState, useRef, useEffect } from 'react';
// Remove framer-motion temporarily to test
// import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  FileText, 
  Send, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit3,
  Copy,
  Archive,
  Trash2,
  Download,
  Share2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Proposal {
  id: string;
  title: string;
  client: string;
  status: 'draft' | 'in-review' | 'sent' | 'won' | 'lost';
  lastModified: string;
  progress: number;
  dueDate?: string;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

interface Slide {
  id: string;
  title: string;
  content: string;
  order: number;
}

const PropPilotDashboardFixed: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'chat' | 'editor'>('dashboard');
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: '1',
      title: 'E-commerce Platform Development',
      client: 'TechCorp Inc.',
      status: 'in-review',
      lastModified: '2 hours ago',
      progress: 85,
      dueDate: '2024-01-15'
    },
    {
      id: '2',
      title: 'Marketing Campaign Strategy',
      client: 'StartupXYZ',
      status: 'draft',
      lastModified: '1 day ago',
      progress: 45
    },
    {
      id: '3',
      title: 'Cloud Migration Services',
      client: 'Enterprise Solutions',
      status: 'sent',
      lastModified: '3 days ago',
      progress: 100,
      dueDate: '2024-01-20'
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm here to help you create a winning proposal. What type of proposal are you working on today?",
      timestamp: new Date().toISOString()
    }
  ]);

  const [currentMessage, setCurrentMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    'in-review': 'bg-blue-100 text-blue-800',
    sent: 'bg-yellow-100 text-yellow-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    draft: Edit3,
    'in-review': Clock,
    sent: Send,
    won: CheckCircle,
    lost: XCircle
  };

  const quickStartTemplates = [
    'Software Development',
    'Consulting Services',
    'Marketing Campaign',
    'Custom Project'
  ];

  const filteredProposals = proposals
    .filter(proposal => {
      const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           proposal.client.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || proposal.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'client':
          return a.client.localeCompare(b.client);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'progress':
          return b.progress - a.progress;
        case 'due':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'recent':
        default:
          return parseInt(b.id) - parseInt(a.id);
      }
    });

  const handleStatusChange = (proposalId: string, newStatus: Proposal['status']) => {
    setProposals(prev => prev.map(proposal => 
      proposal.id === proposalId 
        ? { ...proposal, status: newStatus, lastModified: 'just now' }
        : proposal
    ));
  };

  const duplicateProposal = (proposal: Proposal) => {
    const newProposal: Proposal = {
      ...proposal,
      id: (Date.now()).toString(),
      title: `${proposal.title} (Copy)`,
      status: 'draft',
      progress: 0,
      lastModified: 'just now'
    };
    setProposals(prev => [newProposal, ...prev]);
  };

  const renderDashboard = () => (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-6">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">PropPilot</h1>
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search proposals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 lg:w-80"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                onClick={() => setActiveView('chat')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                size="sm"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">New Proposal</span>
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Bell className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <div className="bg-primary text-primary-foreground flex items-center justify-center h-full w-full text-sm">
                  JD
                </div>
              </Avatar>
            </div>
          </div>
          {/* Mobile search */}
          <div className="mt-4 sm:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search proposals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Your Proposals</h2>
            <Badge variant="secondary" className="text-sm">
              {filteredProposals.length} of {proposals.length}
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in-review">In Review</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="client">Client A-Z</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="due">Due Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Proposals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProposals.map((proposal) => {
            const StatusIcon = statusIcons[proposal.status];
            return (
              <div key={proposal.id}>
                <Card className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{proposal.title}</h3>
                      <p className="text-sm text-muted-foreground">{proposal.client}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Select value={proposal.status} onValueChange={(value) => handleStatusChange(proposal.id, value as Proposal['status'])}>
                        <SelectTrigger className="w-auto h-auto p-0 border-none bg-transparent">
                          <Badge className={statusColors[proposal.status]} variant="outline">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {proposal.status.replace('-', ' ')}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="in-review">In Review</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="won">Won</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-muted-foreground">{proposal.lastModified}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground">{proposal.progress}%</span>
                      </div>
                      <Progress value={proposal.progress} className="h-2" />
                    </div>

                    {proposal.dueDate && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due {proposal.dueDate}
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => setActiveView('editor')}
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        Continue
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="hover:bg-muted transition-colors"
                        onClick={() => duplicateProposal(proposal)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="hover:bg-muted transition-colors"
                        onClick={() => alert('Share functionality coming soon!')}
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );

  if (activeView === 'chat') {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">New Proposal Chat</h1>
            <Button variant="outline" onClick={() => setActiveView('dashboard')}>
              Back to Dashboard
            </Button>
          </div>
          <Card className="p-6">
            <p className="text-muted-foreground">Enhanced chat interface will be added here...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (activeView === 'editor') {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Proposal Editor</h1>
            <Button variant="outline" onClick={() => setActiveView('dashboard')}>
              Back to Dashboard
            </Button>
          </div>
          <Card className="p-6">
            <p className="text-muted-foreground">Slide-based editor will be added here...</p>
          </Card>
        </div>
      </div>
    );
  }

  return renderDashboard();
};

export default PropPilotDashboardFixed;