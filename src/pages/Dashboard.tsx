import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NavigationBar from '@/components/NavigationBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, TrendingUp, CheckCircle, Clock, AlertTriangle, Trophy, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

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
        {/* Welcome Section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-700 dark:text-emerald-400 mb-3 drop-shadow-lg">
            Welcome back, <span className="text-blue-600 dark:text-blue-300">{user?.name}</span>! 💪
          </h1>
          <p className="text-lg md:text-xl text-blue-900 dark:text-blue-200 font-medium">
            Ready to crush your <span className="capitalize font-semibold text-emerald-600 dark:text-emerald-300">{user?.goal?.replace('_', ' ')}</span> goals today?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <Card className="shadow-xl hover:scale-105 transition-transform bg-gradient-to-br from-emerald-200 to-blue-100 dark:from-emerald-900 dark:to-blue-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-emerald-800 dark:text-emerald-200">This Week</CardTitle>
              <Target className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">{completionRate}%</div>
              <Progress value={completionRate} className="h-2 my-2" />
              <p className="text-xs text-muted-foreground">
                {completedWorkouts.length} of {workoutPlan.length} workouts
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-xl hover:scale-105 transition-transform bg-gradient-to-br from-blue-200 to-emerald-100 dark:from-blue-900 dark:to-emerald-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-blue-800 dark:text-blue-200">Streak</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">7</div>
              <p className="text-xs text-muted-foreground">days active</p>
            </CardContent>
          </Card>
          <Card className="shadow-xl hover:scale-105 transition-transform bg-gradient-to-br from-emerald-100 to-blue-50 dark:from-emerald-800 dark:to-blue-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-emerald-800 dark:text-emerald-200">Goal</CardTitle>
              <Target className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize text-emerald-700 dark:text-emerald-300">
                {user?.goal?.replace('_', ' ')}
              </div>
              <p className="text-xs text-muted-foreground">current focus</p>
            </CardContent>
          </Card>
          <Card className="shadow-xl hover:scale-105 transition-transform bg-gradient-to-br from-blue-100 to-emerald-50 dark:from-blue-800 dark:to-emerald-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-blue-800 dark:text-blue-200">Membership</CardTitle>
              <Calendar className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
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
          <Card className="shadow-xl bg-gradient-to-br from-yellow-50 to-emerald-50 dark:from-yellow-900 dark:to-emerald-900">
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
              <div>
                <h4 className="font-semibold mb-2">Unlocked Achievements</h4>
                <div className="flex flex-wrap gap-3">
                  {achievements.length === 0 && <span className="text-gray-400">No achievements yet.</span>}
                  {achievements.map(a => (
                    <Badge key={a.achievement_id} variant="default" className="flex items-center gap-1 px-3 py-2 text-sm">
                      <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                      {a.achievement_id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Weekly Progress */}
          <Card className="lg:col-span-2 shadow-lg bg-white/80 dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-emerald-700 dark:text-emerald-300">This Week's Progress</CardTitle>
              <CardDescription className="text-blue-900 dark:text-blue-200">
                Your {user?.goal?.replace('_', ' ')} workout plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Weekly Completion</span>
                  <span>{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>
              <div className="space-y-4">
                {workoutPlan.map((workout) => (
                  <div key={workout.day} className="flex items-center justify-between p-4 border rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900 transition-colors shadow-sm">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium text-muted-foreground w-20">
                          {workout.day}
                        </div>
                        <div>
                          <h3 className="font-semibold text-emerald-700 dark:text-emerald-200">{workout.workout}</h3>
                          <p className="text-sm text-muted-foreground">
                            {workout.exercises.slice(0, 2).join(', ')}
                            {workout.exercises.length > 2 && '...'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={completedWorkouts.includes(workout.day) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleWorkoutCompletion(workout.day)}
                      className={completedWorkouts.includes(workout.day) ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      {completedWorkouts.includes(workout.day) ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Done
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Mark Done
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Quick Stats & Motivational Card */}
          <div className="space-y-8">
            <Card className="shadow-lg bg-gradient-to-br from-emerald-100 to-blue-50 dark:from-emerald-900 dark:to-blue-900">
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
            <Card className="shadow-lg bg-gradient-to-br from-blue-100 to-emerald-50 dark:from-blue-900 dark:to-emerald-900">
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
