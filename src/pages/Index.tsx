
import React from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import Navbar from '@/components/Navbar';
import { Layers, Users, BarChart3, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const menuItems = [
    { title: 'Projects Dashboard', description: 'Manage and monitor all your projects', icon: <Layers className="h-8 w-8" />, path: '/dashboard' },
    { title: 'Client Management', description: 'View and manage your clients', icon: <Users className="h-8 w-8" />, path: '/clients' },
    { title: 'Analytics', description: 'Project performance and statistics', icon: <BarChart3 className="h-8 w-8" />, path: '/analytics' },
    { title: 'Messages', description: 'Communication with team and clients', icon: <MessageSquare className="h-8 w-8" />, path: '/messages' },
    { title: 'Admin Settings', description: 'User management and system settings', icon: <Settings className="h-8 w-8" />, path: '/admin/users' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PageTransition className="flex-1 container py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Project Management Dashboard</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Welcome to your central hub for managing projects, clients, and team performance.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item, index) => (
            <Link to={item.path} key={index} className="block">
              <div className="glass card-hover rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-all">
                <div className="bg-primary/10 p-4 rounded-full mb-4 text-primary">
                  {item.icon}
                </div>
                <h2 className="text-xl font-medium mb-2">{item.title}</h2>
                <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                <Button variant="outline" className="mt-auto w-full">
                  Open {item.title.split(' ')[0]}
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </PageTransition>
    </div>
  );
};

export default Index;
