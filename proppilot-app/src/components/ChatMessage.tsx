"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  sender: "user" | "ai";
  message: string;
  avatarLetter?: string; // For AI fallback
}

export default function ChatMessage({ sender, message, avatarLetter = "AI" }: ChatMessageProps) {
  const isUser = sender === "user";
  return (
    <div className={cn("flex items-start space-x-3 mb-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          {/* Assuming AvatarImage would be used if avatarSrc was a prop */}
          {/* <AvatarImage src={avatarSrc} alt={sender} /> */}
          <AvatarFallback>{avatarLetter}</AvatarFallback>
        </Avatar>
      )}
      <Card className={cn("p-3 rounded-lg max-w-xs md:max-w-md",
                        isUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
        <p className="text-sm">{message}</p>
      </Card>
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
