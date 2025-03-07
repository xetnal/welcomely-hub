
import React, { useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { Project } from '@/lib/types';
import AddProjectModal from '@/components/AddProjectModal';
import Navbar from '@/components/Navbar';

// Import components
import ProjectHeader from '@/components/dashboard/ProjectHeader';
import ProjectSearch from '@/components/dashboard/ProjectSearch';
import ProjectList from '@/components/dashboard/ProjectList';
import ConnectionStatus from '@/components/dashboard/ConnectionStatus';
import { useProjects } from '@/hooks/useProjects';

const Dashboard = () => {
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    projects,
    loading,
    fetchTimedOut,
    fetchError,
    connectionStatus,
    addProject,
    refreshProjects,
    checkConnection,
    testDirectAPIRequest
  } = useProjects();

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.developer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PageTransition className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-8">
          <ProjectHeader />
          <ProjectSearch 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            onAddProject={() => setIsAddProjectModalOpen(true)}
          />
        </div>
        
        <ConnectionStatus 
          status={connectionStatus}
          error={fetchError}
          onRetryConnection={checkConnection}
          onRetryFetch={refreshProjects}
          onTestDirectRequest={testDirectAPIRequest}
        />
        
        <ProjectList 
          projects={filteredProjects}
          loading={loading}
          fetchTimedOut={fetchTimedOut}
          searchQuery={searchQuery}
          onAddProject={() => setIsAddProjectModalOpen(true)}
        />

        <AddProjectModal
          open={isAddProjectModalOpen}
          onOpenChange={setIsAddProjectModalOpen}
          onAddProject={addProject}
        />
      </PageTransition>
    </div>
  );
};

export default Dashboard;
