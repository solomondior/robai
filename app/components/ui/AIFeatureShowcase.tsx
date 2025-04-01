import React, { useState, useEffect } from 'react';
import { cn } from '~/lib/utils';
import { TerminalAnimation } from './TerminalAnimation';
import { motion } from 'framer-motion';

interface AIFeatureShowcaseProps {
  className?: string;
}

type Feature = {
  id: number;
  title: string;
  description: string;
  icon: string;
};

export function AIFeatureShowcase({ className }: AIFeatureShowcaseProps) {
  const [activeFeature, setActiveFeature] = useState(0);
  
  const features: Feature[] = [
    {
      id: 1,
      title: "Smart Code Generation",
      description: "Generate production-ready code with a simple prompt. Nexus AI understands your requirements and creates optimized components.",
      icon: "i-ph:code-bold"
    },
    {
      id: 2,
      title: "Intelligent Debugging",
      description: "Identify and fix bugs quickly with AI-powered analysis. Nexus AI examines your code and suggests improvements.",
      icon: "i-ph:bug-beetle-bold"
    },
    {
      id: 3,
      title: "Project Acceleration",
      description: "Build complete projects from scratch with guided assistance. Nexus AI helps you structure and implement your ideas.",
      icon: "i-ph:rocket-launch-bold"
    },
    {
      id: 4,
      title: "Seamless Deployment",
      description: "Deploy your applications with ease. Nexus AI handles the configuration and deployment process for you.",
      icon: "i-ph:cloud-arrow-up-bold"
    }
  ];

  // Auto-rotate through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className={cn("w-full max-w-6xl mx-auto py-12", className)}>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Terminal Animation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="order-2 md:order-1"
        >
          <TerminalAnimation className="shadow-2xl" />
        </motion.div>
        
        {/* Features */}
        <div className="order-1 md:order-2 space-y-8">
          <motion.h2 
            className="text-3xl font-bold text-bolt-elements-textPrimary"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Supercharge Your Development
          </motion.h2>
          
          <motion.p
            className="text-lg text-bolt-elements-textSecondary"
            initial={{ y: -15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Nexus AI streamlines your workflow with powerful features that help you build better applications faster.
          </motion.p>
          
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                className={cn(
                  "p-4 rounded-lg border transition-all duration-300 cursor-pointer",
                  activeFeature === index 
                    ? "border-bolt-elements-button-primary-background" 
                    : "border-bolt-elements-borderColor hover:border-bolt-elements-borderColorActive"
                )}
                onClick={() => setActiveFeature(index)}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    feature.icon,
                    "w-6 h-6 mt-1",
                    activeFeature === index 
                      ? "text-bolt-elements-button-primary-text" 
                      : "text-bolt-elements-textPrimary"
                  )} />
                  <div>
                    <h3 className={cn(
                      "font-medium mb-1",
                      activeFeature === index 
                        ? "text-bolt-elements-button-primary-text" 
                        : "text-bolt-elements-textPrimary"
                    )}>
                      {feature.title}
                    </h3>
                    <p className="text-sm text-bolt-elements-textSecondary">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 