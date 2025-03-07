
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, BarChart2, PieChart, ChevronRight } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

const moduleItems = [
  {
    title: 'Project Dashboard',
    description: 'View and manage all your ongoing projects and tasks.',
    icon: <Briefcase className="h-6 w-6" />,
    color: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400',
    path: '/projects'
  },
  {
    title: 'Reports',
    description: 'Access detailed reports and performance metrics.',
    icon: <BarChart2 className="h-6 w-6" />,
    color: 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400',
    path: '/reports'
  },
  {
    title: 'Analytics',
    description: 'Visualize data and gain insights into your workflow.',
    icon: <PieChart className="h-6 w-6" />,
    color: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
    path: '/analytics'
  }
];

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      <Navbar />
      
      <PageTransition className="flex-1 container py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-bold mb-4">Welcomely Hub</h1>
            <p className="text-xl text-muted-foreground dark:text-gray-400">
              Your all-in-one project management solution
            </p>
          </motion.div>
          
          <div className="grid gap-6">
            {moduleItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link to={item.path} className="block">
                  <div className="p-6 rounded-lg border bg-card hover:bg-accent/50 hover:border-accent transition-colors dark:bg-gray-800 dark:hover:bg-gray-800/80 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${item.color}`}>
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-medium">{item.title}</h3>
                          <p className="text-muted-foreground dark:text-gray-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="ml-auto">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default Home;
