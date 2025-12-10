import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// LOCAL FITNESS KNOWLEDGE BASE
// Science-based answers - NO credits required
// ============================================

interface KnowledgeEntry {
  keywords: string[];
  answer: string;
}

const fitnessKnowledge: KnowledgeEntry[] = [
  {
    keywords: ['water', 'hydration', 'drink', 'fluid', 'hydrate'],
    answer: `💧 **Daily Water Intake:**
• Men: 3.7L (13 cups) per day
• Women: 2.7L (9 cups) per day
• Add 500ml for every 30 min of exercise
• Check urine color: pale yellow = well hydrated`
  },
  {
    keywords: ['protein', 'how much protein', 'protein intake', 'protein requirement'],
    answer: `🥩 **Protein Intake:**
• General fitness: 1.2–1.6g per kg body weight
• Muscle building: 1.6–2.2g per kg body weight
• Example (70kg): 112–154g protein/day for muscle gain
• Best sources: chicken, fish, eggs, Greek yogurt, legumes`
  },
  {
    keywords: ['fat loss', 'lose fat', 'burn fat', 'belly fat', 'lose belly'],
    answer: `🔥 **Best Exercises for Fat Loss:**
• HIIT (High Intensity Interval Training)
• Strength training 3-4x/week
• Walking 10,000 steps daily
• Compound lifts: squats, deadlifts, rows
• Note: You cannot spot-reduce belly fat. Overall fat loss through calorie deficit + exercise is the key.`
  },
  {
    keywords: ['muscle gain', 'build muscle', 'gain muscle', 'hypertrophy', 'muscle building'],
    answer: `💪 **Best Exercises for Muscle Gain:**
• Compound movements: squats, deadlifts, bench press, rows, overhead press
• 8-12 reps per set, 3-4 sets
• Progressive overload: add weight/reps weekly
• Calorie surplus: +200-400 kcal/day
• Protein: 1.6-2.2g per kg body weight`
  },
  {
    keywords: ['sets', 'reps', 'how many sets', 'how many reps', 'repetitions'],
    answer: `📊 **Sets and Reps Guide:**
• Strength: 3-5 sets × 4-6 reps (heavy weight)
• Hypertrophy: 3-4 sets × 8-12 reps (moderate weight)
• Endurance: 2-3 sets × 15-20 reps (light weight)
• Beginners: Start with 3 sets × 10 reps`
  },
  {
    keywords: ['rest', 'rest time', 'rest between sets', 'how long to rest', 'recovery between sets'],
    answer: `⏱️ **Rest Time Between Sets:**
• Strength (heavy): 2–3 minutes
• Hypertrophy (muscle building): 60–90 seconds
• Endurance: 30–60 seconds
• Power/explosive: 3–5 minutes`
  },
  {
    keywords: ['calorie', 'calories', 'how many calories', 'calories to lose', 'calorie deficit'],
    answer: `🔥 **Calories for Weight Loss:**
• Calculate TDEE (Total Daily Energy Expenditure)
• Create deficit of 300-500 kcal/day
• 0.5-1kg loss per week is healthy
• Never go below 1200 kcal (women) or 1500 kcal (men)
• Track food intake for accuracy`
  },
  {
    keywords: ['beginner', 'start', 'new to gym', 'workout plan', 'first time', 'starting out'],
    answer: `🌟 **Beginner Workout Plan (3 days/week):**
**Day 1:** Squats 3×10, Push-ups 3×10, Rows 3×10, Plank 3×30s
**Day 2:** 20-30 min cardio + core work
**Day 3:** Lunges 3×10, Dumbbell press 3×10, Lat pulldown 3×10
• Focus on form over weight
• Progress slowly over 4-6 weeks`
  },
  {
    keywords: ['best time', 'when to workout', 'morning workout', 'evening workout', 'workout timing'],
    answer: `🕐 **Best Time to Workout:**
• Morning: Higher testosterone, better fat burning, establishes routine
• Afternoon (2-6pm): Peak performance, body temperature optimal
• Evening: Good strength, but may affect sleep
• Best time = whenever you can be consistent!`
  },
  {
    keywords: ['intermittent fasting', 'fasting', 'if diet', '16:8'],
    answer: `⏰ **Intermittent Fasting:**
• 16:8 method: 16 hours fasting, 8 hours eating window
• Can help with calorie control and fat loss
• Not magic—still need calorie deficit for weight loss
• Safe for most healthy adults
• Stay hydrated during fasting periods`
  },
  {
    keywords: ['steps', 'walking', 'how many steps', '10000 steps', 'daily steps'],
    answer: `👟 **Daily Steps Goal:**
• Minimum: 7,000 steps/day
• Optimal: 8,000-10,000 steps/day
• Burns 300-500 extra calories
• Improves cardiovascular health and reduces stress`
  },
  {
    keywords: ['sleep', 'how much sleep', 'sleeping', 'rest recovery'],
    answer: `😴 **Sleep for Fitness:**
• Adults: 7-9 hours per night
• Athletes: 8-10 hours
• Sleep deprivation reduces strength by 10-20%
• Muscle recovery and growth hormone release happen during deep sleep`
  },
  {
    keywords: ['cardio', 'strength', 'cardio vs strength', 'which is better', 'cardio or weights'],
    answer: `🏃‍♂️ **Cardio vs Strength:**
• Both are important!
• Fat loss: Prioritize strength + moderate cardio
• Strength builds muscle, boosts metabolism
• Cardio improves heart health and endurance
• Ideal: 2-4 strength + 2-3 cardio sessions/week`
  },
  {
    keywords: ['how long', 'workout duration', 'workout length', 'how long to workout'],
    answer: `⏰ **Workout Duration:**
• Beginners: 30-45 minutes
• Intermediate: 45-60 minutes
• Advanced: 60-75 minutes
• Quality > quantity
• Workouts over 90 min may increase cortisol`
  },
  {
    keywords: ['diet weight loss', 'best diet', 'diet for losing', 'weight loss diet'],
    answer: `🥗 **Best Diet for Weight Loss:**
• Calorie deficit: 300-500 kcal below maintenance
• High protein: 1.6-2g per kg body weight
• Plenty of vegetables and fiber
• Limit processed foods and sugary drinks
• No extreme diets—sustainability is key`
  },
  {
    keywords: ['diet muscle', 'muscle diet', 'bulking diet', 'gain diet'],
    answer: `🍗 **Best Diet for Muscle Gain:**
• Calorie surplus: +200-400 kcal/day
• Protein: 1.6-2.2g per kg body weight
• Carbs around workouts for energy
• Eat 4-5 meals spread throughout day
• Prioritize whole foods over supplements`
  },
  {
    keywords: ['warm up', 'warmup', 'warming up', 'pre workout stretch'],
    answer: `🔥 **Warm-Up Routine (5-10 min):**
1. Light cardio: 3-5 min (jogging, jumping jacks)
2. Dynamic stretches: leg swings, arm circles, hip rotations
3. Activation: light versions of workout movements
• Reduces injury risk by 50%+
• Never skip before heavy lifting!`
  },
  {
    keywords: ['cool down', 'cooldown', 'after workout', 'post workout'],
    answer: `🧊 **Cool-Down Routine (5-10 min):**
1. Light walking or cycling: 3-5 min
2. Static stretches: hold each 30-60 seconds
3. Focus on muscles trained
• Reduces muscle soreness
• Promotes recovery and relaxation`
  },
  {
    keywords: ['creatine', 'creatine safe', 'should i take creatine'],
    answer: `💊 **Creatine:**
• One of the most researched supplements—proven safe
• 3-5g per day (no loading phase needed)
• Improves strength, power, and muscle gain
• Stay well hydrated
• Safe for long-term use in healthy adults`
  },
  {
    keywords: ['supplement', 'supplements', 'should i take', 'do i need supplements'],
    answer: `💊 **Supplements Guide:**
• Most people don't need supplements if diet is good
• Useful basics: Protein powder (convenience), Creatine (proven), Vitamin D (if deficient)
• Pre-workout: optional, contains caffeine
• Focus on whole foods first, supplements second`
  },
  {
    keywords: ['eat before workout', 'pre workout meal', 'what to eat before'],
    answer: `🍌 **Pre-Workout Nutrition:**
• 2-3 hours before: balanced meal (protein + carbs + fats)
• 30-60 min before: light snack (banana, toast, yogurt)
• Carbs for energy, protein for muscle
• Avoid high-fat foods close to workout`
  },
  {
    keywords: ['eat after workout', 'post workout meal', 'what to eat after'],
    answer: `🥤 **Post-Workout Nutrition:**
• Eat within 30-60 minutes after workout
• Protein: 20-40g for muscle repair
• Carbs: replenish glycogen stores
• Examples: chicken + rice, protein shake + banana, eggs + toast`
  },
  {
    keywords: ['stamina', 'endurance', 'increase stamina', 'cardio endurance'],
    answer: `🏃 **How to Increase Stamina:**
• Start with Zone 2 cardio: 30-45 min at conversational pace
• Add HIIT 1-2x/week
• Gradually increase duration/intensity
• Consistency is key—train 3-4x/week
• Allow adequate recovery between sessions`
  },
  {
    keywords: ['flexibility', 'improve flexibility', 'stretch routine', 'mobility'],
    answer: `🧘 **How to Improve Flexibility:**
• Stretch daily, especially after workouts
• Hold static stretches 30-60 seconds
• Include yoga or mobility work 2-3x/week
• Focus on hip flexors, hamstrings, shoulders
• Never stretch cold muscles—warm up first`
  },
  {
    keywords: ['not losing weight', 'plateau', 'stuck', 'why not losing'],
    answer: `⚖️ **Why You're Not Losing Weight:**
• Hidden calories: check portions, sauces, drinks
• Underestimating intake or overestimating burn
• Metabolic adaptation: reduce calories further or increase activity
• Stress/sleep affecting hormones
• Building muscle while losing fat (scale doesn't show progress)`
  },
  {
    keywords: ['how long results', 'when see results', 'timeline', 'how long to see'],
    answer: `📅 **Timeline to See Results:**
• Strength gains: 2-4 weeks
• Visible muscle: 6-12 weeks
• Fat loss (noticeable): 4-8 weeks
• Major transformation: 3-6 months
• Consistency and patience are essential!`
  },
  {
    keywords: ['motivation', 'stay motivated', 'how to motivate', 'discipline'],
    answer: `🎯 **How to Stay Motivated:**
• Set specific, measurable goals
• Track progress (photos, measurements, lifts)
• Find a workout partner or community
• Schedule workouts like appointments
• Remember: discipline > motivation. Show up even on hard days.`
  },
  {
    keywords: ['doms', 'muscle soreness', 'sore muscles', 'soreness', 'delayed onset'],
    answer: `💆 **DOMS (Delayed Onset Muscle Soreness):**
• Normal after new or intense exercise
• Peaks 24-72 hours after workout
• Light movement helps recovery (active recovery)
• Stay hydrated, sleep well, get protein
• Reduce with proper warm-up and gradual progression`
  },
  {
    keywords: ['diet', 'meal plan', 'eating', 'nutrition', 'what to eat', 'healthy eating'],
    answer: `🥗 **Basic Nutrition Guidelines:**
• 1/2 plate: vegetables and fruits
• 1/4 plate: lean protein
• 1/4 plate: complex carbs
• Add healthy fats (olive oil, nuts, avocado)
• Protein with every meal`
  },
  {
    keywords: ['exercise', 'best exercise', 'most effective', 'which exercise', 'top exercises'],
    answer: `💪 **Best Overall Exercises:**
• Squats, Deadlifts, Bench Press, Rows, Overhead Press
• Bodyweight: push-ups, pull-ups, lunges, planks
• The best exercise is one you'll do consistently!`
  },
  {
    keywords: ['frequency', 'how often', 'times per week', 'workout frequency'],
    answer: `📅 **Workout Frequency:**
• General fitness: 3-4 days/week
• Muscle building: 4-5 days/week
• Fat loss: 4-5 days/week (strength + cardio mix)
• Rest each muscle group 48 hours`
  }
];

// Motivational fallback responses for unknown questions
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

// Check if message matches any local knowledge
function findLocalAnswer(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  for (const entry of fitnessKnowledge) {
    const matchCount = entry.keywords.filter(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    ).length;
    
    // Match if 1+ keywords found
    if (matchCount >= 1) {
      return entry.answer;
    }
  }
  
  return null;
}

interface AIResponse {
  ok: boolean;
  fallback: boolean;
  code: number;
  message: string;
  data: {
    response?: string;
    error?: string;
    source?: 'ai' | 'local' | 'fallback';
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    console.log('User question:', lastMessage);

    // ============================================
    // STEP 1: Check local knowledge base first
    // ============================================
    const localAnswer = findLocalAnswer(lastMessage);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    // If no API key, try local answer or fallback
    if (!LOVABLE_API_KEY) {
      console.log('LOVABLE_API_KEY not configured');
      
      if (localAnswer) {
        console.log('Returning local knowledge answer');
        const response: AIResponse = {
          ok: true,
          fallback: false,
          code: 200,
          message: 'Local knowledge answer',
          data: {
            response: localAnswer,
            source: 'local'
          }
        };
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const response: AIResponse = {
        ok: true,
        fallback: true,
        code: 200,
        message: 'Using fallback response (API not configured)',
        data: {
          response: getRandomFallbackResponse() + "\n\n_(AI coaching is in fallback mode. Ask common fitness questions for detailed answers!)_",
          source: 'fallback'
        }
      };
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ============================================
    // STEP 2: Try AI API when credits available
    // ============================================
    try {
      console.log('Attempting AI API call...');
      
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
              content: 'You are an expert fitness coach. Provide helpful, accurate, science-based advice about workouts, exercises, form, nutrition, and fitness goals. Keep responses concise but informative. Use bullet points and formatting for clarity.' 
            },
            ...messages,
          ],
        }),
      });

      // Handle rate limit (429) - use local answer or fallback
      if (response.status === 429) {
        console.log('Rate limit hit');
        
        if (localAnswer) {
          console.log('Returning local knowledge answer (rate limited)');
          const aiResponse: AIResponse = {
            ok: true,
            fallback: false,
            code: 200,
            message: 'Local knowledge answer (rate limited)',
            data: {
              response: localAnswer,
              source: 'local'
            }
          };
          return new Response(JSON.stringify(aiResponse), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const aiResponse: AIResponse = {
          ok: true,
          fallback: true,
          code: 429,
          message: 'Rate limit exceeded, using fallback',
          data: {
            response: getRandomFallbackResponse() + "\n\n_(AI is temporarily busy. Ask common fitness questions for instant answers!)_",
            source: 'fallback'
          }
        };
        return new Response(JSON.stringify(aiResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Handle credits exhausted (402) - use local answer or fallback
      if (response.status === 402) {
        console.log('AI credits exhausted');
        
        if (localAnswer) {
          console.log('Returning local knowledge answer (credits exhausted)');
          const aiResponse: AIResponse = {
            ok: true,
            fallback: false,
            code: 200,
            message: 'Local knowledge answer (credits exhausted)',
            data: {
              response: localAnswer,
              source: 'local'
            }
          };
          return new Response(JSON.stringify(aiResponse), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const aiResponse: AIResponse = {
          ok: true,
          fallback: true,
          code: 402,
          message: 'Credits exhausted, using fallback',
          data: {
            response: getRandomFallbackResponse() + "\n\n_(AI coaching is in fallback mode. Try asking about water intake, protein, rest times, or workout plans for detailed answers!)_",
            source: 'fallback'
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
        
        if (localAnswer) {
          const aiResponse: AIResponse = {
            ok: true,
            fallback: false,
            code: 200,
            message: 'Local knowledge answer (API error)',
            data: {
              response: localAnswer,
              source: 'local'
            }
          };
          return new Response(JSON.stringify(aiResponse), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const aiResponse: AIResponse = {
          ok: true,
          fallback: true,
          code: response.status,
          message: 'AI service error, using fallback',
          data: {
            response: getRandomFallbackResponse(),
            source: 'fallback'
          }
        };
        return new Response(JSON.stringify(aiResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Success - return AI response
      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content;

      if (!aiMessage) {
        console.error('No message in AI response:', data);
        
        if (localAnswer) {
          const aiResponse: AIResponse = {
            ok: true,
            fallback: false,
            code: 200,
            message: 'Local knowledge answer (empty AI response)',
            data: {
              response: localAnswer,
              source: 'local'
            }
          };
          return new Response(JSON.stringify(aiResponse), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const aiResponse: AIResponse = {
          ok: true,
          fallback: true,
          code: 200,
          message: 'Empty AI response, using fallback',
          data: {
            response: getRandomFallbackResponse(),
            source: 'fallback'
          }
        };
        return new Response(JSON.stringify(aiResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('AI response received successfully');
      const aiResponse: AIResponse = {
        ok: true,
        fallback: false,
        code: 200,
        message: 'AI response generated successfully',
        data: {
          response: aiMessage,
          source: 'ai'
        }
      };
      return new Response(JSON.stringify(aiResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (fetchError) {
      console.error('Fetch error to AI gateway:', fetchError);
      
      if (localAnswer) {
        const aiResponse: AIResponse = {
          ok: true,
          fallback: false,
          code: 200,
          message: 'Local knowledge answer (network error)',
          data: {
            response: localAnswer,
            source: 'local'
          }
        };
        return new Response(JSON.stringify(aiResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const aiResponse: AIResponse = {
        ok: true,
        fallback: true,
        code: 500,
        message: 'Network error, using fallback',
        data: {
          response: getRandomFallbackResponse(),
          source: 'fallback'
        }
      };
      return new Response(JSON.stringify(aiResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error in ai-coach:', error);
    const aiResponse: AIResponse = {
      ok: true,
      fallback: true,
      code: 500,
      message: 'Server error, using fallback',
      data: {
        response: getRandomFallbackResponse(),
        source: 'fallback'
      }
    };
    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
