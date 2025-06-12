'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';

const SimpleDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'chat'>('dashboard');

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
            <p className="text-muted-foreground">Chat interface coming soon...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">PropPilot</h1>
          <Button onClick={() => setActiveView('chat')}>
            <Plus className="h-4 w-4 mr-2" />
            New Proposal
          </Button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-8">Your Proposals</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <h3 className="font-semibold mb-2">Sample Proposal {i}</h3>
              <p className="text-sm text-muted-foreground mb-4">Sample Client {i}</p>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1">
                  Continue
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SimpleDashboard;