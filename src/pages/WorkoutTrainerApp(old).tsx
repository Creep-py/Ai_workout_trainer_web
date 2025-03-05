import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { 
  Activity, 
  Dumbbell, 
  BarChart2, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Settings, 
  ChevronDown, 
  ChevronUp,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

// Import utility functions
import { calculateAngles, calculateAccuracy, generateFeedback } from '../utils/poseUtils';
import ModelLoadingIndicator from '../components/ModelLoadingIndicator';

// Define exercise types and their ideal angles
const EXERCISES = {
  squats: {
    name: 'Squats',
    description: 'A compound exercise that targets the quadriceps, hamstrings, and glutes.',
    idealAngles: {
      Hip: 90,
      Knee: 90,
      Elbow: 180,
      Shoulder: 180
    },
    instructions: [
      'Stand with feet shoulder-width apart',
      'Keep your back straight',
      'Lower your body as if sitting in a chair',
      'Keep knees aligned with toes',
      'Return to starting position'
    ]
  },
  pushups: {
    name: 'Push-ups',
    description: 'A compound exercise that targets the chest, shoulders, and triceps.',
    idealAngles: {
      Hip: 180,
      Knee: 180,
      Elbow: 90,
      Shoulder: 45
    },
    instructions: [
      'Start in a plank position with hands slightly wider than shoulders',
      'Keep your body in a straight line',
      'Lower your chest to the ground',
      'Push back up to starting position',
      'Keep core engaged throughout'
    ]
  },
  lunges: {
    name: 'Lunges',
    description: 'A unilateral exercise that targets the quadriceps, hamstrings, and glutes.',
    idealAngles: {
      Hip: 120,
      Knee: 90,
      Elbow: 180,
      Shoulder: 180
    },
    instructions: [
      'Stand with feet hip-width apart',
      'Step forward with one leg',
      'Lower your body until both knees are bent at 90 degrees',
      'Keep front knee aligned with ankle',
      'Push back to starting position'
    ]
  }
};

// Preload TensorFlow.js in the background
const preloadTensorFlow = () => {
  // Start loading TensorFlow.js in the background
  tf.ready().then(() => {
    console.log('TensorFlow.js preloaded successfully');
  }).catch(error => {
    console.error('Error preloading TensorFlow.js:', error);
  });
};

// Call preload function immediately
preloadTensorFlow();

export default function WorkoutTrainerApp() {
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<keyof typeof EXERCISES>('squats');
  const [angles, setAngles] = useState({ Hip: 180, Knee: 180, Elbow: 180, Shoulder: 180 });
  const [accuracy, setAccuracy] = useState({ Hip: 0, Knee: 0, Elbow: 0, Shoulder: 0 });
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string, status: 'good' | 'warning' | 'error' }[]>([]);
  const [status, setStatus] = useState<'CORRECT' | 'ADJUST' | 'INCORRECT'>('CORRECT');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [isInBottomPosition, setIsInBottomPosition] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Load TensorFlow.js and MoveNet model with progressive loading
  useEffect(() => {
    let isMounted = true;
    
    const loadModel = async () => {
      try {
        // Check if TensorFlow is already loaded
        if (!tf.getBackend()) {
          await tf.setBackend('webgl');
          await tf.ready();
        }
        
        console.log('TensorFlow.js loaded successfully');
        
        // Only continue if component is still mounted
        if (!isMounted) return;
        
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
          minPoseScore: 0.25
        };
        
        const detector = await poseDetection.createDetector(model, detectorConfig);
        
        // Only set state if component is still mounted
        if (isMounted) {
          setDetector(detector);
          setIsModelLoading(false);
          console.log('MoveNet model loaded successfully');
        }
      } catch (error) {
        console.error('Error loading TensorFlow.js or MoveNet model:', error);
        // Only set state if component is still mounted
        if (isMounted) {
          setIsModelLoading(false);
        }
      }
    };
    
    // Start loading the model
    loadModel();
    
    return () => {
      isMounted = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
  
  // Start/stop pose detection
  const toggleDetection = () => {
    if (isDetecting) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined;
      }
      setIsDetecting(false);
    } else {
      setIsDetecting(true);
      detectPose();
    }
  };
  
  // Reset the workout
  const resetWorkout = () => {
    setRepCount(0);
    setIsInBottomPosition(false);
    setOverallAccuracy(0);
  };
  
  // Detect pose from webcam feed
  const detectPose = async () => {
    if (!detector || !webcamRef.current || !webcamRef.current.video || !canvasRef.current) {
      requestRef.current = requestAnimationFrame(detectPose);
      return;
    }
    
    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Make sure video is ready
    if (video.readyState !== 4) {
      requestRef.current = requestAnimationFrame(detectPose);
      return;
    }
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    try {
      // Detect poses
      const poses = await detector.estimatePoses(video);
      
      if (poses.length > 0) {
        const pose = poses[0];
        
        // Draw pose on canvas
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw keypoints
          pose.keypoints.forEach(keypoint => {
            if (keypoint.score && keypoint.score > 0.3) {
              ctx.beginPath();
              ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = '#6d28d9';
              ctx.fill();
            }
          });
          
          // Draw connections
          const connections = [
            ['nose', 'left_eye'], ['nose', 'right_eye'],
            ['left_eye', 'left_ear'], ['right_eye', 'right_ear'],
            ['left_shoulder', 'right_shoulder'],
            ['left_shoulder', 'left_elbow'], ['right_shoulder', 'right_elbow'],
            ['left_elbow', 'left_wrist'], ['right_elbow', 'right_wrist'],
            ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
            ['left_hip', 'right_hip'],
            ['left_hip', 'left_knee'], ['right_hip', 'right_knee'],
            ['left_knee', 'left_ankle'], ['right_knee', 'right_ankle']
          ];
          
          connections.forEach(([from, to]) => {
            const fromKeypoint = pose.keypoints.find(kp => kp.name === from);
            const toKeypoint = pose.keypoints.find(kp => kp.name === to);
            
            if (fromKeypoint && toKeypoint && 
                fromKeypoint.score && fromKeypoint.score > 0.3 && 
                toKeypoint.score && toKeypoint.score > 0.3) {
              ctx.beginPath();
              ctx.moveTo(fromKeypoint.x, fromKeypoint.y);
              ctx.lineTo(toKeypoint.x, toKeypoint.y);
              ctx.lineWidth = 2;
              ctx.strokeStyle = '#8b5cf6';
              ctx.stroke();
            }
          });
        }
        
        // Calculate joint angles
        const calculatedAngles = calculateAngles(pose.keypoints);
        setAngles(calculatedAngles);
        
        // Calculate accuracy compared to ideal angles
        const idealAngles = EXERCISES[currentExercise].idealAngles;
        const calculatedAccuracy = calculateAccuracy(calculatedAngles, idealAngles);
        setAccuracy(calculatedAccuracy);
        
        // Calculate overall accuracy
        const avgAccuracy = Object.values(calculatedAccuracy).reduce((sum, val) => sum + val, 0) / Object.values(calculatedAccuracy).length;
        setOverallAccuracy(Math.round(avgAccuracy));
        
        // Generate feedback
        const feedbackItems = generateFeedback(calculatedAngles, idealAngles, calculatedAccuracy, pose.keypoints);
        setFeedback(feedbackItems);
        
        // Determine status based on overall accuracy
        if (avgAccuracy >= 80) {
          setStatus('CORRECT');
        } else if (avgAccuracy >= 60) {
          setStatus('ADJUST');
        } else {
          setStatus('INCORRECT');
        }
        
        // Count reps for squats
        if (currentExercise === 'squats') {
          const kneeAngle = calculatedAngles.Knee;
          
          // Bottom position of squat (knees bent)
          if (kneeAngle < 110 && !isInBottomPosition) {
            setIsInBottomPosition(true);
          }
          
          // Top position of squat (standing up)
          if (kneeAngle > 160 && isInBottomPosition) {
            setIsInBottomPosition(false);
            setRepCount(prev => prev + 1);
          }
        }
      }
    } catch (error) {
      console.error('Error detecting pose:', error);
    }
    
    requestRef.current = requestAnimationFrame(detectPose);
  };
  
  // Change exercise
  const handleExerciseChange = (exercise: keyof typeof EXERCISES) => {
    setCurrentExercise(exercise);
    resetWorkout();
  };
  
  // Render loading state
  if (isModelLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">AI Workout Trainer</h1>
            <p className="text-gray-400">Preparing your personalized workout experience</p>
          </div>
          
          <div className="grid place-items-center py-12">
            <ModelLoadingIndicator message="Loading AI workout analysis model..." />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background pt-6 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Exercise selection and instructions */}
          <div className="lg:col-span-1">
            <motion.div 
              className="bg-card-bg rounded-lg overflow-hidden shadow-lg border border-border mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Exercise</h2>
                  <button 
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="p-2 rounded-full hover:bg-card-dark transition-colors"
                  >
                    {isSettingsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
                
                {isSettingsOpen && (
                  <div className="mb-4 space-y-2">
                    {Object.keys(EXERCISES).map((exercise) => (
                      <button
                        key={exercise}
                        onClick={() => handleExerciseChange(exercise as keyof typeof EXERCISES)}
                        className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                          currentExercise === exercise 
                            ? 'bg-primary text-white' 
                            : 'bg-card-dark hover:bg-opacity-80'
                        }`}
                      >
                        {EXERCISES[exercise as keyof typeof EXERCISES].name}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center mb-2">
                  <Dumbbell size={20} className="text-primary mr-2" />
                  <h3 className="text-lg font-semibold">{EXERCISES[currentExercise].name}</h3>
                </div>
                
                <p className="text-gray-400 mb-4">{EXERCISES[currentExercise].description}</p>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Instructions:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {EXERCISES[currentExercise].instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block h-5 w-5 rounded-full bg-primary bg-opacity-20 text-primary text-xs flex items-center justify-center mr-2 mt-0.5">
                          {index + 1}
                        </span>
                        {instruction}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={toggleDetection}
                    className={`flex-1 btn ${isDetecting ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {isDetecting ? (
                      <>
                        <Pause size={18} className="mr-2" /> Pause
                      </>
                    ) : (
                      <>
                        <Play size={18} className="mr-2" /> Start
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={resetWorkout}
                    className="btn btn-secondary"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
            
            {/* Rep counter */}
            <motion.div 
              className="bg-card-bg rounded-lg overflow-hidden shadow-lg border border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Activity size={24} className="text-primary mr-3" />
                  <h2 className="text-xl font-bold">Workout Progress</h2>
                </div>
                
                <div className="flex items-center justify-between mb-4 bg-card-dark p-4 rounded-lg border border-border">
                  <div>
                    <p className="text-gray-400 text-sm">Reps Completed</p>
                    <p className="text-3xl font-bold">{repCount}</p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                    <Dumbbell size={24} className="text-primary" />
                  </div>
                </div>
                
                <div className="bg-card-dark p-4 rounded-lg border border-border">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Average Accuracy</span>
                    <span className="text-sm font-medium">{overallAccuracy}%</span>
                  </div>
                  <div className="h-2 bg-background rounded-full">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        overallAccuracy >= 80 ? 'bg-green-500' : 
                        overallAccuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${overallAccuracy}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Center column - Video feed */}
          <div className="lg:col-span-2">
            <motion.div 
              className="bg-card-bg rounded-lg overflow-hidden shadow-lg border border-border mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Live Pose Detection</h2>
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${isDetecting ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    <span className="text-sm">{isDetecting ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <Webcam
                    ref={webcamRef}
                    mirrored={true}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                  />
                  
                  {!isDetecting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                      <button
                        onClick={toggleDetection}
                        className="btn btn-primary"
                      >
                        <Play size={18} className="mr-2" /> Start Detection
                      </button>
                    </div>
                  )}
                  
                  {/* Status indicator */}
                  <div className="absolute top-4 right-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      status === 'CORRECT' ? 'bg-green-500 bg-opacity-90' : 
                      status === 'ADJUST' ? 'bg-yellow-500 bg-opacity-90' : 'bg-red-500 bg-opacity-90'
                    }`}>
                      {status}
                    </div>
                  </div>
                  
                  {/* Rep counter */}
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-card-bg bg-opacity-90 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <div className="flex items-center">
                        <Dumbbell size={16} className="text-primary mr-2" />
                        <span className="font-bold">{repCount}</span>
                        <span className="text-sm text-gray-400 ml-1">reps</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Joint angles and feedback */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div 
                className="bg-card-bg rounded-lg overflow-hidden shadow-lg border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <BarChart2 size={24} className="text-primary mr-3" />
                    <h2 className="text-xl font-bold">Joint Angles</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(angles).map(([joint, angle]) => (
                      <div key={joint}>
                        <div className="flex justify-between mb-1">
                          <span>{joint}: {angle}°</span>
                          <span>{accuracy[joint as keyof typeof accuracy]}%</span>
                        </div>
                        <div className="h-2 bg-card-dark rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              accuracy[joint as keyof typeof accuracy] >= 80 ? 'bg-green-500' : 
                              accuracy[joint as keyof typeof accuracy] >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${accuracy[joint as keyof typeof accuracy]}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-card-bg rounded-lg overflow-hidden shadow-lg border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Info size={24} className="text-primary mr-3" />
                    <h2 className="text-xl font-bold">Feedback</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {feedback.length > 0 ? (
                      feedback.map((item, index) => (
                        <div key={index} className="flex items-start">
                          {item.status === 'good' ? (
                            <CheckCircle size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          ) : item.status === 'warning' ? (
                            <AlertCircle size={18} className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                          ) : (
                            <AlertCircle size={18} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                          )}
                          <p className={`text-sm ${
                            item.status === 'good' ? 'text-green-500' : 
                            item.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {item.text}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">Start the detection to get real-time feedback on your form.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}