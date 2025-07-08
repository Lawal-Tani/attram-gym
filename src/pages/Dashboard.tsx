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
  const [weeklyGoal, setWeeklyGoal] = useState(4); // Default weekly workout goal
  const [actualWeeklyWorkouts, setActualWeeklyWorkouts] = useState(0);

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
      
      // Fetch this week's workout completions
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      
      const { data: thisWeekCompletions } = await supabase
        .from('workout_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_date', startOfWeek.toISOString().split('T')[0])
        .lte('completed_date', endOfWeek.toISOString().split('T')[0]);
      
      setActualWeeklyWorkouts(thisWeekCompletions?.length || 0);
      
      // Set weekly goal based on user preference
      const frequency = user.workout_frequency || '3-4';
      const goalMap: any = { '1-2': 2, '3-4': 4, '5-6': 6, 'daily': 7 };
      setWeeklyGoal(goalMap[frequency] || 4);
    }
    fetchGamification();
  }, [user?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMotivationIndex(i => (i + 1) % MOTIVATION_QUOTES.length);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const completionRate = Math.round((actualWeeklyWorkouts / weeklyGoal) * 100);

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 hero-bg"></div>
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl animate-float" style={{background: 'var(--gradient-neon)', opacity: 0.1}}></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl animate-float" style={{background: 'var(--gradient-fire)', opacity: 0.1, animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl animate-float" style={{background: 'var(--gradient-ocean)', opacity: 0.1, animationDelay: '4s'}}></div>
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full blur-2xl animate-float" style={{background: 'var(--gradient-sunset)', opacity: 0.15, animationDelay: '1s'}}></div>
      <div className="absolute bottom-20 left-20 w-56 h-56 rounded-full blur-2xl animate-float" style={{background: 'var(--gradient-nature)', opacity: 0.12, animationDelay: '3s'}}></div>
      
      <NavigationBar />
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Motivation Section - moved to top */}
        <div className="mb-12 text-center">
          <Card className="shadow-2xl mx-auto max-w-2xl border-0 card-hover animate-pulse-glow" style={{background: 'var(--gradient-hero)', boxShadow: 'var(--shadow-electric)'}}>
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-medium text-white font-poppins flex items-center justify-center gap-3">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                  💡
                </div>
                Daily Motivation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-white/90 italic font-normal leading-relaxed">
                "{MOTIVATION_QUOTES[motivationIndex]}"
              </p>
              <div className="mt-6 flex justify-center">
                <div className="px-4 py-2 bg-white/20 rounded-full text-white font-normal text-sm backdrop-blur-sm">
                  Keep pushing forward! 🚀
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Welcome Section */}
        <div className="mb-16 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 rounded-3xl blur-xl -z-10"></div>
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-semibold font-poppins mb-6 leading-tight">
              <span className="text-gradient drop-shadow-2xl">Welcome back,</span>
              <br />
              <span className="text-primary font-medium animate-float">{user?.name}</span>
              <span className="text-6xl md:text-8xl ml-4 animate-bounce">💪</span>
            </h1>
            <div className="relative">
              <p className="text-xl md:text-2xl text-foreground/70 font-medium mb-4 font-inter">
                Ready to crush your{' '}
                <span className="relative inline-block">
                  <span className="capitalize font-bold text-accent bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
                    {user?.goal?.replace('_', ' ')}
                  </span>
                </span>{' '}
                goals today?
              </p>
              <div className="flex justify-center gap-4 mt-6">
                <div className="px-6 py-3 bg-accent/10 rounded-full text-accent font-semibold border border-accent/20 glow-effect">
                  🔥 Let's Go!
                </div>
                <div className="px-6 py-3 bg-primary/10 rounded-full text-primary font-semibold border border-primary/20">
                  💯 Level Up
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <Card className="group relative overflow-hidden card-hover border-0 shadow-2xl" style={{background: 'var(--gradient-neon)', boxShadow: 'var(--shadow-neon)'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-3 relative z-10">
              <CardTitle className="text-lg font-medium text-white font-poppins">This Week</CardTitle>
              <div className="p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300 backdrop-blur-sm">
                <Target className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-semibold text-white mb-3 font-poppins">{completionRate}%</div>
              <Progress value={Math.max(completionRate, 15)} className="h-4 my-4 bg-white/20" />
              <p className="text-sm text-white/80 font-medium">
                {actualWeeklyWorkouts} of {weeklyGoal} workouts completed
              </p>
              {actualWeeklyWorkouts === 0 && (
                <p className="text-xs text-white/60 mt-1">
                  Last workout: {stats?.last_workout_date ? new Date(stats.last_workout_date).toLocaleDateString() : 'Never'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden card-hover border-0 shadow-2xl" style={{background: 'var(--gradient-ocean)', boxShadow: 'var(--shadow-electric)'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-3 relative z-10">
              <CardTitle className="text-lg font-medium text-white font-poppins">Streak</CardTitle>
              <div className="p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300 backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-semibold text-white mb-2 font-poppins">{stats?.current_streak || 0}</div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  {[...Array(Math.min(stats?.current_streak || 0, 7))].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-white/80 font-medium">days active streak</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden card-hover border-0 shadow-2xl" style={{background: 'var(--gradient-fire)', boxShadow: 'var(--shadow-cyber)'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-3 relative z-10">
              <CardTitle className="text-lg font-medium text-white font-poppins">Goal</CardTitle>
              <div className="p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300 backdrop-blur-sm">
                <Target className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-semibold capitalize text-white mb-2 font-poppins">
                {user?.goal?.replace('_', ' ')}
              </div>
              <div className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-semibold mb-2 inline-block backdrop-blur-sm">
                🎯 ACTIVE
              </div>
              <p className="text-sm text-white/80 font-medium">current focus area</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden card-hover border-0 shadow-2xl" style={{background: 'var(--gradient-sunset)', boxShadow: 'var(--shadow-neon)'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-3 relative z-10">
              <CardTitle className="text-lg font-medium text-white font-poppins">Membership</CardTitle>
              <div className="p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300 backdrop-blur-sm">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-semibold text-white mb-2 font-poppins">
                {membershipStatus.days}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold mb-2 inline-block backdrop-blur-sm ${
                membershipStatus.status === 'expired' ? 'bg-red-500/20 text-white' :
                membershipStatus.status === 'expiring' ? 'bg-yellow-500/20 text-white' :
                'bg-green-500/20 text-white'
              }`}>
                {membershipStatus.status === 'expired' ? '⚠️ EXPIRED' :
                 membershipStatus.status === 'expiring' ? '⏰ EXPIRING' :
                 '✅ ACTIVE'}
              </div>
              <p className="text-sm text-white/80 font-medium">
                {membershipStatus.status === 'expired' ? 'days past expiry' : 'days remaining'}
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
          <Card className="shadow-xl border-0 card-hover" style={{background: 'var(--gradient-nature)', boxShadow: 'var(--shadow-glow)'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="h-5 w-5 text-yellow-300" />
                Achievements & Streaks
              </CardTitle>
              <CardDescription className="text-white/80">Track your progress and unlock new milestones!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-8 items-center mb-6">
                <div className="flex flex-col items-center bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <Flame className="h-8 w-8 text-orange-300 mb-1" />
                  <span className="font-bold text-lg text-white">{stats?.current_streak || 0}</span>
                  <span className="text-xs text-white/70">Current Streak</span>
                </div>
                <div className="flex flex-col items-center bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <Flame className="h-8 w-8 text-red-300 mb-1" />
                  <span className="font-bold text-lg text-white">{stats?.best_streak || 0}</span>
                  <span className="text-xs text-white/70">Best Streak</span>
                </div>
                <div className="flex flex-col items-center bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <Trophy className="h-8 w-8 text-yellow-300 mb-1" />
                  <span className="font-bold text-lg text-white">{stats?.total_workouts || 0}</span>
                  <span className="text-xs text-white/70">Total Workouts</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {ALL_ACHIEVEMENTS.map(a => {
                  const unlocked = achievements.some(ua => ua.achievement_id === a.id);
                  return (
                    <div
                      key={a.id}
                      className={`flex flex-col items-center rounded-lg p-4 shadow transition-all backdrop-blur-sm ${unlocked ? 'bg-white/20 border border-white/30' : 'bg-white/5 opacity-50 grayscale'}`}
                    >
                      <a.icon className={`h-8 w-8 mb-2 ${unlocked ? 'text-yellow-300 animate-bounce' : 'text-white/50'}`} />
                      <span className={`font-bold text-center ${unlocked ? 'text-white' : 'text-white/50'}`}>{a.label}</span>
                      <span className="text-xs text-white/60 mt-1">{unlocked ? 'Unlocked!' : 'Locked'}</span>
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
