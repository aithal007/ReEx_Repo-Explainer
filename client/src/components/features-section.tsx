import { useState, useEffect } from "react";
import { Check, Rocket, FolderOpen, MessageCircle, Target } from "lucide-react";

const features = [
  {
    icon: <Rocket className="w-12 h-12" />,
    title: "Get TL;DR of Any Repo",
    items: [
      "Instant repository summaries",
      "Key features identification", 
      "Technology stack analysis"
    ],
    color: "text-neon-green"
  },
  {
    icon: <FolderOpen className="w-12 h-12" />,
    title: "Understand Structure & Files",
    items: [
      "Folder organization breakdown",
      "File purpose explanations",
      "Code architecture insights"
    ],
    color: "text-neon-blue"
  },
  {
    icon: <MessageCircle className="w-12 h-12" />,
    title: "Ask Interactive Questions", 
    items: [
      "Natural language queries",
      "Deep dive explanations",
      "Context-aware responses"
    ],
    color: "text-neon-purple"
  },
  {
    icon: <Target className="w-12 h-12" />,
    title: "Code Interview Assistant",
    items: [
      "Technical interview prep",
      "Code review assistance", 
      "Learning path guidance"
    ],
    color: "text-neon-green"
  }
];

export default function FeaturesSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = features.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Why Choose ReEx?</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Transform any GitHub repository into clear, understandable explanations
          </p>
        </div>
        
        {/* Auto-sliding cards container */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * (window.innerWidth < 768 ? 100 : 25)}%)`
            }}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="min-w-full md:min-w-80 glassmorphism rounded-2xl p-8 mx-4 hover:scale-105 transition-all duration-300 neon-glow"
              >
                <div className={`mb-6 text-center ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">{feature.title}</h3>
                <ul className="space-y-3 text-gray-300">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center">
                      <Check className={`mr-3 w-4 h-4 ${feature.color}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {/* Card navigation dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
