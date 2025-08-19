import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, CalendarDays, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { DailySchedule } from '@/hooks/useScheduling';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CalendarViewProps {
  dailySchedules: DailySchedule[];
}

export function CalendarView({ dailySchedules }: CalendarViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const navigate = useNavigate();

  const handleDayClick = (daySchedule: DailySchedule) => {
    navigate(`/work-orders?scheduledDate=${daySchedule.date}`);
  };

  // Get current month's days
  const currentMonthSchedules = dailySchedules.filter(schedule => {
    const scheduleDate = new Date(schedule.date);
    return scheduleDate.getMonth() === selectedMonth.getMonth() && 
           scheduleDate.getFullYear() === selectedMonth.getFullYear();
  });

  const getDayOfMonth = (dateString: string) => {
    return new Date(dateString).getDate();
  };

  const getUtilizationColor = (variance: number, scheduledHours: number) => {
    if (scheduledHours === 0) return 'bg-muted';
    if (variance < 0) return 'bg-destructive'; // Over capacity
    if (variance < scheduledHours * 0.2) return 'bg-warning'; // High utilization
    return 'bg-success'; // Normal utilization
  };

  const formatMonth = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Generate calendar grid
  const firstDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day)
      .toISOString().split('T')[0];
    const daySchedule = dailySchedules.find(s => s.date === dateString);
    calendarDays.push(daySchedule);
  }

  return (
    <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Production Calendar
            </CardTitle>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => changeMonth('prev')}
                className="text-muted-foreground hover:text-foreground"
              >
                ←
              </button>
              <h3 className="font-semibold text-lg">{formatMonth(selectedMonth)}</h3>
              <button 
                onClick={() => changeMonth('next')}
                className="text-muted-foreground hover:text-foreground"
              >
                →
              </button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded"></div>
                <span>Normal Load</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning rounded"></div>
                <span>High Utilization</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive rounded"></div>
                <span>Over Capacity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted rounded"></div>
                <span>No Work Scheduled</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((daySchedule, index) => (
                <div key={index} className="aspect-square">
                  {daySchedule ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className={cn(
                            "w-full h-full p-1 rounded-lg border-2 border-transparent hover:border-primary cursor-pointer transition-colors flex flex-col justify-between",
                            getUtilizationColor(daySchedule.variance, daySchedule.scheduledHours)
                          )}
                          onClick={() => handleDayClick(daySchedule)}
                        >
                          <div className="text-sm font-medium text-white">
                            {getDayOfMonth(daySchedule.date)}
                          </div>
                          <div className="text-xs text-white/90 space-y-0.5">
                            <div className="flex justify-between">
                              <span>S:</span>
                              <span>{daySchedule.scheduledHours.toFixed(1)}h</span>
                            </div>
                            <div className="flex justify-between">
                              <span>A:</span>
                              <span>{daySchedule.availableHours.toFixed(1)}h</span>
                            </div>
                            <div className="flex justify-between">
                              <span>V:</span>
                              <span className={cn(
                                daySchedule.variance >= 0 ? "text-green-200" : "text-red-200"
                              )}>
                                {daySchedule.variance >= 0 ? '+' : ''}{daySchedule.variance.toFixed(1)}h
                              </span>
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm p-4" side="top">
                        <div className="space-y-3">
                          <div className="font-semibold">
                            {new Date(daySchedule.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <div>
                                <div className="text-muted-foreground">Scheduled</div>
                                <div className="font-medium">{daySchedule.scheduledHours.toFixed(1)}h</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              <div>
                                <div className="text-muted-foreground">Available</div>
                                <div className="font-medium">{daySchedule.availableHours.toFixed(1)}h</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {daySchedule.variance >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-success" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-destructive" />
                              )}
                              <div>
                                <div className="text-muted-foreground">Variance</div>
                                <div className={cn(
                                  "font-medium",
                                  daySchedule.variance >= 0 ? "text-success" : "text-destructive"
                                )}>
                                  {daySchedule.variance >= 0 ? '+' : ''}{daySchedule.variance.toFixed(1)}h
                                </div>
                              </div>
                            </div>
                          </div>

                          {daySchedule.workOrderSteps.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-sm font-medium">Scheduled Work:</div>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {daySchedule.workOrderSteps.map((step, stepIndex) => (
                                  <div key={stepIndex} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      <Badge 
                                        className={cn(
                                          "text-xs px-1 py-0",
                                          step.priority === 'urgent' ? 'bg-destructive' :
                                          step.priority === 'high' ? 'bg-warning' :
                                          step.priority === 'medium' ? 'bg-accent' : 'bg-muted'
                                        )}
                                      >
                                        {step.priority}
                                      </Badge>
                                      <span className="font-medium">{step.workOrderTitle}</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">{step.hours.toFixed(1)}h</div>
                                      <div className="text-muted-foreground">{step.departmentName}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div className="w-full h-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
  );
}