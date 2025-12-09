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
    answer: `💧 **Daily Water Intake Recommendation:**

• **Men:** 3.7 liters (about 13 cups) per day
• **Women:** 2.7 liters (about 9 cups) per day

**Tips:**
- Drink an extra 500ml for every 30 minutes of exercise
- If you're sweating heavily, add electrolytes
- Check urine color: pale yellow = well hydrated
- Drink a glass of water first thing in the morning
- Carry a water bottle throughout the day`
  },
  {
    keywords: ['protein', 'how much protein', 'protein intake', 'protein requirement'],
    answer: `🥩 **Daily Protein Intake Recommendation:**

• **General fitness:** 1.2–1.6g per kg body weight
• **Muscle building:** 1.6–2.2g per kg body weight
• **Athletes:** 1.8–2.5g per kg body weight

**Example (70kg person):**
- Maintenance: 84–112g protein/day
- Muscle building: 112–154g protein/day

**Best protein sources:**
- Chicken breast, fish, eggs, Greek yogurt
- Legumes, tofu, tempeh for plant-based
- Spread intake across 4-5 meals for optimal absorption`
  },
  {
    keywords: ['calorie', 'calories', 'how many calories', 'caloric intake', 'tdee'],
    answer: `🔥 **Daily Calorie Intake Guide:**

**Estimation formula (rough):**
• Sedentary: Body weight (kg) × 25-28 kcal
• Moderately active: Body weight (kg) × 30-33 kcal
• Very active: Body weight (kg) × 35-40 kcal

**Goals:**
- **Weight loss:** Eat 300-500 kcal below maintenance
- **Muscle gain:** Eat 200-400 kcal above maintenance
- **Maintenance:** Match your TDEE

**Tips:**
- Track food for 1-2 weeks to understand your intake
- Focus on nutrient-dense foods, not just calories
- Protein and fiber help you feel fuller longer`
  },
  {
    keywords: ['rest', 'rest time', 'rest between sets', 'how long to rest', 'recovery between sets'],
    answer: `⏱️ **Rest Time Between Sets:**

• **Strength training (heavy weight):** 2–3 minutes
• **Hypertrophy (muscle building):** 60–90 seconds
• **Endurance training:** 30–60 seconds
• **Power/explosive exercises:** 3–5 minutes

**Why it matters:**
- Longer rest = more strength recovery for heavy lifts
- Shorter rest = more metabolic stress for muscle growth
- Match rest time to your training goal

**Tip:** Use rest time for light mobility or core activation`
  },
  {
    keywords: ['warm up', 'warmup', 'before workout', 'pre workout', 'warming up'],
    answer: `🔥 **Warm-Up Guidelines:**

**Duration:** 5–10 minutes before every workout

**Structure:**
1. **Light cardio (3-5 min):** Walking, jogging, cycling
2. **Dynamic stretches (3-5 min):** Leg swings, arm circles, hip rotations
3. **Activation exercises:** Light versions of workout movements

**Benefits:**
- Increases blood flow to muscles
- Improves joint mobility
- Reduces injury risk by 50%+
- Enhances performance

**Never skip warm-up for heavy lifting or intense cardio!**`
  },
  {
    keywords: ['stretch', 'stretching', 'flexibility', 'cool down', 'after workout'],
    answer: `🧘 **Stretching Guidelines:**

**After workout (static stretching):**
- Hold each stretch 30-60 seconds
- Focus on muscles you just trained
- Breathe deeply, don't bounce

**Key stretches:**
- Hamstring stretch, quad stretch
- Hip flexor stretch, chest stretch
- Shoulder stretch, calf stretch

**Benefits:**
- Improves flexibility and range of motion
- Reduces muscle soreness (DOMS)
- Promotes relaxation and recovery

**Tip:** Stretch while muscles are warm, not cold`
  },
  {
    keywords: ['cardio', 'strength', 'cardio vs strength', 'which is better', 'cardio or weights'],
    answer: `🏃‍♂️ **Cardio vs Strength Training:**

**Both are important! Here's the breakdown:**

**Cardio benefits:**
- Burns calories during exercise
- Improves heart health
- Builds endurance
- Reduces stress

**Strength training benefits:**
- Builds muscle, boosts metabolism
- Burns calories even at rest
- Strengthens bones and joints
- Improves posture

**Ideal approach:**
- 2-4 strength sessions per week
- 2-3 cardio sessions per week
- For fat loss: prioritize strength + moderate cardio
- Do strength before cardio if same session`
  },
  {
    keywords: ['beginner', 'start', 'new to gym', 'workout plan', 'first time', 'starting out'],
    answer: `🌟 **Beginner Workout Plan:**

**Week structure (3 days):**

**Day 1 - Full Body:**
- Squats: 3×10
- Push-ups: 3×8-10
- Dumbbell rows: 3×10
- Plank: 3×30 sec

**Day 2 - Cardio + Core:**
- 20-30 min walking/cycling
- Crunches: 3×15
- Bird dogs: 3×10

**Day 3 - Full Body:**
- Lunges: 3×10 each leg
- Dumbbell press: 3×10
- Lat pulldowns: 3×10
- Glute bridges: 3×12

**Tips for beginners:**
- Focus on form over weight
- Start light, progress slowly
- Rest 1-2 days between strength sessions
- Stay consistent for 4-6 weeks`
  },
  {
    keywords: ['fat loss', 'weight loss', 'lose weight', 'burn fat', 'losing fat'],
    answer: `⚖️ **Fat Loss vs Weight Loss:**

**Key difference:**
- **Weight loss:** Losing total body weight (water, muscle, fat)
- **Fat loss:** Losing body fat while preserving muscle

**How to lose fat effectively:**
1. Calorie deficit: 300-500 kcal below maintenance
2. High protein: 1.6-2.0g per kg body weight
3. Strength training: 3-4x per week
4. Cardio: 2-3x per week (moderate)
5. Sleep: 7-9 hours per night
6. Patience: 0.5-1kg per week is healthy

**Avoid:**
- Extreme diets (under 1200 kcal)
- Only doing cardio
- Skipping meals`
  },
  {
    keywords: ['steps', 'walking', 'how many steps', '10000 steps', 'daily steps'],
    answer: `👟 **Daily Step Goal:**

**Recommendations:**
- **Minimum:** 7,000 steps/day (reduces mortality risk)
- **Optimal:** 8,000-10,000 steps/day
- **Very active:** 12,000+ steps/day

**Benefits:**
- Burns 300-500 extra calories
- Improves cardiovascular health
- Reduces stress and anxiety
- Easy to maintain long-term

**How to increase steps:**
- Take stairs instead of elevator
- Walk during phone calls
- Park farther from entrance
- Take a 10-min walk after meals`
  },
  {
    keywords: ['how long', 'workout duration', 'workout length', 'how long to workout', 'exercise duration'],
    answer: `⏰ **Optimal Workout Duration:**

**Recommendations:**
- **Beginners:** 30-45 minutes
- **Intermediate:** 45-60 minutes
- **Advanced:** 60-75 minutes

**What counts:**
- This is actual training time
- Don't count rest periods or socializing
- Quality > quantity

**Key points:**
- Workouts over 90 min may increase cortisol
- Short, intense workouts can be very effective
- Consistency matters more than duration

**Frequency:**
- 3-5 days per week for most goals
- Allow 48 hours rest for same muscle groups`
  },
  {
    keywords: ['diet', 'meal plan', 'eating', 'nutrition', 'what to eat', 'healthy eating'],
    answer: `🥗 **Basic Diet Plan Guidelines:**

**Plate composition (per meal):**
- 1/2 plate: Vegetables and fruits
- 1/4 plate: Lean protein
- 1/4 plate: Complex carbs
- Add healthy fats (olive oil, nuts)

**Meal timing:**
- Eat every 3-4 hours
- Protein with every meal
- Carbs around workouts
- Don't skip breakfast

**Foods to prioritize:**
- Lean meats, fish, eggs
- Vegetables, fruits, legumes
- Whole grains, oats, rice
- Nuts, seeds, avocados

**Foods to limit:**
- Processed foods, sugary drinks
- Fried foods, excessive alcohol`
  },
  {
    keywords: ['sleep', 'rest', 'recovery', 'how much sleep', 'sleeping'],
    answer: `😴 **Sleep Requirements for Fitness:**

**Recommendations:**
- **Adults:** 7-9 hours per night
- **Athletes:** 8-10 hours per night
- **Naps:** 20-30 min if needed

**Why sleep matters:**
- Muscle recovery happens during sleep
- Growth hormone release peaks during deep sleep
- Poor sleep increases cortisol (stores fat)
- Sleep deprivation reduces strength by 10-20%

**Sleep tips:**
- Same bedtime every night
- No screens 1 hour before bed
- Cool, dark room
- Avoid caffeine after 2pm
- Limit alcohol before bed`
  },
  {
    keywords: ['exercise', 'best exercise', 'most effective', 'which exercise', 'top exercises'],
    answer: `💪 **Best Exercises for Overall Fitness:**

**Compound movements (work multiple muscles):**
1. **Squats** - Legs, core, back
2. **Deadlifts** - Full posterior chain
3. **Bench Press** - Chest, shoulders, triceps
4. **Pull-ups/Rows** - Back, biceps
5. **Overhead Press** - Shoulders, core

**Bodyweight essentials:**
- Push-ups, lunges, planks
- Burpees, mountain climbers

**Cardio options:**
- Running, cycling, swimming
- Jump rope, rowing

**Key principle:** The best exercise is one you'll do consistently!`
  },
  {
    keywords: ['muscle', 'build muscle', 'muscle building', 'gain muscle', 'hypertrophy'],
    answer: `💪 **Muscle Building Guidelines:**

**Training:**
- 3-5 strength sessions per week
- 8-12 reps per set for hypertrophy
- 3-4 sets per exercise
- Progressive overload (add weight/reps weekly)

**Nutrition:**
- Calorie surplus: +200-400 kcal/day
- Protein: 1.6-2.2g per kg body weight
- Spread protein across 4-5 meals
- Carbs for energy, especially around workouts

**Recovery:**
- 48 hours rest per muscle group
- 7-9 hours sleep
- Manage stress
- Stay hydrated

**Timeline:** Expect 0.25-0.5kg muscle gain per month (natural)`
  },
  {
    keywords: ['frequency', 'how often', 'times per week', 'workout frequency', 'training frequency'],
    answer: `📅 **Workout Frequency Recommendations:**

**By goal:**
- **General fitness:** 3-4 days/week
- **Muscle building:** 4-5 days/week
- **Fat loss:** 4-5 days/week (mix of strength + cardio)
- **Maintenance:** 2-3 days/week

**Split options:**
- **Full body:** 3x/week
- **Upper/Lower:** 4x/week
- **Push/Pull/Legs:** 5-6x/week

**Key rules:**
- Rest each muscle group 48 hours
- Quality over quantity
- Listen to your body
- Consistency > intensity`
  },
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
