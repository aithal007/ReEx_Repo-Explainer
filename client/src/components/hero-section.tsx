import { Link } from "wouter";
import { ArrowRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const scrollToDemo = () => {
    const element = document.getElementById("chatbot");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-neon-purple rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-neon-blue rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-neon-green rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      {/* Gradient fade at bottom for smooth transition */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-32 md:h-48" style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, #09090b 100%)'}} />
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="gradient-text">ReEx</span>
          </h1>
          <h2 className="text-2xl md:text-4xl font-semibold mb-6 text-gray-100">
            The Last Repo Explainer You'll Need
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-12 leading-relaxed">
            Because ReEx doesn't just summarize code. It explains it like a developer.
          </p>
          
          <div className="flex justify-center">
            <Link href="/chat">
              <Button 
                size="lg"
                className="group bg-white text-black hover:bg-gray-200 px-8 py-4 text-lg font-semibold neon-glow hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center">
                  Start Now 
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>
          
          <div className="mt-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium glassmorphism border border-white/20">
              <Bot className="mr-2 w-4 h-4 text-neon-green" />
              Powered by Advanced LLMs
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
