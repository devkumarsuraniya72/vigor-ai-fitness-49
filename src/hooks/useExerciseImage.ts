import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getExerciseImage } from '@/lib/exerciseImages';

// Cache for generated images to avoid regenerating
const imageCache: Record<string, string> = {};

export function useExerciseImage(exerciseName: string) {
  const [imageUrl, setImageUrl] = useState<string>(() => getExerciseImage(exerciseName));
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset to fallback when exercise changes
    setImageUrl(getExerciseImage(exerciseName));
    setError(null);

    // Check cache first
    if (imageCache[exerciseName]) {
      setImageUrl(imageCache[exerciseName]);
      return;
    }

    // Generate AI image
    const generateImage = async () => {
      setIsGenerating(true);
      try {
        const { data, error: fnError } = await supabase.functions.invoke('generate-exercise-image', {
          body: { exerciseName },
        });

        if (fnError) {
          console.error('Edge function error:', fnError);
          setError(fnError.message);
          return;
        }

        if (data?.error) {
          console.error('Image generation error:', data.error);
          setError(data.error);
          return;
        }

        if (data?.imageUrl) {
          imageCache[exerciseName] = data.imageUrl;
          setImageUrl(data.imageUrl);
        }
      } catch (err) {
        console.error('Failed to generate exercise image:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate image');
      } finally {
        setIsGenerating(false);
      }
    };

    generateImage();
  }, [exerciseName]);

  return { imageUrl, isGenerating, error };
}
