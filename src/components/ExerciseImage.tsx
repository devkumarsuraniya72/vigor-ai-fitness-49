import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getExerciseImage } from '@/lib/exerciseImages';

interface ExerciseImageProps {
  exerciseName: string;
  className?: string;
}

export function ExerciseImage({ exerciseName, className }: ExerciseImageProps) {
  const [imgError, setImgError] = useState(false);
  
  // Get the static image for this exercise
  const imageUrl = getExerciseImage(exerciseName);
  
  // If primary image fails, use the default fitness image
  const fallbackUrl = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop';
  const displayUrl = imgError ? fallbackUrl : imageUrl;

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
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
