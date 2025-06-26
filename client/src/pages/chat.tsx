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

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const handleNewConversation = (id: number) => {
    if (id > 0) {
      setLocation(`/chat/${id}`);
    } else {
      setLocation("/chat");
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary text-white flex">
      {/* Sidebar */}
      <div className="w-80 bg-dark-secondary border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <Link href="/" className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-blue rounded-lg flex items-center justify-center">
              <Code className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold gradient-text">ReEx</span>
          </Link>
          
          <Button 
            onClick={() => handleNewConversation(0)}
            className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:scale-105 transition-all"
          >
            <Plus className="mr-2 w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Conversations</h3>
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Link key={conversation.id} href={`/chat/${conversation.id}`}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left p-3 h-auto hover:bg-white/10 ${
                    conversationId === conversation.id ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="mr-3">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{conversation.title}</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(new Date(conversation.createdAt))}
                    </p>
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-gray-400 text-center">
            <p>Making GitHub repos understandable</p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold gradient-text">
            {conversationId ? "Repository Chat" : "New Conversation"}
          </h1>
          <p className="text-gray-400">
            {conversationId 
              ? "Continue your conversation about this repository" 
              : "Start by pasting a GitHub repository URL"
            }
          </p>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 p-6 flex items-center justify-center">
          <ChatInterface 
            conversationId={conversationId}
            onNewConversation={handleNewConversation}
          />
        </div>
      </div>
    </div>
  );
}
