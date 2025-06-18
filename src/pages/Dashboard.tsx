import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NavigationBar from '@/components/NavigationBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([]);

  // Mock workout data based on user goal
  const getWorkoutPlan = () => {
    if (user?.goal === 'muscle_gain') {
      return [
        { day: 'Monday', workout: 'Chest & Triceps', exercises: ['Bench Press', 'Incline Press', 'Tricep Dips'] },
        { day: 'Tuesday', workout: 'Back & Biceps', exercises: ['Pull-ups', 'Rows', 'Bicep Curls'] },
        { day: 'Wednesday', workout: 'Legs', exercises: ['Squats', 'Deadlifts', 'Leg Press'] },
        { day: 'Thursday', workout: 'Shoulders', exercises: ['Military Press', 'Lateral Raises', 'Rear Delts'] },
        { day: 'Friday', workout: 'Arms', exercises: ['Close-Grip Press', 'Hammer Curls', 'Dips'] },
        { day: 'Saturday', workout: 'Full Body', exercises: ['Compound Movements', 'Core Work'] }
      ];
    } else {
      return [
        { day: 'Monday', workout: 'HIIT Cardio', exercises: ['Burpees', 'Mountain Climbers', 'Jump Squats'] },
        { day: 'Tuesday', workout: 'Upper Body Circuit', exercises: ['Push-ups', 'Pull-ups', 'Planks'] },
        { day: 'Wednesday', workout: 'Cardio & Core', exercises: ['Running', 'Bicycle Crunches', 'Russian Twists'] },
        { day: 'Thursday', workout: 'Lower Body Circuit', exercises: ['Squats', 'Lunges', 'Calf Raises'] },
        { day: 'Friday', workout: 'Full Body HIIT', exercises: ['Kettlebell Swings', 'Box Jumps', 'Battle Ropes'] },
        { day: 'Saturday', workout: 'Active Recovery', exercises: ['Walking', 'Yoga', 'Stretching'] }
      ];
    }
  };

  const workoutPlan = getWorkoutPlan();
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
    if (!user?.membershipExpiry) return { status: 'unknown', days: 0 };
    
    const today = new Date();
    const expiry = new Date(user.membershipExpiry);
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { status: 'expired', days: Math.abs(daysLeft) };
    if (daysLeft <= 30) return { status: 'expiring', days: daysLeft };
    return { status: 'active', days: daysLeft };
  };

  const membershipStatus = getMembershipStatus();

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}! 💪
          </h1>
          <p className="text-muted-foreground">
            Ready to crush your {user?.goal?.replace('_', ' ')} goals today?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {completedWorkouts.length} of {workoutPlan.length} workouts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">days active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Goal</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {user?.goal?.replace('_', ' ')}
              </div>
              <p className="text-xs text-muted-foreground">current focus</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membership</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
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
          <Card className="mb-8 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
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
                  Expiry Date: {user?.membershipExpiry ? new Date(user.membershipExpiry).toLocaleDateString() : 'Not set'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Weekly Progress */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>This Week's Progress</CardTitle>
              <CardDescription>
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
                  <div key={workout.day} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium text-muted-foreground w-20">
                          {workout.day}
                        </div>
                        <div>
                          <h3 className="font-semibold">{workout.workout}</h3>
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Streak</span>
                  <Badge variant="secondary">7 days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Best Streak</span>
                  <Badge variant="secondary">14 days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <Badge variant="secondary">18 workouts</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <Badge variant="outline">{user?.startDate ? new Date(user.startDate).toLocaleDateString() : 'N/A'}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>💡 Today's Motivation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">
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
