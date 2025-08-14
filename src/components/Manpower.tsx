import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

interface Employee {
  id: string;
  name: string;
  department: string;
  workCenters: string[];
  hoursPerDay: number;
  vacationDays: Date[];
  scheduledHours: { [key: string]: number }; // date string -> hours
}

interface ManpowerProps {
  selectedDepartment: string;
}

const employees: Employee[] = [
  {
    id: "1",
    name: "John Smith",
    department: "Fire-ex",
    workCenters: ["ASSEMBLY", "WELDING", "P1 INSPECTION"],
    hoursPerDay: 8,
    vacationDays: [new Date(2024, 8, 15), new Date(2024, 8, 16)],
    scheduledHours: {
      "2024-08-14": 8,
      "2024-08-15": 0, // vacation
      "2024-08-16": 0, // vacation
      "2024-08-17": 6,
      "2024-08-18": 8,
      "2024-08-19": 8,
      "2024-08-20": 7
    }
  },
  {
    id: "2",
    name: "Sarah Johnson",
    department: "Fire-ex",
    workCenters: ["RECEIVING INSPECTION", "FINAL INSPECTION", "P2 INSPECTION"],
    hoursPerDay: 8,
    vacationDays: [],
    scheduledHours: {
      "2024-08-14": 8,
      "2024-08-15": 8,
      "2024-08-16": 8,
      "2024-08-17": 8,
      "2024-08-18": 6,
      "2024-08-19": 8,
      "2024-08-20": 8
    }
  },
  {
    id: "3",
    name: "Mike Wilson",
    department: "Fire-ex",
    workCenters: ["HYDRO", "BLAST/PAINT", "CLEAN"],
    hoursPerDay: 8,
    vacationDays: [new Date(2024, 8, 18)],
    scheduledHours: {
      "2024-08-14": 8,
      "2024-08-15": 8,
      "2024-08-16": 7,
      "2024-08-17": 8,
      "2024-08-18": 0, // vacation
      "2024-08-19": 8,
      "2024-08-20": 8
    }
  },
  {
    id: "4",
    name: "Lisa Brown",
    department: "Fire-ex",
    workCenters: ["TEARDOWN", "DUMP", "TAG"],
    hoursPerDay: 8,
    vacationDays: [],
    scheduledHours: {
      "2024-08-14": 8,
      "2024-08-15": 8,
      "2024-08-16": 8,
      "2024-08-17": 7,
      "2024-08-18": 8,
      "2024-08-19": 8,
      "2024-08-20": 6
    }
  },
  {
    id: "5",
    name: "Tom Garcia",
    department: "Firex-TX",
    workCenters: ["ASSEMBLY", "WELDING", "FILL"],
    hoursPerDay: 8,
    vacationDays: [new Date(2024, 8, 19), new Date(2024, 8, 20)],
    scheduledHours: {
      "2024-08-14": 8,
      "2024-08-15": 8,
      "2024-08-16": 8,
      "2024-08-17": 8,
      "2024-08-18": 8,
      "2024-08-19": 0, // vacation
      "2024-08-20": 0  // vacation
    }
  },
  {
    id: "6",
    name: "Amy Davis",
    department: "Firex-TX",
    workCenters: ["RECEIVING INSPECTION", "P1 INSPECTION", "VERIFY PARTS"],
    hoursPerDay: 8,
    vacationDays: [],
    scheduledHours: {
      "2024-08-14": 8,
      "2024-08-15": 8,
      "2024-08-16": 6,
      "2024-08-17": 8,
      "2024-08-18": 8,
      "2024-08-19": 8,
      "2024-08-20": 8
    }
  },
  {
    id: "7",
    name: "Chris Martinez",
    department: "Oxygen",
    workCenters: ["HYDRO", "FILL", "WEIGHT/LEAK CHECK"],
    hoursPerDay: 8,
    vacationDays: [new Date(2024, 8, 17)],
    scheduledHours: {
      "2024-08-14": 8,
      "2024-08-15": 8,
      "2024-08-16": 8,
      "2024-08-17": 0, // vacation
      "2024-08-18": 8,
      "2024-08-19": 8,
      "2024-08-20": 7
    }
  },
  {
    id: "8",
    name: "Jennifer Lee",
    department: "Oxygen",
    workCenters: ["ASSEMBLY", "VERIFY GAUGE/SWITCH/TCPS", "FINAL INSPECTION"],
    hoursPerDay: 8,
    vacationDays: [],
    scheduledHours: {
      "2024-08-14": 8,
      "2024-08-15": 7,
      "2024-08-16": 8,
      "2024-08-17": 8,
      "2024-08-18": 8,
      "2024-08-19": 8,
      "2024-08-20": 8
    }
  }
];

export function Manpower({ selectedDepartment }: ManpowerProps) {
  const filteredEmployees = employees.filter(emp => emp.department === selectedDepartment);
  
  // Generate week dates (current week)
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getDayStatus = (employee: Employee, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const scheduledHours = employee.scheduledHours[dateStr] || 0;
    const isVacation = employee.vacationDays.some(vd => isSameDay(vd, date));
    
    if (isVacation) return { type: 'vacation', hours: 0, label: 'Vacation' };
    if (scheduledHours === 0) return { type: 'off', hours: 0, label: 'Off' };
    if (scheduledHours === employee.hoursPerDay) return { type: 'full', hours: scheduledHours, label: `${scheduledHours}h` };
    if (scheduledHours > 0) return { type: 'partial', hours: scheduledHours, label: `${scheduledHours}h` };
    return { type: 'available', hours: 0, label: 'Available' };
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'vacation': return 'bg-warning text-warning-foreground';
      case 'off': return 'bg-muted text-muted-foreground';
      case 'full': return 'bg-success text-success-foreground';
      case 'partial': return 'bg-primary text-primary-foreground';
      case 'available': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Calculate department summary
  const departmentStats = weekDates.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const totalAvailable = filteredEmployees.reduce((sum, emp) => sum + emp.hoursPerDay, 0);
    const totalScheduled = filteredEmployees.reduce((sum, emp) => {
      const scheduled = emp.scheduledHours[dateStr] || 0;
      return sum + scheduled;
    }, 0);
    const variance = totalScheduled - totalAvailable;
    
    return {
      date,
      totalAvailable,
      totalScheduled,
      variance,
      utilization: totalAvailable > 0 ? (totalScheduled / totalAvailable) * 100 : 0
    };
  });

  return (
    <div className="space-y-6">
      {/* Department Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manpower Overview - {selectedDepartment}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {departmentStats.map((stat) => (
              <div key={stat.date.toISOString()} className="text-center">
                <div className="font-medium text-sm mb-2">
                  {format(stat.date, 'EEE dd')}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="text-muted-foreground">Available: {stat.totalAvailable}h</div>
                  <div className="text-muted-foreground">Scheduled: {stat.totalScheduled}h</div>
                  <div className={`font-medium ${stat.variance > 0 ? 'text-warning' : stat.variance < 0 ? 'text-success' : 'text-muted-foreground'}`}>
                    Variance: {stat.variance > 0 ? '+' : ''}{stat.variance}h
                  </div>
                  <div className="text-xs">
                    <Badge className={`${stat.utilization >= 100 ? 'bg-destructive' : stat.utilization >= 85 ? 'bg-warning' : 'bg-success'} text-white`}>
                      {stat.utilization.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employee Schedule Calendar */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Employee Schedules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{employee.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Work Centers: {employee.workCenters.join(', ')}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {weekDates.map((date) => {
                    const status = getDayStatus(employee, date);
                    return (
                      <div key={date.toISOString()} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          {format(date, 'EEE dd')}
                        </div>
                        <Badge className={getStatusColor(status.type)}>
                          {status.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}