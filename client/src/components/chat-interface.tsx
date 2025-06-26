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
  const { data: messages = [], refetch: refetchMessages } = useQuery<Message[]>({
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
    <div className="w-full max-w-4xl mx-auto flex flex-col" style={{ height: "80vh" }}>
      {!conversationId && !(messages as Message[]).length && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Repository insights</span>
              <br />
              <span className="text-white">in seconds</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              ReEx is your AI agent for understanding GitHub repositories instantly
            </p>
          </div>
        </div>
      )}
      
      {/* Chat Messages */}
      {(conversationId || (messages as Message[]).length > 0) && (
        <ScrollArea className="flex-1 p-6 space-y-6" style={{ height: "calc(80vh - 200px)" }}>
          {!conversationId && (messages as Message[]).length === 0 && (
            <div className="flex items-start space-x-4 chat-message">
              <div className="w-10 h-10 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="text-white w-5 h-5" />
              </div>
              <div className="bg-dark-secondary rounded-3xl px-6 py-4 max-w-2xl">
                <p className="text-gray-200 leading-relaxed">
                  Hi! I'm ReEx, your AI-powered repository explainer.
                  <br /><br />
                  Paste a GitHub repository URL below and I'll provide a comprehensive explanation of what the project does, its structure, and key components.
                </p>
              </div>
            </div>
          )}

          {(messages as Message[]).map((message: Message) => (
            <div key={message.id} className={`flex items-start space-x-4 chat-message ${message.isUser ? 'justify-end' : ''}`}>
              {message.isUser ? (
                <>
                  <div className="bg-gradient-to-r from-neon-purple to-neon-blue rounded-3xl px-6 py-4 max-w-2xl">
                    <p className="text-white leading-relaxed">{message.content}</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="text-white w-5 h-5" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="text-white w-5 h-5" />
                  </div>
                  <div className="bg-dark-secondary rounded-3xl px-6 py-4 max-w-2xl">
                    <div className="text-gray-100 whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  </div>
                </>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-4 chat-message">
              <div className="w-10 h-10 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="text-white w-5 h-5" />
              </div>
              <div className="bg-dark-secondary rounded-3xl px-6 py-4 max-w-md">
                <p className="text-gray-200 typing-indicator leading-relaxed">
                  {isInitialExplanation ? "Analyzing repository..." : "Thinking..."}
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </ScrollArea>
      )}
      
      {/* Chat Input */}
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end space-x-4 bg-dark-secondary rounded-3xl border border-white/10 p-4">
              <div className="flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isInitialExplanation 
                      ? "Ask anything..." 
                      : "Message ReEx..."
                  }
                  className="w-full bg-transparent border-0 text-white placeholder-gray-400 focus:outline-none focus:ring-0 text-lg resize-none"
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost" 
                  size="sm"
                  className="p-2 hover:bg-white/10 rounded-full"
                >
                  <Paperclip className="w-4 h-4 text-gray-400" />
                </Button>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>

          {/* Sample URLs for demo */}
          {isInitialExplanation && !conversationId && !(messages as Message[]).length && (
            <div className="mt-6 text-center">
              <p className="text-gray-400 mb-4 text-sm">+ Add repository</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={() => demoRepo('https://github.com/facebook/react')}
                  variant="ghost"
                  size="sm"
                  className="bg-dark-secondary hover:bg-white/10 text-sm px-4 py-2 rounded-full border border-white/10"
                >
                  facebook/react
                </Button>
                <Button
                  onClick={() => demoRepo('https://github.com/vercel/next.js')}
                  variant="ghost"
                  size="sm"
                  className="bg-dark-secondary hover:bg-white/10 text-sm px-4 py-2 rounded-full border border-white/10"
                >
                  vercel/next.js
                </Button>
                <Button
                  onClick={() => demoRepo('https://github.com/microsoft/vscode')}
                  variant="ghost"
                  size="sm"
                  className="bg-dark-secondary hover:bg-white/10 text-sm px-4 py-2 rounded-full border border-white/10"
                >
                  microsoft/vscode
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
