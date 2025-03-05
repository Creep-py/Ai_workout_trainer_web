import * as poseDetection from '@tensorflow-models/pose-detection';

type Keypoint = poseDetection.Keypoint;
type KeypointWithName = Keypoint & { name?: string };

interface Angles {
  Hip: number;
  Knee: number;
  Elbow: number;
  Shoulder: number;
  [key: string]: number;
}

interface Accuracy {
  Hip: number;
  Knee: number;
  Elbow: number;
  Shoulder: number;
  [key: string]: number;
}

interface FeedbackItem {
  text: string;
  status: 'good' | 'warning' | 'error';
}

// Calculate angle between three points
function calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  
  return angle;
}

// Check if a keypoint is visible with higher threshold for stability
function isVisible(keypoint: KeypointWithName | undefined): boolean {
  return keypoint !== undefined && keypoint.score !== undefined && keypoint.score > 0.3; // Increased threshold
}

// Apply smoothing to keypoints to reduce jitter
// function smoothKeypoints(keypoints: KeypointWithName[], previousKeypoints: KeypointWithName[] | null, smoothingFactor: number = 0.4): KeypointWithName[] {
//   if (!previousKeypoints) return keypoints;
  
//   return keypoints.map((keypoint, index) => {
//     const prevKeypoint = previousKeypoints.find(kp => kp.name === keypoint.name);
//     if (!prevKeypoint) return keypoint;
    
//     return {
//       ...keypoint,
//       x: prevKeypoint.x * smoothingFactor + keypoint.x * (1 - smoothingFactor),
//       y: prevKeypoint.y * smoothingFactor + keypoint.y * (1 - smoothingFactor),
//     };
//   });
// }

// Store previous keypoints for smoothing
// let previousKeypoints: KeypointWithName[] | null = null;

// Calculate joint angles from keypoints
export function calculateAngles(keypoints: KeypointWithName[]): Angles {
  // Apply smoothing for stability
  // const smoothedKeypoints = smoothKeypoints(keypoints, previousKeypoints);
  // previousKeypoints = smoothedKeypoints;
  
  const findKeypoint = (name: string) => keypoints.find(kp => kp.name === name);
  
  const nose = findKeypoint('nose');
  const leftEye = findKeypoint('left_eye');
  const rightEye = findKeypoint('right_eye');
  const leftEar = findKeypoint('left_ear');
  const rightEar = findKeypoint('right_ear');
  const leftShoulder = findKeypoint('left_shoulder');
  const rightShoulder = findKeypoint('right_shoulder');
  const leftElbow = findKeypoint('left_elbow');
  const rightElbow = findKeypoint('right_elbow');
  const leftWrist = findKeypoint('left_wrist');
  const rightWrist = findKeypoint('right_wrist');
  const leftHip = findKeypoint('left_hip');
  const rightHip = findKeypoint('right_hip');
  const leftKnee = findKeypoint('left_knee');
  const rightKnee = findKeypoint('right_knee');
  const leftAnkle = findKeypoint('left_ankle');
  const rightAnkle = findKeypoint('right_ankle');
  
  let hipAngle = 180;
  let kneeAngle = 180;
  let elbowAngle = 180;
  let shoulderAngle = 180;
  
  // Calculate hip angle (between shoulder, hip, and knee)
  if (isVisible(leftShoulder) && isVisible(leftHip) && isVisible(leftKnee)) {
    hipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
  } else if (isVisible(rightShoulder) && isVisible(rightHip) && isVisible(rightKnee)) {
    hipAngle = calculateAngle(rightShoulder, rightHip, rightKnee);
  }
  
  // Calculate knee angle (between hip, knee, and ankle)
  if (isVisible(leftHip) && isVisible(leftKnee) && isVisible(leftAnkle)) {
    kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  } else if (isVisible(rightHip) && isVisible(rightKnee) && isVisible(rightAnkle)) {
    kneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  }
  
  // Calculate elbow angle (between shoulder, elbow, and wrist)
  if (isVisible(leftShoulder) && isVisible(leftElbow) && isVisible(leftWrist)) {
    elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  } else if (isVisible(rightShoulder) && isVisible(rightElbow) && isVisible(rightWrist)) {
    elbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  }
  
  // Calculate shoulder angle (between hip, shoulder, and elbow)
  if (isVisible(leftHip) && isVisible(leftShoulder) && isVisible(leftElbow)) {
    shoulderAngle = calculateAngle(leftHip, leftShoulder, leftElbow);
  } else if (isVisible(rightHip) && isVisible(rightShoulder) && isVisible(rightElbow)) {
    shoulderAngle = calculateAngle(rightHip, rightShoulder, rightElbow);
  }
  
  // Round angles for stability and readability
  return {
    Hip: Math.round(hipAngle),
    Knee: Math.round(kneeAngle),
    Elbow: Math.round(elbowAngle),
    Shoulder: Math.round(shoulderAngle)
  };
}

// Calculate accuracy compared to ideal angles
export function calculateAccuracy(angles: Angles, idealAngles: Angles): Accuracy {
  const accuracy: Accuracy = {
    Hip: 0,
    Knee: 0,
    Elbow: 0,
    Shoulder: 0
  };
  
  // Calculate accuracy for each joint
  for (const joint in idealAngles) {
    const ideal = idealAngles[joint];
    const actual = angles[joint];
    const diff = Math.abs(ideal - actual);
    
    // Convert difference to accuracy percentage
    // If difference is 0, accuracy is 100%
    // If difference is 45 degrees or more, accuracy is 0%
    const maxDiff = 45;
    accuracy[joint] = Math.max(0, Math.round(100 - (diff / maxDiff) * 100));
  }
  
  return accuracy;
}

// Check if the person is properly visible in the frame
function isPersonProperlyVisible(keypoints: KeypointWithName[]): boolean {
  // Count visible keypoints with higher threshold for reliability
  const visibleKeypoints = keypoints.filter(kp => kp.score && kp.score > 0.5).length;
  
  // If less than 12 keypoints are visible, the person is not properly in frame
  return visibleKeypoints >= 12;
}

// Check if the person is too close or too far from the camera
function checkPersonDistance(keypoints: KeypointWithName[]): 'ok' | 'too_close' | 'too_far' {
  const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
  const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
  
  if (!leftShoulder || !rightShoulder || leftShoulder.score < 0.5 || rightShoulder.score < 0.5) {
    return 'ok'; // Can't determine
  }
  
  // Calculate shoulder width in pixels
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
  
  // Estimate based on shoulder width
  if (shoulderWidth < 50) {
    return 'too_far';
  } else if (shoulderWidth > 200) {
    return 'too_close';
  }
  
  return 'ok';
}

// Check if the spine is straight
function checkSpineStraightness(keypoints: KeypointWithName[]): number {
  const nose = keypoints.find(kp => kp.name === 'nose');
  const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
  const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
  const leftHip = keypoints.find(kp => kp.name === 'left_hip');
  const rightHip = keypoints.find(kp => kp.name === 'right_hip');
  
  if (!nose || !leftShoulder || !rightShoulder || !leftHip || !rightHip ||
      nose.score < 0.5 || leftShoulder.score < 0.5 || rightShoulder.score < 0.5 ||
      leftHip.score < 0.5 || rightHip.score < 0.5) {
    return 100; // Can't determine
  }
  
  // Calculate midpoints
  const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
  const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const midHipX = (leftHip.x + rightHip.x) / 2;
  const midHipY = (leftHip.y + rightHip.y) / 2;
  
  // Calculate vertical alignment
  const verticalDiff = Math.abs(midShoulderX - midHipX);
  const height = Math.abs(midShoulderY - midHipY);
  
  // Calculate straightness as a percentage (0% = completely bent, 100% = perfectly straight)
  const maxAllowedDiff = height * 0.3; // Allow up to 30% deviation
  const straightness = Math.max(0, 100 - (verticalDiff / maxAllowedDiff) * 100);
  
  return Math.min(100, Math.round(straightness));
}

// Generate feedback based on angles, accuracy, and keypoints
export function generateFeedback(
  angles: Angles, 
  idealAngles: Angles, 
  accuracy: Accuracy,
  keypoints: KeypointWithName[]
): FeedbackItem[] {
  const feedback: FeedbackItem[] = [];
  
  // Check if person is properly visible
  if (!isPersonProperlyVisible(keypoints)) {
    feedback.push({
      text: 'Position yourself properly in front of the camera',
      status: 'error'
    });
    return feedback; // Return early if person isn't visible
  }
  
  // Check distance from camera
  const distanceCheck = checkPersonDistance(keypoints);
  if (distanceCheck === 'too_close') {
    feedback.push({
      text: 'Move back from the camera to fit your entire body',
      status: 'warning'
    });
  } else if (distanceCheck === 'too_far') {
    feedback.push({
      text: 'Move closer to the camera for better detection',
      status: 'warning'
    });
  }
  
  // Check spine straightness
  const spineStr = checkSpineStraightness(keypoints);
  if (spineStr < 70) {
    feedback.push({
      text: 'Straighten your back for proper posture',
      status: 'error'
    });
  } else if (spineStr < 85) {
    feedback.push({
      text: 'Try to keep your back straighter',
      status: 'warning'
    });
  } else {
    feedback.push({
      text: 'Back is straight, good job!',
      status: 'good'
    });
  }
  
  // Generate correction angle for each joint
  const joints = [
    { name: 'Hip', verb: 'Move', direction: 'hip' },
    { name: 'Knee', verb: 'Bend', direction: 'knee' },
    { name: 'Elbow', verb: 'Bend', direction: 'elbow' },
    { name: 'Shoulder', verb: 'Adjust', direction: 'shoulder' }
  ];
  
  // Add feedback for each joint with low accuracy
  joints.forEach(joint => {
    const jointName = joint.name;
    const accuracyValue = accuracy[jointName];
    
    if (accuracyValue < 85) {
      const actual = angles[jointName];
      const ideal = idealAngles[jointName];
      const diff = ideal - actual;
      const direction = diff > 0 ? 'more' : 'less';
      const severity = accuracyValue < 50 ? 'error' : 'warning';
      
      feedback.push({
        text: `${joint.verb} your ${joint.direction} ${direction} (${Math.abs(Math.round(diff))}°)`,
        status: severity
      });
    } else {
      feedback.push({
        text: `${jointName} angle is correct`,
        status: 'good'
      });
    }
  });
  
  return feedback;
}