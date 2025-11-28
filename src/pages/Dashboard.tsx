import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Calendar, Flame, TrendingUp, Trophy, Play } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, signOut } = useAuth();
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
        .eq('user_id', user.id)
        .order('day_number');

      if (error) throw error;
      setProgress(data || []);
    } catch (error: any) {
      toast.error('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const completedDays = progress.filter(p => p.is_completed).length;
  const totalCalories = progress.reduce((sum, p) => sum + (p.calories_burned || 0), 0);
  const currentDay = completedDays + 1;
  const currentStreak = calculateStreak(progress);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            VIGOR AI
          </h1>
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
            <Link to="/ai-coach">
              <Button variant="ghost">AI Coach</Button>
            </Link>
            <Button variant="ghost" onClick={() => signOut()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="mb-2 text-4xl font-bold">Welcome Back!</h2>
          <p className="text-xl text-muted-foreground">
            Day {currentDay} of your transformation journey
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Calendar className="h-6 w-6" />}
            title="Days Completed"
            value={completedDays}
            total={30}
            gradient="from-primary to-primary/60"
          />
          <StatCard
            icon={<Flame className="h-6 w-6" />}
            title="Calories Burned"
            value={totalCalories}
            unit="kcal"
            gradient="from-secondary to-secondary/60"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Current Streak"
            value={currentStreak}
            unit="days"
            gradient="from-accent to-accent/60"
          />
          <StatCard
            icon={<Trophy className="h-6 w-6" />}
            title="Progress"
            value={Math.round((completedDays / 30) * 100)}
            unit="%"
            gradient="from-primary via-secondary to-accent"
          />
        </div>

        {/* Today's Workout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <div className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="mb-2 text-3xl font-bold">Today's Workout</h3>
                  <p className="text-muted-foreground">Day {currentDay} • Full Body Challenge</p>
                </div>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                  <Play className="h-10 w-10" />
                </div>
              </div>

              {currentDay <= 30 ? (
                <Link to={`/program/day/${currentDay}`}>
                  <Button size="lg" className="w-full bg-gradient-to-r from-primary to-secondary text-lg font-bold hover:scale-105 transition-transform">
                    Start Day {currentDay}
                  </Button>
                </Link>
              ) : (
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">🎉 Program Completed!</p>
                  <p className="mt-2 text-muted-foreground">Congratulations on completing your 30-day transformation!</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <QuickLink to="/program" title="View Program" description="See all 30 days" />
          <QuickLink to="/ai-coach" title="AI Coach" description="Get personalized guidance" />
          <QuickLink to="/profile" title="My Profile" description="Track your stats" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, total, unit, gradient }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 transition-opacity group-hover:opacity-10`} />
      <div className="relative">
        <div className="mb-4 inline-block rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-3">
          {icon}
        </div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-3xl font-bold">
          {value}
          {unit && <span className="text-lg text-muted-foreground"> {unit}</span>}
          {total && <span className="text-lg text-muted-foreground"> / {total}</span>}
        </p>
      </div>
    </motion.div>
  );
}

function QuickLink({ to, title, description }: any) {
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="rounded-xl border border-border bg-card/30 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/50"
      >
        <h4 className="mb-1 text-lg font-bold">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </motion.div>
    </Link>
  );
}

function calculateStreak(progress: any[]): number {
  if (progress.length === 0) return 0;
  
  const completed = progress.filter(p => p.is_completed).sort((a, b) => b.day_number - a.day_number);
  if (completed.length === 0) return 0;

  let streak = 1;
  for (let i = 0; i < completed.length - 1; i++) {
    if (completed[i].day_number - completed[i + 1].day_number === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
