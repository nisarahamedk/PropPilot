'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const PropPilotDashboard: React.FC = () => {
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(currentMessage),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      "Great! I understand you're working on a software development proposal. Can you tell me more about the client and their specific needs?",
      "Perfect! What's the scope of this project? Are there any specific deliverables or timeline requirements?",
      "Excellent information! Now, what makes your team the right choice for this project? Any relevant experience or unique advantages?",
      "Thank you for those details. I have enough information to start creating your proposal. Would you like me to generate it now?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleGenerateProposal = () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setActiveView('editor');
          generateSlides();
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const generateSlides = () => {
    const defaultSlides: Slide[] = [
      { id: '1', title: 'Title Slide', content: 'Project Proposal for Client', order: 1 },
      { id: '2', title: 'Executive Summary', content: 'Brief overview of the proposed solution...', order: 2 },
      { id: '3', title: 'Understanding Your Needs', content: 'We understand your requirements...', order: 3 },
      { id: '4', title: 'Proposed Solution', content: 'Our comprehensive approach...', order: 4 },
      { id: '5', title: 'Timeline & Milestones', content: 'Project timeline and key deliverables...', order: 5 },
      { id: '6', title: 'Team & Expertise', content: 'Meet our experienced team...', order: 6 },
      { id: '7', title: 'Pricing', content: 'Investment and payment terms...', order: 7 },
      { id: '8', title: 'Next Steps', content: 'How to move forward...', order: 8 }
    ];
    setSlides(defaultSlides);
  };

  const handleQuickStart = (template: string) => {
    const message = `I'd like to create a ${template} proposal.`;
    setCurrentMessage(message);
    handleSendMessage();
  };

  const handleExport = async (type: 'pdf' | 'pptx' | 'docx') => {
    setIsExporting(true);
    setExportType(type);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would call an API to generate and download the file
    console.log(`Exporting as ${type.toUpperCase()}...`);
    alert(`${type.toUpperCase()} export completed! (This is a demo - no actual file was generated)`);
    
    setIsExporting(false);
    setExportType('');
  };

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
          // For demo purposes, assume more recent means lower id (newer entries)
          return parseInt(b.id) - parseInt(a.id);
      }
    });

  const renderDashboard = () => (
    <div className="h-full bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search proposals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setActiveView('chat')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Proposal
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <div className="bg-primary text-primary-foreground flex items-center justify-center h-full w-full text-sm">
                JD
              </div>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
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

        {/* Empty State */}
        {filteredProposals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No proposals found' : 'No proposals yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Create your first proposal to get started'}
            </p>
            {(!searchQuery && filterStatus === 'all') && (
              <Button onClick={() => setActiveView('chat')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Proposal
              </Button>
            )}
          </motion.div>
        )}

        {/* Proposals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProposals.map((proposal) => {
            const StatusIcon = statusIcons[proposal.status];
            return (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
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
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );

  const renderChat = () => (
    <div className="h-full bg-background flex flex-col">
      {/* Chat Header */}
      <header className="border-b border-border p-6 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => setActiveView('dashboard')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">New Proposal</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">Save Draft</Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto px-6">
          {/* Messages */}
          <ScrollArea className="flex-1 py-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`p-4 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground ml-12' 
                        : 'bg-muted text-foreground mr-12'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mr-3 order-0">
                      AI
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Quick Start Templates */}
              {messages.length === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-2xl mr-12">
                    <p className="text-sm text-muted-foreground mb-3">Quick start templates:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickStartTemplates.map((template) => (
                        <Button
                          key={template}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickStart(template)}
                          className="justify-start"
                        >
                          <Zap className="h-3 w-3 mr-2" />
                          {template}
                        </Button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Generation Progress */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-2xl mr-12">
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-foreground mb-3">Generating your proposal...</p>
                      <Progress value={generationProgress} className="mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {generationProgress < 30 && "Analyzing requirements..."}
                        {generationProgress >= 30 && generationProgress < 60 && "Crafting your value proposition..."}
                        {generationProgress >= 60 && generationProgress < 90 && "Designing slides..."}
                        {generationProgress >= 90 && "Finalizing proposal..."}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border p-6 bg-background">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Textarea
                  placeholder="Type your message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  className="min-h-[60px] resize-none"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Button onClick={handleSendMessage} disabled={!currentMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
                {messages.length > 3 && (
                  <Button onClick={handleGenerateProposal} variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="h-full bg-background flex flex-col lg:flex-row">
      {/* Left Panel - Chat */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border flex flex-col bg-muted/20 h-full">
        <div className="p-4 border-b border-border bg-background/95">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Refinement Chat</h2>
            <Button variant="ghost" size="sm" onClick={() => setActiveView('dashboard')}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.slice(-3).map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs p-3 rounded-lg text-sm ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-foreground'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <Input
              placeholder="Refine your proposal..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button size="icon" onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Slide Thumbnails Panel */}
      <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border flex flex-col bg-muted/30">
        <div className="p-4 border-b border-border bg-background/95">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Slides</h3>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-2">
            {slides.map((slide, index) => (
              <motion.div
                key={slide.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`p-3 cursor-pointer transition-all ${
                    activeSlide === index 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setActiveSlide(index)}
                >
                  <div className="aspect-[4/3] bg-background rounded border mb-2 p-2 overflow-hidden">
                    <div className="text-xs font-medium text-foreground mb-1 truncate">
                      {slide.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground line-clamp-3">
                      {slide.content}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {index + 1}
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Editor Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-6 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="font-semibold text-foreground">Proposal Editor</h2>
              <span className="text-sm text-muted-foreground">
                Slide {activeSlide + 1} of {slides.length}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Select disabled={isExporting}>
                <SelectTrigger className="w-32" disabled={isExporting}>
                  {isExporting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 mr-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  <SelectValue placeholder={isExporting ? 'Exporting...' : 'Export'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    value="pdf" 
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                  >
                    Export PDF
                  </SelectItem>
                  <SelectItem 
                    value="pptx" 
                    onClick={() => handleExport('pptx')}
                    disabled={isExporting}
                  >
                    Export PowerPoint
                  </SelectItem>
                  <SelectItem 
                    value="docx" 
                    onClick={() => handleExport('docx')}
                    disabled={isExporting}
                  >
                    Export Word
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => alert('Share functionality: Generate shareable link, email, or collaborate in real-time (coming soon!)')}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Slide Content */}
        <ScrollArea className="flex-1">
          <div className="p-8 bg-muted/10">
            {slides[activeSlide] && (
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-6xl mx-auto h-full flex items-center justify-center"
              >
                <Card className="w-full max-w-5xl aspect-[16/9] p-12 bg-background shadow-xl border-2">
                  <div className="h-full flex flex-col">
                    <h1 className="text-4xl font-bold text-foreground mb-8 text-center">
                      {slides[activeSlide].title}
                    </h1>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="prose prose-xl max-w-none text-center">
                        <p className="text-muted-foreground leading-relaxed text-lg">
                          {slides[activeSlide].content}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Bottom Toolbar */}
        <div className="p-6 border-t border-border bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                disabled={activeSlide === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))}
                disabled={activeSlide === slides.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Slide
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round((activeSlide + 1) / slides.length * 100)}% Complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-background">
      <AnimatePresence mode="wait">
        {activeView === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderDashboard()}
          </motion.div>
        )}
        {activeView === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderChat()}
          </motion.div>
        )}
        {activeView === 'editor' && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderEditor()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropPilotDashboard;