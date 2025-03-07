
import React, { useState, useEffect } from 'react';
import { Shield, Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import PageTransition from '@/components/PageTransition';
import Navbar from '@/components/Navbar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Define the user profile type
interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'Admin' | 'Developer' | 'Sales' | 'Manager' | 'Client';
  email?: string;
}

const ROLES = ['Admin', 'Developer', 'Sales', 'Manager', 'Client'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [savingChanges, setSavingChanges] = useState(false);

  // Fetch all users and their profiles
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Get current user's role first
        const { data: currentUserData, error: currentUserError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user?.id)
          .single();

        if (currentUserError) {
          throw currentUserError;
        }

        setCurrentUserRole(currentUserData.role);
        console.log("Current user role:", currentUserData.role);

        // Only proceed to fetch all users if current user is Admin
        if (currentUserData.role === 'Admin') {
          // Fetch profiles with user email from auth.users (via a join)
          const { data: userData, error: usersError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, role')
            .order('full_name');

          if (usersError) {
            throw usersError;
          }

          // We can't get emails from auth.users via the client
          // so we'll just display the profiles without emails
          setUsers(userData);
          console.log("Fetched users:", userData.length);
        } else {
          // Not an admin, show warning
          toast.error("You don't have admin privileges");
        }
      } catch (error: any) {
        console.error('Error fetching users:', error);
        toast.error(`Failed to load users: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  const handleRoleChange = (userId: string, newRole: string) => {
    setPendingChanges((prev) => ({
      ...prev,
      [userId]: newRole,
    }));
  };

  const saveChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) return;

    setSavingChanges(true);
    try {
      // Update each user's role
      const promises = Object.entries(pendingChanges).map(([userId, role]) =>
        supabase
          .from('profiles')
          .update({ role })
          .eq('id', userId)
      );

      const results = await Promise.all(promises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`${errors.length} updates failed`);
      }

      // Update local state
      setUsers(users.map((user) => {
        if (pendingChanges[user.id]) {
          return { ...user, role: pendingChanges[user.id] as any };
        }
        return user;
      }));

      setPendingChanges({});
      toast.success('User roles updated successfully');
    } catch (error: any) {
      console.error('Error updating roles:', error);
      toast.error(`Failed to update roles: ${error.message}`);
    } finally {
      setSavingChanges(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col dark:bg-gray-900">
        <Navbar />
        <div className="flex-1 container py-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl mb-2">Loading admin dashboard...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (currentUserRole !== 'Admin') {
    return (
      <div className="min-h-screen flex flex-col dark:bg-gray-900">
        <Navbar />
        <div className="flex-1 container py-16 flex items-center justify-center">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Access Denied
              </CardTitle>
              <CardDescription>
                You need administrator privileges to access this page.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      <Navbar />
      
      <PageTransition className="flex-1 container py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground dark:text-gray-400 mt-1">
                Manage users and their roles
              </p>
            </div>
            
            {Object.keys(pendingChanges).length > 0 && (
              <Button 
                onClick={saveChanges} 
                disabled={savingChanges}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and modify user roles in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                            {user.full_name 
                              ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                              : 'U'}
                          </div>
                          <span>{user.full_name || 'Unnamed User'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email || 'No email available'}</TableCell>
                      <TableCell>
                        <Select
                          value={pendingChanges[user.id] || user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {pendingChanges[user.id] && (
                          <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">
                            (unsaved)
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </div>
  );
};

export default AdminDashboard;
