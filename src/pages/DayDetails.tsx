import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Flame, Play, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function DayDetails() {
  const { dayNumber } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDayExercises();
  }, [dayNumber]);

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

  const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration + ex.rest_time, 0);
  const totalCalories = exercises.reduce((sum, ex) => sum + ex.calories_burned, 0);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Link to="/program" className="mb-6 inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Program
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-4 text-5xl font-bold">Day {dayNumber}</h1>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-full bg-card/50 px-4 py-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>{Math.round(totalDuration / 60)} min</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-card/50 px-4 py-2">
              <Flame className="h-5 w-5 text-secondary" />
              <span>~{totalCalories} kcal</span>
            </div>
            <div className="rounded-full bg-card/50 px-4 py-2">
              {exercises.length} exercises
            </div>
          </div>
        </motion.div>

        <Card className="mb-8 border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
          <h2 className="mb-4 text-2xl font-bold">Workout Overview</h2>
          <p className="mb-6 text-muted-foreground">
            Complete all exercises in order. Take the designated rest between each exercise.
            Focus on proper form over speed.
          </p>
          <Button
            size="lg"
            onClick={() => navigate(`/workout/${dayNumber}`)}
            className="w-full bg-gradient-to-r from-primary to-secondary text-lg font-bold"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Workout
          </Button>
        </Card>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Exercises</h3>
          {exercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-border bg-card/50 p-6 backdrop-blur-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold">
                        {index + 1}
                      </span>
                      <h4 className="text-xl font-bold">{exercise.name}</h4>
                    </div>
                    <p className="mb-4 text-muted-foreground">{exercise.description}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-primary">{exercise.duration}s active</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-secondary">{exercise.rest_time}s rest</span>
                      <span className="text-muted-foreground">•</span>
                      <span>{exercise.calories_burned} kcal</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
