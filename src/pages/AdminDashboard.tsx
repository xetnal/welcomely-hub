
import React, { useState, useEffect } from 'react';
import { Shield, Save, AlertCircle, RefreshCw } from 'lucide-react';
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

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'Admin' | 'Developer' | 'Sales' | 'Manager' | 'Client';
  email?: string;
  created_at?: string;
  updated_at?: string;
}

const ROLES = ['Admin', 'Developer', 'Sales', 'Manager', 'Client'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [savingChanges, setSavingChanges] = useState(false);
  const [processingBulkUpdate, setProcessingBulkUpdate] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get current user role
      const { data: currentUserRoleData, error: currentUserRoleError } = await supabase
        .rpc('get_user_role', { user_id: user?.id });

      if (currentUserRoleError) {
        throw currentUserRoleError;
      }

      setCurrentUserRole(currentUserRoleData);
      console.log("Current user role:", currentUserRoleData);

      if (currentUserRoleData?.toLowerCase() === 'admin') {
        // Get all user profiles with email
        const { data: profilesData, error: profilesError } = await supabase
          .rpc('get_all_profiles_with_email');

        if (profilesError) {
          throw profilesError;
        }

        // Process profiles, ensuring all have a default role
        const processedProfiles = profilesData.map(profile => ({
          ...profile,
          role: profile.role || 'Client' // Default to 'Client' if role is null or empty
        }));

        setUsers(processedProfiles);
        console.log("Fetched users:", processedProfiles);
      } else {
        toast.error("You don't have admin privileges");
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(`Failed to load users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const isAdmin = currentUserRole?.toLowerCase() === 'admin';

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
      // Process one role update at a time to better identify errors
      for (const [userId, role] of Object.entries(pendingChanges)) {
        console.log(`Updating user ${userId} to role ${role}`);
        
        // Use the RPC function which updates the user_roles table
        const { data, error } = await supabase.rpc('update_user_role', { 
          target_user_id: userId, 
          new_role: role 
        });
        
        if (error) {
          console.error(`Error updating user role ${userId}:`, error);
          throw new Error(`Failed to update user ${userId}: ${error.message}`);
        }
        
        console.log(`Role update response:`, data);
      }

      // Update local state with new roles
      setUsers(users.map((user) => {
        if (pendingChanges[user.id]) {
          return { ...user, role: pendingChanges[user.id] as any };
        }
        return user;
      }));

      setPendingChanges({});
      toast.success('User roles updated successfully');
      
      // Refresh to ensure we have the latest data
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating roles:', error);
      toast.error(`Failed to update roles: ${error.message}`);
    } finally {
      setSavingChanges(false);
    }
  };

  const updateAllClientsToDevs = async () => {
    setProcessingBulkUpdate(true);
    try {
      // Get all users with 'Client' role
      const clientUsers = users.filter(user => user.role === 'Client');
      
      if (clientUsers.length === 0) {
        toast.info('No clients to update');
        return;
      }

      // Create pending changes for all clients
      const changes: Record<string, string> = {};
      clientUsers.forEach(user => {
        changes[user.id] = 'Developer';
      });

      // Update roles one by one
      for (const [userId, role] of Object.entries(changes)) {
        console.log(`Updating user ${userId} from Client to Developer`);
        
        const { data, error } = await supabase.rpc('update_user_role', { 
          target_user_id: userId, 
          new_role: role 
        });
        
        if (error) {
          console.error(`Error updating user role ${userId}:`, error);
          throw new Error(`Failed to update user ${userId}: ${error.message}`);
        }
      }

      // Update local state
      setUsers(users.map((user) => {
        if (user.role === 'Client') {
          return { ...user, role: 'Developer' as any };
        }
        return user;
      }));

      toast.success(`Updated ${clientUsers.length} clients to developers`);
      
      // Refresh to ensure we have the latest data
      fetchUsers();
    } catch (error: any) {
      console.error('Error in bulk role update:', error);
      toast.error(`Failed to update client roles: ${error.message}`);
    } finally {
      setProcessingBulkUpdate(false);
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

  if (!isAdmin) {
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
            
            <div className="flex gap-2">
              <Button 
                onClick={updateAllClientsToDevs} 
                disabled={processingBulkUpdate || savingChanges}
                variant="outline"
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${processingBulkUpdate ? 'animate-spin' : ''}`} />
                Change All Clients to Developers
              </Button>
              
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
                          value={pendingChanges[user.id] || user.role || 'Client'}
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
