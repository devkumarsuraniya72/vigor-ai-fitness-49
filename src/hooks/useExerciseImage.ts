import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getExerciseImage } from '@/lib/exerciseImages';

// Cache for generated images to avoid regenerating
const imageCache: Record<string, string> = {};
// Track if we've hit credit limits to stop trying
let creditsExhausted = false;

export function useExerciseImage(exerciseName: string) {
  const [imageUrl, setImageUrl] = useState<string>(() => getExerciseImage(exerciseName));
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attemptedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Reset to fallback when exercise changes
    const fallbackUrl = getExerciseImage(exerciseName);
    setImageUrl(fallbackUrl);
    setError(null);

    // Check cache first
    if (imageCache[exerciseName]) {
      setImageUrl(imageCache[exerciseName]);
      return;
    }

    // Don't try to generate if credits are exhausted or already attempted
    if (creditsExhausted || attemptedRef.current.has(exerciseName)) {
      return;
    }

    // Generate AI image
    const generateImage = async () => {
      attemptedRef.current.add(exerciseName);
      setIsGenerating(true);
      
      try {
        const { data, error: fnError } = await supabase.functions.invoke('generate-exercise-image', {
          body: { exerciseName },
        });

        if (fnError) {
          // Check for credit/payment errors
          const errorStr = fnError.message || String(fnError);
          if (errorStr.includes('402') || errorStr.includes('credits') || errorStr.includes('Payment')) {
            creditsExhausted = true;
            console.log('AI credits exhausted, using static images');
          }
          return;
        }

        if (data?.error) {
          if (data.error.includes('credits') || data.error.includes('402')) {
            creditsExhausted = true;
            console.log('AI credits exhausted, using static images');
          }
          return;
        }

        if (data?.imageUrl) {
          imageCache[exerciseName] = data.imageUrl;
          setImageUrl(data.imageUrl);
        }
      } catch (err) {
        console.error('Failed to generate exercise image:', err);
      } finally {
        setIsGenerating(false);
      }
    };

    generateImage();
  }, [exerciseName]);

  return { imageUrl, isGenerating, error };
}
