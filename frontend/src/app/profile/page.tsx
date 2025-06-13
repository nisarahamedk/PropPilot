'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Edit3,
  Camera,
  Save,
  Award,
  Target,
  TrendingUp,
  FileText,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  company: string;
  jobTitle: string;
  bio: string;
  joinDate: string;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    company: 'PropPilot Solutions',
    jobTitle: 'Senior Business Developer',
    bio: 'Experienced business developer with a passion for creating winning proposals and building strong client relationships.',
    joinDate: 'January 2023'
  });

  const [tempProfile, setTempProfile] = useState(profile);

  const stats = [
    { label: 'Total Proposals', value: '47', icon: FileText, color: 'text-blue-600' },
    { label: 'Win Rate', value: '68%', icon: Target, color: 'text-green-600' },
    { label: 'Total Value', value: '$2.4M', icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Achievements', value: '12', icon: Award, color: 'text-yellow-600' }
  ];

  const achievements = [
    { id: 1, title: 'First Win', description: 'Won your first proposal', date: 'Feb 2023', icon: CheckCircle },
    { id: 2, title: 'High Performer', description: 'Achieved 70% win rate', date: 'Jun 2023', icon: Award },
    { id: 3, title: 'Big Deal', description: 'Closed a $500K+ deal', date: 'Sep 2023', icon: TrendingUp },
    { id: 4, title: 'Consistent Winner', description: '5 wins in a row', date: 'Dec 2023', icon: Target }
  ];

  const recentActivity = [
    { id: 1, action: 'Won proposal', title: 'E-commerce Platform Development', date: '2 days ago' },
    { id: 2, action: 'Created proposal', title: 'Marketing Campaign Strategy', date: '1 week ago' },
    { id: 3, action: 'Updated proposal', title: 'Cloud Migration Services', date: '2 weeks ago' },
    { id: 4, action: 'Won proposal', title: 'Mobile App Development', date: '3 weeks ago' }
  ];

  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Your basic profile information and contact details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-20 w-20">
                          <div className="bg-primary text-primary-foreground flex items-center justify-center h-full w-full text-2xl font-bold">
                            {profile.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </Avatar>
                        {isEditing && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{profile.name}</h3>
                        <p className="text-muted-foreground">{profile.jobTitle}</p>
                        <p className="text-sm text-muted-foreground">Member since {profile.joinDate}</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Full Name
                        </label>
                        {isEditing ? (
                          <Input
                            value={tempProfile.name}
                            onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                          />
                        ) : (
                          <div className="flex items-center space-x-2 p-3 rounded-md bg-muted/30">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{profile.name}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Email
                        </label>
                        {isEditing ? (
                          <Input
                            type="email"
                            value={tempProfile.email}
                            onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})}
                          />
                        ) : (
                          <div className="flex items-center space-x-2 p-3 rounded-md bg-muted/30">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{profile.email}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Phone
                        </label>
                        {isEditing ? (
                          <Input
                            value={tempProfile.phone}
                            onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})}
                          />
                        ) : (
                          <div className="flex items-center space-x-2 p-3 rounded-md bg-muted/30">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{profile.phone}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Location
                        </label>
                        {isEditing ? (
                          <Input
                            value={tempProfile.location}
                            onChange={(e) => setTempProfile({...tempProfile, location: e.target.value})}
                          />
                        ) : (
                          <div className="flex items-center space-x-2 p-3 rounded-md bg-muted/30">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{profile.location}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Company
                        </label>
                        {isEditing ? (
                          <Input
                            value={tempProfile.company}
                            onChange={(e) => setTempProfile({...tempProfile, company: e.target.value})}
                          />
                        ) : (
                          <div className="flex items-center space-x-2 p-3 rounded-md bg-muted/30">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{profile.company}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Job Title
                        </label>
                        {isEditing ? (
                          <Input
                            value={tempProfile.jobTitle}
                            onChange={(e) => setTempProfile({...tempProfile, jobTitle: e.target.value})}
                          />
                        ) : (
                          <div className="flex items-center space-x-2 p-3 rounded-md bg-muted/30">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{profile.jobTitle}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Bio
                      </label>
                      {isEditing ? (
                        <Textarea
                          value={tempProfile.bio}
                          onChange={(e) => setTempProfile({...tempProfile, bio: e.target.value})}
                          rows={3}
                        />
                      ) : (
                        <div className="p-3 rounded-md bg-muted/30">
                          <span className="text-foreground">{profile.bio}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                    <CardDescription>Your performance overview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats.map((stat, index) => {
                      const IconComponent = stat.icon;
                      return (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg bg-background ${stat.color}`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">{stat.value}</div>
                              <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            <span className="font-medium">{activity.action}</span> - {activity.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((achievement) => {
                  const IconComponent = achievement.icon;
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="hover:shadow-md transition-all duration-200">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-1">
                                {achievement.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {achievement.description}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                {achievement.date}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}