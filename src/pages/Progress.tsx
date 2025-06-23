import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Calendar, TrendingUp, Award, Target, Dumbbell, Clock } from 'lucide-react';
import NavigationBar from '@/components/NavigationBar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const chartConfig = {
  workouts: {
    label: 'Workouts',
    color: '#22c55e',
  },
  duration: {
    label: 'Duration (min)',
    color: '#3b82f6',
  },
  weight: {
    label: 'Weight (lbs)',
    color: '#22c55e',
  },
};

const ProgressPage = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([]);
  const [strengthProgress, setStrengthProgress] = useState<any[]>([]);
  const [workoutTypes, setWorkoutTypes] = useState<any[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [errorTypes, setErrorTypes] = useState<string | null>(null);
  const [quickStats, setQuickStats] = useState({
    workouts: 0,
    totalTime: 0,
    streak: 0,
    strengthChange: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingWeekly, setLoadingWeekly] = useState(true);
  const [errorWeekly, setErrorWeekly] = useState<string | null>(null);
  const [loadingStrength, setLoadingStrength] = useState(true);
  const [errorStrength, setErrorStrength] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const fetchData = async () => {
      try {
        // Weekly Progress
        const { data: completions, error: completionsError } = await supabase
          .from('workout_completions')
          .select('completed_date, duration_minutes')
          .eq('user_id', user.id);
        if (completionsError) throw completionsError;
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekData = weekDays.map(day => ({ day, workouts: 0, duration: 0 }));
        completions.forEach((c: any) => {
          const d = new Date(c.completed_date);
          const day = weekDays[d.getDay()];
          const entry = weekData.find(w => w.day === day);
          if (entry) {
            entry.workouts += 1;
            entry.duration += c.duration_minutes || 0;
          }
        });
        setWeeklyProgress(weekData);
        // Strength Progress
        const { data: strengthEntries, error: strengthError } = await supabase
          .from('progress_entries')
          .select('exercise_name, weight, date')
          .eq('user_id', user.id)
          .eq('workout_type', 'strength');
        if (strengthError) throw strengthError;
        setStrengthProgress(strengthEntries);
        // Quick Stats
        const { data: stats, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (statsError) throw statsError;
        setQuickStats({
          workouts: stats.total_workouts,
          totalTime: stats.total_duration_minutes,
          streak: stats.current_streak,
          strengthChange: 0,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoadingWeekly(true);
    setErrorWeekly(null);
    const fetchWeekly = async () => {
      try {
        const { data: completions, error: completionsError } = await supabase
          .from('workout_completions')
          .select('completed_date, duration_minutes')
          .eq('user_id', user.id);
        if (completionsError) throw completionsError;
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekData = weekDays.map(day => ({ day, workouts: 0, duration: 0 }));
        completions.forEach((c: any) => {
          const d = new Date(c.completed_date);
          const day = weekDays[d.getDay()];
          const entry = weekData.find(w => w.day === day);
          if (entry) {
            entry.workouts += 1;
            entry.duration += c.duration_minutes || 0;
          }
        });
        setWeeklyProgress(weekData);
      } catch (err: any) {
        setErrorWeekly(err.message || 'Failed to load weekly progress');
      } finally {
        setLoadingWeekly(false);
      }
    };
    fetchWeekly();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoadingStrength(true);
    setErrorStrength(null);
    const fetchStrength = async () => {
      try {
        const { data: strengthEntries, error: strengthError } = await supabase
          .from('progress_entries')
          .select('exercise_name, weight, date')
          .eq('user_id', user.id)
          .eq('workout_type', 'strength');
        if (strengthError) throw strengthError;
        setStrengthProgress(strengthEntries);
      } catch (err: any) {
        setErrorStrength(err.message || 'Failed to load strength progress');
      } finally {
        setLoadingStrength(false);
      }
    };
    fetchStrength();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoadingTypes(true);
    setErrorTypes(null);
    const fetchTypes = async () => {
      try {
        const { data: allEntries, error: allEntriesError } = await supabase
          .from('progress_entries')
          .select('workout_type')
          .eq('user_id', user.id);
        if (allEntriesError) throw allEntriesError;
        const typeCounts: any = {};
        allEntries.forEach((e: any) => {
          typeCounts[e.workout_type] = (typeCounts[e.workout_type] || 0) + 1;
        });
        const typeColors: any = {
          strength: '#22c55e',
          cardio: '#3b82f6',
          flexibility: '#f59e0b',
          sports: '#ef4444',
        };
        setWorkoutTypes(
          Object.entries(typeCounts).map(([name, value]: any) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            color: typeColors[name] || '#8884d8',
          }))
        );
      } catch (err: any) {
        setErrorTypes(err.message || 'Failed to load workout types');
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchTypes();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoadingStats(true);
    setErrorStats(null);
    const fetchStats = async () => {
      try {
        const { data: stats, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (statsError) throw statsError;
        setQuickStats({
          workouts: stats.total_workouts,
          totalTime: stats.total_duration_minutes,
          streak: stats.current_streak,
          strengthChange: 0,
        });
      } catch (err: any) {
        setErrorStats(err.message || 'Failed to load quick stats');
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Workout Progress</h1>
          <p className="text-muted-foreground">Track your fitness journey and achievements</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {loadingStats ? (
            <div>Loading quick stats...</div>
          ) : errorStats ? (
            <div className="text-red-500">{errorStats}</div>
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Dumbbell className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-2xl font-bold">{quickStats.workouts}</p>
                      <p className="text-xs text-muted-foreground">Workouts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{Math.floor(quickStats.totalTime / 60)}h {quickStats.totalTime % 60}m</p>
                      <p className="text-xs text-muted-foreground">Total Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">+{quickStats.strengthChange}%</p>
                      <p className="text-xs text-muted-foreground">Strength</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">{quickStats.streak}</p>
                      <p className="text-xs text-muted-foreground">Streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="strength">Strength</TabsTrigger>
            <TabsTrigger value="cardio">Cardio</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Weekly Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Weekly Activity</span>
                </CardTitle>
                <CardDescription>Your workout frequency and duration this week</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingWeekly ? (
                  <div>Loading weekly progress...</div>
                ) : errorWeekly ? (
                  <div className="text-red-500">{errorWeekly}</div>
                ) : (
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyProgress} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="workouts" fill="#22c55e" name="Workouts" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Workout Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Workout Distribution</CardTitle>
                <CardDescription>Breakdown of your workout types</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTypes ? (
                  <div>Loading workout types...</div>
                ) : errorTypes ? (
                  <div className="text-red-500">{errorTypes}</div>
                ) : (
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <Pie
                          data={workoutTypes}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {workoutTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strength" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Strength Progress</CardTitle>
                <CardDescription>Track your lifting progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStrength ? (
                  <div>Loading strength progress...</div>
                ) : errorStrength ? (
                  <div className="text-red-500">{errorStrength}</div>
                ) : (
                  <div className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={strengthProgress} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cardio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cardio Performance</CardTitle>
                <CardDescription>Your cardiovascular fitness improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Weekly Cardio Minutes</span>
                    <Badge variant="secondary">180 min</Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Heart Rate</span>
                    <Badge variant="secondary">142 bpm</Badge>
                  </div>
                  <Progress value={65} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Calories Burned</span>
                    <Badge variant="secondary">2,450 cal</Badge>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Fitness Goals</span>
                </CardTitle>
                <CardDescription>Track your progress towards your fitness objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Workout 4x per week</span>
                      <span className="text-sm text-muted-foreground">3/4 this week</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Bench Press 200lbs</span>
                      <span className="text-sm text-muted-foreground">155/200 lbs</span>
                    </div>
                    <Progress value={77.5} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Run 5K in 25 minutes</span>
                      <span className="text-sm text-muted-foreground">27:30 current</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Lose 10 pounds</span>
                      <span className="text-sm text-muted-foreground">6/10 lbs</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <NavigationBar />
    </div>
  );
};

export default ProgressPage;

