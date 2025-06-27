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

// Duplicate the features for seamless looping
const loopedFeatures = [...features, ...features];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Why Choose ReEx?</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Transform any GitHub repository into clear, understandable explanations
          </p>
        </div>
        {/* Smoothly auto-sliding cards container */}
        <div className="relative overflow-hidden py-8 md:py-12" style={{ minHeight: '370px' }}>
          <div
            className="flex w-max animate-features-carousel"
            style={{
              // The width is set by the number of cards and their min-width
              // The animation is handled by Tailwind's arbitrary keyframes below
            }}
          >
            {loopedFeatures.map((feature, index) => (
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
      </div>
      {/* Tailwind custom keyframes for infinite scroll */}
      <style>{`
        @keyframes features-carousel {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-features-carousel {
          animation: features-carousel 24s linear infinite;
        }
        @media (max-width: 767px) {
          .animate-features-carousel {
            animation: features-carousel 16s linear infinite;
          }
        }
      `}</style>
    </section>
  );
}
