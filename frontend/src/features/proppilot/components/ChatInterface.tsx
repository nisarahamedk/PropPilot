'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'; // Added Card imports

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null); // Corrected type for ScrollArea ref if needed based on actual ScrollArea component

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now().toString() + '-ai',
        text: `PropPilot: Thanks for your message - "${inputValue}"! I'm still learning, but I'll help you build a great proposal. What would you like to do first? (e.g., start new proposal, upload RFP)`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
    }, 1000);

    setInputValue('');
  };

  useEffect(() => {
    // Auto-scroll to bottom
    // The ref for shadcn/ui ScrollArea might point to the root element.
    // Accessing the viewport requires finding the specific DOM element.
    // This implementation assumes direct manipulation, which might need adjustment
    // if ScrollArea exposes a more specific API for scrolling.
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      } else {
        // Fallback for simpler structures or if the viewport selector is not found
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <h2 className="text-xl font-semibold">PropPilot Chat</h2>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        {/* The ScrollArea component from shadcn/ui typically does not take a ref directly like a simple div.
            It forwards its ref to the underlying Radix component.
            The ref type might be `React.ElementRef<typeof ScrollAreaPrimitive.Root>`
            For controlling scroll, you might need to interact with the viewport child.
            The current `scrollAreaRef` type is HTMLDivElement, which is okay for the outer element.
         */}
        <ScrollArea className="h-full p-4" ref={scrollAreaRef as React.RefObject<HTMLDivElement>}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  msg.sender === 'user' ? 'justify-end' : ''
                }`}
              >
                {msg.sender === 'ai' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-ai-avatar.png" alt="AI" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs text-right mt-1 ${ /* Corrected template literal */
                    msg.sender === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground/80'
                  }`}>
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user-avatar.png" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-grow"
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
