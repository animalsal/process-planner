import { Navigation } from '@/components/Navigation';
import { WorkOrdersTable } from '@/components/WorkOrdersTable';

export default function WorkOrders() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Navigation />
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Work Orders Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage work order priorities, due dates, and track completion estimates
            </p>
          </div>
          
          <WorkOrdersTable />
        </div>
      </div>
    </div>
  );
}