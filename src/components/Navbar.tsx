
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      // Only set dark mode if explicitly saved as dark
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      // Default to light mode for any other case (null, 'light', etc.)
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md dark:bg-gray-900 dark:border-gray-800">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative flex items-center justify-center"
            >
              <div className="h-8 w-8 rounded-full bg-background dark:bg-gray-900 absolute"></div>
              <img 
                src="/lovable-uploads/22886747-a1b6-4177-9722-48875351f084.png" 
                alt="Workflow Hub Logo" 
                className="h-8 w-auto relative z-10"
                style={{ mixBlendMode: isDarkMode ? 'screen' : 'multiply' }}
              />
            </motion.div>
            <motion.span 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-medium"
            >
              Workflow Hub
            </motion.span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary dark:text-gray-200">
              Dashboard
            </Link>
            <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary dark:text-gray-400">
              Reports
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary dark:text-gray-400">
              Analytics
            </a>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-full"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <div className="hidden md:flex items-center gap-4">
            <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary dark:text-gray-400">
              Settings
            </a>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center dark:bg-primary/30 text-primary-foreground">
              <span className="text-xs font-medium">JD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
