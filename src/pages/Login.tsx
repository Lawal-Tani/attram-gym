import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Crown, Star, Zap } from 'lucide-react';

const Login = () => {
  const { user, login, register, loading, authChecked, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('Login page render - authChecked:', authChecked, 'user:', !!user, 'loading:', loading);

  // Redirect authenticated users
  useEffect(() => {
    if (authChecked && user && !loading) {
      console.log('Redirecting authenticated user to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate, authChecked]);

  // Show auth error if any
  useEffect(() => {
    if (error) {
      toast({
        title: "Authentication Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    goal: 'weight_loss' as 'weight_loss' | 'muscle_gain',
    subscription_plan: 'basic',
    fitness_level: 'beginner'
  });

  const subscriptionPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '₵120/month',
      icon: Star,
      features: ['Access to basic workouts', 'Progress tracking', 'Basic nutrition tips']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '₵220/month',
      icon: Crown,
      features: ['All basic features', 'Personal trainer chat', 'Custom meal plans', 'Advanced analytics']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '₵320/month',
      icon: Zap,
      features: ['All premium features', '1-on-1 video sessions', 'Supplement recommendations', 'Priority support']
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Submitting login form');
      const success = await login(loginData.email, loginData.password);
      if (!success) {
        toast({
          title: "Login failed",
          description: "Please check your email and password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login form error:', error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting signup form');
      const success = await register({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        goal: signupData.goal,
        subscription_plan: signupData.subscription_plan,
        fitness_level: signupData.fitness_level as 'beginner' | 'intermediate' | 'advanced'
      });

      if (success) {
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account before logging in.",
        });
        setSignupData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          goal: 'weight_loss',
          subscription_plan: 'basic',
          fitness_level: 'beginner'
        });
      }
    } catch (error) {
      console.error('Signup form error:', error);
      toast({
        title: "Signup error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while auth is initializing
  if (!authChecked) {
    console.log('Showing auth loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show a brief message before redirect
  if (user) {
    console.log('User authenticated, showing redirect message');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Welcome back! Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering login form');
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Dumbbell className="h-8 w-8 text-emerald-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">FitTracker</h1>
          </div>
          <p className="text-gray-600">Your personal fitness companion</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      disabled={isSubmitting || loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      disabled={isSubmitting || loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        placeholder="Enter your full name"
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        required
                        disabled={isSubmitting || loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        required
                        disabled={isSubmitting || loading}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        required
                        disabled={isSubmitting || loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        required
                        disabled={isSubmitting || loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Fitness Goal</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={signupData.goal === 'weight_loss' ? 'default' : 'outline'}
                        onClick={() => setSignupData({ ...signupData, goal: 'weight_loss' })}
                        disabled={isSubmitting || loading}
                        className="w-full"
                      >
                        Weight Loss
                      </Button>
                      <Button
                        type="button"
                        variant={signupData.goal === 'muscle_gain' ? 'default' : 'outline'}
                        onClick={() => setSignupData({ ...signupData, goal: 'muscle_gain' })}
                        disabled={isSubmitting || loading}
                        className="w-full"
                      >
                        Muscle Gain
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Choose Your Plan</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {subscriptionPlans.map((plan) => {
                        const IconComponent = plan.icon;
                        return (
                          <div
                            key={plan.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                              signupData.subscription_plan === plan.id
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSignupData({ ...signupData, subscription_plan: plan.id })}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <IconComponent className="h-5 w-5" />
                              <span className="font-semibold">{plan.name}</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">{plan.price}</div>
                            <ul className="text-xs space-y-1">
                              {plan.features.map((feature, index) => (
                                <li key={index}>• {feature}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
