import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { User, Scale, Ruler } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data || {});
    } catch (error: any) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('user_id', user?.id);

      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold">My Profile</h1>
            <Button variant="ghost" onClick={() => window.history.back()}>
              Back
            </Button>
          </div>

          <Card className="border-border bg-card/50 p-8 backdrop-blur-sm">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                  <User className="h-10 w-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user?.email}</h2>
                  <p className="text-muted-foreground">Vigor AI Member</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile?.age || ''}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                    placeholder="25"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profile?.gender || 'male'}
                    onValueChange={(value) => setProfile({ ...profile, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Weight {profile?.unit_system === 'imperial' ? '(lbs)' : '(kg)'}
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={profile?.weight || ''}
                    onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) })}
                    placeholder="70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Height {profile?.unit_system === 'imperial' ? '(inches)' : '(cm)'}
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={profile?.height || ''}
                    onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) })}
                    placeholder="175"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit_system">Unit System</Label>
                  <Select
                    value={profile?.unit_system || 'metric'}
                    onValueChange={(value) => setProfile({ ...profile, unit_system: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                      <SelectItem value="imperial">Imperial (lbs, inches)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calorie_target">Daily Calorie Target</Label>
                  <Input
                    id="calorie_target"
                    type="number"
                    value={profile?.daily_calorie_target || 2000}
                    onChange={(e) => setProfile({ ...profile, daily_calorie_target: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-secondary font-bold"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
