import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback images mapped by exercise type/name
const fallbackImages: Record<string, string> = {
  'Squats': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=600&fit=crop',
  'Alternate Lunges': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&h=600&fit=crop',
  'Glute Bridge': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop',
  'Plank': 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=800&h=600&fit=crop',
  'Bicycle Crunches': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
  'Leg Raises': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
  'Russian Twist': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop',
  'Side Plank': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop',
  'Push-ups': 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&h=600&fit=crop',
  'Tricep Dips': 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=800&h=600&fit=crop',
  'Arm Circles': 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=800&h=600&fit=crop',
  'Jumping Jacks': 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800&h=600&fit=crop',
  'Mountain Climbers': 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800&h=600&fit=crop',
  'High Knees': 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=600&fit=crop',
  'Burpees': 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&h=600&fit=crop',
};

const defaultFallbackImage = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop';

function getFallbackImage(exerciseName: string): string {
  return fallbackImages[exerciseName] || defaultFallbackImage;
}

interface ImageResponse {
  ok: boolean;
  fallback: boolean;
  code: number;
  message: string;
  data: {
    imageUrl: string;
    exerciseName: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { exerciseName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!exerciseName) {
      const response: ImageResponse = {
        ok: true,
        fallback: true,
        code: 400,
        message: 'Exercise name is required',
        data: {
          imageUrl: defaultFallbackImage,
          exerciseName: 'Unknown'
        }
      };
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // If no API key, return fallback immediately
    if (!LOVABLE_API_KEY) {
      console.log('LOVABLE_API_KEY not configured, using fallback image');
      const response: ImageResponse = {
        ok: true,
        fallback: true,
        code: 200,
        message: 'Using fallback image (API not configured)',
        data: {
          imageUrl: getFallbackImage(exerciseName),
          exerciseName
        }
      };
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const prompt = `Generate a realistic fitness illustration of a person demonstrating the "${exerciseName}" exercise with correct form. Show a fit person in athletic wear performing the exercise in a modern dark gym with subtle blue and purple neon accent lighting. The image should be clear, instructional, and inspiring. Clean composition, professional fitness photography style.`;

      console.log('Attempting AI image generation for:', exerciseName);

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image',
          messages: [{ role: 'user', content: prompt }],
          modalities: ['image', 'text'],
        }),
      });

      // Handle rate limit (429)
      if (response.status === 429) {
        console.log('Rate limit hit, using fallback image');
        const imageResponse: ImageResponse = {
          ok: true,
          fallback: true,
          code: 429,
          message: 'Rate limit exceeded, using fallback image',
          data: {
            imageUrl: getFallbackImage(exerciseName),
            exerciseName
          }
        };
        return new Response(JSON.stringify(imageResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Handle credits exhausted (402)
      if (response.status === 402) {
        console.log('AI credits exhausted, using fallback image');
        const imageResponse: ImageResponse = {
          ok: true,
          fallback: true,
          code: 402,
          message: 'Credits exhausted, using fallback image',
          data: {
            imageUrl: getFallbackImage(exerciseName),
            exerciseName
          }
        };
        return new Response(JSON.stringify(imageResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Handle other errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);
        const imageResponse: ImageResponse = {
          ok: true,
          fallback: true,
          code: response.status,
          message: 'AI service error, using fallback image',
          data: {
            imageUrl: getFallbackImage(exerciseName),
            exerciseName
          }
        };
        return new Response(JSON.stringify(imageResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageUrl) {
        console.log('No image in AI response, using fallback');
        const imageResponse: ImageResponse = {
          ok: true,
          fallback: true,
          code: 200,
          message: 'No image generated, using fallback',
          data: {
            imageUrl: getFallbackImage(exerciseName),
            exerciseName
          }
        };
        return new Response(JSON.stringify(imageResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Success - return AI generated image
      console.log('Successfully generated AI image for:', exerciseName);
      const imageResponse: ImageResponse = {
        ok: true,
        fallback: false,
        code: 200,
        message: 'AI image generated successfully',
        data: {
          imageUrl,
          exerciseName
        }
      };
      return new Response(JSON.stringify(imageResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (fetchError) {
      console.error('Fetch error to AI gateway:', fetchError);
      const imageResponse: ImageResponse = {
        ok: true,
        fallback: true,
        code: 500,
        message: 'Network error, using fallback image',
        data: {
          imageUrl: getFallbackImage(exerciseName),
          exerciseName
        }
      };
      return new Response(JSON.stringify(imageResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error in generate-exercise-image:', error);
    // Even on complete failure, return a valid response
    const imageResponse: ImageResponse = {
      ok: true,
      fallback: true,
      code: 500,
      message: 'Server error, using fallback image',
      data: {
        imageUrl: defaultFallbackImage,
        exerciseName: 'Unknown'
      }
    };
    return new Response(JSON.stringify(imageResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
