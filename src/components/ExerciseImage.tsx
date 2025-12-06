import { useExerciseImage } from '@/hooks/useExerciseImage';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ExerciseImageProps {
  exerciseName: string;
  className?: string;
}

export function ExerciseImage({ exerciseName, className }: ExerciseImageProps) {
  const { imageUrl, isGenerating } = useExerciseImage(exerciseName);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isGenerating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Generating AI image...</span>
          </div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={`${exerciseName} exercise demonstration`}
        className="h-full w-full object-cover"
        loading="eager"
      />
    </div>
  );
}
