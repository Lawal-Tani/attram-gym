
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Award, Target, Dumbbell, Clock } from 'lucide-react';
import NavigationBar from '@/components/NavigationBar';

// Mock data for charts
const weeklyProgress = [
  { day: 'Mon', workouts: 2, duration: 90 },
  { day: 'Tue', workouts: 1, duration: 45 },
  { day: 'Wed', workouts: 3, duration: 120 },
  { day: 'Thu', workouts: 2, duration: 75 },
  { day: 'Fri', workouts: 1, duration: 60 },
  { day: 'Sat', workouts: 4, duration: 150 },
  { day: 'Sun', workouts: 2, duration: 80 },
];

const strengthProgress = [
  { exercise: 'Bench Press', weight: 135, date: '2024-01-01' },
  { exercise: 'Bench Press', weight: 145, date: '2024-02-01' },
  { exercise: 'Bench Press', weight: 155, date: '2024-03-01' },
  { exercise: 'Squat', weight: 185, date: '2024-01-01' },
  { exercise: 'Squat', weight: 200, date: '2024-02-01' },
  { exercise: 'Squat', weight: 215, date: '2024-03-01' },
  { exercise: 'Deadlift', weight: 225, date: '2024-01-01' },
  { exercise: 'Deadlift', weight: 245, date: '2024-02-01' },
  { exercise: 'Deadlift', weight: 265, date: '2024-03-01' },
];

const workoutTypes = [
  { name: 'Strength', value: 45, color: '#22c55e' },
  { name: 'Cardio', value: 30, color: '#3b82f6' },
  { name: 'Flexibility', value: 15, color: '#f59e0b' },
  { name: 'Sports', value: 10, color: '#ef4444' },
];

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
  const [selectedPeriod, setSelectedPeriod] = useState('week');

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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Dumbbell className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold">24</p>
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
                  <p className="text-2xl font-bold">18h</p>
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
                  <p className="text-2xl font-bold">+15%</p>
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
                  <p className="text-2xl font-bold">7</p>
                  <p className="text-xs text-muted-foreground">Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyProgress} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="workouts" fill="#22c55e" name="Workouts" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Workout Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Workout Distribution</CardTitle>
                <CardDescription>Breakdown of your workout types</CardDescription>
              </CardHeader>
              <CardContent>
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
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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
                <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={strengthProgress} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
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
