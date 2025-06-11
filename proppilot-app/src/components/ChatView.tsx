"use client";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "./ChatMessage";

interface Message {
  id: string;
  sender: "user" | "ai";
  message: string;
}

interface ChatViewProps {
  messages: Message[];
}

export default function ChatView({ messages }: ChatViewProps) {
  // This ref is for the ScrollArea component itself, not the viewport.
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  // This ref is for the direct child div that holds the messages.
  const messagesEndRef = React.useRef<HTMLDivElement>(null);


  React.useEffect(() => {
    // Scroll to the bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    // The ScrollArea defines the scrollable container.
    // The direct child will be the one whose scrollHeight is measured.
    <ScrollArea className="h-[400px] w-full p-4 border rounded-md" ref={scrollAreaRef}>
      <div> {/* This div contains all messages and its height grows */}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} sender={msg.sender} message={msg.message} />
        ))}
        {/* This empty div is at the end of the messages list. Scrolling it into view effectively scrolls to bottom. */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
