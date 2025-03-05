import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';
import WorkoutTrainerApp from './WorkoutTrainerApp';
import { useUser } from '../context/UserContext';

const WorkoutTrainer: React.FC = () => {
  const { isLoggedIn } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/signin');
    }
    document.title = 'AI Workout Trainer';
    
    // Simulate loading for transition effect
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isLoggedIn, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-black relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 z-0"></div>
      
      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[128px] opacity-20 z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-[128px] opacity-20 z-0"></div>
      
      <Navbar />
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-teal-400">
              Loading AI Workout Trainer
            </h2>
            <div className="w-16 h-16 border-4 border-t-blue-500 border-r-purple-500 border-b-teal-400 border-l-pink-500 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col z-10 pt-16">
          <WorkoutTrainerApp />
          <Chatbot />
        </div>
      )}
    </div>
  );
}

export default WorkoutTrainer;