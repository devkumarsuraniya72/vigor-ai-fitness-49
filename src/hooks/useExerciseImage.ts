import { getExerciseImage } from '@/lib/exerciseImages';

// Simple hook that returns the static exercise image
// No AI generation - uses curated images only
export function useExerciseImage(exerciseName: string) {
  const imageUrl = getExerciseImage(exerciseName);

  return { 
    imageUrl, 
    isGenerating: false, 
    isFallback: false,
    error: null 
  };
}
