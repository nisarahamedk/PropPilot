'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  Target,
  Calendar,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  const metrics = [
    {
      title: 'Total Proposals',
      value: '47',
      change: '+12%',
      trend: 'up',
      icon: FileText,
      description: 'Proposals created this period'
    },
    {
      title: 'Win Rate',
      value: '68%',
      change: '+5%',
      trend: 'up',
      icon: Target,
      description: 'Percentage of won proposals'
    },
    {
      title: 'Total Value',
      value: '$2.4M',
      change: '+18%',
      trend: 'up',
      icon: DollarSign,
      description: 'Combined value of all proposals'
    },
    {
      title: 'Avg. Response Time',
      value: '2.3 days',
      change: '-8%',
      trend: 'down',
      icon: Clock,
      description: 'Average time to create proposal'
    }
  ];

  const recentProposals = [
    { id: 1, title: 'E-commerce Platform', client: 'TechCorp', value: '$125K', status: 'won', date: '2024-01-10' },
    { id: 2, title: 'Marketing Campaign', client: 'StartupXYZ', value: '$35K', status: 'pending', date: '2024-01-08' },
    { id: 3, title: 'Cloud Migration', client: 'Enterprise Ltd', value: '$85K', status: 'sent', date: '2024-01-06' },
    { id: 4, title: 'Mobile App', client: 'FinTech Inc', value: '$95K', status: 'won', date: '2024-01-04' },
    { id: 5, title: 'Website Redesign', client: 'Local Business', value: '$15K', status: 'lost', date: '2024-01-02' }
  ];

  const statusData = [
    { status: 'Won', count: 15, percentage: 68, color: 'bg-green-500' },
    { status: 'Lost', count: 4, percentage: 18, color: 'bg-red-500' },
    { status: 'Pending', count: 3, percentage: 14, color: 'bg-yellow-500' }
  ];

  const monthlyData = [
    { month: 'Oct', proposals: 8, won: 5, value: 320000 },
    { month: 'Nov', proposals: 12, won: 8, value: 480000 },
    { month: 'Dec', proposals: 15, won: 11, value: 620000 },
    { month: 'Jan', proposals: 12, won: 8, value: 450000 }
  ];

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Track your proposal performance and insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <motion.div
                    key={metric.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {metric.title}
                        </CardTitle>
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground mb-1">
                          {metric.value}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={metric.trend === 'up' ? 'default' : 'secondary'}
                            className={`text-xs ${
                              metric.trend === 'up' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {metric.trend === 'up' ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {metric.change}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {metric.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Charts and Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Proposal Status Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Proposal Status Breakdown</CardTitle>
                  <CardDescription>Distribution of proposal outcomes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {statusData.map((item) => (
                    <div key={item.status}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-foreground">{item.status}</span>
                        <span className="text-muted-foreground">{item.count} proposals</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Progress value={item.percentage} className="flex-1" />
                        <span className="text-sm font-medium text-foreground min-w-[3rem]">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Monthly Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                  <CardDescription>Proposals and win rate over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map((month) => (
                      <div key={month.month} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div>
                          <div className="font-medium text-foreground">{month.month}</div>
                          <div className="text-sm text-muted-foreground">
                            {month.proposals} proposals • {Math.round((month.won / month.proposals) * 100)}% win rate
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">
                            ${(month.value / 1000).toFixed(0)}K
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {month.won} won
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Proposals</CardTitle>
                <CardDescription>Latest proposal activity and outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentProposals.map((proposal) => (
                    <div key={proposal.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{proposal.title}</div>
                        <div className="text-sm text-muted-foreground">{proposal.client}</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-semibold text-foreground">{proposal.value}</div>
                          <div className="text-xs text-muted-foreground">{proposal.date}</div>
                        </div>
                        <Badge 
                          variant="outline"
                          className={
                            proposal.status === 'won' ? 'bg-green-100 text-green-800' :
                            proposal.status === 'lost' ? 'bg-red-100 text-red-800' :
                            proposal.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {proposal.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Detailed performance analysis coming soon</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Performance charts will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
                <CardDescription>Long-term trends and insights coming soon</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Trend analysis will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}