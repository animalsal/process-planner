import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WorkOrder } from "@/types/scheduling";
import { Clock, Calendar, AlertCircle } from "lucide-react";

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  position: number;
}

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning text-warning-foreground",
  high: "bg-accent text-accent-foreground",
  urgent: "bg-destructive text-destructive-foreground"
};

const statusColors = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-primary text-primary-foreground",
  completed: "bg-success text-success-foreground",
  on_hold: "bg-warning text-warning-foreground"
};

export function WorkOrderCard({ workOrder, position }: WorkOrderCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getStatusProgress = () => {
    switch (workOrder.status) {
      case 'completed': return 100;
      case 'in_progress': return 50;
      case 'on_hold': return 25;
      default: return 0;
    }
  };

  return (
    <Card className="shadow-card hover:shadow-elevated transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              #{position} {workOrder.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={priorityColors[workOrder.priority]}>
                {workOrder.priority}
              </Badge>
              <Badge className={statusColors[workOrder.status]}>
                {workOrder.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          {workOrder.priority === 'urgent' && (
            <AlertCircle className="h-5 w-5 text-destructive" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {workOrder.description && (
          <p className="text-sm text-muted-foreground">{workOrder.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Total Hours:</span>
            <span className="font-medium">{workOrder.totalHours}h</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Steps:</span>
            <span className="font-medium">{workOrder.steps.length}</span>
          </div>
        </div>

        {workOrder.estimatedCompletionDate && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Completion:</span>
              <span className="font-medium">
                {formatDate(workOrder.estimatedCompletionDate)}
              </span>
            </div>
            <Progress value={getStatusProgress()} className="h-2" />
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Process Steps</h4>
          <div className="space-y-1">
            {workOrder.steps.map((step, index) => (
              <div key={step.id} className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {index + 1}. {step.name}
                </span>
                <span className="font-medium">{step.estimatedHours}h</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}