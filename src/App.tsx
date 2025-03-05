import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import BodyCalibration from './pages/BodyCalibration';
import Profile from './pages/Profile';
import WorkoutTrainer from './pages/WorkoutTrainer';
import { UserProvider } from './context/UserContext';
import { Dumbbell } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [skipLoading, setSkipLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if we should skip loading (from localStorage)
    const shouldSkipLoading = localStorage.getItem('skipLoading') === 'true';
    
    // Skip loading for trainer page or if skipLoading flag is set
    if (shouldSkipLoading || location.pathname === '/trainer') {
      setSkipLoading(true);
      localStorage.removeItem('skipLoading'); // Clear the flag after using it
      setIsLoading(false);
      return;
    }

    // Initialize AOS
    import('aos').then(AOS => {
      import('aos/dist/aos.css');
      AOS.init({
        duration: 1000,
        once: false,
        mirror: true
      });
    });

    // Simulate loading resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isLoading && !skipLoading) {
    return (
      <motion.div 
        className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 animate-gradient-shift"></div>
        
        {/* Animated neon circles */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(16, 185, 129, 0) 70%)',
                width: `${Math.random() * 30 + 10}vw`,
                height: `${Math.random() * 30 + 10}vw`,
                left: `${Math.random() * 80}%`,
                top: `${Math.random() * 80}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.2, 1],
                opacity: [0, 0.6, 0.3],
                x: [0, Math.random() * 40 - 20],
                y: [0, Math.random() * 40 - 20],
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.3
              }}
            />
          ))}
        </div>
        
        <motion.div 
          className="relative z-10 flex flex-col items-center"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo animation */}
          <motion.div 
            className="mb-8 relative"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center"
              animate={{ 
                boxShadow: [
                  "0 0 0 rgba(139, 92, 246, 0.4)",
                  "0 0 20px rgba(139, 92, 246, 0.6)",
                  "0 0 0 rgba(139, 92, 246, 0.4)"
                ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <motion.div
                animate={{ 
                  rotate: 360,
                  transition: { duration: 3, repeat: Infinity, ease: "linear" }
                }}
              >
                <Dumbbell size={48} className="text-white" />
              </motion.div>
            </motion.div>
            
            {/* Orbiting elements */}
            <motion.div
              className="absolute w-full h-full top-0 left-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <motion.div 
                className="absolute w-4 h-4 rounded-full bg-blue-500"
                style={{ top: '0%', left: '50%', marginLeft: '-8px', marginTop: '-8px' }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            
            <motion.div
              className="absolute w-full h-full top-0 left-0"
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            >
              <motion.div 
                className="absolute w-3 h-3 rounded-full bg-purple-500"
                style={{ bottom: '10%', right: '0%', marginRight: '-6px', marginBottom: '-6px' }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
          
          {/* Text animation */}
          <motion.h1 
            className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            AI Workout Trainer
          </motion.h1>
          
          <motion.p
            className="text-gray-400 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Your personal AI fitness coach
          </motion.p>
          
          {/* Loading indicator */}
          <motion.div 
            className="w-40 h-1 bg-gray-800 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <UserProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/calibration" element={<BodyCalibration />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/trainer" element={<WorkoutTrainer />} />
        </Routes>
      </AnimatePresence>
    </UserProvider>
  );
}

export default App;