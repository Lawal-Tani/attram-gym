import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Target, Calendar, Clock, Edit2, Save, X, Crown, LogOut } from 'lucide-react';
import NavigationBar from '@/components/NavigationBar';
import PaymentMethods from '@/components/PaymentMethods';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user, session, logout, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    goal: user?.goal || 'weight_loss',
    fitness_level: user?.fitness_level || 'beginner',
    experience_years: user?.experience_years || 0,
    workout_frequency: user?.workout_frequency || '3-4',
    preferred_duration: user?.preferred_duration || '30-45',
    equipment_access: user?.equipment_access || [],
    limitations: user?.limitations || [],
    injuries: user?.injuries || '',
  });

  const handleSave = async () => {
    // Save to Supabase
    const { error } = await supabase
      .from('users')
      .update({
        name: editData.name,
        goal: editData.goal,
        fitness_level: editData.fitness_level,
        experience_years: editData.experience_years,
        workout_frequency: editData.workout_frequency,
        preferred_duration: editData.preferred_duration,
        equipment_access: editData.equipment_access,
        limitations: editData.limitations,
        injuries: editData.injuries,
      })
      .eq('id', user.id);
    if (!error) {
      await refreshUser();
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    } else {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getDaysUntilExpiry = () => {
    if (!user?.membership_expiry) return 0;
    const today = new Date();
    const expiry = new Date(user.membership_expiry);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMembershipDuration = () => {
    if (!user?.start_date) return 0;
    const start = new Date(user.start_date);
    const today = new Date();
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSubscriptionPlanDisplay = () => {
    const plan = user?.subscription_plan || 'basic';
    const planNames = {
      basic: 'Basic Plan',
      premium: 'Premium Plan',
      pro: 'Pro Plan'
    };
    return planNames[plan as keyof typeof planNames] || 'Basic Plan';
  };

  const daysUntilExpiry = getDaysUntilExpiry();
  const membershipDays = getMembershipDuration();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavigationBar />

      <div className="container mx-auto px-2 sm:px-2 py-8 pb-28">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Your Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your account information and fitness preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Profile Information */}
              <Card className="bg-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-accent" />
                      Personal Information
                    </CardTitle>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="border-accent text-accent"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSave}
                          className="bg-accent text-white hover:bg-accent/80"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(false)}
                          className="border-muted-foreground text-muted-foreground"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isEditing ? (
                    <>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                          <p className="text-lg font-medium text-foreground mt-1">{user?.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                          <p className="text-lg font-medium text-foreground mt-1">{session?.user?.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Fitness Goal</Label>
                          <div className="mt-1">
                            <Badge variant="secondary" className="text-sm bg-accent text-white">
                              {user?.goal === 'weight_loss' ? 'Weight Loss' : 'Muscle Gain'}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Account Type</Label>
                          <div className="mt-1">
                            <Badge
                              variant={user?.role === 'admin' ? 'default' : 'secondary'}
                              className="text-sm capitalize bg-accent text-white"
                            >
                              {user?.role}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Fitness Level</Label>
                          <p className="text-lg font-medium text-foreground mt-1">{user?.fitness_level}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Experience (Years)</Label>
                          <p className="text-lg font-medium text-foreground mt-1">{user?.experience_years}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Workout Frequency</Label>
                          <p className="text-lg font-medium text-foreground mt-1">{user?.workout_frequency}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Preferred Duration</Label>
                          <p className="text-lg font-medium text-foreground mt-1">{user?.preferred_duration}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Equipment Access</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {user?.equipment_access?.length ? user.equipment_access.map((eq: string) => (
                              <Badge key={eq} className="bg-accent text-white">{eq}</Badge>
                            )) : <span className="text-muted-foreground">None</span>}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Limitations</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {user?.limitations?.length ? user.limitations.map((lim: string) => (
                              <Badge key={lim} className="bg-accent text-white">{lim}</Badge>
                            )) : <span className="text-muted-foreground">None</span>}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Injuries</Label>
                          <p className="text-lg font-medium text-foreground mt-1">{user?.injuries || 'None'}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="goal">Fitness Goal</Label>
                        <Select
                          value={editData.goal}
                          onValueChange={(value: 'weight_loss' | 'muscle_gain') =>
                            setEditData({ ...editData, goal: value })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weight_loss">Weight Loss</SelectItem>
                            <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="fitness_level">Fitness Level</Label>
                        <Select
                          value={editData.fitness_level}
                          onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => setEditData({ ...editData, fitness_level: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="experience_years">Experience (Years)</Label>
                        <Input
                          id="experience_years"
                          type="number"
                          min={0}
                          value={editData.experience_years}
                          onChange={e => setEditData({ ...editData, experience_years: Number(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="workout_frequency">Workout Frequency</Label>
                        <Select
                          value={editData.workout_frequency}
                          onValueChange={(value: string) => setEditData({ ...editData, workout_frequency: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-2">1-2 days/week</SelectItem>
                            <SelectItem value="3-4">3-4 days/week</SelectItem>
                            <SelectItem value="5-6">5-6 days/week</SelectItem>
                            <SelectItem value="7">Everyday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="preferred_duration">Preferred Duration</Label>
                        <Select
                          value={editData.preferred_duration}
                          onValueChange={(value: string) => setEditData({ ...editData, preferred_duration: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15-30">15-30 min</SelectItem>
                            <SelectItem value="30-45">30-45 min</SelectItem>
                            <SelectItem value="45-60">45-60 min</SelectItem>
                            <SelectItem value=">60">60+ min</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Equipment Access</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {['Dumbbells', 'Barbell', 'Kettlebell', 'Resistance Bands', 'Pull-up Bar', 'Bench', 'None'].map(eq => (
                            <Button
                              key={eq}
                              type="button"
                              variant={editData.equipment_access.includes(eq) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                setEditData(prev => {
                                  const exists = prev.equipment_access.includes(eq);
                                  return {
                                    ...prev,
                                    equipment_access: exists
                                      ? prev.equipment_access.filter(e => e !== eq)
                                      : [...prev.equipment_access, eq]
                                  };
                                });
                              }}
                            >
                              {eq}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Limitations</Label>
                        <Input
                          value={editData.limitations.join(', ')}
                          onChange={e => setEditData({ ...editData, limitations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                          placeholder="e.g. Knee pain, Asthma"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Injuries</Label>
                        <Input
                          value={editData.injuries}
                          onChange={e => setEditData({ ...editData, injuries: e.target.value })}
                          placeholder="e.g. Shoulder injury"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subscription Information */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-accent" />
                    Subscription Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Current Plan</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm bg-accent text-white">
                          {getSubscriptionPlanDisplay()}
                        </Badge>
                        <Button variant="default" size="sm" className="bg-accent text-white" onClick={() => toast({ title: 'Upgrade coming soon!' })}>
                          Upgrade Plan
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Billing Cycle</Label>
                      <p className="text-lg font-medium text-foreground mt-1">Monthly</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Next Billing Date</Label>
                      <p className="text-lg font-medium text-foreground mt-1">
                        {user?.membership_expiry ? new Date(user.membership_expiry).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Membership Info */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-accent" />
                    Membership Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                      <p className="text-lg font-medium text-foreground mt-1">
                        {user?.start_date ? new Date(user.start_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Days as Member</Label>
                      <p className="text-lg font-medium text-foreground mt-1">{membershipDays} days</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Days Until Expiry</Label>
                      <div className="mt-1">
                        <Badge
                          variant={daysUntilExpiry <= 30 ? "destructive" : "secondary"}
                          className={`text-sm ${daysUntilExpiry <= 30 ? 'bg-red-600 text-white' : 'bg-accent text-white'}`}
                        >
                          {daysUntilExpiry} days
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {daysUntilExpiry <= 30 && (
                    <div className="mt-6 p-4 bg-red-900 border border-red-700 rounded-lg">
                      <div className="flex items-center gap-2 text-red-200 mb-2">
                        <Clock className="h-5 w-5" />
                        <span className="font-medium">Membership Expiring Soon</span>
                      </div>
                      <p className="text-red-200 text-sm mb-3">
                        Your membership expires in {daysUntilExpiry} days. Please renew to continue accessing all features.
                      </p>
                      <Button
                        variant="outline"
                        className="border-red-400 text-red-200 hover:bg-red-800"
                      >
                        Renew Membership
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fitness Goal Info */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-accent" />
                    Your Fitness Journey
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Information about your current fitness goal and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-accent/20 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">
                        Current Goal: {user?.goal === 'weight_loss' ? 'Weight Loss' : 'Muscle Gain'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {user?.goal === 'weight_loss'
                          ? 'Focus on high-intensity workouts, cardio, and maintaining a caloric deficit for optimal weight loss results.'
                          : 'Emphasize strength training, progressive overload, and adequate nutrition to build lean muscle mass effectively.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Payment Methods - Full Width */}
          <div className="mt-6">
            <PaymentMethods />
          </div>

          {/* Logout Button - Bottom */}
          <div className="mt-10 max-w-md mx-auto">
            <Button
              variant="destructive"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
