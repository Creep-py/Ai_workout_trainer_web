import { Github, Twitter, Linkedin, Mail, Dumbbell, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
      
      {/* Glow effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mr-2 shadow-lg shadow-purple-500/20">
                <Dumbbell size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 neon-text">
                AI Workout Trainer
              </span>
            </div>
            <p className="mt-4 text-gray-400 max-w-md">
              AI-powered workout trainer that helps you perfect your form and achieve your fitness goals with real-time feedback and personalized guidance.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors transform hover:scale-110 duration-300">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors transform hover:scale-110 duration-300">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors transform hover:scale-110 duration-300">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors transform hover:scale-110 duration-300">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-3 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Home
                </Link>
              </li>
              <li>
                <a href="#features" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-3 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Features
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-3 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-3 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-3 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-3 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Tutorials
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-3 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-3 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-purple-500/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2025 AI Workout Trainer. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}