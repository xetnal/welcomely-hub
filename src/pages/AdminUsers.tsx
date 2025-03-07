
import React from 'react';
import Navbar from '@/components/Navbar';
import PageTransition from '@/components/PageTransition';

const AdminUsers = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PageTransition className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <p>This page is under construction. User management functionality will be available soon.</p>
      </PageTransition>
    </div>
  );
};

export default AdminUsers;
