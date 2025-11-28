import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Check, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function Program() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setProgress(data || []);
    } catch (error: any) {
      toast.error('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const completedDays = progress.filter(p => p.is_completed).map(p => p.day_number);
  const currentDay = completedDays.length + 1;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold">30-Day Program</h1>
            <p className="text-xl text-muted-foreground">
              {completedDays.length} of 30 days completed
            </p>
          </div>
          <Link to="/dashboard" className="text-primary hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-5 lg:grid-cols-6">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day, index) => {
            const isCompleted = completedDays.includes(day);
            const isLocked = day > currentDay;
            const isCurrent = day === currentDay;

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
              >
                {isLocked ? (
                  <div className="relative aspect-square rounded-2xl border border-border bg-card/30 p-4 backdrop-blur-sm opacity-50">
                    <div className="flex h-full flex-col items-center justify-center">
                      <Lock className="mb-2 h-8 w-8 text-muted-foreground" />
                      <span className="text-2xl font-bold text-muted-foreground">
                        {day}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Link to={`/program/day/${day}`}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`relative aspect-square cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all ${
                        isCompleted
                          ? 'border-primary bg-gradient-to-br from-primary/20 to-primary/10'
                          : isCurrent
                          ? 'animate-glow-pulse border-primary bg-gradient-to-br from-secondary/20 to-secondary/10'
                          : 'border-border bg-card/50 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex h-full flex-col items-center justify-center">
                        {isCompleted ? (
                          <>
                            <div className="mb-2 rounded-full bg-primary p-2">
                              <Check className="h-6 w-6 text-background" />
                            </div>
                            <span className="text-2xl font-bold">Day {day}</span>
                          </>
                        ) : (
                          <>
                            <span className="mb-2 text-4xl font-bold">{day}</span>
                            {isCurrent && (
                              <span className="text-xs font-bold text-primary">
                                START TODAY
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
