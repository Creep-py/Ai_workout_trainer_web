import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { Play, Pause, SkipBack, SkipForward, Upload, RefreshCw, Plus, ChevronDown, X, FolderOpen, Dumbbell, Trash2 } from 'lucide-react';
import { calculateAngles, calculateAccuracy, generateFeedback } from '../utils/poseUtils';
import './WorkoutTrainerApp.css';
import { createPortal } from 'react-dom';

function App() {
  // State for webcam and pose detection
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trainerJointCanvasRef = useRef<HTMLCanvasElement>(null);
  const traineeJointCanvasRef = useRef<HTMLCanvasElement>(null);
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isTrainerReady, setIsTrainerReady] = useState<boolean>(false);
  
  // State for trainer video
  const trainerVideoRef = useRef<HTMLVideoElement>(null);
  const trainerCanvasRef = useRef<HTMLCanvasElement>(null);
  const [trainerVideoUrl, setTrainerVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trainerPose, setTrainerPose] = useState<poseDetection.Pose | null>(null);
  const [trainerAngles, setTrainerAngles] = useState<{
    Hip: number;
    Knee: number;
    Elbow: number;
    Shoulder: number;
  }>({
    Hip: 120,
    Knee: 145,
    Elbow: 90,
    Shoulder: 180
  });
  
  // State for pose data with debouncing
  const [postureAccuracy, setPostureAccuracy] = useState(85);
  const [postureStatus, setPostureStatus] = useState('CORRECT');
  const [jointAngles, setJointAngles] = useState([
    { joint: 'Hip', angle: 120, accuracy: 85 },
    { joint: 'Knee', angle: 145, accuracy: 45 },
    { joint: 'Elbow', angle: 90, accuracy: 65 },
    { joint: 'Shoulder', angle: 180, accuracy: 75 }
  ]);
  const [feedbackItems, setFeedbackItems] = useState<{text: string, status: 'good' | 'warning' | 'error'}[]>([
    { text: 'Position yourself in front of the camera', status: 'warning' }
  ]);
  
  // Current trainee pose
  const [traineePose, setTraineePose] = useState<poseDetection.Pose | null>(null);
  
  // Training state
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showVideoControls, setShowVideoControls] = useState(false);
  
  // Exercise categories
  interface ExerciseVideo {
    name: string;
    url: string;
  }
  
  interface ExerciseCategory {
    name: string;
    videos: ExerciseVideo[];
  }
  
  const [exerciseCategories, setExerciseCategories] = useState<ExerciseCategory[]>(() => {
    // Load from localStorage if available
    const savedCategories = localStorage.getItem('exerciseCategories');
    return savedCategories ? JSON.parse(savedCategories) : [
      { name: 'Squats', videos: [] },
      { name: 'Strength Training', videos: [] },
      { name: 'Cardio', videos: [] }
    ];
  });
  
  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('exerciseCategories', JSON.stringify(exerciseCategories));
  }, [exerciseCategories]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    // Get the first category name or empty string if no categories
    const savedCategories = localStorage.getItem('exerciseCategories');
    if (savedCategories) {
      const categories = JSON.parse(savedCategories);
      return categories.length > 0 ? categories[0].name : '';
    }
    return 'Squats'; // Default to first category
  });
  
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Video management
  const [showVideoDropdown, setShowVideoDropdown] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ExerciseVideo | null>(null);
  
  // Refs for debouncing
  const lastUpdateTime = useRef(0);
  const pendingData = useRef<{
    angles: any,
    accuracy: any,
    minAccuracy: number,
    feedback: any
  } | null>(null);
  
  // Refs for dropdowns
  const videoBtnRef = useRef<HTMLButtonElement>(null);
  const videoDropdownRef = useRef<HTMLDivElement>(null);
  const categoryBtnRef = useRef<HTMLButtonElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  
  // Initialize TensorFlow.js and pose detector
  useEffect(() => {
    const initTF = async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        console.log('TensorFlow.js initialized with WebGL backend');
        
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
          modelUrl: undefined
        };
        
        const detector = await poseDetection.createDetector(model, detectorConfig);
        setDetector(detector);
        console.log('Pose detector initialized');
        setCameraActive(true);
      } catch (error) {
        console.error('Error initializing pose detector:', error);
      }
    };
    
    initTF();
    
    return () => {
      // Cleanup
      if (detector) {
        detector.dispose?.();
      }
    };
  }, []);
  
  // Add scroll effect to navbar
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        if (window.scrollY > 10) {
          headerRef.current.classList.add('scrolled');
        } else {
          headerRef.current.classList.remove('scrolled');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Analyze trainer video when it's loaded
  useEffect(() => {
    if (!trainerVideoUrl || !detector || !trainerVideoRef.current) return;
    
    const analyzeTrainerVideo = async () => {
      if (!trainerVideoRef.current || !detector) return;
      
      // Give time for the trainer to get into position
      setIsTrainerReady(false);
      
      // Pause at a good frame for analysis (3 seconds in)
      trainerVideoRef.current.currentTime = 3.0;
      
      // Wait for the video to seek
      await new Promise(resolve => {
        const handleSeeked = () => {
          trainerVideoRef.current?.removeEventListener('seeked', handleSeeked);
          resolve(null);
        };
        trainerVideoRef.current?.addEventListener('seeked', handleSeeked);
      });
      
      try {
        // Detect pose in the trainer video
        const poses = await detector.estimatePoses(trainerVideoRef.current);
        
        if (poses.length > 0) {
          const pose = poses[0];
          setTrainerPose(pose);
          
          // Calculate ideal angles from trainer pose
          const angles = calculateAngles(pose.keypoints);
          setTrainerAngles(angles);
          
          // Draw pose on trainer canvas
          if (trainerCanvasRef.current) {
            drawPoseOnCanvas(pose, trainerCanvasRef.current, true);
          }
          
          // Draw pose on trainer joint canvas
          if (trainerJointCanvasRef.current) {
            drawJointLinesOnCanvas(pose, trainerJointCanvasRef.current, true);
          }
          
          setIsTrainerReady(true);
        }
      } catch (error) {
        console.error('Error analyzing trainer video:', error);
      }
    };
    
    analyzeTrainerVideo();
    
    // Add event listener for timeupdate to continuously update trainer pose during playback
    const updateTrainerPoseDuringPlayback = async () => {
      if (!trainerVideoRef.current || !detector || !isPlaying) return;
      
      try {
        const poses = await detector.estimatePoses(trainerVideoRef.current);
        
        if (poses.length > 0) {
          const pose = poses[0];
          setTrainerPose(pose);
          
          // Update trainer angles
          const angles = calculateAngles(pose.keypoints);
          setTrainerAngles(angles);
          
          // Draw updated pose on trainer canvas
          if (trainerCanvasRef.current) {
            drawPoseOnCanvas(pose, trainerCanvasRef.current, true);
          }
          
          // Draw updated pose on trainer joint canvas
          if (trainerJointCanvasRef.current) {
            drawJointLinesOnCanvas(pose, trainerJointCanvasRef.current, true);
          }
        }
      } catch (error) {
        console.error('Error updating trainer pose during playback:', error);
      }
    };
    
    const videoElement = trainerVideoRef.current;
    videoElement.addEventListener('timeupdate', updateTrainerPoseDuringPlayback);
    
    return () => {
      videoElement.removeEventListener('timeupdate', updateTrainerPoseDuringPlayback);
    };
  }, [trainerVideoUrl, detector, isPlaying]);
  
  // Helper function to draw joint lines only on canvas with black background
  const drawJointLinesOnCanvas = (pose: poseDetection.Pose, canvas: HTMLCanvasElement, isTrainer: boolean = false) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = 300;
    canvas.height = 300;
    
    // Fill with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Scale keypoints to fit the canvas
    const keypoints = pose.keypoints;
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = 0;
    let maxY = 0;
    
    // Find the bounds of the pose
    keypoints.forEach(keypoint => {
      if (keypoint.score && keypoint.score > 0.3) {
        minX = Math.min(minX, keypoint.x);
        minY = Math.min(minY, keypoint.y);
        maxX = Math.max(maxX, keypoint.x);
        maxY = Math.max(maxY, keypoint.y);
      }
    });
    
    // Calculate scale and offset to center the pose
    const poseWidth = maxX - minX;
    const poseHeight = maxY - minY;
    const scale = Math.min(
      (canvas.width * 0.8) / poseWidth,
      (canvas.height * 0.8) / poseHeight
    );
    
    const offsetX = (canvas.width - poseWidth * scale) / 2;
    const offsetY = (canvas.height - poseHeight * scale) / 2;
    
    // Define connections for drawing skeleton
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
    
    // Draw connections
    connections.forEach(([from, to]) => {
      const fromKeypoint = pose.keypoints.find(kp => kp.name === from);
      const toKeypoint = pose.keypoints.find(kp => kp.name === to);
      
      if (
        fromKeypoint && 
        toKeypoint && 
        fromKeypoint.score && 
        toKeypoint.score && 
        fromKeypoint.score > 0.3 && 
        toKeypoint.score > 0.3
      ) {
        ctx.beginPath();
        
        // Scale and center the coordinates
        let fromX = (fromKeypoint.x - minX) * scale + offsetX;
        let fromY = (fromKeypoint.y - minY) * scale + offsetY;
        let toX = (toKeypoint.x - minX) * scale + offsetX;
        let toY = (toKeypoint.y - minY) * scale + offsetY;
        
        // For trainee, flip horizontally to correct mirror effect
        if (!isTrainer) {
          fromX = canvas.width - fromX;
          toX = canvas.width - toX;
        }
        
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.lineWidth = isTrainer ? 6 : 5; // Thicker lines for better visibility
        ctx.strokeStyle = isTrainer ? '#FF0000' : '#38B2AC'; // Red for trainer, teal for trainee
        ctx.stroke();
      }
    });
    
    // Draw keypoints
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score && keypoint.score > 0.3) {
        ctx.beginPath();
        
        // Scale and center the coordinates
        let x = (keypoint.x - minX) * scale + offsetX;
        let y = (keypoint.y - minY) * scale + offsetY;
        
        // For trainee, flip horizontally to correct mirror effect
        if (!isTrainer) {
          x = canvas.width - x;
        }
        
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = isTrainer ? '#FF6B6B' : '#4FD1C5';
        ctx.fill();
      }
    });
  };
  
  // Helper function to draw pose on canvas with colored lines
  const drawPoseOnCanvas = (pose: poseDetection.Pose, canvas: HTMLCanvasElement, isTrainer: boolean = false, accuracyData: any = null) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match video or webcam
    const videoElement = isTrainer ? trainerVideoRef.current : webcamRef.current?.video;
    if (videoElement) {
      canvas.width = videoElement.videoWidth || videoElement.width;
      canvas.height = videoElement.videoHeight || videoElement.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw keypoints
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score && keypoint.score > 0.3) {
        ctx.beginPath();
        
        // For trainee, flip horizontally to correct mirror effect
        let x = keypoint.x;
        if (!isTrainer) {
          x = canvas.width - x;
        }
        
        ctx.arc(x, keypoint.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = isTrainer ? '#FF6B6B' : '#38B2AC';
        ctx.fill();
      }
    });
    
    // Define connections for drawing skeleton
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
    
    // Map body parts to joint names for coloring
    const bodyPartToJoint: {[key: string]: string} = {
      'left_shoulder': 'Shoulder', 'right_shoulder': 'Shoulder',
      'left_elbow': 'Elbow', 'right_elbow': 'Elbow',
      'left_hip': 'Hip', 'right_hip': 'Hip',
      'left_knee': 'Knee', 'right_knee': 'Knee'
    };
    
    // Draw connections with color based on accuracy
    connections.forEach(([from, to]) => {
      const fromKeypoint = pose.keypoints.find(kp => kp.name === from);
      const toKeypoint = pose.keypoints.find(kp => kp.name === to);
      
      if (
        fromKeypoint && 
        toKeypoint && 
        fromKeypoint.score && 
        toKeypoint.score && 
        fromKeypoint.score > 0.3 && 
        toKeypoint.score > 0.3
      ) {
        ctx.beginPath();
        
        // For trainee, flip horizontally to correct mirror effect
        let fromX = fromKeypoint.x;
        let toX = toKeypoint.x;
        
        if (!isTrainer) {
          fromX = canvas.width - fromX;
          toX = canvas.width - toX;
        }
        
        ctx.moveTo(fromX, fromKeypoint.y);
        ctx.lineTo(toX, toKeypoint.y);
        ctx.lineWidth = isTrainer ? 6 : 5; // Thicker lines for better visibility
        
        // Determine line color based on accuracy if available
        if (!isTrainer && accuracyData && (from in bodyPartToJoint || to in bodyPartToJoint)) {
          const jointName = bodyPartToJoint[from] || bodyPartToJoint[to];
          const accuracy = accuracyData[jointName] || 0;
          
          if (accuracy >= 85) {
            ctx.strokeStyle = '#48BB78'; // Green for good
          }
            else if (accuracy >= 50) {
              ctx.strokeStyle = '#ECC94B'; // Yellow for warning
    
          } else {
            ctx.strokeStyle = '#F56565'; // Red for error
          }
        } else {
          // Default color for trainer or when accuracy is not available
          ctx.strokeStyle = isTrainer ? '#FF0000' : '#38B2AC'; // Red for trainer
        }
        
        ctx.stroke();
      }
    });
  };
  
  // Update UI with debounced data
  const updateUIWithData = useCallback((data: any) => {
    setJointAngles([
      { joint: 'Hip', angle: Math.round(data.angles.Hip), accuracy: data.accuracy.Hip },
      { joint: 'Knee', angle: Math.round(data.angles.Knee), accuracy: data.accuracy.Knee },
      { joint: 'Elbow', angle: Math.round(data.angles.Elbow), accuracy: data.accuracy.Elbow },
      { joint: 'Shoulder', angle: Math.round(data.angles.Shoulder), accuracy: data.accuracy.Shoulder }
    ]);
    
    setPostureAccuracy(data.minAccuracy);
    
    // Update posture status based on minimum accuracy
    if (data.minAccuracy >= 85) {
      setPostureStatus('CORRECT');
    } else {
      setPostureStatus('INCORRECT');
    }
    
    // Split feedback into two sections
    const goodFeedback = data.feedback.filter((item: any) => item.status === 'good');
    const improvementFeedback = data.feedback.filter((item: any) => item.status === 'warning' || item.status === 'error');
    
    // Combine them with section headers
    const organizedFeedback = [
      { text: 'Good Form:', status: 'good' as const },
      ...goodFeedback,
      { text: 'Needs Improvement:', status: 'warning' as const },
      ...improvementFeedback
    ];
    
    // Update feedback
    setFeedbackItems(organizedFeedback);
  }, []);
  
  // Process debounced updates
  useEffect(() => {
    const processDebounce = () => {
      const now = Date.now();
      
      // If there's pending data and enough time has passed since the last update
      if (pendingData.current && now - lastUpdateTime.current > 500) {
        updateUIWithData(pendingData.current);
        lastUpdateTime.current = now;
        pendingData.current = null;
      }
      
      requestAnimationFrame(processDebounce);
    };
    
    const animationFrameId = requestAnimationFrame(processDebounce);
    return () => cancelAnimationFrame(animationFrameId);
  }, [updateUIWithData]);
  
  // Start pose detection loop
  useEffect(() => {
    let animationFrameId: number;
    
    const detectPose = async () => {
      try {
        if (
          isDetecting &&
          detector &&
          webcamRef.current &&
          webcamRef.current.video &&
          webcamRef.current.video.readyState === 4 &&
          canvasRef.current
        ) {
          const video = webcamRef.current.video;
          const canvas = canvasRef.current;
          
          // Detect poses
          const poses = await detector.estimatePoses(video);
          
          if (poses.length > 0) {
            const pose = poses[0];
            setTraineePose(pose);
            
            // Calculate joint angles
            const angles = calculateAngles(pose.keypoints);
            
            // Calculate accuracy compared to ideal angles (either from trainer or default)
            const idealAngles = trainerPose ? trainerAngles : {
              Hip: 120,
              Knee: 145,
              Elbow: 90,
              Shoulder: 180
            };
            
            const accuracy = calculateAccuracy(angles, idealAngles);
            
            // Find minimum accuracy for overall score
            const minAccuracy = Math.min(
              accuracy.Hip, 
              accuracy.Knee, 
              accuracy.Elbow,
              // accuracy.Shoulder
            );
            
            // Generate feedback
            const feedback = generateFeedback(angles, idealAngles, accuracy, pose.keypoints);
            
            // Draw pose on canvas with colored lines based on accuracy
            drawPoseOnCanvas(pose, canvas, false, accuracy);
            
            // Update trainee joint lines canvas
            if (traineeJointCanvasRef.current) {
              drawJointLinesOnCanvas(pose, traineeJointCanvasRef.current, false);
            }
            
            // Only update UI if training is active
            if (isTraining) {
              // Store data for debounced update
              pendingData.current = {
                angles,
                accuracy,
                minAccuracy,
                feedback
              };
            }
          } else {
            // No pose detected
            if (isTraining) {
              pendingData.current = {
                angles: { Hip: 0, Knee: 0, Elbow: 0, Shoulder: 0 },
                accuracy: { Hip: 0, Knee: 0, Elbow: 0, Shoulder: 0 },
                minAccuracy: 0,
                feedback: [
                  { text: 'No person detected. Position yourself in front of the camera.', status: 'error' }
                ]
              };
            }
          }
        } else if (webcamRef.current && !webcamRef.current.video) {
          // Camera not available
          if (isTraining) {
            pendingData.current = {
              angles: { Hip: 0, Knee: 0, Elbow: 0, Shoulder: 0 },
              accuracy: { Hip: 0, Knee: 0, Elbow: 0, Shoulder: 0 },
              minAccuracy: 0,
              feedback: [
                { text: 'Camera not available. Please allow camera access.', status: 'error' }
              ]
            };
          }
        }
      } catch (error) {
        console.error('Error in pose detection:', error);
      }
      
      animationFrameId = requestAnimationFrame(detectPose);
    };
    
    if (isDetecting) {
      detectPose();
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isDetecting, detector, trainerPose, trainerAngles, isTraining]);
  
  // Handle trainer video upload
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      
      // Add to current category's videos
      const updatedCategories = exerciseCategories.map(category => {
        if (category.name === selectedCategory) {
          return {
            ...category,
            videos: [...category.videos, { name: file.name, url }]
          };
        }
        return category;
      });
      
      setExerciseCategories(updatedCategories);
      setShowVideoDropdown(false);
    }
  };
  
  // Load a previously uploaded video
  const loadVideo = (video: ExerciseVideo) => {
    setTrainerVideoUrl(video.url);
    setSelectedVideo(video);
    setIsPlaying(false);
    if (trainerVideoRef.current) {
      trainerVideoRef.current.currentTime = 0;
    }
    setShowVideoDropdown(false);
  };
  
  // Video control handlers
  const togglePlayPause = () => {
    if (!isTraining) {
      alert('Please click "Start Training" first to begin the session.');
      return;
    }
    
    if (trainerVideoRef.current) {
      if (isPlaying) {
        trainerVideoRef.current.pause();
        setIsPlaying(false);
      } else {
        trainerVideoRef.current.play();
        setIsPlaying(true);
      }
    }
  };
  
  const skipBackward = () => {
    if (trainerVideoRef.current) {
      trainerVideoRef.current.currentTime -= 5;
    }
  };
  
  const skipForward = () => {
    if (trainerVideoRef.current) {
      trainerVideoRef.current.currentTime += 5;
    }
  };
  
  // Start training
  const startTraining = () => {
    if (!trainerVideoUrl) {
      alert('Please load a trainer video first to start training.');
      return;
    }
    
    // Start countdown
    setShowCountdown(true);
    setCountdownValue(10);
    
    const countdownInterval = setInterval(() => {
      setCountdownValue(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setShowCountdown(false);
          setIsTraining(true);
          // Don't auto-play, let user control playback
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Stop training
  const stopTraining = () => {
    setIsTraining(false);
    if (trainerVideoRef.current) {
      trainerVideoRef.current.pause();
    }
    setIsPlaying(false);
    
    // Reset UI
    setPostureAccuracy(85);
    setPostureStatus('CORRECT');
    setJointAngles([
      { joint: 'Hip', angle: 120, accuracy: 85 },
      { joint: 'Knee', angle: 145, accuracy: 45 },
      { joint: 'Elbow', angle: 90, accuracy: 65 },
      { joint: 'Shoulder', angle: 180, accuracy: 75 }
    ]);
    setFeedbackItems([
      { text: 'Position yourself in front of the camera', status: 'warning' }
    ]);
  };
  
  // Reset webcam and pose detection
  const resetCamera = () => {
    // Stop current detection and training
    setIsDetecting(false);
    setIsTraining(false);
    
    // Clear canvases
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    if (trainerJointCanvasRef.current) {
      const ctx = trainerJointCanvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, trainerJointCanvasRef.current.width, trainerJointCanvasRef.current.height);
    }
    
    if (traineeJointCanvasRef.current) {
      const ctx = traineeJointCanvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, traineeJointCanvasRef.current.width, traineeJointCanvasRef.current.height);
    }
    
    // Reset trainer video
    if (trainerVideoRef.current) {
      trainerVideoRef.current.pause();
      setIsPlaying(false);
    }
    
    // Reset states
    setTrainerVideoUrl(null);
    setSelectedVideo(null);
    setTraineePose(null);
    setTrainerPose(null);
    setPostureAccuracy(85);
    setPostureStatus('CORRECT');
    setJointAngles([
      { joint: 'Hip', angle: 120, accuracy: 85 },
      { joint: 'Knee', angle: 145, accuracy: 45 },
      { joint: 'Elbow', angle: 90, accuracy: 65 },
      { joint: 'Shoulder', angle: 180, accuracy: 75 }
    ]);
    setFeedbackItems([
      { text: 'Position yourself in front of the camera', status: 'warning' }
    ]);
    
    // Restart detection after a short delay
    setTimeout(() => {
      setIsDetecting(true);
    }, 500);
  };
  
  // Add new exercise category
  const addNewCategory = () => {
    if (newCategoryName.trim() === '') return;
    
    setExerciseCategories(prev => [
      ...prev,
      { name: newCategoryName, videos: [] }
    ]);
    
    setNewCategoryName('');
    setShowAddCategoryModal(false);
  };
  
  // Get current category's videos
  const getCurrentCategoryVideos = () => {
    const category = exerciseCategories.find(cat => cat.name === selectedCategory);
    return category ? category.videos : [];
  };

  // Delete a video from a category
  const deleteVideo = (videoName: string) => {
    if (confirm(`Are you sure you want to delete the video "${videoName}"?`)) {
      const updatedCategories = exerciseCategories.map(category => {
        if (category.name === selectedCategory) {
          return {
            ...category,
            videos: category.videos.filter(video => video.name !== videoName)
          };
        }
        return category;
      });
      
      setExerciseCategories(updatedCategories);
      
      // If the deleted video was selected, reset the selection
      if (selectedVideo && selectedVideo.name === videoName) {
        setSelectedVideo(null);
        setTrainerVideoUrl(null);
      }
    }
  };
  
  // Delete a category
  const deleteCategory = (categoryName: string) => {
    if (exerciseCategories.length <= 1) {
      alert("You cannot delete the last category. Please create a new category first.");
      return;
    }
    
    if (confirm(`Are you sure you want to delete the category "${categoryName}" and all its videos?`)) {
      const updatedCategories = exerciseCategories.filter(
        category => category.name !== categoryName
      );
      
      setExerciseCategories(updatedCategories);
      
      // If the deleted category was selected, select the first available category
      if (selectedCategory === categoryName) {
        setSelectedCategory(updatedCategories[0].name);
        setSelectedVideo(null);
        setTrainerVideoUrl(null);
      }
    }
  };

  // Create a Portal component for dropdowns
  const DropdownPortal: React.FC<{ children: React.ReactNode; isOpen: boolean }> = ({ children, isOpen }) => {
    if (!isOpen) return null;
    
    return createPortal(
      children,
      document.getElementById('portal-root') || document.body
    );
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close video dropdown if clicking outside
      if (
        showVideoDropdown &&
        videoBtnRef.current &&
        videoDropdownRef.current &&
        !videoBtnRef.current.contains(event.target as Node) &&
        !videoDropdownRef.current.contains(event.target as Node)
      ) {
        setShowVideoDropdown(false);
      }
      
      // Close category dropdown if clicking outside
      if (
        showCategoryDropdown &&
        categoryBtnRef.current &&
        categoryDropdownRef.current &&
        !categoryBtnRef.current.contains(event.target as Node) &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVideoDropdown, showCategoryDropdown]);

  // Update dropdown positions when buttons are resized or window is resized
  useEffect(() => {
    const updateDropdownPositions = () => {
      // Don't force re-render as this causes flickering
      // Just update the state if needed
    };
    
    window.addEventListener('resize', updateDropdownPositions);
    return () => {
      window.removeEventListener('resize', updateDropdownPositions);
    };
  }, [showVideoDropdown, showCategoryDropdown]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header ref={headerRef} className="navbar-container">
        {/* Header glow effects */}
        <div className="absolute -top-20 left-1/3 w-64 h-64 bg-blue-500 rounded-full filter blur-[100px] opacity-20"></div>
        <div className="absolute -top-10 right-1/4 w-40 h-40 bg-purple-500 rounded-full filter blur-[80px] opacity-10"></div>
        
        <div className="container mx-auto py-3 px-4 sm:px-6">
          <div className="flex items-center justify-between relative z-[100]">
            {/* Logo and title */}
            <div className="navbar-logo">
              <Dumbbell size={24} className="navbar-logo-icon" />
              <h1 className="navbar-logo-text text-xl">AI Workout Trainer</h1>
            </div>
            
            {/* Controls */}
            <div className="navbar-controls">
              <div className="dropdown-container">
                <button 
                  ref={videoBtnRef}
                  onClick={() => setShowVideoDropdown(!showVideoDropdown)}
                  className="glow-button bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-all text-sm sm:text-base"
                >
                  <Upload size={16} className="mr-2" />
                  <span className="hidden sm:inline">{selectedVideo ? "Change Video" : "Upload Video"}</span>
                  <span className="sm:hidden">Video</span>
                </button>
                
                {showVideoDropdown && (
                  <div 
                    ref={videoDropdownRef}
                    className="dropdown-menu bg-black border border-[#1A202C] rounded-md shadow-lg overflow-hidden backdrop-blur-md bg-opacity-90 shadow-[0_0_20px_rgba(56,178,172,0.3)]"
                    style={{
                      position: 'fixed',
                      width: '16rem',
                      maxHeight: '80vh',
                      top: videoBtnRef.current ? videoBtnRef.current.getBoundingClientRect().bottom + 8 : 0,
                      left: videoBtnRef.current ? videoBtnRef.current.getBoundingClientRect().left : 0,
                      zIndex: 9999
                    }}
                  >
                    <div className="p-2 border-b border-[#1A202C] bg-black/50">
                      <label className="inline-flex items-center w-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-medium py-2 px-4 rounded-md transition-colors cursor-pointer">
                        <Upload size={16} className="mr-2" />
                        <span>Upload New Video</span>
                        <input 
                          type="file" 
                          accept="video/*" 
                          className="hidden" 
                          onChange={handleVideoUpload}
                        />
                      </label>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {getCurrentCategoryVideos().length > 0 ? (
                        getCurrentCategoryVideos().map((video, index) => (
                          <div 
                            key={index} 
                            className="p-2 border-b border-[#1A202C] hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-purple-900/30 cursor-pointer flex justify-between items-center group"
                          >
                            <span 
                              className="truncate group-hover:text-blue-400 transition-colors flex-grow"
                              onClick={() => loadVideo(video)}
                            >
                              {video.name}
                            </span>
                            <div className="flex items-center">
                              <button 
                                className="text-blue-400 hover:text-blue-300 mr-2"
                                onClick={() => loadVideo(video)}
                              >
                                Load
                              </button>
                              <button 
                                className="text-red-400 hover:text-red-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteVideo(video.name);
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-400">
                          No videos in this category
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="dropdown-container">
                <button 
                  ref={categoryBtnRef}
                  className="glow-button bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white py-2 px-4 rounded-md flex items-center justify-center transition-all text-sm sm:text-base"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <FolderOpen size={16} className="mr-2" />
                  <span className="hidden sm:inline">{selectedCategory || "Select Category"}</span>
                  <span className="sm:hidden">Category</span>
                  <ChevronDown size={16} className="ml-2" />
                </button>
                
                {showCategoryDropdown && (
                  <div 
                    ref={categoryDropdownRef}
                    className="dropdown-menu bg-black border border-[#1A202C] rounded-md shadow-lg overflow-hidden backdrop-blur-md bg-opacity-90 shadow-[0_0_20px_rgba(56,178,172,0.3)]"
                    style={{
                      position: 'fixed',
                      width: '16rem',
                      maxHeight: '80vh',
                      top: categoryBtnRef.current ? categoryBtnRef.current.getBoundingClientRect().bottom + 8 : 0,
                      left: categoryBtnRef.current ? categoryBtnRef.current.getBoundingClientRect().left : 0,
                      zIndex: 9999
                    }}
                  >
                    {exerciseCategories.length > 0 ? (
                      exerciseCategories.map((category, index) => (
                        <div 
                          key={index}
                          className="p-2 border-b border-[#1A202C] hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-purple-900/30 cursor-pointer flex items-center justify-between group"
                        >
                          <span 
                            className="truncate group-hover:text-blue-400 transition-colors flex-grow"
                            onClick={() => {
                              setSelectedCategory(category.name);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            {category.name}
                          </span>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">{category.videos?.length || 0} videos</span>
                            {exerciseCategories.length > 1 && (
                              <button 
                                className="text-red-400 hover:text-red-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCategory(category.name);
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-gray-400">
                        No categories found
                      </div>
                    )}
                    
                    {/* Add New Category button */}
                    <div 
                      className="p-2 border-t border-[#2D3748] hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-purple-900/30 cursor-pointer flex items-center text-blue-400"
                      onClick={() => {
                        setShowCategoryDropdown(false);
                        setShowAddCategoryModal(true);
                      }}
                    >
                      <Plus size={16} className="mr-2" />
                      Add New Category
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 p-4 flex flex-col gap-4 relative">
        {/* Background glow effects */}
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[150px] opacity-10 z-0"></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-blue-500 rounded-full filter blur-[120px] opacity-10 z-0"></div>
        
        {/* Video panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">
          {/* Left panel - Trainer video */}
          <div className="neon-panel rounded-lg overflow-hidden flex flex-col">
            <div className="p-2 border-b border-[#2D3748]/50 bg-black/50">
              <p className="neon-blue-text text-sm text-center font-medium">
                {selectedVideo ? `Trainer Video: ${selectedVideo.name}` : "Trainer Video Preview"}
              </p>
            </div>
            <div 
              className="flex-1 bg-black/70 m-2 rounded-lg flex items-center justify-center relative"
              onMouseEnter={() => setShowVideoControls(true)}
              onMouseLeave={() => setShowVideoControls(false)}
            >
              {trainerVideoUrl ? (
                <>
                  <video 
                    ref={trainerVideoRef}
                    src={trainerVideoUrl}
                    className="max-h-full max-w-full"
                    onEnded={() => setIsPlaying(false)}
                    playsInline
                  />
                  <canvas
                    ref={trainerCanvasRef}
                    className="absolute top-0 left-0 w-full h-full object-contain"
                  />
                  {!isTrainerReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                      <p className="text-white">Analyzing trainer pose...</p>
                    </div>
                  )}
                  
                  {/* Video controls overlay */}
                  {showVideoControls && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2 flex justify-center items-center space-x-4 backdrop-blur-sm">
                      <button 
                        className="text-white hover:text-blue-400 transition-colors"
                        onClick={skipBackward}
                      >
                        <SkipBack size={20} />
                      </button>
                      <button 
                        className="text-white hover:text-blue-400 transition-colors"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                      </button>
                      <button 
                        className="text-white hover:text-blue-400 transition-colors"
                        onClick={skipForward}
                      >
                        <SkipForward size={20} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[#A0AEC0]">No trainer video loaded</p>
              )}
            </div>
          </div>

          {/* Middle panel - Joint line comparison */}
          <div className="neon-panel rounded-lg overflow-hidden flex flex-col">
            <div className="p-2 border-b border-[#2D3748]/50 bg-black/50">
              <p className="neon-blue-text text-sm text-center font-medium">Joint Line Comparison</p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2 m-2">
              {/* Trainer joint lines */}
              <div className="bg-black/70 rounded-lg flex items-center justify-center relative border border-[#2D3748]/30">
                <p className="text-blue-400 absolute top-2 left-2 text-xs font-medium">Trainer Joint Lines</p>
                <canvas
                  ref={trainerJointCanvasRef}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Trainee joint lines */}
              <div className="bg-black/70 rounded-lg flex items-center justify-center relative border border-[#2D3748]/30">
                <p className="text-blue-400 absolute top-2 left-2 text-xs font-medium">Trainee Joint Lines</p>
                <canvas
                  ref={traineeJointCanvasRef}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Right panel - Trainee video */}
          <div className="neon-panel rounded-lg overflow-hidden flex flex-col">
            <div className="p-2 border-b border-[#2D3748]/50 bg-black/50">
              <p className="neon-blue-text text-sm font-medium">Position yourself in front of the camera</p>
            </div>
            <div className="flex-1 bg-black/70 m-2 rounded-lg flex items-center justify-center relative">
              <Webcam
                ref={webcamRef}
                mirrored
                className="absolute top-0 left-0 w-full h-full object-contain"
                onLoadedMetadata={() => setIsDetecting(true)}
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: "user"
                }}
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full object-contain z-10"
              />
              {!cameraActive && (
                <p className="text-[#A0AEC0] z-20">Loading camera...</p>
              )}
              
              {/* Countdown overlay */}
              {showCountdown && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-30 backdrop-blur-sm">
                  <div className="text-center">
                    <p className="text-white text-lg mb-2">Get ready!</p>
                    <p className="text-white text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-teal-400">{countdownValue}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-2 flex justify-center space-x-4">
              <button 
                className={`${isTraining ? 'glow-button-red bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' : 'glow-button bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500'} text-white py-2 px-4 rounded-md flex items-center justify-center transition-all`}
                onClick={isTraining ? stopTraining : startTraining}
              >
                {isTraining ? "Stop Training" : "Start Training"}
              </button>
              <button 
                className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white py-2 px-4 rounded-md flex items-center justify-center transition-all border border-gray-600"
                onClick={resetCamera}
              >
                <RefreshCw size={16} className="mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Feedback and metrics section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">
          {/* Feedback panel - Split into two sections */}
          <div className="neon-panel rounded-lg p-3 lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Feedback section 1 - Good form */}
            <div>
              <h2 className="text-lg font-semibold mb-2 gradient-text-blue">Good Form Feedback</h2>
              <div className="max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                <ul className="space-y-2">
                  {feedbackItems
                    .filter(item => item.status === 'good')
                    .map((item, index) => (
                      <li key={index} className="flex items-start bg-black/40 p-2 rounded-md border border-green-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        <span className="inline-block w-2 h-2 rounded-full mr-2 mt-1.5 bg-green-500 shadow-[0_0_5px_rgba(16,185,129,0.7)]"></span>
                        <span className="text-base font-medium text-green-100">{item.text}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
            
            {/* Feedback section 2 - Needs improvement */}
            <div>
              <h2 className="text-lg font-semibold mb-2 gradient-text-purple">Improvement Feedback</h2>
              <div className="max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                <ul className="space-y-2">
                  {feedbackItems
                    .filter(item => item.status === 'warning' || item.status === 'error')
                    .map((item, index) => (
                      <li key={index} className={`flex items-start p-2 rounded-md border ${
                        item.status === 'warning' ? 'bg-black/40 border-yellow-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'bg-black/40 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                      }`}>
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 mt-1.5 ${
                          item.status === 'warning' ? 'bg-yellow-500 shadow-[0_0_5px_rgba(245,158,11,0.7)]' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.7)]'
                        }`}></span>
                        <span className="text-base font-medium">{item.text}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Metrics panel */}
          <div className="neon-panel rounded-lg p-3">
            <div className="grid grid-cols-1 gap-4">
              {/* Posture accuracy and status */}
              <div>
                <div className="posture-accuracy">
                  <h2 className="text-xl font-semibold neon-purple-text">Posture Accuracy</h2>
                  <div className="posture-accuracy-value">{postureAccuracy}%</div>
                </div>
                
                <div className="mt-2">
                  <h2 className="text-xl font-semibold neon-purple-text">Posture Status</h2>
                  <div className={postureStatus === 'CORRECT' ? 'posture-status-correct' : 'posture-status-incorrect'}>
                    {postureStatus}
                  </div>
                </div>
              </div>

              {/* Joint angles */}
              <div>
                <div className="flex justify-between mb-2">
                  <h2 className="text-xl font-semibold neon-purple-text">Joint Angles</h2>
                  <h2 className="text-xl font-semibold neon-purple-text">Accuracy</h2>
                </div>
                
                <div className="space-y-4 mt-4">
                  {jointAngles.map((item, index) => (
                    <div key={index} className="joint-angle-container">
                      <div className="flex justify-between mb-1">
                        <span className="joint-angle-label">{item.joint}: {item.angle}°</span>
                        <span className="joint-angle-value">{item.accuracy}%</span>
                      </div>
                      <div className="joint-angle-progress-container">
                        <div 
                          className={
                            item.accuracy >= 85 ? 'joint-angle-progress-good' : 
                            item.accuracy >= 50 ? 'joint-angle-progress-warning' : 'joint-angle-progress-error'
                          } 
                          style={{ width: `${item.accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-[10000]">
          <div className="bg-black p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Add New Category</h2>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="w-full p-2 bg-black border border-gray-700 rounded-md text-white"
            />
            <div className="mt-4 flex justify-end">
              <button
                className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white py-2 px-4 rounded-md"
                onClick={addNewCategory}
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;