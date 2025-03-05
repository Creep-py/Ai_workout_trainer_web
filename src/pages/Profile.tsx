import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit2, Award, Activity, Dumbbell, BarChart2, Calendar, Save, X, Trophy, Target, Flame } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import { useUser } from '../context/UserContext';

export default function Profile() {
  const { user, isLoggedIn, updateUserData } = useUser();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    hipSize: '',
    chestSize: '',
    neckSize: ''
  });
  
  useEffect(() => {
    // Redirect if not logged in
    if (!isLoggedIn) {
      navigate('/signin');
      return;
    }
    
    // Initialize form data with user data
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age?.toString() || '',
        gender: user.gender || '',
        height: user.height?.toString() || '',
        weight: user.weight?.toString() || '',
        hipSize: user.hipSize?.toString() || '',
        chestSize: user.chestSize?.toString() || '',
        neckSize: user.neckSize?.toString() || ''
      });
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
  }, [user, isLoggedIn, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update user data
    updateUserData({
      name: formData.name,
      age: formData.age ? parseInt(formData.age) : undefined,
      gender: formData.gender,
      height: formData.height ? parseFloat(formData.height) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      hipSize: formData.hipSize ? parseFloat(formData.hipSize) : undefined,
      chestSize: formData.chestSize ? parseFloat(formData.chestSize) : undefined,
      neckSize: formData.neckSize ? parseFloat(formData.neckSize) : undefined
    });
    
    setIsEditing(false);
  };
  
  const cancelEdit = () => {
    // Reset form data to user data
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age?.toString() || '',
        gender: user.gender || '',
        height: user.height?.toString() || '',
        weight: user.weight?.toString() || '',
        hipSize: user.hipSize?.toString() || '',
        chestSize: user.chestSize?.toString() || '',
        neckSize: user.neckSize?.toString() || ''
      });
    }
    
    setIsEditing(false);
  };
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - User info */}
            <div className="lg:col-span-1">
              <motion.div 
                className="bg-card-bg rounded-lg overflow-hidden shadow-lg border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                data-aos="fade-up"
              >
                <div className="bg-gradient-to-r from-primary-dark to-primary h-32 relative">
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="absolute top-4 right-4 bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-all"
                    >
                      <Edit2 size={16} className="text-white" />
                    </button>
                  )}
                </div>
                
                <div className="px-6 pb-6">
                  <div className="flex justify-center -mt-16 mb-6">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="h-32 w-32 rounded-full border-4 border-card-bg object-cover"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-full border-4 border-card-bg bg-primary flex items-center justify-center text-white text-4xl font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-1">
                              Age
                            </label>
                            <input
                              type="number"
                              name="age"
                              id=" age"
                              value={formData.age}
                              onChange={handleChange}
                              className="input"
                              min="1"
                              max="120"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-1">
                              Gender
                            </label>
                            <select
                              name="gender"
                              id="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              className="input"
                            >
                              <option value="" disabled>Select</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                              <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="height" className="block text-sm font-medium text-gray-300 mb-1">
                              Height (cm)
                            </label>
                            <input
                              type="number"
                              name="height"
                              id="height"
                              value={formData.height}
                              onChange={handleChange}
                              className="input"
                              min="50"
                              max="250"
                              step="0.1"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-1">
                              Weight (kg)
                            </label>
                            <input
                              type="number"
                              name="weight"
                              id="weight"
                              value={formData.weight}
                              onChange={handleChange}
                              className="input"
                              min="20"
                              max="300"
                              step="0.1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Body Measurements (cm)
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <input
                                type="number"
                                name="hipSize"
                                placeholder="Hip"
                                value={formData.hipSize}
                                onChange={handleChange}
                                className="input text-sm"
                                min="50"
                                max="200"
                                step="0.1"
                              />
                            </div>
                            <div>
                              <input
                                type="number"
                                name="chestSize"
                                placeholder="Chest"
                                value={formData.chestSize}
                                onChange={handleChange}
                                className="input text-sm"
                                min="50"
                                max="200"
                                step="0.1"
                              />
                            </div>
                            <div>
                              <input
                                type="number"
                                name="neckSize"
                                placeholder="Neck"
                                value={formData.neckSize}
                                onChange={handleChange}
                                className="input text-sm"
                                min="20"
                                max="100"
                                step="0.1"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3 pt-2">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="flex-1 btn btn-secondary"
                          >
                            <X size={18} className="mr-2" /> Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 btn btn-primary"
                          >
                            <Save size={18} className="mr-2" /> Save
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold text-center mb-2">{user.name}</h1>
                      <p className="text-primary text-center mb-6">Level {user.level || 1} Fitness Enthusiast</p>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-card-dark rounded-lg p-3 border border-border">
                            <p className="text-gray-400 text-sm">Age</p>
                            <p className="text-lg font-medium">{user.age || 'Not set'}</p>
                          </div>
                          <div className="bg-card-dark rounded-lg p-3 border border-border">
                            <p className="text-gray-400 text-sm">Gender</p>
                            <p className="text-lg font-medium capitalize">{user.gender || 'Not set'}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-card-dark rounded-lg p-3 border border-border">
                            <p className="text-gray-400 text-sm">Height</p>
                            <p className="text-lg font-medium">{user.height ? `${user.height} cm` : 'Not set'}</p>
                          </div>
                          <div className="bg-card-dark rounded-lg p-3 border border-border">
                            <p className="text-gray-400 text-sm">Weight</p>
                            <p className="text-lg font-medium">{user.weight ? `${user.weight} kg` : 'Not set'}</p>
                          </div>
                        </div>
                        
                        <div className="bg-card-dark rounded-lg p-3 border border-border">
                          <p className="text-gray-400 text-sm mb-2">Body Measurements</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <p className="text-xs text-gray-400">Hip</p>
                              <p className="font-medium">{user.hipSize ? `${user.hipSize} cm` : 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Chest</p>
                              <p className="font-medium">{user.chestSize ? `${user.chestSize} cm` : 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Neck</p>
                              <p className="font-medium">{user.neckSize ? `${user.neckSize} cm` : 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
            
            {/* Right column - Stats and achievements */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Progress card */}
                <motion.div 
                  className="bg-card-bg rounded-lg p-6 shadow-lg border border-border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  data-aos="fade-up"
                  data-aos-delay="100"
                >
                  <div className="flex items-center mb-4">
                    <Activity size={24} className="text-primary mr-3" />
                    <h2 className="text-xl font-bold">Your Progress</h2>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Level {user.level || 1}</span>
                      <span className="text-sm text-gray-400">Level {(user.level || 1) + 1}</span>
                    </div>
                    <div className="h-2 bg-card-dark rounded-full">
                      <div 
                        className="h-2 bg-primary rounded-full"
                        style={{ width: `${((user.experience || 0) % 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {100 - ((user.experience || 0) % 100)} XP to next level
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card-dark rounded-lg p-3 border border-border">
                      <div className="flex items-center mb-1">
                        <Calendar size={16} className="text-primary mr-2" />
                        <p className="text-sm font-medium">Workout Streak</p>
                      </div>
                      <p className="text-2xl font-bold">3 days</p>
                    </div>
                    <div className="bg-card-dark rounded-lg p-3 border border-border">
                      <div className="flex items-center mb-1">
                        <Dumbbell size={16} className="text-primary mr-2" />
                        <p className="text-sm font-medium">Total Workouts</p>
                      </div>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Achievements card */}
                <motion.div 
                  className="bg-card-bg rounded-lg p-6 shadow-lg border border-border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  <div className="flex items-center mb-4">
                    <Trophy size={24} className="text-primary mr-3" />
                    <h2 className="text-xl font-bold">Achievements</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center bg-card-dark rounded-lg p-3 border border-border">
                      <div className="h-12 w-12 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-4">
                        <Award size={24} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">First Workout</p>
                        <p className="text-sm text-gray-400">Completed your first workout session</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center bg-card-dark rounded-lg p-3 border border-border">
                      <div className="h-12 w-12 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-4">
                        <Target size={24} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Perfect Form</p>
                        <p className="text-sm text-gray-400">Achieved 95% form accuracy</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center bg-card-dark bg-opacity-50 rounded-lg p-3 border border-border border-opacity-50">
                      <div className="h-12 w-12 rounded-full bg-gray-600 bg-opacity-20 flex items-center justify-center mr-4">
                        <Flame size={24} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">3-Day Streak</p>
                        <p className="text-sm text-gray-500">Work out for 3 days in a row</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Stats card */}
                <motion.div 
                  className="bg-card-bg rounded-lg p-6 shadow-lg md:col-span-2 border border-border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  data-aos="fade-up"
                  data-aos-delay="300"
                >
                  <div className="flex items-center mb-6">
                    <BarChart2 size={24} className="text-primary mr-3" />
                    <h2 className="text-xl font-bold">Workout Statistics</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card-dark rounded-lg p-4 border border-border">
                      <p className="text-gray-400 text-sm mb-1">Average Accuracy</p>
                      <p className="text-3xl font-bold">87%</p>
                      <div className="h-2 bg-background rounded-full mt-2">
                        <div className="h-2 bg-primary rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    
                    <div className="bg-card-dark rounded-lg p-4 border border-border">
                      <p className="text-gray-400 text-sm mb-1">Most Practiced</p>
                      <p className="text-xl font-bold">Squats</p>
                      <p className="text-sm text-gray-400 mt-1">8 sessions</p>
                    </div>
                    
                    <div className="bg-card-dark rounded-lg p-4 border border-border">
                      <p className="text-gray-400 text-sm mb-1">Total Time</p>
                      <p className="text-3xl font-bold">3.5h</p>
                      <p className="text-sm text-gray-400 mt-1">This month</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      <Chatbot />
    </div>
  );
}