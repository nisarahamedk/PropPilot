'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PropPilotDashboard from '@/features/proppilot/components/PropPilotDashboard';

export default function Home() {
  const { isAuthenticated, userName, login, logout } = useAuth();
  const [nameInput, setNameInput] = React.useState('');

  const handleLogin = () => {
    if (nameInput.trim()) {
      login(nameInput.trim());
      setNameInput('');
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
              onKeyDown={(e) => {
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

  return <PropPilotDashboard />;
}