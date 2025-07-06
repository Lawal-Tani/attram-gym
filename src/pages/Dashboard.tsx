import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NavigationBar from '@/components/NavigationBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, TrendingUp, CheckCircle, Clock, AlertTriangle, Trophy, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';

const ALL_ACHIEVEMENTS = [
  { id: 'first_workout', label: 'First Workout', icon: Trophy },
  { id: 'streak_7', label: '7-Day Streak', icon: Flame },
  { id: 'streak_30', label: '30-Day Streak', icon: Flame },
  { id: 'workouts_50', label: '50 Workouts', icon: Trophy },
  { id: 'workouts_100', label: '100 Workouts', icon: Trophy },
  { id: 'goal_completed', label: 'Goal Completed', icon: Target },
];

const MOTIVATION_QUOTES = [
  "The only bad workout is the one that didn't happen. Keep pushing forward!",
  "Success starts with self-discipline.",
  "Push yourself, because no one else is going to do it for you.",
  "Don't limit your challenges. Challenge your limits.",
  "You are stronger than you think.",
  "Small progress is still progress."
];

const Dashboard = () => {
  const { user } = useAuth();
  const [workoutPlan, setWorkoutPlan] = useState<any[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [typeData, setTypeData] = useState<any[]>([]);
  const [motivationIndex, setMotivationIndex] = useState(0);

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch the user's workout plans for their goal and fitness level
        const { data: plans, error: planError } = await supabase
          .from('workout_plans')
          .select('id, day_of_week, title, fitness_level')
          .eq('user_id', user.id)
          .eq('goal_type', user.goal)
          .eq('fitness_level', user.fitness_level || 'beginner');
        if (planError) throw planError;
        if (!plans || plans.length === 0) {
          setWorkoutPlan([]);
          setLoading(false);
          return;
        }
        // For each plan, fetch exercises
        const planIds = plans.map((p: any) => p.id);
        const { data: exercises, error: exercisesError } = await supabase
          .from('exercises')
          .select('id, workout_plan_id, name, sets, reps, rest_time, order_index')
          .in('workout_plan_id', planIds);
        if (exercisesError) throw exercisesError;
        // Group exercises by plan and day
        const planByDay: any = {};
        plans.forEach((plan: any) => {
          planByDay[plan.day_of_week] = {
            ...plan,
            exercises: exercises
              .filter((ex: any) => ex.workout_plan_id === plan.id)
              .sort((a: any, b: any) => a.order_index - b.order_index),
          };
        });
        // Sort by day of week
        const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
        const sorted = days
          .filter(day => planByDay[day])
          .map(day => ({
            day,
            workout: planByDay[day].title,
            exercises: planByDay[day].exercises.map((ex: any) => ex.name),
          }));
        setWorkoutPlan(sorted);
      } catch (err: any) {
        setError(err.message || 'Failed to load workout plan');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkoutPlan();
  }, [user]);

  useEffect(() => {
    async function fetchGamification() {
      if (!user?.id) return;
      // Fetch stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setStats(statsData);
      // Fetch achievements
      const { data: achievementsData } = await (supabase as any)
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .eq('unlocked', true);
      setAchievements(achievementsData || []);
    }
    fetchGamification();
  }, [user?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMotivationIndex(i => (i + 1) % MOTIVATION_QUOTES.length);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const completionRate = Math.round((completedWorkouts.length / workoutPlan.length) * 100);

  const toggleWorkoutCompletion = (day: string) => {
    if (completedWorkouts.includes(day)) {
      setCompletedWorkouts(completedWorkouts.filter(d => d !== day));
    } else {
      setCompletedWorkouts([...completedWorkouts, day]);
    }
  };

  // Calculate days until membership expiry
  const getMembershipStatus = () => {
    if (!user?.membership_expiry) return { status: 'unknown', days: 0 };
    
    const today = new Date();
    const expiry = new Date(user.membership_expiry);
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { status: 'expired', days: Math.abs(daysLeft) };
    if (daysLeft <= 30) return { status: 'expiring', days: daysLeft };
    return { status: 'active', days: daysLeft };
  };

  const membershipStatus = getMembershipStatus();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <NavigationBar />
      <div className="container mx-auto px-4 py-12">
        {/* Motivation Section - moved to top */}
        <div className="mb-10 text-center">
          <Card className="shadow-lg bg-background mx-auto max-w-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-emerald-700 dark:text-emerald-200">💡 Motivation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground italic">
                {MOTIVATION_QUOTES[motivationIndex]}
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Welcome Section */}
        <div className="mb-10 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/10 rounded-3xl -z-10"></div>
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent mb-4 drop-shadow-lg">
            Welcome back, <span className="text-primary">{user?.name}</span>! 💪
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 font-medium">
            Ready to crush your <span className="capitalize font-bold text-accent">{user?.goal?.replace('_', ' ')}</span> goals today?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <Card className="shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-accent/5 to-accent/20 border-accent/30 hover:shadow-glow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-accent">This Week</CardTitle>
              <Target className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-accent">{completionRate}%</div>
              <Progress value={completionRate} className="h-3 my-3" />
              <p className="text-xs text-muted-foreground">
                {completedWorkouts.length} of {workoutPlan.length} workouts
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-500/5 to-blue-500/20 border-blue-500/30 hover:shadow-blue-500/20 hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-blue-600">Streak</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-blue-600">7</div>
              <p className="text-xs text-muted-foreground">days active</p>
            </CardContent>
          </Card>
          <Card className="shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-500/5 to-purple-500/20 border-purple-500/30 hover:shadow-purple-500/20 hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-purple-600">Goal</CardTitle>
              <Target className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize text-purple-600">
                {user?.goal?.replace('_', ' ')}
              </div>
              <p className="text-xs text-muted-foreground">current focus</p>
            </CardContent>
          </Card>
          <Card className="shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-orange-500/5 to-orange-500/20 border-orange-500/30 hover:shadow-orange-500/20 hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-orange-600">Membership</CardTitle>
              <Calendar className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {membershipStatus.days}
              </div>
              <p className="text-xs text-muted-foreground">
                {membershipStatus.status === 'expired' ? 'days expired' : 'days left'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Membership Alert */}
        {(membershipStatus.status === 'expiring' || membershipStatus.status === 'expired') && (
          <Card className="mb-10 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950 shadow-lg animate-pulse">
            <CardContent className="flex items-center space-x-4 pt-6">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                  {membershipStatus.status === 'expired' ? 'Membership Expired' : 'Membership Expiring Soon'}
                </h3>
                <p className="text-orange-700 dark:text-orange-300">
                  {membershipStatus.status === 'expired' 
                    ? `Your membership expired ${membershipStatus.days} days ago. Please renew to continue.`
                    : `Your membership expires in ${membershipStatus.days} days. Contact the gym to renew.`
                  }
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  Expiry Date: {user?.membership_expiry ? new Date(user.membership_expiry).toLocaleDateString() : 'Not set'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gamification Section */}
        <div className="mb-12">
          <Card className="shadow-xl bg-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Achievements & Streaks
              </CardTitle>
              <CardDescription>Track your progress and unlock new milestones!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-8 items-center mb-6">
                <div className="flex flex-col items-center">
                  <Flame className="h-8 w-8 text-orange-500 mb-1" />
                  <span className="font-bold text-lg">{stats?.current_streak || 0}</span>
                  <span className="text-xs text-gray-500">Current Streak</span>
                </div>
                <div className="flex flex-col items-center">
                  <Flame className="h-8 w-8 text-red-500 mb-1" />
                  <span className="font-bold text-lg">{stats?.best_streak || 0}</span>
                  <span className="text-xs text-gray-500">Best Streak</span>
                </div>
                <div className="flex flex-col items-center">
                  <Trophy className="h-8 w-8 text-yellow-500 mb-1" />
                  <span className="font-bold text-lg">{stats?.total_workouts || 0}</span>
                  <span className="text-xs text-gray-500">Total Workouts</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {ALL_ACHIEVEMENTS.map(a => {
                  const unlocked = achievements.some(ua => ua.achievement_id === a.id);
                  return (
                    <div
                      key={a.id}
                      className={`flex flex-col items-center rounded-lg p-4 shadow transition-all ${unlocked ? 'bg-accent/10' : 'bg-muted opacity-50 grayscale'}`}
                    >
                      <a.icon className={`h-8 w-8 mb-2 ${unlocked ? 'text-accent animate-bounce' : 'text-muted-foreground'}`} />
                      <span className={`font-bold text-center ${unlocked ? 'text-accent' : 'text-muted-foreground'}`}>{a.label}</span>
                      <span className="text-xs text-muted-foreground mt-1">{unlocked ? 'Unlocked!' : 'Locked'}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Weekly Progress */}
          <Card className="shadow-xl bg-background border border-accent/30">
            <CardHeader>
              <CardTitle>Progress Over Time</CardTitle>
              <CardDescription>Your workout progress visualized</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#475569" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#475569" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" fontSize={12} stroke="#cbd5e1"/>
                  <YAxis fontSize={12} stroke="#cbd5e1"/>
                  <RechartsTooltip contentStyle={{ background: '#22223a', border: 'none', color: '#f8fafc' }}/>
                  <Area type="monotone" dataKey="weight" stroke="#475569" fill="url(#colorProgress)" name="Weight" strokeWidth={3} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {/* Quick Stats & Motivational Card */}
          <div className="space-y-8">
            <Card className="shadow-lg bg-background">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-blue-800 dark:text-blue-200">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Streak</span>
                  <Badge variant="secondary">{stats?.current_streak || 0} days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Best Streak</span>
                  <Badge variant="secondary">{stats?.best_streak || 0} days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <Badge variant="secondary">{stats?.total_workouts || 0} workouts</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <Badge variant="outline">{user?.start_date ? new Date(user.start_date).toLocaleDateString() : 'N/A'}</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg bg-background">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-emerald-700 dark:text-emerald-200">💡 Today's Motivation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground italic">
                  "The only bad workout is the one that didn't happen. Keep pushing forward!"
                </p>
                <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    🎯 Focus on {user?.goal === 'muscle_gain' ? 'progressive overload' : 'consistency and intensity'} today!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
