import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface LoadingTransitionProps {
  onComplete: () => void;
  message?: string;
}

const LoadingTransition: React.FC<LoadingTransitionProps> = ({ 
  onComplete, 
  message = "Your AI trainer is getting ready..." 
}) => {
  const [progress, setProgress] = useState(0);
  const loadingMessages = [
    "Analyzing workout patterns...",
    "Calibrating pose detection...",
    "Loading exercise models...",
    "Preparing real-time feedback...",
    "Setting up your personal trainer..."
  ];
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        // Accelerate progress as it gets closer to 100%
        const increment = prev < 50 ? 1 : prev < 80 ? 2 : 3;
        const newProgress = Math.min(prev + increment, 100);
        
        // When complete, trigger the callback
        if (newProgress >= 100) {
          clearInterval(interval);
          // Give a small delay before completing to show 100%
          setTimeout(onComplete, 500);
        }
        return newProgress;
      });
    }, 50);

    // Cycle through loading messages
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => {
        const currentIndex = loadingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="max-w-md w-full flex flex-col items-center"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="mb-8 flex items-center justify-center">
          <motion.div
            animate={{ 
              rotate: 360,
              transition: { duration: 2, repeat: Infinity, ease: "linear" }
            }}
            className="h-16 w-16 rounded-full bg-primary bg-opacity-20 flex items-center justify-center"
          >
            <Activity size={32} className="text-primary" />
          </motion.div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 text-center">AI Workout Trainer</h2>
        
        <motion.p 
          className="text-gray-300 mb-6 text-center"
          key={currentMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {currentMessage}
        </motion.p>

        <div className="w-full bg-card-bg rounded-full h-3 mb-4 overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <p className="text-sm text-gray-400">{progress}% complete</p>
      </motion.div>
    </motion.div>
  );
};

export default LoadingTransition; 