import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback motivational responses when AI credits are exhausted
const fallbackResponses = [
  "💪 Keep pushing! Every rep counts toward your goals. Focus on proper form and stay consistent!",
  "🔥 You've got this! Remember: progress, not perfection. Small steps lead to big results!",
  "⚡ Stay focused on your workout! Drink water, breathe deeply, and give it your all!",
  "🏆 Champions are made in the moments when no one is watching. Keep going!",
  "💯 Your body can do amazing things when your mind believes. Trust the process!",
  "🎯 Every workout brings you closer to your goals. Stay committed and stay strong!",
  "✨ Rest when you need to, but never quit. You're stronger than you think!",
  "🌟 The only bad workout is the one that didn't happen. You're already winning by showing up!",
];

function getRandomFallbackResponse(): string {
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[randomIndex];
}

interface AIResponse {
  ok: boolean;
  fallback: boolean;
  code: number;
  message: string;
  data: {
    response?: string;
    error?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    // If no API key, return fallback immediately
    if (!LOVABLE_API_KEY) {
      console.log('LOVABLE_API_KEY not configured, using fallback');
      const response: AIResponse = {
        ok: true,
        fallback: true,
        code: 200,
        message: 'Using fallback response (API not configured)',
        data: {
          response: getRandomFallbackResponse() + "\n\n(Note: AI coaching is currently in fallback mode. Full AI features will be available when credits are restored.)"
        }
      };
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert fitness coach. Provide helpful, motivating advice about workouts, exercises, form, nutrition, and fitness goals. Keep responses concise and actionable.' 
            },
            ...messages,
          ],
        }),
      });

      // Handle rate limit (429)
      if (response.status === 429) {
        console.log('Rate limit hit, using fallback');
        const aiResponse: AIResponse = {
          ok: true,
          fallback: true,
          code: 429,
          message: 'Rate limit exceeded, using fallback',
          data: {
            response: getRandomFallbackResponse() + "\n\n(Note: AI is temporarily busy. Please try again in a moment for personalized advice.)"
          }
        };
        return new Response(JSON.stringify(aiResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Handle credits exhausted (402)
      if (response.status === 402) {
        console.log('AI credits exhausted, using fallback');
        const aiResponse: AIResponse = {
          ok: true,
          fallback: true,
          code: 402,
          message: 'Credits exhausted, using fallback',
          data: {
            response: getRandomFallbackResponse() + "\n\n(Note: AI coaching is in fallback mode. Full personalized AI features will return when credits are available.)"
          }
        };
        return new Response(JSON.stringify(aiResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Handle other errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);
        const aiResponse: AIResponse = {
          ok: true,
          fallback: true,
          code: response.status,
          message: 'AI service error, using fallback',
          data: {
            response: getRandomFallbackResponse()
          }
        };
        return new Response(JSON.stringify(aiResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content;

      if (!aiMessage) {
        console.error('No message in AI response:', data);
        const aiResponse: AIResponse = {
          ok: true,
          fallback: true,
          code: 200,
          message: 'Empty AI response, using fallback',
          data: {
            response: getRandomFallbackResponse()
          }
        };
        return new Response(JSON.stringify(aiResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Success - return AI response
      const aiResponse: AIResponse = {
        ok: true,
        fallback: false,
        code: 200,
        message: 'AI response generated successfully',
        data: {
          response: aiMessage
        }
      };
      return new Response(JSON.stringify(aiResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (fetchError) {
      console.error('Fetch error to AI gateway:', fetchError);
      const aiResponse: AIResponse = {
        ok: true,
        fallback: true,
        code: 500,
        message: 'Network error, using fallback',
        data: {
          response: getRandomFallbackResponse()
        }
      };
      return new Response(JSON.stringify(aiResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error in ai-coach:', error);
    // Even on complete failure, return a valid response
    const aiResponse: AIResponse = {
      ok: true,
      fallback: true,
      code: 500,
      message: 'Server error, using fallback',
      data: {
        response: getRandomFallbackResponse()
      }
    };
    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
