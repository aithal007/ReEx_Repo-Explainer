import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Code, MessageSquare, Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatInterface from "@/components/chat-interface";
import { formatDate } from "@/lib/utils";
import type { Conversation } from "@shared/schema";

export default function Chat() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const conversationId = params.id ? parseInt(params.id) : undefined;

  const handleNewConversation = (id: number) => {
    if (id > 0) {
      setLocation(`/chat/${id}`);
    } else {
      setLocation("/chat");
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary text-white flex flex-col">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-white/10 bg-dark-primary sticky top-0 z-20">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-blue rounded-lg flex items-center justify-center">
            <Code className="text-white w-4 h-4" />
          </div>
          <span className="text-xl font-bold gradient-text">ReEx</span>
        </Link>
        <Button 
          onClick={() => handleNewConversation(0)}
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:scale-105 transition-all px-4 py-2"
        >
          <Plus className="mr-2 w-4 h-4" />
          New Chat
        </Button>
      </div>
      {/* Chat Area fills space between header and input */}
      <div className="flex-1 min-h-0 flex flex-col">
        <ChatInterface 
          conversationId={conversationId}
          onNewConversation={handleNewConversation}
          fixedInput
        />
      </div>
    </div>
  );
}
