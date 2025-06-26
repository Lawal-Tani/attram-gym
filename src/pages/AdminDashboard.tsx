import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NavigationBar from '@/components/NavigationBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Calendar, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Member {
  id: string;
  name: string;
  email: string;
  goal: 'weight_loss' | 'muscle_gain';
  membershipExpiry: string;
  startDate: string;
  role: 'user' | 'admin';
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    goal: 'weight_loss' as 'weight_loss' | 'muscle_gain',
    membershipExpiry: '',
    role: 'user' as 'user' | 'admin'
  });

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('id, name, goal, role, membership_expiry, start_date');
        if (fetchError) throw fetchError;
        setMembers(
          data.map((u: any) => ({
            id: u.id,
            name: u.name,
            goal: u.goal,
            membershipExpiry: u.membership_expiry,
            startDate: u.start_date,
            role: u.role,
          }))
        );
      } catch (err: any) {
        setError(err.message || 'Failed to load members');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.membershipExpiry) {
      const user: Member = {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        goal: newUser.goal,
        membershipExpiry: newUser.membershipExpiry,
        startDate: new Date().toISOString().split('T')[0],
        role: newUser.role
      };
      setMembers([...members, user]);
      setNewUser({ name: '', email: '', goal: 'weight_loss', membershipExpiry: '', role: 'user' });
    }
  };

  const getMembershipStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { status: 'expired', days: Math.abs(daysLeft) };
    if (daysLeft <= 30) return { status: 'expiring', days: daysLeft };
    return { status: 'active', days: daysLeft };
  };

  const activeMembers = members.filter(m => getMembershipStatus(m.membershipExpiry).status !== 'expired').length;
  const expiringMembers = members.filter(m => getMembershipStatus(m.membershipExpiry).status === 'expiring').length;
  const totalAdmins = members.filter(m => m.role === 'admin').length;

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}! Manage gym members and admins.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeMembers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{expiringMembers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalAdmins}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add New User/Admin */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
              <CardDescription>Register a new member or admin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value: 'user' | 'admin') => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="goal">Fitness Goal</Label>
                <Select value={newUser.goal} onValueChange={(value: 'weight_loss' | 'muscle_gain') => setNewUser({ ...newUser, goal: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Weight Loss</SelectItem>
                    <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expiry">Membership Expiry</Label>
                <Input
                  id="expiry"
                  type="date"
                  value={newUser.membershipExpiry}
                  onChange={(e) => setNewUser({ ...newUser, membershipExpiry: e.target.value })}
                />
              </div>

              <Button onClick={handleAddUser} className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Add {newUser.role === 'admin' ? 'Admin' : 'Member'}
              </Button>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Users & Admins</CardTitle>
              <CardDescription>Manage existing users and administrators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => {
                  const membershipInfo = getMembershipStatus(member.membershipExpiry);
                  return (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{member.name}</h3>
                          {member.role === 'admin' && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">
                          Goal: {member.goal.replace('_', ' ')}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="mb-1">
                          {membershipInfo.status === 'active' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              Active
                            </Badge>
                          )}
                          {membershipInfo.status === 'expiring' && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                              Expiring Soon
                            </Badge>
                          )}
                          {membershipInfo.status === 'expired' && (
                            <Badge variant="destructive">
                              Expired
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Expires: {new Date(member.membershipExpiry).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {membershipInfo.status === 'expired' 
                            ? `${membershipInfo.days} days ago`
                            : `${membershipInfo.days} days left`
                          }
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
