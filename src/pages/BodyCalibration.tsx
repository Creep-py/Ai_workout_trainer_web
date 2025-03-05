import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, User, Ruler, Weight, Grape as Tape } from 'lucide-react';
import { useUser } from '../context/UserContext';
import Logo from '../components/Logo';

export default function BodyCalibration() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    hipSize: '',
    chestSize: '',
    neckSize: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { updateUserData } = useUser();
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const nextStep = () => {
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data with body measurements
      updateUserData({
        age: parseInt(formData.age),
        gender: formData.gender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        hipSize: parseFloat(formData.hipSize),
        chestSize: parseFloat(formData.chestSize),
        neckSize: parseFloat(formData.neckSize)
      });
      
      console.log('Redirecting to landing page');
      // Redirect to landing page (root route) using window.location
      window.location.href = '/';
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-1">
                  Age
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="age"
                    id="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                    required
                  />
                </div>
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
                  required
                >
                  <option value="" disabled>Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              
              <div className="pt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full btn btn-primary"
                >
                  Next <ArrowRight size={18} className="ml-2" />
                </button>
              </div>
            </div>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4">Body Measurements</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-300 mb-1">
                  Height (cm)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Ruler size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="height"
                    id="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Enter your height in cm"
                    min="50"
                    max="250"
                    step="0.1"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-1">
                  Weight (kg)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Weight size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="weight"
                    id="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Enter your weight in kg"
                    min="20"
                    max="300"
                    step="0.1"
                    required
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-1/2 btn btn-secondary"
                >
                  <ArrowLeft size={18} className="mr-2" /> Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-1/2 btn btn-primary"
                >
                  Next <ArrowRight size={18} className="ml-2" />
                </button>
              </div>
            </div>
          </motion.div>
        );
        
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4">Additional Measurements</h3>
            <p className="text-gray-400 text-sm mb-4">
              These measurements help us provide more accurate pose estimation and feedback.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="hipSize" className="block text-sm font-medium text-gray-300 mb-1">
                  Hip Size (cm)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tape size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="hipSize"
                    id="hipSize"
                    value={formData.hipSize}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Enter your hip size in cm"
                    min="50"
                    max="200"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="chestSize" className="block text-sm font-medium text-gray-300 mb-1">
                  Chest Size (cm)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tape size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="chestSize"
                    id="chestSize"
                    value={formData.chestSize}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Enter your chest size in cm"
                    min="50"
                    max="200"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="neckSize" className="block text-sm font-medium text-gray-300 mb-1">
                  Neck Size (cm)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tape size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="neckSize"
                    id="neckSize"
                    value={formData.neckSize}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Enter your neck size in cm"
                    min="20"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-1/2 btn btn-secondary"
                >
                  <ArrowLeft size={18} className="mr-2" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-1/2 btn btn-primary"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <>Complete <ArrowRight size={18} className="ml-2" /></>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
         );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Body Calibration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Help us personalize your workout experience
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-card-bg py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Basic Info</span>
              <span>Body Measurements</span>
              <span>Additional</span>
            </div>
            <div className="h-2 bg-card-dark rounded-full">
              <div 
                className="h-2 bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {renderStep()}
          </form>
        </div>
      </div>
      
      <div className="mt-8 text-center relative z-10">
        <p className="text-sm text-gray-400">
          Your data is securely stored and will only be used to improve your workout experience.
        </p>
      </div>
    </div>
  );
}