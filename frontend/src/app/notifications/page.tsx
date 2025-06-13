'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell,
  BellOff,
  Check,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  MessageCircle,
  Calendar,
  Settings,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

interface Notification {
  id: string;
  type: 'proposal' | 'comment' | 'deadline' | 'system' | 'achievement';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionRequired?: boolean;
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'proposal',
      title: 'Proposal Status Update',
      message: 'Your proposal "E-commerce Platform Development" has been accepted by TechCorp Inc.',
      timestamp: '2 hours ago',
      read: false,
      priority: 'high',
      actionRequired: false
    },
    {
      id: '2',
      type: 'deadline',
      title: 'Deadline Reminder',
      message: 'Cloud Migration Services proposal is due tomorrow (Jan 20, 2024)',
      timestamp: '4 hours ago',
      read: false,
      priority: 'high',
      actionRequired: true
    },
    {
      id: '3',
      type: 'comment',
      title: 'New Comment',
      message: 'Client added feedback on "Marketing Campaign Strategy" proposal',
      timestamp: '1 day ago',
      read: true,
      priority: 'medium',
      actionRequired: true
    },
    {
      id: '4',
      type: 'achievement',
      title: 'Milestone Reached',
      message: 'Congratulations! You\'ve reached a 70% win rate this month',
      timestamp: '2 days ago',
      read: true,
      priority: 'low',
      actionRequired: false
    },
    {
      id: '5',
      type: 'system',
      title: 'System Update',
      message: 'New AI features are now available in the proposal editor',
      timestamp: '3 days ago',
      read: true,
      priority: 'medium',
      actionRequired: false
    },
    {
      id: '6',
      type: 'proposal',
      title: 'Proposal Viewed',
      message: 'StartupXYZ has viewed your "Marketing Campaign Strategy" proposal',
      timestamp: '3 days ago',
      read: true,
      priority: 'low',
      actionRequired: false
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    proposalUpdates: true,
    deadlineReminders: true,
    comments: true,
    achievements: false,
    systemUpdates: true
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'proposal': return FileText;
      case 'comment': return MessageCircle;
      case 'deadline': return Clock;
      case 'system': return Settings;
      case 'achievement': return CheckCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600';
    if (type === 'achievement') return 'text-green-600';
    if (type === 'deadline') return 'text-yellow-600';
    return 'text-blue-600';
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'action-required') return notif.actionRequired;
    if (filter !== 'all') return notif.type === filter;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
              <p className="text-muted-foreground">
                Stay updated on your proposals and activities
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="action-required">Action Required</SelectItem>
                <SelectItem value="proposal">Proposals</SelectItem>
                <SelectItem value="deadline">Deadlines</SelectItem>
                <SelectItem value="comment">Comments</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No notifications found
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {filter === 'unread' 
                      ? "You're all caught up! No unread notifications."
                      : "Try adjusting your filter to see more notifications."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  const iconColor = getNotificationColor(notification.type, notification.priority);
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            <div className={`p-2 rounded-lg bg-muted ${iconColor}`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className={`font-medium ${
                                    !notification.read ? 'text-foreground' : 'text-muted-foreground'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <span className="text-xs text-muted-foreground">
                                      {notification.timestamp}
                                    </span>
                                    {notification.actionRequired && (
                                      <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                                        Action Required
                                      </Badge>
                                    )}
                                    {notification.priority === 'high' && (
                                      <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
                                        High Priority
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 ml-4">
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                  )}
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Customize how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({...prev, emailNotifications: checked}))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({...prev, pushNotifications: checked}))
                      }
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium text-foreground mb-4">Notification Types</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-foreground">Proposal Updates</span>
                        <p className="text-xs text-muted-foreground">Status changes, approvals, rejections</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.proposalUpdates}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({...prev, proposalUpdates: checked}))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-foreground">Deadline Reminders</span>
                        <p className="text-xs text-muted-foreground">Upcoming deadlines and due dates</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.deadlineReminders}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({...prev, deadlineReminders: checked}))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-foreground">Comments & Feedback</span>
                        <p className="text-xs text-muted-foreground">New comments and client feedback</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.comments}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({...prev, comments: checked}))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-foreground">Achievements</span>
                        <p className="text-xs text-muted-foreground">Milestones and success notifications</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.achievements}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({...prev, achievements: checked}))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-foreground">System Updates</span>
                        <p className="text-xs text-muted-foreground">New features and maintenance notices</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.systemUpdates}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({...prev, systemUpdates: checked}))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <Button className="w-full">Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}