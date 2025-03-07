
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import Navbar from '@/components/Navbar';
import { Project } from '@/lib/types';
import { fetchProjects } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Import components
import SectionHeader from '@/components/dashboard/SectionHeader';
import Dashboard from './Dashboard';
import ClientList from '@/components/dashboard/ClientList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layers, Users, BarChart3 } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState("projects");
  const [clients, setClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      // Fetch projects to extract client information
      const projectData = await fetchProjects();
      
      // Extract unique clients from projects
      const uniqueClients = [...new Set(projectData.map(project => project.client))];
      setClients(uniqueClients);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast.error(`Error loading clients: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PageTransition className="flex-1 container py-8">
        <Tabs defaultValue="projects" className="space-y-6" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Projects</span>
              </TabsTrigger>
              <TabsTrigger value="clients" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Clients</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="projects" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <SectionHeader 
              title="Client Management" 
              description="View and manage your clients" 
            />
            <ClientList clients={clients} loading={isLoading} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <SectionHeader 
              title="Analytics" 
              description="Project performance and statistics" 
            />
            <div className="text-center p-12 bg-muted/20 rounded-lg border border-dashed">
              <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                We're working on providing detailed analytics for your projects
              </p>
              <Button variant="outline">
                Go to Projects
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </PageTransition>
    </div>
  );
};

export default Index;
