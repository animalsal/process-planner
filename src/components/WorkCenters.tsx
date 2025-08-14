import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Settings, Clock, Users, TrendingUp } from 'lucide-react';

interface WorkCenter {
  name: string;
  department: string;
  capacity: number;
  utilization: number;
  availableHours: number;
  scheduledHours: number;
}

interface WorkCentersProps {
  selectedDepartment: string;
}

const workCenters: WorkCenter[] = [
  { name: "RECEIVING INSPECTION", department: "Fire-ex", capacity: 40, utilization: 85, availableHours: 40, scheduledHours: 34 },
  { name: "DUMP", department: "Fire-ex", capacity: 32, utilization: 70, availableHours: 32, scheduledHours: 22 },
  { name: "TEARDOWN", department: "Fire-ex", capacity: 48, utilization: 90, availableHours: 48, scheduledHours: 43 },
  { name: "HYDRO", department: "Fire-ex", capacity: 40, utilization: 95, availableHours: 40, scheduledHours: 38 },
  { name: "BLAST/PAINT", department: "Fire-ex", capacity: 56, utilization: 88, availableHours: 56, scheduledHours: 49 },
  { name: "CLEAN", department: "Fire-ex", capacity: 32, utilization: 75, availableHours: 32, scheduledHours: 24 },
  { name: "P1 INSPECTION", department: "Fire-ex", capacity: 40, utilization: 82, availableHours: 40, scheduledHours: 33 },
  { name: "ASSEMBLY", department: "Fire-ex", capacity: 64, utilization: 92, availableHours: 64, scheduledHours: 59 },
  { name: "FILL", department: "Fire-ex", capacity: 32, utilization: 68, availableHours: 32, scheduledHours: 22 },
  { name: "VERIFY GAUGE/SWITCH/TCPS", department: "Fire-ex", capacity: 40, utilization: 85, availableHours: 40, scheduledHours: 34 },
  { name: "WEIGHT/LEAK CHECK", department: "Fire-ex", capacity: 48, utilization: 87, availableHours: 48, scheduledHours: 42 },
  { name: "TAG", department: "Fire-ex", capacity: 24, utilization: 70, availableHours: 24, scheduledHours: 17 },
  { name: "P2 INSPECTION", department: "Fire-ex", capacity: 40, utilization: 83, availableHours: 40, scheduledHours: 33 },
  { name: "VERIFY PARTS", department: "Fire-ex", capacity: 32, utilization: 78, availableHours: 32, scheduledHours: 25 },
  { name: "FINAL INSPECTION", department: "Fire-ex", capacity: 40, utilization: 80, availableHours: 40, scheduledHours: 32 },
  
  // Firex-TX
  { name: "RECEIVING INSPECTION", department: "Firex-TX", capacity: 32, utilization: 90, availableHours: 32, scheduledHours: 29 },
  { name: "DUMP", department: "Firex-TX", capacity: 24, utilization: 75, availableHours: 24, scheduledHours: 18 },
  { name: "TEARDOWN", department: "Firex-TX", capacity: 40, utilization: 95, availableHours: 40, scheduledHours: 38 },
  { name: "HYDRO", department: "Firex-TX", capacity: 32, utilization: 88, availableHours: 32, scheduledHours: 28 },
  { name: "BLAST/PAINT", department: "Firex-TX", capacity: 48, utilization: 92, availableHours: 48, scheduledHours: 44 },
  { name: "CLEAN", department: "Firex-TX", capacity: 24, utilization: 80, availableHours: 24, scheduledHours: 19 },
  { name: "P1 INSPECTION", department: "Firex-TX", capacity: 32, utilization: 85, availableHours: 32, scheduledHours: 27 },
  { name: "ASSEMBLY", department: "Firex-TX", capacity: 56, utilization: 95, availableHours: 56, scheduledHours: 53 },
  { name: "FILL", department: "Firex-TX", capacity: 24, utilization: 70, availableHours: 24, scheduledHours: 17 },
  { name: "VERIFY GAUGE/SWITCH/TCPS", department: "Firex-TX", capacity: 32, utilization: 88, availableHours: 32, scheduledHours: 28 },
  { name: "WEIGHT/LEAK CHECK", department: "Firex-TX", capacity: 40, utilization: 90, availableHours: 40, scheduledHours: 36 },
  { name: "TAG", department: "Firex-TX", capacity: 16, utilization: 75, availableHours: 16, scheduledHours: 12 },
  { name: "P2 INSPECTION", department: "Firex-TX", capacity: 32, utilization: 87, availableHours: 32, scheduledHours: 28 },
  { name: "VERIFY PARTS", department: "Firex-TX", capacity: 24, utilization: 82, availableHours: 24, scheduledHours: 20 },
  { name: "FINAL INSPECTION", department: "Firex-TX", capacity: 32, utilization: 85, availableHours: 32, scheduledHours: 27 },

  // Oxygen
  { name: "RECEIVING INSPECTION", department: "Oxygen", capacity: 40, utilization: 78, availableHours: 40, scheduledHours: 31 },
  { name: "DUMP", department: "Oxygen", capacity: 32, utilization: 85, availableHours: 32, scheduledHours: 27 },
  { name: "TEARDOWN", department: "Oxygen", capacity: 48, utilization: 88, availableHours: 48, scheduledHours: 42 },
  { name: "HYDRO", department: "Oxygen", capacity: 40, utilization: 92, availableHours: 40, scheduledHours: 37 },
  { name: "BLAST/PAINT", department: "Oxygen", capacity: 56, utilization: 85, availableHours: 56, scheduledHours: 48 },
  { name: "CLEAN", department: "Oxygen", capacity: 32, utilization: 80, availableHours: 32, scheduledHours: 26 },
  { name: "P1 INSPECTION", department: "Oxygen", capacity: 40, utilization: 90, availableHours: 40, scheduledHours: 36 },
  { name: "ASSEMBLY", department: "Oxygen", capacity: 64, utilization: 88, availableHours: 64, scheduledHours: 56 },
  { name: "FILL", department: "Oxygen", capacity: 32, utilization: 95, availableHours: 32, scheduledHours: 30 },
  { name: "VERIFY GAUGE/SWITCH/TCPS", department: "Oxygen", capacity: 40, utilization: 82, availableHours: 40, scheduledHours: 33 },
  { name: "WEIGHT/LEAK CHECK", department: "Oxygen", capacity: 48, utilization: 85, availableHours: 48, scheduledHours: 41 },
  { name: "TAG", department: "Oxygen", capacity: 24, utilization: 88, availableHours: 24, scheduledHours: 21 },
  { name: "P2 INSPECTION", department: "Oxygen", capacity: 40, utilization: 80, availableHours: 40, scheduledHours: 32 },
  { name: "VERIFY PARTS", department: "Oxygen", capacity: 32, utilization: 75, availableHours: 32, scheduledHours: 24 },
  { name: "FINAL INSPECTION", department: "Oxygen", capacity: 40, utilization: 87, availableHours: 40, scheduledHours: 35 },

  // Add similar data for other departments...
];

export function WorkCenters({ selectedDepartment }: WorkCentersProps) {
  const filteredWorkCenters = workCenters.filter(wc => wc.department === selectedDepartment);

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 95) return "capacity-over";
    if (utilization >= 85) return "capacity-high";
    if (utilization >= 70) return "capacity-medium";
    return "capacity-low";
  };

  const getUtilizationStatus = (utilization: number) => {
    if (utilization >= 95) return "Critical";
    if (utilization >= 85) return "High";
    if (utilization >= 70) return "Moderate";
    return "Normal";
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Work Centers - {selectedDepartment}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkCenters.map((workCenter) => (
              <Card key={workCenter.name} className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{workCenter.name}</CardTitle>
                    <Badge className={`bg-${getUtilizationColor(workCenter.utilization)} text-white text-xs`}>
                      {getUtilizationStatus(workCenter.utilization)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Utilization</span>
                      <span className="font-medium">{workCenter.utilization}%</span>
                    </div>
                    <Progress 
                      value={Math.min(workCenter.utilization, 100)} 
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground text-xs">Available</div>
                        <div className="font-medium">{workCenter.availableHours}h</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground text-xs">Scheduled</div>
                        <div className="font-medium">{workCenter.scheduledHours}h</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}