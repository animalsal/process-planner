import { useState, useMemo } from 'react';
import { WorkOrder, Department, CapacityData, SchedulingResult } from '@/types/scheduling';

export interface DailySchedule {
  date: string; // YYYY-MM-DD format
  scheduledHours: number;
  availableHours: number;
  variance: number;
  workOrderSteps: {
    workOrderId: string;
    workOrderTitle: string;
    stepName: string;
    departmentName: string;
    hours: number;
    priority: WorkOrder['priority'];
  }[];
}

// Sample departments data
const sampleDepartments: Department[] = [
  { id: '1', name: 'Machining', totalCapacityHours: 160, availableHours: 160 },
  { id: '2', name: 'Assembly', totalCapacityHours: 120, availableHours: 120 },
  { id: '3', name: 'Quality Control', totalCapacityHours: 80, availableHours: 80 },
  { id: '4', name: 'Welding', totalCapacityHours: 100, availableHours: 100 },
  { id: '5', name: 'Finishing', totalCapacityHours: 60, availableHours: 60 },
];

// Sample work orders
const sampleWorkOrders: WorkOrder[] = [
  {
    id: '1',
    workOrderNumber: 'WO-2024-001',
    repairOrderNumber: 'RO-X200-045',
    customerName: 'Acme Manufacturing',
    title: 'Engine Block Assembly',
    description: 'Complete engine block assembly for Model X200',
    priority: 'high',
    status: 'pending',
    totalHours: 45,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    steps: [
      { id: '1-1', name: 'Raw Material Prep', departmentId: '1', estimatedHours: 8, order: 1 },
      { id: '1-2', name: 'Machining Operations', departmentId: '1', estimatedHours: 16, order: 2 },
      { id: '1-3', name: 'Welding Frame', departmentId: '4', estimatedHours: 12, order: 3 },
      { id: '1-4', name: 'Final Assembly', departmentId: '2', estimatedHours: 6, order: 4 },
      { id: '1-5', name: 'Quality Inspection', departmentId: '3', estimatedHours: 3, order: 5 },
    ]
  },
  {
    id: '2',
    workOrderNumber: 'WO-2024-002',
    repairOrderNumber: 'RO-HM-321',
    customerName: 'Industrial Solutions Ltd',
    title: 'Transmission Rebuild',
    description: 'Rebuild transmission unit for heavy machinery',
    priority: 'urgent',
    status: 'pending',
    totalHours: 32,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    steps: [
      { id: '2-1', name: 'Disassembly', departmentId: '1', estimatedHours: 4, order: 1 },
      { id: '2-2', name: 'Component Machining', departmentId: '1', estimatedHours: 12, order: 2 },
      { id: '2-3', name: 'Reassembly', departmentId: '2', estimatedHours: 10, order: 3 },
      { id: '2-4', name: 'Testing & QC', departmentId: '3', estimatedHours: 6, order: 4 },
    ]
  },
  {
    id: '3',
    workOrderNumber: 'WO-2024-003',
    repairOrderNumber: 'RO-CB-789',
    customerName: 'Custom Fabrication Co',
    title: 'Custom Bracket Fabrication',
    description: 'Custom mounting brackets for client specification',
    priority: 'medium',
    status: 'in_progress',
    totalHours: 18,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    steps: [
      { id: '3-1', name: 'Material Cutting', departmentId: '1', estimatedHours: 3, order: 1 },
      { id: '3-2', name: 'Welding', departmentId: '4', estimatedHours: 8, order: 2 },
      { id: '3-3', name: 'Surface Finishing', departmentId: '5', estimatedHours: 4, order: 3 },
      { id: '3-4', name: 'Quality Check', departmentId: '3', estimatedHours: 3, order: 4 },
    ]
  }
];

export function useScheduling() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(sampleWorkOrders);
  const [departments] = useState<Department[]>(sampleDepartments);

  const capacityData: CapacityData[] = useMemo(() => {
    return departments.map(dept => {
      const departmentWorkload = workOrders
        .filter(wo => wo.status !== 'completed')
        .flatMap(wo => wo.steps.filter(step => step.departmentId === dept.id))
        .reduce((total, step) => total + step.estimatedHours, 0);

      const utilizationPercentage = (departmentWorkload / dept.totalCapacityHours) * 100;
      const backlogDays = Math.max(0, (departmentWorkload - dept.availableHours) / (dept.totalCapacityHours / 5)); // Assuming 5 working days per week

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        totalCapacity: dept.totalCapacityHours,
        usedCapacity: Math.min(departmentWorkload, dept.totalCapacityHours),
        utilizationPercentage,
        backlogHours: Math.max(0, departmentWorkload - dept.availableHours),
        backlogDays
      };
    });
  }, [workOrders, departments]);

  const scheduleWorkOrders = (): SchedulingResult[] => {
    const results: SchedulingResult[] = [];
    const departmentSchedules = new Map<string, Date>();
    
    // Initialize department schedules to current date
    departments.forEach(dept => {
      departmentSchedules.set(dept.id, new Date());
    });

    // Sort work orders by priority and creation date
    const sortedWorkOrders = [...workOrders]
      .filter(wo => wo.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    sortedWorkOrders.forEach(workOrder => {
      const stepSchedules: SchedulingResult['stepSchedules'] = [];
      let workOrderStartDate = new Date();
      let workOrderEndDate = new Date();

      workOrder.steps
        .sort((a, b) => a.order - b.order)
        .forEach((step, index) => {
          const dept = departments.find(d => d.id === step.departmentId);
          if (!dept) return;

          const stepStartDate = new Date(departmentSchedules.get(step.departmentId) || new Date());
          const hoursPerDay = dept.totalCapacityHours / 5; // 5 working days
          const daysNeeded = Math.ceil(step.estimatedHours / hoursPerDay);
          const stepEndDate = new Date(stepStartDate);
          stepEndDate.setDate(stepEndDate.getDate() + daysNeeded);

          stepSchedules.push({
            stepId: step.id,
            startDate: stepStartDate,
            endDate: stepEndDate,
            days: daysNeeded
          });

          // Update department schedule
          departmentSchedules.set(step.departmentId, stepEndDate);

          if (index === 0) workOrderStartDate = stepStartDate;
          workOrderEndDate = stepEndDate;
        });

      const totalDays = Math.ceil(
        (workOrderEndDate.getTime() - workOrderStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      results.push({
        workOrderId: workOrder.id,
        estimatedStartDate: workOrderStartDate,
        estimatedCompletionDate: workOrderEndDate,
        totalDays,
        stepSchedules
      });
    });

    return results;
  };

  const getDailySchedules = (): DailySchedule[] => {
    const scheduledResults = scheduleWorkOrders();
    const dailySchedules = new Map<string, DailySchedule>();
    
    // Initialize next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      
      // Calculate total available hours per day across all departments
      const totalAvailableHours = departments.reduce((sum, dept) => {
        return sum + (dept.totalCapacityHours / 5); // 5 working days per week
      }, 0);
      
      dailySchedules.set(dateKey, {
        date: dateKey,
        scheduledHours: 0,
        availableHours: totalAvailableHours,
        variance: totalAvailableHours,
        workOrderSteps: []
      });
    }

    // Add scheduled work to each day
    scheduledResults.forEach(result => {
      const workOrder = workOrders.find(wo => wo.id === result.workOrderId);
      if (!workOrder) return;

      result.stepSchedules.forEach(stepSchedule => {
        const step = workOrder.steps.find(s => s.id === stepSchedule.stepId);
        const department = departments.find(d => d.id === step?.departmentId);
        if (!step || !department) return;

        // Distribute hours across the step's duration
        const stepDays = stepSchedule.days;
        const hoursPerDay = step.estimatedHours / stepDays;
        
        for (let i = 0; i < stepDays; i++) {
          const currentDate = new Date(stepSchedule.startDate);
          currentDate.setDate(currentDate.getDate() + i);
          const dateKey = currentDate.toISOString().split('T')[0];
          
          const daySchedule = dailySchedules.get(dateKey);
          if (daySchedule) {
            daySchedule.scheduledHours += hoursPerDay;
            daySchedule.variance = daySchedule.availableHours - daySchedule.scheduledHours;
            
            daySchedule.workOrderSteps.push({
              workOrderId: workOrder.id,
              workOrderTitle: workOrder.title,
              stepName: step.name,
              departmentName: department.name,
              hours: hoursPerDay,
              priority: workOrder.priority
            });
          }
        }
      });
    });

    return Array.from(dailySchedules.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const addWorkOrder = (workOrder: Omit<WorkOrder, 'id' | 'createdAt'>) => {
    const newWorkOrder: WorkOrder = {
      ...workOrder,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setWorkOrders(prev => [...prev, newWorkOrder]);
  };

  const updateWorkOrderStatus = (id: string, status: WorkOrder['status']) => {
    setWorkOrders(prev => prev.map(wo => 
      wo.id === id ? { ...wo, status } : wo
    ));
  };

  const updateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders(prev => prev.map(wo => 
      wo.id === id ? { ...wo, ...updates } : wo
    ));
  };

  return {
    workOrders,
    departments,
    capacityData,
    scheduleWorkOrders,
    getDailySchedules,
    addWorkOrder,
    updateWorkOrderStatus,
    updateWorkOrder
  };
}