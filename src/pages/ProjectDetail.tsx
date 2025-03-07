
import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import PageTransition from '@/components/PageTransition';

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PageTransition className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Project Details</h1>
          <p className="text-muted-foreground">Viewing project {projectId}</p>
        </div>
        <p>This page is under construction. Detailed project view will be available soon.</p>
      </PageTransition>
    </div>
  );
};

export default ProjectDetail;
