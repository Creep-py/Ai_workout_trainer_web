import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Activity, Zap, Users, Code, CheckCircle, Dumbbell, Cpu, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import { useUser } from '../context/UserContext';
import { navigateToTrainerWithoutLoading } from '../utils/navigationUtils';

export default function LandingPage() {
  const { isLoggedIn } = useUser();
  const navigate = useNavigate();
  
  const featuresRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Initialize AOS
    import('aos').then(AOS => {
      import('aos/dist/aos.css');
      AOS.init({
        duration: 1000,
        once: false,
        mirror: true
      });
    });
  }, []);

  // Handle direct navigation to trainer without loading
  const handleStartTraining = (e: React.MouseEvent) => {
    if (isLoggedIn) {
      e.preventDefault();
      const path = navigateToTrainerWithoutLoading();
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Hero Section - Full Screen */}
      <section className="h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0a0a14]"></div>
        
        {/* Subtle background elements */}
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[150px] opacity-10 z-0"></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-blue-500 rounded-full filter blur-[120px] opacity-10 z-0"></div>
        
        <div className="container mx-auto px-4 z-10 text-center">
          <motion.p 
            className="text-purple-400 mb-4 uppercase tracking-wider font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            INTRODUCING
          </motion.p>
          
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-500 to-blue-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            AI WORKOUT TRAINER
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Train smarter with real-time pose detection and personalized feedback to
            improve your workout technique and prevent injuries.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link 
              to={isLoggedIn ? "/trainer" : "/signup"} 
              onClick={isLoggedIn ? handleStartTraining : undefined}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3 px-8 rounded-md text-lg font-medium transition-all"
            >
              Let's Train <ArrowRight size={18} className="inline ml-2" />
            </Link>
          </motion.div>
          
          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <div className="flex flex-col items-center">
              <p className="text-gray-400 mb-2">Scroll to learn more</p>
              <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center pt-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-20 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Key Features</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our AI-powered platform offers everything you need to perfect your workout form
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/50 border border-gray-800 p-6 rounded-lg hover:border-purple-500/50 transition-all duration-300" data-aos="fade-up" data-aos-delay="100">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mb-6">
                <Activity size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Real-time Pose Estimation</h3>
              <p className="text-gray-400">
                Advanced AI algorithms detect and track your body movements with precision to provide instant feedback.
              </p>
            </div>
            
            <div className="bg-black/50 border border-gray-800 p-6 rounded-lg hover:border-purple-500/50 transition-all duration-300" data-aos="fade-up" data-aos-delay="200">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mb-6">
                <Brain size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Personalized Feedback</h3>
              <p className="text-gray-400">
                Get customized recommendations based on your body measurements and fitness goals.
              </p>
            </div>
            
            <div className="bg-black/50 border border-gray-800 p-6 rounded-lg hover:border-purple-500/50 transition-all duration-300" data-aos="fade-up" data-aos-delay="300">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mb-6">
                <Zap size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Form Correction</h3>
              <p className="text-gray-400">
                Immediate alerts when your form needs adjustment to prevent injuries and maximize results.
              </p>
            </div>
          </div>
          
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="order-2 lg:order-1" data-aos="fade-right">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Advanced Workout Analysis</h3>
              <p className="text-gray-300 mb-6">
                Our AI-powered system analyzes your movements in real-time, providing instant feedback to help you perfect your form and maximize your workout efficiency.
              </p>
              
              <ul className="space-y-3">
                {[
                  "Joint angle measurement for precise form analysis",
                  "Posture correction to prevent injuries",
                  "Rep counting with proper form validation",
                  "Personalized workout recommendations"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle size={20} className="text-purple-400 mt-1 mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="order-1 lg:order-2" data-aos="fade-left">
              <div className="relative">
                <div className="bg-black/50 rounded-lg overflow-hidden border border-gray-800">
                  <img 
                    src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                    alt="Workout Analysis" 
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                
                <div className="absolute -bottom-5 -right-5 bg-black/80 p-4 rounded-lg border border-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
                      <Dumbbell size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-purple-400">92% Accuracy</p>
                      <p className="text-sm text-gray-400">Perfect form achieved</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Tech Stack Section */}
      <section id="tech" ref={techRef} className="py-20 px-4 bg-card-dark relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        
        {/* Glow effects */}
        <div className="absolute -top-40 left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text neon-glow">Powered By</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Built with cutting-edge technologies for the best performance
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center" data-aos="zoom-in" data-aos-delay="100">
              <div className="h-16 w-16 rounded-full bg-card-bg flex items-center justify-center mb-4 border border-border neon-border">
                <img src="https://www.tensorflow.org/images/tf_logo_social.png" alt="TensorFlow" className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-medium neon-purple">TensorFlow.js</h3>
            </div>
            
            <div className="flex flex-col items-center" data-aos="zoom-in" data-aos-delay="200">
              <div className="h-16 w-16 rounded-full bg-card-bg flex items-center justify-center mb-4 border border-border neon-border">
                <Cpu size={32} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-medium neon-blue">MoveNet</h3>
            </div>
            
            <div className="flex flex-col items-center" data-aos="zoom-in" data-aos-delay="300">
              <div className="h-16 w-16 rounded-full bg-card-bg flex items-center justify-center mb-4 border border-border neon-border">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png" alt="React" className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-medium neon-purple">React</h3>
            </div>
            
            <div className="flex flex-col items-center" data-aos="zoom-in" data-aos-delay="400">
              <div className="h-16 w-16 rounded-full bg-card-bg flex items-center justify-center mb-4 border border-border neon-border">
                <img src="https://tailwindcss.com/_next/static/media/tailwindcss-mark.3c5441fc7a190fb1800d4a5c7f07ba4b1345a9c8.svg" alt="Tailwind CSS" className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-medium neon-blue">Tailwind CSS</h3>
            </div>
          </div>
          
          <div className="mt-20" data-aos="fade-up">
            <div className="bg-card-bg rounded-lg p-8 border border-border neon-border">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-8 md:mb-0">
                  <h3 className="text-2xl font-bold mb-4 gradient-text neon-glow">How It Works</h3>
                  <p className="text-gray-300 mb-6">
                    Our platform uses TensorFlow.js and MoveNet to analyze your movements in real-time through your device's camera. The AI model identifies key body points and calculates joint angles to provide instant feedback on your form.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mr-4 mt-1">
                        <span className="font-bold text-white">1</span>
                      </div>
                      <div>
                        <h4 className="font-bold neon-purple">Pose Detection</h4>
                        <p className="text-gray-400">AI identifies 17 key points on your body</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mr-4 mt-1">
                        <span className="font-bold text-white">2</span>
                      </div>
                      <div>
                        <h4 className="font-bold neon-blue">Form Analysis</h4>
                        <p className="text-gray-400">Calculates joint angles and posture alignment</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mr-4 mt-1">
                        <span className="font-bold text-white">3</span>
                      </div>
                      <div>
                        <h4 className="font-bold neon-teal">Real-time Feedback</h4>
                        <p className="text-gray-400">Provides instant guidance to correct your form</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-8">
                  <div className="relative">
                    <div className="bg-card-dark rounded-lg overflow-hidden border border-border neon-border">
                      <img 
                        src="https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                        alt="AI Technology" 
                        className="w-full h-auto rounded-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card-dark to-transparent opacity-60"></div>
                    </div>
                    <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center pulse-animation">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Us Section */}
      <section id="about" ref={aboutRef} className="py-20 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text neon-glow">About Us</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our mission is to make professional-level fitness guidance accessible to everyone
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8" data-aos="fade-right">
              <div className="relative">
                <div className="bg-card-bg rounded-lg overflow-hidden border border-border neon-border">
                  <img 
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                    alt="Team" 
                    className="rounded-lg w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-5 -left-5 bg-card-bg p-4 rounded-lg border border-border neon-border">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
                      <Users size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold neon-purple">Our Team</p>
                      <p className="text-sm text-gray-400">Fitness & AI experts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2" data-aos="fade-left">
              <h3 className="text-2xl font-bold mb-4 gradient-text">Our Story</h3>
              <p className="text-gray-300 mb-6">
                AI Workout Trainer was born from a simple observation: many people struggle with proper exercise form, leading to injuries and suboptimal results. Our team of fitness experts and AI engineers came together to solve this problem.
              </p>
              <p className="text-gray-300 mb-6">
                Using advanced computer vision and machine learning, we've created a platform that provides real-time feedback on your workout form, just like having a personal trainer by your side.
              </p>
              <div className="flex items-center p-4 bg-card-bg rounded-lg border border-border neon-border">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mr-4">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-bold neon-blue">Join Our Community</p>
                  <p className="text-gray-400">Connect with like-minded fitness enthusiasts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-blue-900/30"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        
        {/* Glow effects */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-500"></div>
        <div className="absolute -top-20 left-1/4 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 right-1/4 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10" data-aos="zoom-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text neon-glow">Ready to Transform Your Workouts?</h2>
          <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have improved their form and achieved better results with AI Workout Trainer.
          </p>
          {isLoggedIn ? (
            <Link to="/trainer" className="btn bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 shadow-lg hover:shadow-xl hover:shadow-purple-500/20">
              Start Training Now <ArrowRight size={18} className="ml-2" />
            </Link>
          ) : (
            <Link to="/signup" className="btn bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 shadow-lg hover:shadow-xl hover:shadow-purple-500/20">
              Sign Up for Free <ArrowRight size={18} className="ml-2" />
            </Link>
          )}
          
          <div className="mt-8 flex justify-center space-x-4">
            <div className="flex items-center text-gray-400">
              <CheckCircle size={16} className="mr-2 text-green-400" />
              <span className="text-sm">Free to start</span>
            </div>
            <div className="flex items-center text-gray-400">
              <CheckCircle size={16} className="mr-2 text-green-400" />
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center text-gray-400">
              <CheckCircle size={16} className="mr-2 text-green-400" />
              <span className="text-sm">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
      {isLoggedIn && <Chatbot />}
    </div>
  );
}