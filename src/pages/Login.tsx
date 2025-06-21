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
  const { user, login, register, loading, authChecked } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enhanced redirect logic
  useEffect(() => {
    if (authChecked && user && !loading) {
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000); // 1s delay to ensure everything is loaded
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate, authChecked]);

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
    subscription_plan: 'basic'
  });

  const subscriptionPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$9.99/month',
      icon: Star,
      features: ['Access to basic workouts', 'Progress tracking', 'Basic nutrition tips']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$19.99/month',
      icon: Crown,
      features: ['All basic features', 'Personal trainer chat', 'Custom meal plans', 'Advanced analytics']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29.99/month',
      icon: Zap,
      features: ['All premium features', '1-on-1 video sessions', 'Supplement recommendations', 'Priority support']
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await login(loginData.email, loginData.password);
      if (!success) {
        toast({
          title: "Login failed",
          description: "Please check your email and password.",
          variant: "destructive",
        });
      }
    } catch (error) {
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
      const success = await register({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        goal: signupData.goal,
        subscription_plan: signupData.subscription_plan
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
          subscription_plan: 'basic'
        });
      }
    } catch (error) {
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
  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-6">
                  {/* [Keep all your existing signup form JSX unchanged] */}
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
