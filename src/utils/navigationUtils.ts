/**
 * Navigation utility functions for the AI Workout Trainer app
 */

/**
 * Navigate to the workout trainer page with a smooth loading transition
 * This sets a flag in localStorage that will be checked by App.tsx
 * to bypass the initial app loading screen, but still show the trainer loading animation
 * @returns The path to navigate to
 */
export const navigateToTrainerWithoutLoading = () => {
  // Set flag in localStorage to skip app loading but show trainer loading
  localStorage.setItem('skipLoading', 'true');
  
  // Don't set skipTrainerLoading to true, so the trainer loading animation will show
  
  // Return the path instead of redirecting directly
  return '/trainer';
}; 

/**
 * Navigate to the workout trainer page with no loading screens
 * This bypasses both the app loading and the trainer loading screens
 * @returns The path to navigate to
 */
export const navigateToTrainerWithNoAnimations = () => {
  // Set flags to skip both loading screens
  localStorage.setItem('skipLoading', 'true');
  localStorage.setItem('skipTrainerLoading', 'true');
  
  // Return the path
  return '/trainer';
}; 