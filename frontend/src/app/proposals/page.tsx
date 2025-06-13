'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit3,
  Copy,
  Share2,
  Trash2,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Proposal {
  id: string;
  title: string;
  client: string;
  status: 'draft' | 'in-review' | 'sent' | 'won' | 'lost';
  lastModified: string;
  progress: number;
  dueDate?: string;
  value?: string;
}

export default function ProposalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  const [proposals] = useState<Proposal[]>([
    {
      id: '1',
      title: 'E-commerce Platform Development',
      client: 'TechCorp Inc.',
      status: 'in-review',
      lastModified: '2 hours ago',
      progress: 85,
      dueDate: '2024-01-15',
      value: '$125,000'
    },
    {
      id: '2',
      title: 'Marketing Campaign Strategy',
      client: 'StartupXYZ',
      status: 'draft',
      lastModified: '1 day ago',
      progress: 45,
      value: '$35,000'
    },
    {
      id: '3',
      title: 'Cloud Migration Services',
      client: 'Enterprise Solutions',
      status: 'sent',
      lastModified: '3 days ago',
      progress: 100,
      dueDate: '2024-01-20',
      value: '$85,000'
    },
    {
      id: '4',
      title: 'Mobile App Development',
      client: 'FinTech Startup',
      status: 'won',
      lastModified: '1 week ago',
      progress: 100,
      value: '$95,000'
    },
    {
      id: '5',
      title: 'Website Redesign',
      client: 'Local Business',
      status: 'lost',
      lastModified: '2 weeks ago',
      progress: 100,
      value: '$15,000'
    }
  ]);

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
        case 'value':
          const aValue = parseFloat(a.value?.replace(/[^0-9]/g, '') || '0');
          const bValue = parseFloat(b.value?.replace(/[^0-9]/g, '') || '0');
          return bValue - aValue;
        case 'recent':
        default:
          return parseInt(b.id) - parseInt(a.id);
      }
    });

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-foreground">All Proposals</h1>
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
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Proposal
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-foreground">
              {filteredProposals.length} Proposals
            </h2>
            <Badge variant="secondary" className="text-sm">
              {proposals.filter(p => p.status === 'won').length} Won
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
                <SelectItem value="value">Value</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          {filteredProposals.map((proposal) => {
            const StatusIcon = statusIcons[proposal.status];
            return (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg mb-1">
                            {proposal.title}
                          </h3>
                          <p className="text-muted-foreground">{proposal.client}</p>
                        </div>
                        <div className="text-right">
                          {proposal.value && (
                            <p className="font-semibold text-foreground">{proposal.value}</p>
                          )}
                          <p className="text-sm text-muted-foreground">{proposal.lastModified}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <Badge className={statusColors[proposal.status]} variant="outline">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {proposal.status.replace('-', ' ')}
                        </Badge>
                        {proposal.dueDate && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due {proposal.dueDate}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground">{proposal.progress}%</span>
                          </div>
                          <Progress value={proposal.progress} className="h-2" />
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit3 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share2 className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredProposals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No proposals found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}