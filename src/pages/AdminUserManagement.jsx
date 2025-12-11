import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil } from 'lucide-react';
import UserEditForm from '../components/admin/UserEditForm';

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const me = await base44.auth.me();
        setCurrentUser(me);

        if (me.role !== 'admin') {
          setLoading(false);
          return;
        }
        
        const userList = await base44.entities.User.list();
        setUsers(userList);
        
        // Get list of coaches for display
        const coachList = userList.filter(u => u.user_type === 'coach');
        setCoaches(coachList);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const handleUserUpdate = async (updatedUser) => {
    setUsers(users.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    setEditingUser(null);
  };

  const getCoachName = (coachId) => {
    if (!coachId) return '-';
    const coach = coaches.find(c => c.id === coachId);
    return coach ? (coach.full_name || coach.email) : 'Unknown Coach';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600" />
      </div>
    );
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <p className="text-sm text-stone-600 mt-2">
            Manage user roles, types, and coach assignments
          </p>
        </CardHeader>
        <CardContent>
          {editingUser ? (
            <UserEditForm
              user={editingUser}
              coaches={coaches}
              onSave={handleUserUpdate}
              onCancel={() => setEditingUser(null)}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>System Role</TableHead>
                    <TableHead>User Type</TableHead>
                    <TableHead>Assigned Coach</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name || 'Pending Invitation'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={user.user_type === 'coach' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-green-50 text-green-700 border-green-200'
                          }
                        >
                          {user.user_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.user_type === 'client' ? (
                          <span className="text-sm">
                            {getCoachName(user.assigned_coach_id)}
                          </span>
                        ) : (
                          <span className="text-stone-400 text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        {user.onboarding_completed ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-yellow-200 text-yellow-700 bg-yellow-50">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setEditingUser(user)}
                          className="hover:bg-sage-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}