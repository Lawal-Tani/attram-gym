
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, TrendingUp, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';

const Dashboard = () => {
  const { user } = useAuth();
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Load completed workouts from localStorage
    const saved = localStorage.getItem(`workouts_${user?.id}`);
    if (saved) {
      const savedWorkouts = JSON.parse(saved);
      setCompletedWorkouts(savedWorkouts);
      
      // Calculate weekly progress (assuming 6 workouts per week)
      const thisWeek = savedWorkouts.filter((date: string) => {
        const workoutDate = new Date(date);
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return workoutDate >= weekStart;
      });
      
      setWeeklyProgress((thisWeek.length / 6) * 100);
      setStreak(thisWeek.length);
    }
  }, [user?.id]);

  const getDaysUntilExpiry = () => {
    if (!user?.membershipExpiry) return 0;
    const today = new Date();
    const expiry = new Date(user.membershipExpiry);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name}! 💪
          </h1>
          <p className="text-gray-600">
            Ready to crush your {user?.goal === 'weight_loss' ? 'weight loss' : 'muscle gain'} goals today?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(weeklyProgress)}%</div>
              <Progress value={weeklyProgress} className="mt-2 bg-emerald-400" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Target className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streak} days</div>
              <p className="text-xs text-blue-100 mt-1">Keep it up!</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
              <Calendar className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedWorkouts.length}</div>
              <p className="text-xs text-purple-100 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className={`${daysUntilExpiry <= 30 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'} text-white`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membership</CardTitle>
              <Clock className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{daysUntilExpiry} days</div>
              <p className="text-xs opacity-90 mt-1">
                {daysUntilExpiry <= 30 ? 'Renew soon!' : 'Until expiry'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Membership Alert */}
        {daysUntilExpiry <= 30 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Membership Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-4">
                Your membership expires in {daysUntilExpiry} days. Contact the gym to renew your membership.
              </p>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                Contact Gym
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-500" />
                Today's Workout
              </CardTitle>
              <CardDescription>
                Your personalized {user?.goal === 'weight_loss' ? 'weight loss' : 'muscle gain'} workout plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Ready to tackle your workout? Your plan is designed specifically for your goals.
              </p>
              <Link to="/workout-plan">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                  View Workout Plan
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Your Profile
              </CardTitle>
              <CardDescription>
                Manage your account and fitness preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Goal:</span>
                  <Badge variant="secondary">
                    {user?.goal === 'weight_loss' ? 'Weight Loss' : 'Muscle Gain'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member since:</span>
                  <span className="text-gray-800">
                    {user?.startDate ? new Date(user.startDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              <Link to="/profile">
                <Button variant="outline" className="w-full">
                  Manage Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your workout history from the past week</CardDescription>
          </CardHeader>
          <CardContent>
            {completedWorkouts.length > 0 ? (
              <div className="space-y-2">
                {completedWorkouts.slice(-5).reverse().map((date, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600">Workout completed</span>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      {new Date(date).toLocaleDate()}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No workouts completed yet. Start your first workout today!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
