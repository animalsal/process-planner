import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CapacityData } from "@/types/scheduling";
import { TrendingUp, Users, Clock } from "lucide-react";

interface CapacityChartProps {
  capacityData: CapacityData[];
}

export function CapacityChart({ capacityData }: CapacityChartProps) {
  const getCapacityColor = (utilization: number) => {
    if (utilization >= 100) return "capacity-over";
    if (utilization >= 80) return "capacity-high";
    if (utilization >= 60) return "capacity-medium";
    return "capacity-low";
  };

  const getCapacityStatus = (utilization: number) => {
    if (utilization >= 100) return "Over Capacity";
    if (utilization >= 80) return "High Utilization";
    if (utilization >= 60) return "Moderate Load";
    return "Low Utilization";
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Department Capacity Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {capacityData.map((dept) => (
          <div key={dept.departmentId} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{dept.departmentName}</h3>
              <Badge 
                className={`bg-${getCapacityColor(dept.utilizationPercentage)} text-white`}
              >
                {getCapacityStatus(dept.utilizationPercentage)}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Capacity Utilization</span>
                <span className="font-medium">{dept.utilizationPercentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(dept.utilizationPercentage, 100)} 
                className="h-3"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Total Capacity</div>
                  <div className="font-medium">{dept.totalCapacity}h</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Used</div>
                  <div className="font-medium">{dept.usedCapacity}h</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Backlog</div>
                  <div className="font-medium">{dept.backlogDays.toFixed(1)} days</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}