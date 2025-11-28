import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, Target, TrendingUp, Brain } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-secondary/5 to-background" />
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-glow-pulse rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 animate-glow-pulse rounded-full bg-secondary/20 blur-3xl animation-delay-1000" />
        </div>

        <div className="container relative z-10 mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mb-6 text-6xl font-bold tracking-tight md:text-8xl">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                VIGOR AI
              </span>
            </h1>
            <h2 className="mb-4 text-3xl font-bold md:text-5xl">
              Transform in 30 Days
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-xl text-muted-foreground">
              AI-powered fitness coaching with personalized workouts, real-time guidance, 
              and intelligent progress tracking. Your transformation starts now.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="group relative overflow-hidden bg-gradient-to-r from-primary to-secondary px-8 py-6 text-lg font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/50">
                  <span className="relative z-10">Start Free Trial</span>
                  <div className="absolute inset-0 -z-0 bg-gradient-to-r from-secondary to-primary opacity-0 transition-opacity group-hover:opacity-100" />
                </Button>
              </Link>
              <Link to="/auth?mode=login">
                <Button size="lg" variant="outline" className="border-2 border-primary px-8 py-6 text-lg font-bold transition-all hover:scale-105 hover:bg-primary/10">
                  Login
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold">Why Choose Vigor AI?</h2>
            <p className="text-xl text-muted-foreground">
              Advanced technology meets proven fitness science
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20"
              >
                <div className="mb-4 inline-block rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-3">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-4xl rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 p-12 text-center backdrop-blur-sm"
        >
          <h2 className="mb-4 text-4xl font-bold">Ready to Transform?</h2>
          <p className="mb-8 text-xl text-muted-foreground">
            Join thousands achieving their fitness goals with Vigor AI
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="animate-glow-pulse bg-gradient-to-r from-primary to-secondary px-12 py-6 text-xl font-bold">
              Begin Your Journey
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: Brain,
    title: 'AI Coach',
    description: 'Real-time form feedback and personalized workout adjustments',
  },
  {
    icon: Target,
    title: '30-Day Program',
    description: 'Structured progression designed for maximum results',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Detailed analytics and performance insights',
  },
  {
    icon: Zap,
    title: 'Smart Intensity',
    description: 'AI adapts difficulty based on your performance',
  },
];
