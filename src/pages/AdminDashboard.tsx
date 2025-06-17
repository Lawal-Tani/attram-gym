
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NavigationBar from '@/components/NavigationBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Calendar, Target } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  goal: 'weight_loss' | 'muscle_gain';
  membershipExpiry: string;
  startDate: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      goal: 'muscle_gain',
      membershipExpiry: '2024-12-31',
      startDate: '2024-01-01'
    },
    {
      id: '3',
      name: 'Jane Smith',
      email: 'jane@example.com',
      goal: 'weight_loss',
      membershipExpiry: '2024-06-15',
      startDate: '2024-01-15'
    }
  ]);

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    goal: 'weight_loss' as 'weight_loss' | 'muscle_gain',
    membershipExpiry: ''
  });

  const handleAddMember = () => {
    if (newMember.name && newMember.email && newMember.membershipExpiry) {
      const member: Member = {
        id: Date.now().toString(),
        name: newMember.name,
        email: newMember.email,
        goal: newMember.goal,
        membershipExpiry: newMember.membershipExpiry,
        startDate: new Date().toISOString().split('T')[0]
      };
      setMembers([...members, member]);
      setNewMember({ name: '', email: '', goal: 'weight_loss', membershipExpiry: '' });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Manage gym members and track renewals.</p>
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
              <Target className="h-4 w-4 text-green-600" />
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
              <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
              <UserPlus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">$2,450</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add New Member */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Add New Member</CardTitle>
              <CardDescription>Register a new gym member</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Enter member name"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="goal">Fitness Goal</Label>
                <Select value={newMember.goal} onValueChange={(value: 'weight_loss' | 'muscle_gain') => setNewMember({ ...newMember, goal: value })}>
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
                  value={newMember.membershipExpiry}
                  onChange={(e) => setNewMember({ ...newMember, membershipExpiry: e.target.value })}
                />
              </div>

              <Button onClick={handleAddMember} className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </CardContent>
          </Card>

          {/* Members List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Members List</CardTitle>
              <CardDescription>Manage existing gym members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => {
                  const membershipInfo = getMembershipStatus(member.membershipExpiry);
                  return (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-xs text-gray-500 capitalize">
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
                        <p className="text-xs text-gray-500">
                          Expires: {new Date(member.membershipExpiry).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
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
