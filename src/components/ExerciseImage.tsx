import { useState } from 'react';
import { useExerciseImage } from '@/hooks/useExerciseImage';
import { cn } from '@/lib/utils';
import { getExerciseImage } from '@/lib/exerciseImages';

interface ExerciseImageProps {
  exerciseName: string;
  className?: string;
}

export function ExerciseImage({ exerciseName, className }: ExerciseImageProps) {
  const { imageUrl, isGenerating, isFallback } = useExerciseImage(exerciseName);
  const [imgError, setImgError] = useState(false);

  // If image fails to load, use static fallback
  const displayUrl = imgError ? getExerciseImage(exerciseName) : imageUrl;

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {isGenerating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      )}
      <img
        src={displayUrl}
        alt={`${exerciseName} exercise demonstration`}
        className="h-full w-full object-cover"
        loading="eager"
        onError={() => setImgError(true)}
      />
    </div>
  );
}
