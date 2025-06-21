
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
  const { user, login, register, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    console.log('Login useEffect - user:', user, 'loading:', loading);
    if (user && !loading) {
      console.log('User logged in, redirecting to dashboard:', user);
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

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
    console.log('Login attempt started');
    setIsSubmitting(true);

    try {
      const success = await login(loginData.email, loginData.password);
      console.log('Login result:', success);
      if (success) {
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        });
      } else {
        toast({
          title: "Login failed",
          description: "Please check your email and password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
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
        // Reset form
        setSignupData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          goal: 'weight_loss',
          subscription_plan: 'basic'
        });
      } else {
        toast({
          title: "Signup failed",
          description: "Please try again with different details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
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
  if (loading) {
    console.log('Showing loading spinner - auth context loading');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering login form - user:', user, 'loading:', loading);

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        required
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Fitness Goal</Label>
                    <select
                      id="goal"
                      className="w-full p-2 border border-gray-300 rounded-md disabled:opacity-50"
                      value={signupData.goal}
                      onChange={(e) => setSignupData({ ...signupData, goal: e.target.value as 'weight_loss' | 'muscle_gain' })}
                      disabled={isSubmitting}
                    >
                      <option value="weight_loss">Weight Loss</option>
                      <option value="muscle_gain">Muscle Gain</option>
                    </select>
                  </div>

                  {/* Subscription Plans */}
                  <div className="space-y-3">
                    <Label>Choose Your Plan</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {subscriptionPlans.map((plan) => {
                        const IconComponent = plan.icon;
                        return (
                          <div
                            key={plan.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              signupData.subscription_plan === plan.id
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSignupData({ ...signupData, subscription_plan: plan.id })}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <IconComponent className="h-5 w-5 text-emerald-600" />
                              <h4 className="font-medium">{plan.name}</h4>
                            </div>
                            <p className="text-lg font-bold text-emerald-600 mb-2">{plan.price}</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {plan.features.map((feature, index) => (
                                <li key={index}>• {feature}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : "Create account"}
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
