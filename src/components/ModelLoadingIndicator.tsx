import React from 'react';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

interface ModelLoadingIndicatorProps {
  message?: string;
}

const ModelLoadingIndicator: React.FC<ModelLoadingIndicatorProps> = ({ 
  message = 'Loading AI model...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-card-bg rounded-lg border border-border">
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
        }}
        className="mb-4"
      >
        <div className="h-16 w-16 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
          <Cpu size={32} className="text-primary" />
        </div>
      </motion.div>
      
      <h3 className="text-xl font-bold mb-2">{message}</h3>
      <p className="text-gray-400 text-center mb-4">
        This may take a moment as we prepare the AI workout analysis tools.
      </p>
      
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
        <motion.div 
          className="bg-primary h-2.5 rounded-full" 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
      
      <div className="text-sm text-gray-400">
        Please ensure your camera is connected and ready
      </div>
    </div>
  );
};

export default ModelLoadingIndicator; 