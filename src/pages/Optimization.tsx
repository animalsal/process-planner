import { useState, useMemo } from 'react';
import { useScheduling } from '@/hooks/useScheduling';
import { WorkOrder } from '@/types/scheduling';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Shuffle
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

interface OptimizedSchedule {
  workOrderId: string;
  currentScheduledDate?: Date;
  optimizedScheduledDate: Date;
  reason: string;
  impact: 'high' | 'medium' | 'low';
  workOrder: WorkOrder;
}

export default function Optimization() {
  const { workOrders, updateWorkOrder, departments } = useScheduling();
  const { toast } = useToast();
  const [optimizedSchedules, setOptimizedSchedules] = useState<OptimizedSchedule[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Calculate optimization suggestions
  const generateOptimizedSchedule = () => {
    setIsOptimizing(true);
    
    const pendingWorkOrders = workOrders.filter(wo => wo.status === 'pending');
    const optimizations: OptimizedSchedule[] = [];
    
    // Sort by priority and due date
    const sortedWorkOrders = [...pendingWorkOrders].sort((a, b) => {
      const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      // If same priority, sort by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      return 0;
    });

    // Track department capacity
    const departmentCapacity: Record<string, number> = {};
    departments.forEach(dept => {
      departmentCapacity[dept.id] = dept.availableHours;
    });

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    sortedWorkOrders.forEach(workOrder => {
      const totalHours = workOrder.steps.reduce((sum, step) => sum + step.estimatedHours, 0);
      const department = departments.find(d => d.id === workOrder.department);
      
      if (!department) return;

      // Calculate optimal start date based on capacity
      let optimalDate = new Date(currentDate);
      let remainingHours = totalHours;
      
      while (remainingHours > 0) {
        const availableHours = Math.min(departmentCapacity[department.id] || 0, 8); // Max 8 hours per day
        
        if (availableHours > 0) {
          const hoursToSchedule = Math.min(remainingHours, availableHours);
          departmentCapacity[department.id] -= hoursToSchedule;
          remainingHours -= hoursToSchedule;
        }
        
        if (remainingHours > 0) {
          optimalDate = addDays(optimalDate, 1);
          // Reset daily capacity (simplified - in reality, this would be more complex)
          if (departmentCapacity[department.id] < 8) {
            departmentCapacity[department.id] = Math.min(department.availableHours, 8);
          }
        }
      }

      // Check if optimization is needed
      const currentScheduled = workOrder.scheduledDate ? new Date(workOrder.scheduledDate) : null;
      let reason = '';
      let impact: 'high' | 'medium' | 'low' = 'low';

      if (!currentScheduled) {
        reason = 'No scheduled date - assigning optimal slot';
        impact = 'medium';
      } else {
        const daysDifference = differenceInDays(optimalDate, currentScheduled);
        
        if (Math.abs(daysDifference) > 0) {
          if (workOrder.priority === 'urgent' && daysDifference < 0) {
            reason = 'Urgent priority - moving earlier to meet critical deadline';
            impact = 'high';
          } else if (workOrder.dueDate && optimalDate > currentScheduled && new Date(workOrder.dueDate) < currentScheduled) {
            reason = 'Due date conflict - rescheduling to meet deadline';
            impact = 'high';
          } else if (daysDifference > 3) {
            reason = 'Better resource utilization - moving to balance workload';
            impact = 'medium';
          } else {
            reason = 'Minor adjustment for optimal scheduling';
            impact = 'low';
          }
        }
      }

      if (reason) {
        optimizations.push({
          workOrderId: workOrder.id,
          currentScheduledDate: currentScheduled,
          optimizedScheduledDate: optimalDate,
          reason,
          impact,
          workOrder
        });
      }
    });

    setOptimizedSchedules(optimizations);
    setShowPreview(true);
    setIsOptimizing(false);

    toast({
      title: "Optimization Complete",
      description: `Found ${optimizations.length} optimization opportunities`
    });
  };

  const commitOptimizations = async () => {
    try {
      for (const optimization of optimizedSchedules) {
        await updateWorkOrder(optimization.workOrderId, {
          scheduledDate: optimization.optimizedScheduledDate
        });
      }

      toast({
        title: "Schedule Optimized",
        description: `Successfully updated ${optimizedSchedules.length} work order schedules`
      });

      setOptimizedSchedules([]);
      setShowPreview(false);
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "There was an error updating the schedules",
        variant: "destructive"
      });
    }
  };

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
    }
  };

  const getPriorityColor = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-secondary text-secondary-foreground';
    }
  };

  const metrics = useMemo(() => {
    const totalPending = workOrders.filter(wo => wo.status === 'pending').length;
    const urgentPending = workOrders.filter(wo => wo.status === 'pending' && wo.priority === 'urgent').length;
    const overduePending = workOrders.filter(wo => 
      wo.status === 'pending' && 
      wo.dueDate && 
      new Date(wo.dueDate) < new Date()
    ).length;

    return { totalPending, urgentPending, overduePending };
  }, [workOrders]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Schedule Optimization</h1>
              <p className="text-muted-foreground">Optimize work order scheduling based on priority, due dates, and resource availability</p>
            </div>
            <Navigation />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Work Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalPending}</div>
              <p className="text-xs text-muted-foreground">
                Ready for optimization
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{metrics.urgentPending}</div>
              <p className="text-xs text-muted-foreground">
                Requiring immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
              <TrendingUp className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{metrics.overduePending}</div>
              <p className="text-xs text-muted-foreground">
                Past due date
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI-Powered Schedule Optimization
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Analyze current schedule and generate optimized assignments based on priority, due dates, and resource capacity
                </p>
              </div>
              <Button 
                onClick={generateOptimizedSchedule}
                disabled={isOptimizing}
                className="flex items-center gap-2"
              >
                {isOptimizing ? (
                  <>
                    <Shuffle className="h-4 w-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Generate Optimization
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          {showPreview && (
            <CardContent>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Preview Changes</TabsTrigger>
                  <TabsTrigger value="analysis">Impact Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="space-y-4">
                  {optimizedSchedules.length === 0 ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        No optimization opportunities found. Your current schedule is already optimal!
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {optimizedSchedules.length} work orders will be rescheduled
                        </p>
                        <Button onClick={commitOptimizations} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Commit Changes
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {optimizedSchedules.map((optimization) => (
                          <Card key={optimization.workOrderId} className="border-l-4 border-l-primary">
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <Badge className={getPriorityColor(optimization.workOrder.priority)}>
                                    {optimization.workOrder.priority}
                                  </Badge>
                                  <Badge className={getImpactColor(optimization.impact)}>
                                    {optimization.impact} impact
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {optimization.workOrder.workOrderNumber}
                                </div>
                              </div>

                              <h4 className="font-medium mb-2">{optimization.workOrder.title}</h4>
                              <p className="text-sm text-muted-foreground mb-4">{optimization.reason}</p>

                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span className="font-medium">Current:</span>
                                  {optimization.currentScheduledDate ? (
                                    format(optimization.currentScheduledDate, 'MMM dd, yyyy')
                                  ) : (
                                    <span className="text-muted-foreground">Not scheduled</span>
                                  )}
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span className="font-medium">Optimized:</span>
                                  <span className="text-primary font-medium">
                                    {format(optimization.optimizedScheduledDate, 'MMM dd, yyyy')}
                                  </span>
                                </div>
                              </div>

                              {optimization.workOrder.dueDate && (
                                <div className="mt-2 text-sm text-muted-foreground">
                                  Due: {format(new Date(optimization.workOrder.dueDate), 'MMM dd, yyyy')}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">High Impact Changes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                          {optimizedSchedules.filter(o => o.impact === 'high').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Critical improvements</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Medium Impact Changes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-warning">
                          {optimizedSchedules.filter(o => o.impact === 'medium').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Moderate improvements</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Low Impact Changes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-success">
                          {optimizedSchedules.filter(o => o.impact === 'low').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Fine-tuning adjustments</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      The optimization algorithm considers work order priority, due dates, estimated hours, 
                      and department capacity to suggest the most efficient scheduling sequence.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </CardContent>
          )}
        </Card>
      </main>
    </div>
  );
}