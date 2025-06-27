import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bot, User, Send, Plus, Paperclip, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { validateGitHubUrl, extractRepoName } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { Message } from "@shared/schema";
import { useLocation } from "wouter";

interface ChatInterfaceProps {
  conversationId?: number;
  onNewConversation: (id: number) => void;
  fixedInput?: boolean;
}

interface ExplainResponse {
  explanation: string;
  conversationId: number;
  repoContext: string;
}

interface ChatResponse {
  response: string;
}

const MarkdownMessage = ({ content }: { content: string }) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="markdown-content prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 text-white border-b border-gray-600 pb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mb-3 text-white mt-6">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium mb-2 text-gray-200 mt-4">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed text-gray-100">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 space-y-1 text-gray-100">{children}</ul>
          ),
          li: ({ children }) => (
            <li className="flex items-start">
              <span className="text-blue-400 mr-2 mt-1.5">•</span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          code: ({ children, className }) => {
            const isInline = !className?.includes('language-');
            const text = String(children);
            
            if (isInline) {
              return (
                <code className="bg-gray-700 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            
            return (
              <div className="relative group">
                <Button
                  onClick={() => copyToClipboard(text)}
                  className="absolute top-2 right-2 p-1 bg-gray-600 hover:bg-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  size="sm"
                >
                  {copiedText === text ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
                <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm border border-gray-600">
                  <code>{children}</code>
                </pre>
              </div>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-400 bg-gray-800/50 p-4 my-4 italic text-gray-200">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default function ChatInterface({ conversationId, onNewConversation, fixedInput }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [repoContext, setRepoContext] = useState("");
  const [isInitialExplanation, setIsInitialExplanation] = useState(!conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showScrollDown, setShowScrollDown] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [readmeError, setReadmeError] = useState("");

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
      setReadmeError("");
      if (!conversationId) {
        onNewConversation(data.conversationId);
        navigate(`/chat/${data.conversationId}`);
      }
      refetchMessages();
    },
    onError: (error: any) => {
      let msg = error instanceof Error ? error.message : (error?.message || "Failed to explain repository");
      if (msg.includes("README.md not found")) {
        setReadmeError("Sorry, this repository does not have a README.md file. Please provide a repository with a README for analysis.");
      } else {
        toast({
          title: "Error",
          description: msg,
          variant: "destructive",
        });
      }
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

  // Track scroll position to show/hide arrow
  useEffect(() => {
    if (!fixedInput) return;
    const handleScroll = () => {
      const el = chatAreaRef.current;
      if (!el) return;
      const diff = el.scrollHeight - el.scrollTop - el.clientHeight;
      console.log('Scroll debug:', {scrollHeight: el.scrollHeight, scrollTop: el.scrollTop, clientHeight: el.clientHeight, diff});
      // Show arrow if not at the bottom (within 1px)
      setShowScrollDown(diff > 1);
    };
    const el = chatAreaRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      // Initial check
      const diff = el.scrollHeight - el.scrollTop - el.clientHeight;
      console.log('Initial scroll debug:', {scrollHeight: el.scrollHeight, scrollTop: el.scrollTop, clientHeight: el.clientHeight, diff});
      setShowScrollDown(el.scrollHeight > el.clientHeight && diff > 1);
    }
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
    };
  }, [fixedInput, messages]);

  // Also check after new messages render
  useEffect(() => {
    if (!fixedInput) return;
    const el = chatAreaRef.current;
    if (!el) return;
    const diff = el.scrollHeight - el.scrollTop - el.clientHeight;
    console.log('After message scroll debug:', {scrollHeight: el.scrollHeight, scrollTop: el.scrollTop, clientHeight: el.clientHeight, diff});
    setShowScrollDown(diff > 1);
  }, [messages, fixedInput]);

  const isLoading = explainMutation.isPending || chatMutation.isPending;

  return (
    <div className={`w-full max-w-4xl mx-auto flex flex-col flex-1 min-h-0 ${fixedInput ? 'relative h-full' : ''}`} style={fixedInput ? {height: '100%'} : {}}>
      {!conversationId && !messages.length && (
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
      <div className={fixedInput ? 'flex-1 min-h-0 overflow-y-auto pb-32' : ''} ref={fixedInput ? chatAreaRef : undefined}>
        {!conversationId && messages.length === 0 && (
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

        {readmeError && (
          <div className="flex items-start space-x-4 chat-message mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg ring-2 ring-red-400/60">
              <Bot className="text-white w-5 h-5" />
            </div>
            <div className="bg-gradient-to-br from-red-700/90 to-red-900/80 border border-red-400/60 rounded-3xl px-8 py-5 max-w-2xl shadow-2xl backdrop-blur-md">
              <p className="text-red-100 leading-relaxed font-semibold text-lg">
                {readmeError}
              </p>
            </div>
          </div>
        )}

        {messages.map((message: Message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-4 chat-message mb-6 ${message.isUser ? 'justify-end flex-row-reverse' : ''}`}
          >
            <div className={`w-10 h-10 ${message.isUser ? 'bg-gradient-to-r from-white/30 to-neon-blue' : 'bg-gradient-to-r from-neon-purple to-neon-blue'} rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg ${message.isUser ? 'ring-2 ring-white/40' : 'ring-2 ring-neon-blue/40'}`}>
              {message.isUser ? <User className="text-white w-5 h-5" /> : <Bot className="text-white w-5 h-5" />}
            </div>
            <div
              className={
                message.isUser
                  ? 'bg-gradient-to-br from-white/10 to-neon-blue/20 rounded-3xl px-8 py-5 max-w-2xl shadow-xl backdrop-blur-md border border-white/10 text-white text-lg'
                  : 'bg-gradient-to-br from-dark-secondary/80 to-neon-purple/20 rounded-3xl px-8 py-5 max-w-2xl shadow-xl backdrop-blur-md border border-white/10 text-gray-100 text-lg'
              }
              style={{ wordBreak: 'break-word' }}
            >
              {message.isUser ? (
                <span>{message.content}</span>
              ) : (
                <MarkdownMessage content={message.content} />
              )}
            </div>
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
      </div>
      
      {/* Chat Input */}
      {fixedInput ? (
        <div className="fixed bottom-0 left-0 w-full flex justify-center z-30 bg-transparent mb-10">
          <div className="w-full max-w-3xl">
            {/* Up arrow button above input, only if there are messages and not at bottom */}
            {(conversationId || messages.length > 0) && showScrollDown && (
              <div className="flex justify-center mb-3">
                <button
                  type="button"
                  className="bg-dark-secondary rounded-full p-2 shadow-md border border-white/10 hover:bg-white/10 transition-all"
                  onClick={() => {
                    if (messagesEndRef.current) {
                      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  aria-label="Scroll to latest message"
                >
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down text-gray-400"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center h-12 rounded-full shadow-2xl px-5 gap-2 bg-black/70">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isInitialExplanation 
                      ? "Ask anything..." 
                      : "Message ReEx..."
                  }
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 text-xs h-full px-2 focus:ring-0 focus:outline-none text-right"
                  disabled={isLoading}
                  style={{ minHeight: '36px' }}
                />
                <Button
                  type="button"
                  variant="ghost" 
                  size="icon"
                  className="rounded-full bg-white/10 hover:bg-white/20 w-10 h-10 flex items-center justify-center p-0"
                >
                  <Paperclip className="w-5 h-5 text-gray-400" />
                </Button>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="rounded-full bg-white/10 hover:bg-white/20 w-10 h-10 flex items-center justify-center p-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 text-gray-200" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="relative pb-2 pt-2">
          <div className="max-w-2xl mx-auto">
            {/* Up arrow button above input, only if there are messages and not at bottom */}
            {(conversationId || messages.length > 0) && showScrollDown && (
              <div className="flex justify-center mb-1">
                <button
                  type="button"
                  className="bg-dark-secondary rounded-full p-2 shadow-md border border-white/10 hover:bg-white/10 transition-all"
                  onClick={() => {
                    if (messagesEndRef.current) {
                      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  aria-label="Scroll to latest message"
                >
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down text-gray-400"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center h-12 rounded-full shadow-2xl px-5 gap-2 bg-black/70">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isInitialExplanation 
                      ? "Ask anything..." 
                      : "Message ReEx..."
                  }
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 text-xs h-full px-2 focus:ring-0 focus:outline-none text-right"
                  disabled={isLoading}
                  style={{ minHeight: '36px' }}
                />
                <Button
                  type="button"
                  variant="ghost" 
                  size="icon"
                  className="rounded-full bg-white/10 hover:bg-white/20 w-10 h-10 flex items-center justify-center p-0"
                >
                  <Paperclip className="w-5 h-5 text-gray-400" />
                </Button>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="rounded-full bg-white/10 hover:bg-white/20 w-10 h-10 flex items-center justify-center p-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 text-gray-200" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}