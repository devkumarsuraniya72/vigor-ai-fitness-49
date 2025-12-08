import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getExerciseImage } from '@/lib/exerciseImages';

// Cache for images to avoid regenerating
const imageCache: Record<string, string> = {};
// Track which exercises we've already attempted to generate
const attemptedExercises = new Set<string>();

interface AIImageResponse {
  ok: boolean;
  fallback: boolean;
  code: number;
  message: string;
  data: {
    imageUrl: string;
    exerciseName: string;
  };
}

export function useExerciseImage(exerciseName: string) {
  const [imageUrl, setImageUrl] = useState<string>(() => 
    imageCache[exerciseName] || getExerciseImage(exerciseName)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // If we have a cached image, use it
    if (imageCache[exerciseName]) {
      setImageUrl(imageCache[exerciseName]);
      setIsFallback(false);
      return;
    }

    // If we've already attempted this exercise, use fallback
    if (attemptedExercises.has(exerciseName)) {
      setImageUrl(getExerciseImage(exerciseName));
      setIsFallback(true);
      return;
    }

    // Mark as attempted and try to generate
    attemptedExercises.add(exerciseName);
    
    const generateImage = async () => {
      setIsGenerating(true);
      
      try {
        const { data, error } = await supabase.functions.invoke<AIImageResponse>('generate-exercise-image', {
          body: { exerciseName },
        });

        if (!mountedRef.current) return;

        // Handle invoke error
        if (error) {
          console.log('Edge function error, using fallback:', error.message);
          setImageUrl(getExerciseImage(exerciseName));
          setIsFallback(true);
          return;
        }

        // The edge function ALWAYS returns ok: true with fallback info
        if (data?.ok && data?.data?.imageUrl) {
          const url = data.data.imageUrl;
          imageCache[exerciseName] = url;
          setImageUrl(url);
          setIsFallback(data.fallback || false);
          
          if (data.fallback) {
            console.log(`Using fallback image for ${exerciseName}: ${data.message}`);
          }
        } else {
          // Unexpected response format, use fallback
          setImageUrl(getExerciseImage(exerciseName));
          setIsFallback(true);
        }
      } catch (err) {
        console.error('Failed to generate exercise image:', err);
        if (mountedRef.current) {
          setImageUrl(getExerciseImage(exerciseName));
          setIsFallback(true);
        }
      } finally {
        if (mountedRef.current) {
          setIsGenerating(false);
        }
      }
    };

    generateImage();
  }, [exerciseName]);

  return { 
    imageUrl, 
    isGenerating, 
    isFallback,
    error: null 
  };
}
