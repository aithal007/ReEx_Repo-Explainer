import { Link, useLocation } from "wouter";
import { Code, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [location] = useLocation();

  const scrollToSection = (sectionId: string) => {
    if (location !== "/") {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 glassmorphism border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-blue rounded-lg flex items-center justify-center">
              <Code className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold gradient-text">ReEx</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection("features")}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection("chatbot")}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Demo
            </button>
            <Link href="/chat">
              <Button className="bg-white text-black hover:bg-gray-200 transition-all transform hover:scale-105">
                Start Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
