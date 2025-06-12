'use client'; // This page now needs to be a client component to use the hook

import React from 'react';
import { useAuth } from '@/lib/auth'; // Import useAuth
import { Button } from '@/components/ui/button'; // Import Button
import { Input } from '@/components/ui/input'; // Import Input (for mock login name)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components

import ChatInterface from '@/features/proppilot/components/ChatInterface';
import RFPAnalyzer from '@/features/proppilot/components/RFPAnalyzer';
import ProposalSectionDisplay from '@/features/proppilot/components/ProposalSectionDisplay';
import ProposalValidator from '@/features/proppilot/components/ProposalValidator';

export default function PropPilotPage() {
  const { isAuthenticated, userName, login, logout } = useAuth();
  const [nameInput, setNameInput] = React.useState('');

  const handleLogin = () => {
    if (nameInput.trim()) {
      login(nameInput.trim());
      setNameInput(''); // Clear input after login
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login to PropPilot</CardTitle>
            <CardDescription>Enter your name to simulate login.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyPress={(e) => { // Allow login on Enter key press
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
              className="w-full"
            />
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col gap-8">
      <header className="text-center relative py-4"> {/* Added py-4 for spacing */}
        <h1 className="text-4xl font-bold text-primary">Welcome to PropPilot, {userName}!</h1>
        <p className="text-xl text-muted-foreground">
          Your AI-powered proposal generation assistant.
        </p>
        <Button onClick={logout} variant="outline" className="absolute top-4 right-4"> {/* Adjusted positioning slightly */}
          Logout
        </Button>
      </header>

      {/* Chat Interface */}
      <section id="chat-interface" className="w-full max-w-2xl mx-auto">
        {/* Removed h2 and p, ChatInterface has its own CardHeader and is a Card itself */}
        <ChatInterface />
      </section>

      {/* RFP Analyzer */}
      <section id="rfp-analyzer" className="w-full max-w-2xl mx-auto">
        <RFPAnalyzer />
      </section>

      {/* Proposal Display */}
      <section id="proposal-display" className="w-full max-w-4xl mx-auto">
        <ProposalSectionDisplay />
      </section>

      {/* Proposal Validator */}
      <section id="proposal-validator" className="w-full max-w-2xl mx-auto">
        <ProposalValidator />
      </section>
    </div>
  );
}
