import { Code, Github } from "lucide-react";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import ChatInterface from "@/components/chat-interface";

export default function Landing() {
  const handleNewConversation = (id: number) => {
    if (id > 0) {
      window.location.href = `/chat/${id}`;
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary text-white overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      
      {/* ChatBot Interface Section */}
      <section id="chatbot" className="min-h-screen py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Try ReEx Now</h2>
            <p className="text-xl text-gray-400">
              Paste any GitHub repository URL and get an instant explanation
            </p>
          </div>
          
          <ChatInterface onNewConversation={handleNewConversation} />
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
