
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Auth = () => {
  const { user, signIn, signUp, signOut, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the pathname to redirect to after login
  const from = location.state?.from?.pathname || '/';

  // Reset loading state when auth state changes
  useEffect(() => {
    if (!authLoading) {
      console.log("Auth loading state changed to:", authLoading);
      setIsLoading(false);
    }
  }, [authLoading]);

  // Sign out existing user when navigating to auth page
  useEffect(() => {
    const cleanupAuth = async () => {
      if (user) {
        try {
          console.log("Signing out existing user on auth page...");
          await signOut(false); // Pass false to avoid navigation
          console.log('Signed out existing user on auth page');
        } catch (error) {
          console.error('Error signing out on auth page:', error);
          setIsLoading(false);
        }
      }
    };
    
    cleanupAuth();
  }, [user, signOut]);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user && !authLoading && !isLoading) {
      console.log('User authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [user, authLoading, from, navigate, isLoading]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Starting sign in process...");
    setIsLoading(true);
    try {
      await signIn(email, password);
      // We don't need to navigate here as the useEffect will handle it
      console.log("Sign in function completed successfully");
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false); // Make sure to reset loading state on error
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Starting sign up process...");
    setIsLoading(true);
    try {
      await signUp(email, password, fullName);
      // We don't need to navigate here as the useEffect will handle it
      console.log("Sign up function completed successfully");
    } catch (error) {
      console.error('Sign up error:', error);
      setIsLoading(false); // Make sure to reset loading state on error
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <img
            src="/lovable-uploads/22886747-a1b6-4177-9722-48875351f084.png"
            alt="Workflow Hub Logo"
            className="h-12 w-auto mb-4"
          />
          <h1 className="text-2xl font-bold">Workflow Hub</h1>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading || authLoading}>
                    {isLoading || authLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                  Enter your information to create a new account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Password</Label>
                    <Input
                      id="registerPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading || authLoading}>
                    {isLoading || authLoading ? "Creating account..." : "Create account"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Auth;
