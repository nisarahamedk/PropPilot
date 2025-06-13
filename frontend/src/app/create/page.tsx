'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload,
  FileText,
  MessageCircle,
  Zap,
  ArrowRight,
  Users,
  Building,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function CreatePage() {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [formData, setFormData] = useState({
    projectName: '',
    clientName: '',
    projectType: '',
    timeline: '',
    budget: '',
    description: ''
  });

  const creationMethods = [
    {
      id: 'chat',
      title: 'AI-Guided Creation',
      description: 'Chat with our AI to build your proposal step by step',
      icon: MessageCircle,
      features: ['Guided conversation', 'Smart suggestions', 'Dynamic content'],
      recommended: true
    },
    {
      id: 'template',
      title: 'Quick Start Templates',
      description: 'Choose from pre-built templates and customize',
      icon: Zap,
      features: ['Ready-made structures', 'Industry-specific', 'Fast setup']
    },
    {
      id: 'upload',
      title: 'Import RFP Document',
      description: 'Upload an RFP and let AI analyze requirements',
      icon: Upload,
      features: ['Auto-analysis', 'Requirement extraction', 'Smart matching']
    },
    {
      id: 'manual',
      title: 'Manual Creation',
      description: 'Start from scratch with full control',
      icon: FileText,
      features: ['Complete control', 'Custom structure', 'Blank canvas']
    }
  ];

  const templates = [
    { id: 'software', name: 'Software Development', description: 'Web and mobile app projects' },
    { id: 'consulting', name: 'Consulting Services', description: 'Business and strategy consulting' },
    { id: 'marketing', name: 'Marketing Campaign', description: 'Digital marketing and advertising' },
    { id: 'design', name: 'Design Services', description: 'UI/UX and graphic design' },
    { id: 'ecommerce', name: 'E-commerce Solution', description: 'Online store development' },
    { id: 'custom', name: 'Custom Project', description: 'Tailored to your needs' }
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleGetStarted = () => {
    if (selectedMethod === 'chat') {
      // Navigate to dashboard chat interface
      window.location.href = '/';
    } else if (selectedMethod === 'template') {
      // Navigate to dashboard with template selection
      window.location.href = '/';
    } else if (selectedMethod === 'upload') {
      // Navigate to dashboard with upload interface  
      window.location.href = '/';
    } else {
      // Navigate to dashboard with manual form
      window.location.href = '/';
    }
  };

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Proposal</h1>
            <p className="text-muted-foreground">Choose how you'd like to create your proposal</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {!selectedMethod ? (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {creationMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className={`cursor-pointer h-full transition-all duration-200 hover:shadow-lg ${
                        method.recommended ? 'ring-2 ring-primary/50 bg-primary/5' : ''
                      }`}
                      onClick={() => handleMethodSelect(method.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              method.recommended ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{method.title}</CardTitle>
                              {method.recommended && (
                                <Badge variant="secondary" className="mt-1">Recommended</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <CardDescription className="text-sm">
                          {method.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {method.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Quick Stats
              </h3>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">15min</div>
                  <div className="text-sm text-muted-foreground">Avg. Creation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Templates</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedMethod('')}
                className="mb-4"
              >
                ← Back to methods
              </Button>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {creationMethods.find(m => m.id === selectedMethod)?.title}
              </h2>
              <p className="text-muted-foreground">
                {creationMethods.find(m => m.id === selectedMethod)?.description}
              </p>
            </div>

            {selectedMethod === 'template' && (
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Choose a template:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-foreground">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {selectedMethod === 'manual' && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                  <CardDescription>
                    Provide basic details about your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Project Name
                      </label>
                      <Input
                        placeholder="Enter project name"
                        value={formData.projectName}
                        onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Client Name
                      </label>
                      <Input
                        placeholder="Enter client name"
                        value={formData.clientName}
                        onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Project Type
                      </label>
                      <Select value={formData.projectType} onValueChange={(value) => setFormData({...formData, projectType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="software">Software Development</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Timeline
                      </label>
                      <Input
                        placeholder="e.g., 3 months"
                        value={formData.timeline}
                        onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Budget Range
                    </label>
                    <Input
                      placeholder="e.g., $50,000 - $100,000"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Project Description
                    </label>
                    <Textarea
                      placeholder="Describe the project requirements and objectives..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setSelectedMethod('')}>
                Cancel
              </Button>
              <Button onClick={handleGetStarted}>
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}