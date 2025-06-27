import { useState } from "react";
import { Code } from "lucide-react";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { validateGitHubUrl } from "@/lib/utils";

export default function Landing() {
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const explainMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/explain", { url });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.conversationId) {
        navigate(`/chat/${data.conversationId}`);
      }
    },
    onError: () => {
      setError("Failed to explain repository. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateGitHubUrl(repoUrl)) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }
    explainMutation.mutate(repoUrl);
  };

  return (
    <div className="min-h-screen bg-dark-primary text-white overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      {/* ChatBot Interface Section replaced with repo input */}
      <section id="chatbot" className="min-h-[60vh] pt-8 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 gradient-text">Try ReEx Now</h2>
            <p className="text-base md:text-lg text-gray-400">
              Paste any GitHub repository URL and get an instant explanation
            </p>
          </div>
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex flex-col items-center gap-2">
            <Input
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              placeholder="Enter GitHub repository URL..."
              className="w-full bg-dark-secondary border border-white/10 rounded-full px-5 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-md"
              disabled={explainMutation.isPending}
            />
            <Button
              type="submit"
              className="bg-gradient-to-r from-neon-purple to-neon-blue px-6 py-2 rounded-full text-sm font-semibold shadow-lg"
              disabled={explainMutation.isPending}
            >
              {explainMutation.isPending ? "Analyzing..." : "Explain Repository"}
            </Button>
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </form>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-blue rounded-lg flex items-center justify-center">
              <Code className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold gradient-text">ReEx</span>
          </div>
          <p className="text-gray-400 mb-6">
            Making GitHub repositories understandable for everyone
          </p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
