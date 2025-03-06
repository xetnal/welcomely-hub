
import React from 'react';
import { format } from 'date-fns';
import { Search, Plus, Filter } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import ProjectCard from '@/components/ProjectCard';
import { Project } from '@/lib/types';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    client: 'Acme Corporation',
    developer: 'Jane Smith',
    startDate: new Date(2023, 7, 15),
    endDate: new Date(2023, 9, 30),
    status: 'active',
    description: 'Complete website redesign with new branding, improved UX, and mobile-first approach.',
    tasks: []
  },
  {
    id: '2',
    name: 'Mobile App Development',
    client: 'Global Tech',
    developer: 'John Doe',
    startDate: new Date(2023, 6, 1),
    endDate: new Date(2023, 11, 15),
    status: 'active',
    description: 'Cross-platform mobile app for iOS and Android with customer portal integration.',
    tasks: []
  },
  {
    id: '3',
    name: 'E-commerce Platform',
    client: 'Fashion Boutique',
    developer: 'Alex Johnson',
    startDate: new Date(2023, 5, 10),
    endDate: new Date(2023, 8, 20),
    status: 'on-hold',
    description: 'Custom e-commerce solution with inventory management and payment gateway integration.',
    tasks: []
  },
  {
    id: '4',
    name: 'CRM Integration',
    client: 'Sales Pro',
    developer: 'Emily Chen',
    startDate: new Date(2023, 8, 5),
    endDate: new Date(2024, 1, 15),
    status: 'active',
    description: 'Integration of the existing CRM system with new marketing automation tools.',
    tasks: []
  },
  {
    id: '5',
    name: 'Business Analytics Dashboard',
    client: 'Data Insights Inc.',
    developer: 'Michael Brown',
    startDate: new Date(2023, 4, 20),
    endDate: new Date(2023, 7, 10),
    status: 'completed',
    description: 'Interactive dashboard for business analytics with real-time data visualization.',
    tasks: []
  },
  {
    id: '6',
    name: 'Cloud Migration',
    client: 'Legacy Systems Co.',
    developer: 'Sarah Williams',
    startDate: new Date(2023, 9, 1),
    endDate: new Date(2024, 2, 28),
    status: 'active',
    description: 'Migration of legacy systems to cloud infrastructure with minimal downtime.',
    tasks: []
  }
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <PageTransition className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold"
            >
              Project Dashboard
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-muted-foreground"
            >
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </motion.p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full bg-white/80 border pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </PageTransition>
    </div>
  );
};

export default Index;
