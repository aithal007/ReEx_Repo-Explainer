import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bot, User, Send, Plus, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { validateGitHubUrl, extractRepoName } from "@/lib/utils";
import type { Message } from "@shared/schema";

interface ChatInterfaceProps {
  conversationId?: number;
  onNewConversation: (id: number) => void;
}

interface ExplainResponse {
  explanation: string;
  conversationId: number;
  repoContext: string;
}

interface ChatResponse {
  response: string;
}

export default function ChatInterface({ conversationId, onNewConversation }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [repoContext, setRepoContext] = useState("");
  const [isInitialExplanation, setIsInitialExplanation] = useState(!conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch messages for current conversation
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: [`/api/conversations/${conversationId}/messages`],
    enabled: !!conversationId,
  });

  const explainMutation = useMutation({
    mutationFn: async (url: string): Promise<ExplainResponse> => {
      const response = await apiRequest("POST", "/api/explain", {
        url,
        conversationId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setRepoContext(data.repoContext);
      setIsInitialExplanation(false);
      if (!conversationId) {
        onNewConversation(data.conversationId);
      }
      refetchMessages();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to explain repository",
        variant: "destructive",
      });
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string): Promise<ChatResponse> => {
      const response = await apiRequest("POST", "/api/chat", {
        message,
        conversationId: conversationId!,
        repoContext,
      });
      return response.json();
    },
    onSuccess: () => {
      refetchMessages();
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (isInitialExplanation) {
      if (!validateGitHubUrl(input)) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid GitHub repository URL",
          variant: "destructive",
        });
        return;
      }
      explainMutation.mutate(input);
    } else {
      if (!conversationId) return;
      chatMutation.mutate(input);
    }

    setInput("");
  };

  const handleNewChat = () => {
    setInput("");
    setRepoContext("");
    setIsInitialExplanation(true);
    onNewConversation(0);
  };

  const demoRepo = (url: string) => {
    setInput(url);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isLoading = explainMutation.isPending || chatMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto glassmorphism rounded-3xl overflow-hidden" style={{ height: "600px" }}>
      {/* Chat Header */}
      <div className="bg-dark-secondary border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full flex items-center justify-center">
            <Bot className="text-white w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">ReEx AI Assistant</h3>
            <p className="text-sm text-gray-400">Ready to explain repositories</p>
          </div>
        </div>
        <Button 
          onClick={handleNewChat}
          variant="ghost"
          className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-all"
        >
          <Plus className="mr-2 w-4 h-4" />
          New Chat
        </Button>
      </div>
      
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-6 space-y-4" style={{ height: "450px" }}>
        {!conversationId && (
          <div className="flex items-start space-x-3 chat-message">
            <div className="w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-white w-4 h-4" />
            </div>
            <div className="glassmorphism rounded-2xl px-4 py-3 max-w-md">
              <p className="text-gray-200">
                Hi! I'm ReEx, your AI-powered repository explainer.
                <br /><br />
                Paste a GitHub repository URL below and I'll provide a comprehensive explanation of what the project does, its structure, and key components.
              </p>
            </div>
          </div>
        )}

        {messages.map((message: Message) => (
          <div key={message.id} className={`flex items-start space-x-3 chat-message ${message.isUser ? 'justify-end' : ''}`}>
            {message.isUser ? (
              <>
                <div className="bg-gradient-to-r from-neon-purple to-neon-blue rounded-2xl px-4 py-3 max-w-md">
                  <p className="text-white">{message.content}</p>
                </div>
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-white w-4 h-4" />
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white w-4 h-4" />
                </div>
                <div className="glassmorphism rounded-2xl px-4 py-3 max-w-lg">
                  <div className="text-gray-200 whitespace-pre-wrap">{message.content}</div>
                </div>
              </>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3 chat-message">
            <div className="w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-white w-4 h-4" />
            </div>
            <div className="glassmorphism rounded-2xl px-4 py-3 max-w-md">
              <p className="text-gray-200 typing-indicator">
                {isInitialExplanation ? "Analyzing repository..." : "Thinking..."}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </ScrollArea>
      
      {/* Chat Input */}
      <div className="p-4 border-t border-white/10">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isInitialExplanation 
                  ? "Paste GitHub repository URL here..." 
                  : "Ask a question about this repository..."
              }
              className="w-full bg-dark-secondary border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 pr-12"
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Button
                type="button"
                variant="ghost" 
                size="sm"
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <Paperclip className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-neon-purple to-neon-blue px-6 py-4 rounded-2xl text-white font-semibold hover:scale-105 transition-all neon-glow"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {/* Sample URLs for demo */}
        {isInitialExplanation && (
          <div className="mt-4 text-center">
            <p className="text-gray-400 mb-3 text-sm">Try these sample repositories:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                onClick={() => demoRepo('https://github.com/facebook/react')}
                variant="ghost"
                size="sm"
                className="glassmorphism text-xs hover:bg-white/10"
              >
                facebook/react
              </Button>
              <Button
                onClick={() => demoRepo('https://github.com/vercel/next.js')}
                variant="ghost"
                size="sm"
                className="glassmorphism text-xs hover:bg-white/10"
              >
                vercel/next.js
              </Button>
              <Button
                onClick={() => demoRepo('https://github.com/microsoft/vscode')}
                variant="ghost"
                size="sm"
                className="glassmorphism text-xs hover:bg-white/10"
              >
                microsoft/vscode
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
