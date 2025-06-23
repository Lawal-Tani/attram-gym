import React, { useState } from 'react';
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

const Profile = () => {
  const { user, session, logout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    goal: user?.goal || 'weight_loss'
  });

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <NavigationBar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Your Profile
            </h1>
            <p className="text-gray-600">
              Manage your account information and fitness preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-emerald-500" />
                      Personal Information
                    </CardTitle>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSave}
                          className="bg-emerald-500 hover:bg-emerald-600"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(false)}
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
                          <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                          <p className="text-lg font-medium text-gray-800 mt-1">{user?.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Email</Label>
                          <p className="text-lg font-medium text-gray-800 mt-1">{session?.user?.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Fitness Goal</Label>
                          <div className="mt-1">
                            <Badge variant="secondary" className="text-sm">
                              {user?.goal === 'weight_loss' ? 'Weight Loss' : 'Muscle Gain'}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Account Type</Label>
                          <div className="mt-1">
                            <Badge
                              variant={user?.role === 'admin' ? 'default' : 'secondary'}
                              className="text-sm capitalize"
                            >
                              {user?.role}
                            </Badge>
                          </div>
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
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subscription Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-500" />
                    Subscription Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Current Plan</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm">
                          {getSubscriptionPlanDisplay()}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Upgrade Plan
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Billing Cycle</Label>
                      <p className="text-lg font-medium text-gray-800 mt-1">Monthly</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Next Billing Date</Label>
                      <p className="text-lg font-medium text-gray-800 mt-1">
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Membership Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Start Date</Label>
                      <p className="text-lg font-medium text-gray-800 mt-1">
                        {user?.start_date ? new Date(user.start_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Days as Member</Label>
                      <p className="text-lg font-medium text-gray-800 mt-1">{membershipDays} days</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Days Until Expiry</Label>
                      <div className="mt-1">
                        <Badge
                          variant={daysUntilExpiry <= 30 ? "destructive" : "secondary"}
                          className="text-sm"
                        >
                          {daysUntilExpiry} days
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {daysUntilExpiry <= 30 && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700 mb-2">
                        <Clock className="h-5 w-5" />
                        <span className="font-medium">Membership Expiring Soon</span>
                      </div>
                      <p className="text-red-600 text-sm mb-3">
                        Your membership expires in {daysUntilExpiry} days. Please renew to continue accessing all features.
                      </p>
                      <Button
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-100"
                      >
                        Renew Membership
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fitness Goal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    Your Fitness Journey
                  </CardTitle>
                  <CardDescription>
                    Information about your current fitness goal and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">
                        Current Goal: {user?.goal === 'weight_loss' ? 'Weight Loss' : 'Muscle Gain'}
                      </h4>
                      <p className="text-sm text-gray-600">
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
