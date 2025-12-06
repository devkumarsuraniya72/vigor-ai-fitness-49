import { getExerciseImage } from '@/lib/exerciseImages';

// AI image generation is disabled until credits are available
// This hook simply returns the static fallback images
export function useExerciseImage(exerciseName: string) {
  const imageUrl = getExerciseImage(exerciseName);
  
  return { 
    imageUrl, 
    isGenerating: false, 
    error: null 
  };
}
