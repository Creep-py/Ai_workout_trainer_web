import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Dumbbell, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isLoggedIn, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current && 
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/90 backdrop-blur-md border-b border-[#1A202C]' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center mr-2">
                <Dumbbell size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                AI Workout Trainer
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-6">
              <Link 
                to="/" 
                className={`px-3 py-2 text-sm font-medium transition-colors relative group ${
                  location.pathname === '/' 
                    ? 'text-purple-400' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Home
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
                  location.pathname === '/' ? 'scale-x-100' : ''
                }`}></span>
              </Link>
              
              {isLoggedIn ? (
                <>
                  <Link 
                    to="/trainer" 
                    className={`px-3 py-2 text-sm font-medium transition-colors relative group ${
                      location.pathname === '/trainer' 
                        ? 'text-purple-400' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Workout Trainer
                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
                      location.pathname === '/trainer' ? 'scale-x-100' : ''
                    }`}></span>
                  </Link>
                  <div className="relative ml-3" ref={profileDropdownRef}>
                    <button 
                      onClick={toggleProfileDropdown}
                      className="flex items-center text-sm rounded-full focus:outline-none py-1"
                    >
                      <span className="sr-only">Open user menu</span>
                      {user?.profileImage ? (
                        <img
                          className="h-9 w-9 rounded-full object-cover border-2 border-purple-500"
                          src={user.profileImage}
                          alt={user.name}
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-purple-600 flex items-center justify-center text-white">
                          {user?.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <ChevronDown size={16} className={`ml-1 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'transform rotate-180' : ''}`} />
                    </button>
                    {isProfileOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-black ring-1 ring-purple-500 border border-purple-500/30 backdrop-blur-md z-50">
                        <Link 
                          to="/profile" 
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-purple-500/10 hover:text-white transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Your Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-purple-500/10 hover:text-white transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/signin" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium relative group">
                    Sign In
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                  </Link>
                  <Link to="/signup" className="bg-purple-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {isLoggedIn && (
              <Link to="/profile" className="mr-4">
                {user?.profileImage ? (
                  <img
                    className="h-8 w-8 rounded-full object-cover border-2 border-purple-500"
                    src={user.profileImage}
                    alt={user.name}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            )}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-purple-500/10 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black border-t border-purple-500/20 backdrop-blur-md">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/' 
                    ? 'text-purple-400' 
                    : 'text-gray-300 hover:text-white hover:bg-purple-500/10'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              {isLoggedIn ? (
                <>
                  <Link
                    to="/trainer"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === '/trainer' 
                        ? 'text-purple-400' 
                        : 'text-gray-300 hover:text-white hover:bg-purple-500/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Workout Trainer
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-purple-500/10"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <User size={16} className="mr-2 text-purple-400" />
                      Your Profile
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-purple-500/10"
                  >
                    <div className="flex items-center">
                      <LogOut size={16} className="mr-2 text-purple-400" />
                      Sign out
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-purple-500/10"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-purple-600 hover:bg-purple-700 my-2 mx-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}