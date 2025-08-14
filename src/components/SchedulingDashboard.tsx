import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrderCard } from './WorkOrderCard';
import { CapacityChart } from './CapacityChart';
import { useScheduling } from '@/hooks/useScheduling';
import { CalendarDays, Package, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';

export function SchedulingDashboard() {
  const { workOrders, capacityData, scheduleWorkOrders, updateWorkOrderStatus } = useScheduling();
  const [activeTab, setActiveTab] = useState('overview');

  const scheduledResults = scheduleWorkOrders();
  
  const stats = {
    total: workOrders.length,
    pending: workOrders.filter(wo => wo.status === 'pending').length,
    inProgress: workOrders.filter(wo => wo.status === 'in_progress').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length,
    totalBacklog: capacityData.reduce((sum, dept) => sum + dept.backlogDays, 0)
  };

  const overCapacityDepts = capacityData.filter(dept => dept.utilizationPercentage >= 100);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Production Scheduling & Capacity Planning
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage work orders and optimize resource allocation
            </p>
          </div>
          <Button className="bg-gradient-primary text-primary-foreground shadow-elevated">
            <Plus className="h-4 w-4 mr-2" />
            New Work Order
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-warning">{stats.pending}</p>
                </div>
                <CalendarDays className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold text-primary">{stats.inProgress}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-success">{stats.completed}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Backlog</p>
                  <p className="text-3xl font-bold text-destructive">
                    {(stats.totalBacklog / capacityData.length).toFixed(1)}d
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {overCapacityDepts.length > 0 && (
          <Card className="border-destructive shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Capacity Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overCapacityDepts.map(dept => (
                  <div key={dept.departmentId} className="flex items-center justify-between">
                    <span className="font-medium">{dept.departmentName}</span>
                    <Badge className="bg-destructive text-destructive-foreground">
                      {dept.utilizationPercentage.toFixed(0)}% Utilization
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workorders">Work Orders</TabsTrigger>
            <TabsTrigger value="capacity">Capacity Planning</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Scheduled Work Orders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scheduledResults.slice(0, 3).map((result, index) => {
                    const workOrder = workOrders.find(wo => wo.id === result.workOrderId);
                    if (!workOrder) return null;
                    
                    return (
                      <div key={result.workOrderId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">#{index + 1} {workOrder.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Est. completion: {result.estimatedCompletionDate.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={`${workOrder.priority === 'urgent' ? 'bg-destructive' : 'bg-primary'} text-white`}>
                          {result.totalDays} days
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <CapacityChart capacityData={capacityData} />
            </div>
          </TabsContent>

          <TabsContent value="workorders" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {workOrders.map((workOrder, index) => (
                <WorkOrderCard
                  key={workOrder.id}
                  workOrder={workOrder}
                  position={index + 1}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="capacity" className="space-y-6">
            <CapacityChart capacityData={capacityData} />
            
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Detailed Capacity Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Department</th>
                        <th className="text-right p-2">Total Capacity</th>
                        <th className="text-right p-2">Used Hours</th>
                        <th className="text-right p-2">Utilization</th>
                        <th className="text-right p-2">Backlog Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {capacityData.map(dept => (
                        <tr key={dept.departmentId} className="border-b">
                          <td className="p-2 font-medium">{dept.departmentName}</td>
                          <td className="p-2 text-right">{dept.totalCapacity}h</td>
                          <td className="p-2 text-right">{dept.usedCapacity}h</td>
                          <td className="p-2 text-right">
                            <span className={`font-medium ${
                              dept.utilizationPercentage >= 100 ? 'text-destructive' :
                              dept.utilizationPercentage >= 80 ? 'text-warning' :
                              'text-success'
                            }`}>
                              {dept.utilizationPercentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-2 text-right">{dept.backlogDays.toFixed(1)} days</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}