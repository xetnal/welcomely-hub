
import React from 'react';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ClientListProps {
  clients: string[];
  loading?: boolean;
}

const ClientList: React.FC<ClientListProps> = ({ clients, loading = false }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center p-12 bg-muted/20 rounded-lg border border-dashed">
        <h3 className="text-lg font-medium mb-2">No clients found</h3>
        <p className="text-muted-foreground mb-4">
          Client information is extracted from your projects
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create a project to add clients
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {clients.map((client, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{client}</CardTitle>
            <CardDescription>Client</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 mr-2" />
              <span>Organization</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ClientList;
