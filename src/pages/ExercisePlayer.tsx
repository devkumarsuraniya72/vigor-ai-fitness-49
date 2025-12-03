import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { toast } from 'sonner';

type WorkoutState = 'countdown' | 'exercise' | 'rest' | 'completed';

export default function ExercisePlayer() {
  const { dayNumber } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState<WorkoutState>('countdown');
  const [timeLeft, setTimeLeft] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDayExercises();
  }, [dayNumber]);

  useEffect(() => {
    if (isPaused || loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, state, currentIndex, loading]);

  const loadDayExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('day_exercises')
        .select(`
          *,
          exercises (*)
        `)
        .eq('day_number', Number(dayNumber))
        .order('order_index');

      if (error) throw error;
      setExercises(data?.map(d => d.exercises) || []);
    } catch (error: any) {
      toast.error('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };


  const handleTimerEnd = () => {
    if (state === 'countdown') {
      setState('exercise');
      setTimeLeft(exercises[currentIndex].duration);
    } else if (state === 'exercise') {
      setState('rest');
      setTimeLeft(exercises[currentIndex].rest_time);
    } else if (state === 'rest') {
      if (currentIndex < exercises.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setState('exercise');
        setTimeLeft(exercises[currentIndex + 1].duration);
      } else {
        completeWorkout();
      }
    }
  };

  const completeWorkout = async () => {
    setState('completed');

    if (user) {
      const totalCalories = exercises.reduce((sum, ex) => sum + ex.calories_burned, 0);
      
      await supabase.from('progress').upsert({
        user_id: user.id,
        day_number: Number(dayNumber),
        is_completed: true,
        completed_at: new Date().toISOString(),
        calories_burned: totalCalories,
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setState('exercise');
      setTimeLeft(exercises[currentIndex + 1].duration);
    } else {
      completeWorkout();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setState('exercise');
      setTimeLeft(exercises[currentIndex - 1].duration);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (state === 'completed') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="mb-8 text-8xl">🎉</div>
          <h1 className="mb-4 text-5xl font-bold">Day {dayNumber} Complete!</h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Amazing work! You're one step closer to your transformation.
          </p>
          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Back to Dashboard
            </Button>
            {Number(dayNumber) < 30 && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate(`/program/day/${Number(dayNumber) + 1}`)}
              >
                Next Day
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const currentExercise = exercises[currentIndex];
  const progress = ((currentIndex / exercises.length) * 100).toFixed(0);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="fixed left-0 top-0 z-50 h-2 w-full bg-muted">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <AnimatePresence mode="wait">
          {state === 'countdown' ? (
            <motion.div
              key="countdown"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="text-center"
            >
              <h2 className="mb-8 text-3xl font-bold">Get Ready!</h2>
              <div className="text-9xl font-bold text-primary animate-pulse">
                {timeLeft}
              </div>
            </motion.div>
          ) : state === 'rest' ? (
            <motion.div
              key="rest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl text-center"
            >
              <h2 className="mb-4 text-4xl font-bold text-secondary">Rest</h2>
              <div className="mb-8 text-8xl font-bold">{timeLeft}s</div>
              <p className="text-xl text-muted-foreground">
                Next: {currentIndex < exercises.length - 1 ? exercises[currentIndex + 1].name : 'Complete!'}
              </p>
              <div className="mt-8 h-3 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full bg-secondary"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / currentExercise.rest_time) * 100}%` }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentExercise.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="w-full max-w-4xl"
            >
              {/* Exercise Image */}
              <div className="mb-8 flex h-96 items-center justify-center rounded-3xl border-4 border-primary/30 bg-gradient-to-br from-primary/20 to-secondary/20">
                <div className="text-center">
                  <div className="text-8xl mb-4">💪</div>
                  <p className="text-2xl font-bold text-foreground">{currentExercise.name}</p>
                  <p className="text-muted-foreground mt-2">{currentExercise.difficulty}</p>
                </div>
              </div>

              {/* Exercise Info */}
              <div className="mb-8 text-center">
                <div className="mb-2 text-sm text-muted-foreground">
                  Exercise {currentIndex + 1} of {exercises.length}
                </div>
                <h2 className="mb-4 text-5xl font-bold">{currentExercise.name}</h2>
                <p className="mb-6 text-xl text-muted-foreground">
                  {currentExercise.description}
                </p>
                <div className="mb-8 text-7xl font-bold text-primary">
                  {timeLeft}s
                </div>
                <div className="mx-auto h-4 w-full max-w-md overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / currentExercise.duration) * 100}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  onClick={() => setIsPaused(!isPaused)}
                  className="bg-gradient-to-r from-primary to-secondary"
                >
                  {isPaused ? (
                    <Play className="h-6 w-6" />
                  ) : (
                    <Pause className="h-6 w-6" />
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleNext}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
