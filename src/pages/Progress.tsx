import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
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

const ALL_ACHIEVEMENTS = [
  { id: 'first_workout', label: 'First Workout', icon: Award },
  { id: 'streak_7', label: '7-Day Streak', icon: TrendingUp },
  { id: 'streak_30', label: '30-Day Streak', icon: TrendingUp },
  { id: 'workouts_50', label: '50 Workouts', icon: Dumbbell },
  { id: 'workouts_100', label: '100 Workouts', icon: Dumbbell },
  { id: 'goal_completed', label: 'Goal Completed', icon: Target },
];

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
  const [cardioStats, setCardioStats] = useState({
    weeklyMinutes: 0,
    avgHeartRate: 0,
    caloriesBurned: 0,
    weeklyGoal: 240 // 4 hours weekly goal
  });
  const [goalProgress, setGoalProgress] = useState({
    weeklyWorkouts: { current: 0, target: 4 },
    benchPress: { current: 0, target: 200 },
    runTime: { current: 0, target: 25 }, // in minutes
    weightLoss: { current: 0, target: 10 }
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingWeekly, setLoadingWeekly] = useState(true);
  const [errorWeekly, setErrorWeekly] = useState<string | null>(null);
  const [loadingStrength, setLoadingStrength] = useState(true);
  const [errorStrength, setErrorStrength] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [typeData, setTypeData] = useState<any[]>([]);
  const [achievements] = useState([
    { achievement_id: 'first_workout' },
    { achievement_id: 'streak_7' },
  ]);

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
        
        // Calculate strength change from recent progress entries
        const { data: recentStrength } = await supabase
          .from('progress_entries')
          .select('weight, date')
          .eq('user_id', user.id)
          .eq('workout_type', 'strength')
          .order('date', { ascending: false })
          .limit(10);
        
        let strengthChange = 0;
        if (recentStrength && recentStrength.length > 1) {
          const latest = recentStrength[0]?.weight || 0;
          const earlier = recentStrength[recentStrength.length - 1]?.weight || 0;
          if (earlier > 0) {
            strengthChange = Math.round(((latest - earlier) / earlier) * 100);
          }
        }
        
        setQuickStats({
          workouts: stats?.total_workouts || 0,
          totalTime: stats?.total_duration_minutes || 0,
          streak: stats?.current_streak || 0,
          strengthChange,
        });
        
        // Fetch cardio stats from this week
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        
        const { data: cardioEntries } = await supabase
          .from('progress_entries')
          .select('duration_minutes')
          .eq('user_id', user.id)
          .eq('workout_type', 'cardio')
          .gte('date', startOfWeek.toISOString().split('T')[0]);
        
        const weeklyCardioMinutes = cardioEntries?.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) || 0;
        
        setCardioStats({
          weeklyMinutes: weeklyCardioMinutes,
          avgHeartRate: 142, // placeholder - could be calculated from actual data
          caloriesBurned: Math.round(weeklyCardioMinutes * 10), // rough estimation
          weeklyGoal: 240
        });
        
        // Fetch goal progress
        const { data: thisWeekCompletions } = await supabase
          .from('workout_completions')
          .select('*')
          .eq('user_id', user.id)
          .gte('completed_date', startOfWeek.toISOString().split('T')[0]);
        
        // Get latest bench press weight
        const { data: benchData } = await supabase
          .from('progress_entries')
          .select('weight')
          .eq('user_id', user.id)
          .ilike('exercise_name', '%bench%press%')
          .order('date', { ascending: false })
          .limit(1);
        
        setGoalProgress({
          weeklyWorkouts: { current: thisWeekCompletions?.length || 0, target: 4 },
          benchPress: { current: benchData?.[0]?.weight || 0, target: 200 },
          runTime: { current: 27.5, target: 25 }, // placeholder
          weightLoss: { current: 6, target: 10 } // placeholder
        });
        
      } catch (err: any) {
        setErrorStats(err.message || 'Failed to load quick stats');
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [user]);

  useEffect(() => {
    async function fetchCharts() {
      if (!user?.id) return;
      const { data: progressEntries } = await supabase
        .from('progress_entries')
        .select('date, weight, duration_minutes, workout_type')
        .eq('user_id', user.id)
        .order('date', { ascending: true });
      setProgressData((progressEntries || []).map((e: any) => ({
        date: e.date,
        weight: e.weight || 0,
        duration: e.duration_minutes || 0
      })));
      const typeCounts: Record<string, number> = {};
      (progressEntries || []).forEach((e: any) => {
        if (e.workout_type) typeCounts[e.workout_type] = (typeCounts[e.workout_type] || 0) + 1;
      });
      setTypeData(Object.entries(typeCounts).map(([type, value]) => ({ type, value })));
    }
    fetchCharts();
  }, [user?.id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-20 md:pb-20">
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

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Progress Over Time Line Chart */}
              <Card className="shadow-lg bg-background border border-accent/30">
                <CardHeader>
                  <CardTitle>Progress Over Time</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" fontSize={12} stroke="#cbd5e1" />
                      <YAxis fontSize={12} stroke="#cbd5e1" />
                      <Tooltip contentStyle={{ background: '#22223a', border: 'none', color: '#f8fafc' }}/>
                      <Line type="monotone" dataKey="weight" stroke="#475569" name="Weight" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="duration" stroke="#10b981" name="Duration (min)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              {/* Workout Type Distribution Pie Chart */}
              <Card className="shadow-lg bg-background border border-accent/30">
                <CardHeader>
                  <CardTitle>Workout Type Distribution</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={typeData} dataKey="value" nameKey="type" cx="50%" cy="50%" outerRadius={70} label>
                        {typeData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={["#475569", "#6366f1", "#f59e42", "#f43f5e"][idx % 4]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip contentStyle={{ background: '#22223a', border: 'none', color: '#f8fafc' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
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
                    <Badge variant="secondary">{cardioStats.weeklyMinutes} / {cardioStats.weeklyGoal} min</Badge>
                  </div>
                   <Progress value={Math.max((cardioStats.weeklyMinutes / cardioStats.weeklyGoal) * 100, 8)} className="h-2" />
                   
                   <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Heart Rate</span>
                    <Badge variant="secondary">{cardioStats.avgHeartRate} bpm</Badge>
                  </div>
                  <Progress value={65} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Calories Burned</span>
                    <Badge variant="secondary">{cardioStats.caloriesBurned} cal</Badge>
                  </div>
                  <Progress value={Math.min((cardioStats.caloriesBurned / 2400) * 100, 100)} className="h-2" />
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
                      <span className="font-medium">Workout {goalProgress.weeklyWorkouts.target}x per week</span>
                      <span className="text-sm text-muted-foreground">{goalProgress.weeklyWorkouts.current}/{goalProgress.weeklyWorkouts.target} this week</span>
                    </div>
                    <Progress value={(goalProgress.weeklyWorkouts.current / goalProgress.weeklyWorkouts.target) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Bench Press {goalProgress.benchPress.target}lbs</span>
                      <span className="text-sm text-muted-foreground">{goalProgress.benchPress.current}/{goalProgress.benchPress.target} lbs</span>
                    </div>
                    <Progress value={(goalProgress.benchPress.current / goalProgress.benchPress.target) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Run 5K in {goalProgress.runTime.target} minutes</span>
                      <span className="text-sm text-muted-foreground">{goalProgress.runTime.current}:30 current</span>
                    </div>
                    <Progress value={Math.max(0, 100 - ((goalProgress.runTime.current - goalProgress.runTime.target) / goalProgress.runTime.target * 100))} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Lose {goalProgress.weightLoss.target} pounds</span>
                      <span className="text-sm text-muted-foreground">{goalProgress.weightLoss.current}/{goalProgress.weightLoss.target} lbs</span>
                    </div>
                    <Progress value={(goalProgress.weightLoss.current / goalProgress.weightLoss.target) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Achievements Section */}
        <Card className="shadow-lg bg-background mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Achievements
            </CardTitle>
            <CardDescription>Unlock achievements as you progress!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {ALL_ACHIEVEMENTS.map(a => {
                // Assume you have achievements from Supabase in a variable called achievements
                const unlocked = (achievements || []).some(ua => ua.achievement_id === a.id);
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

      <NavigationBar />
    </div>
  );
};

export default ProgressPage;

