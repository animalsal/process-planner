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
  { id: '1', name: 'Fire-ex', totalCapacityHours: 160, availableHours: 160 },
  { id: '2', name: 'Firex-TX', totalCapacityHours: 120, availableHours: 120 },
  { id: '3', name: 'Oxygen', totalCapacityHours: 140, availableHours: 140 },
  { id: '4', name: 'Oxygen-TX', totalCapacityHours: 100, availableHours: 100 },
  { id: '5', name: 'Survival', totalCapacityHours: 180, availableHours: 180 },
  { id: '6', name: 'Survival-TX', totalCapacityHours: 90, availableHours: 90 },
];

// Sample work orders
const sampleWorkOrders: WorkOrder[] = [
  // August work orders - current capacity
  {
    id: '1',
    workOrderNumber: 'WO-2024-001',
    repairOrderNumber: 'RO-X200-045',
    customerName: 'Acme Manufacturing',
    title: 'Engine Block Assembly',
    description: 'Complete engine block assembly for Model X200',
    priority: 'high',
    status: 'pending',
    department: 'Fire-ex',
    workType: 'contractual',
    totalHours: 45,
    createdAt: new Date('2024-08-15'),
    dueDate: new Date('2024-09-05'),
    scheduledDate: new Date('2024-08-28'),
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
    repairOrderNumber: 'RO-Y150-132',
    customerName: 'Global Aerospace Corp',
    title: 'Turbine Housing Repair',
    description: 'Critical repair of turbine housing for emergency flight systems',
    priority: 'urgent',
    status: 'pending',
    department: 'Firex-TX',
    workType: 'non-contract',
    totalHours: 72,
    createdAt: new Date('2024-08-16'),
    dueDate: new Date('2024-08-30'),
    scheduledDate: new Date('2024-08-27'),
    steps: [
      { id: '2-1', name: 'Disassembly', departmentId: '2', estimatedHours: 8, order: 1 },
      { id: '2-2', name: 'Component Machining', departmentId: '2', estimatedHours: 24, order: 2 },
      { id: '2-3', name: 'Reassembly', departmentId: '2', estimatedHours: 16, order: 3 },
      { id: '2-4', name: 'Testing & QC', departmentId: '2', estimatedHours: 24, order: 4 },
    ]
  },
  // September over-capacity scenarios
  {
    id: '3',
    workOrderNumber: 'WO-2024-003',
    repairOrderNumber: 'RO-Z300-789',
    customerName: 'TechFlow Industries',
    title: 'Oxygen System Overhaul',
    description: 'Complete overhaul of oxygen system components',
    priority: 'urgent',
    status: 'pending',
    department: 'Oxygen',
    workType: 'contractual',
    totalHours: 96,
    createdAt: new Date('2024-08-18'),
    dueDate: new Date('2024-09-02'),
    scheduledDate: new Date('2024-09-01'),
    steps: [
      { id: '3-1', name: 'Component Analysis', departmentId: '3', estimatedHours: 16, order: 1 },
      { id: '3-2', name: 'Machining', departmentId: '3', estimatedHours: 32, order: 2 },
      { id: '3-3', name: 'Assembly', departmentId: '3', estimatedHours: 24, order: 3 },
      { id: '3-4', name: 'Testing', departmentId: '3', estimatedHours: 24, order: 4 },
    ]
  },
  {
    id: '4',
    workOrderNumber: 'WO-2024-004',
    repairOrderNumber: 'RO-O400-123',
    customerName: 'Maritime Safety Corp',
    title: 'Emergency Oxygen Tank Repair',
    description: 'Critical repair for emergency oxygen systems',
    priority: 'urgent',
    status: 'pending',
    department: 'Oxygen-TX',
    workType: 'contractual',
    totalHours: 88,
    createdAt: new Date('2024-08-19'),
    dueDate: new Date('2024-09-03'),
    scheduledDate: new Date('2024-09-02'),
    steps: [
      { id: '4-1', name: 'Pressure Testing', departmentId: '4', estimatedHours: 16, order: 1 },
      { id: '4-2', name: 'Welding Repairs', departmentId: '4', estimatedHours: 32, order: 2 },
      { id: '4-3', name: 'Valve Replacement', departmentId: '4', estimatedHours: 24, order: 3 },
      { id: '4-4', name: 'Final Testing', departmentId: '4', estimatedHours: 16, order: 4 },
    ]
  },
  {
    id: '5',
    workOrderNumber: 'WO-2024-005',
    repairOrderNumber: 'RO-S500-567',
    customerName: 'Emergency Response Inc',
    title: 'Life Vest System Overhaul',
    description: 'Complete overhaul of automated life vest systems',
    priority: 'high',
    status: 'pending',
    department: 'Survival',
    workType: 'contractual',
    totalHours: 120,
    createdAt: new Date('2024-08-20'),
    dueDate: new Date('2024-09-05'),
    scheduledDate: new Date('2024-09-03'),
    steps: [
      { id: '5-1', name: 'Component Inspection', departmentId: '5', estimatedHours: 24, order: 1 },
      { id: '5-2', name: 'Fabric Repair', departmentId: '5', estimatedHours: 40, order: 2 },
      { id: '5-3', name: 'Inflation System', departmentId: '5', estimatedHours: 32, order: 3 },
      { id: '5-4', name: 'Quality Testing', departmentId: '5', estimatedHours: 24, order: 4 },
    ]
  },
  {
    id: '6',
    workOrderNumber: 'WO-2024-006',
    repairOrderNumber: 'RO-ST600-890',
    customerName: 'Safety Systems Ltd',
    title: 'Survival Kit Transmission Update',
    description: 'Update and repair survival kit transmission systems',
    priority: 'high',
    status: 'pending',
    department: 'Survival-TX',
    workType: 'non-contract',
    totalHours: 104,
    createdAt: new Date('2024-08-21'),
    dueDate: new Date('2024-09-06'),
    scheduledDate: new Date('2024-09-04'),
    steps: [
      { id: '6-1', name: 'Electronics Testing', departmentId: '6', estimatedHours: 20, order: 1 },
      { id: '6-2', name: 'Circuit Repair', departmentId: '6', estimatedHours: 36, order: 2 },
      { id: '6-3', name: 'Signal Testing', departmentId: '6', estimatedHours: 28, order: 3 },
      { id: '6-4', name: 'Calibration', departmentId: '6', estimatedHours: 20, order: 4 },
    ]
  },
  // Mid-September high volume causing over-capacity
  {
    id: '7',
    workOrderNumber: 'WO-2024-007',
    repairOrderNumber: 'RO-F700-111',
    customerName: 'Industrial Fire Systems',
    title: 'Fire Suppression System Rebuild',
    description: 'Complete rebuild of industrial fire suppression system',
    priority: 'urgent',
    status: 'pending',
    department: 'Fire-ex',
    workType: 'contractual',
    totalHours: 80,
    createdAt: new Date('2024-08-22'),
    dueDate: new Date('2024-09-10'),
    scheduledDate: new Date('2024-09-08'),
    steps: [
      { id: '7-1', name: 'System Analysis', departmentId: '1', estimatedHours: 16, order: 1 },
      { id: '7-2', name: 'Component Replacement', departmentId: '1', estimatedHours: 32, order: 2 },
      { id: '7-3', name: 'Pressure Testing', departmentId: '1', estimatedHours: 20, order: 3 },
      { id: '7-4', name: 'Certification', departmentId: '1', estimatedHours: 12, order: 4 },
    ]
  },
  {
    id: '8',
    workOrderNumber: 'WO-2024-008',
    repairOrderNumber: 'RO-FT800-222',
    customerName: 'Airport Safety Division',
    title: 'Fire Suppression Transmission Repair',
    description: 'Critical transmission system repair for airport fire systems',
    priority: 'urgent',
    status: 'pending',
    department: 'Firex-TX',
    workType: 'contractual',
    totalHours: 112,
    createdAt: new Date('2024-08-23'),
    dueDate: new Date('2024-09-12'),
    scheduledDate: new Date('2024-09-10'),
    steps: [
      { id: '8-1', name: 'Diagnostic Testing', departmentId: '2', estimatedHours: 24, order: 1 },
      { id: '8-2', name: 'Transmission Rebuild', departmentId: '2', estimatedHours: 48, order: 2 },
      { id: '8-3', name: 'Performance Testing', departmentId: '2', estimatedHours: 24, order: 3 },
      { id: '8-4', name: 'Final Calibration', departmentId: '2', estimatedHours: 16, order: 4 },
    ]
  },
  {
    id: '9',
    workOrderNumber: 'WO-2024-009',
    repairOrderNumber: 'RO-O900-333',
    customerName: 'Medical Equipment Co',
    title: 'Hospital Oxygen System Repair',
    description: 'Emergency repair of hospital oxygen delivery system',
    priority: 'urgent',
    status: 'pending',
    department: 'Oxygen',
    workType: 'contractual',
    totalHours: 128,
    createdAt: new Date('2024-08-24'),
    dueDate: new Date('2024-09-12'),
    scheduledDate: new Date('2024-09-11'),
    steps: [
      { id: '9-1', name: 'System Inspection', departmentId: '3', estimatedHours: 32, order: 1 },
      { id: '9-2', name: 'Valve Replacement', departmentId: '3', estimatedHours: 48, order: 2 },
      { id: '9-3', name: 'Pressure Calibration', departmentId: '3', estimatedHours: 32, order: 3 },
      { id: '9-4', name: 'Safety Testing', departmentId: '3', estimatedHours: 16, order: 4 },
    ]
  },
  {
    id: '10',
    workOrderNumber: 'WO-2024-010',
    repairOrderNumber: 'RO-OT1000-444',
    customerName: 'Emergency Services',
    title: 'Mobile Oxygen Transmission Unit',
    description: 'Repair of mobile oxygen transmission for ambulances',
    priority: 'high',
    status: 'pending',
    department: 'Oxygen-TX',
    workType: 'non-contract',
    totalHours: 96,
    createdAt: new Date('2024-08-25'),
    dueDate: new Date('2024-09-15'),
    scheduledDate: new Date('2024-09-13'),
    steps: [
      { id: '10-1', name: 'Unit Disassembly', departmentId: '4', estimatedHours: 16, order: 1 },
      { id: '10-2', name: 'Component Repair', departmentId: '4', estimatedHours: 40, order: 2 },
      { id: '10-3', name: 'Transmission Testing', departmentId: '4', estimatedHours: 24, order: 3 },
      { id: '10-4', name: 'Mobile Testing', departmentId: '4', estimatedHours: 16, order: 4 },
    ]
  },
  {
    id: '11',
    workOrderNumber: 'WO-2024-011',
    repairOrderNumber: 'RO-S1100-555',
    customerName: 'Coast Guard',
    title: 'Life Raft System Overhaul',
    description: 'Complete overhaul of coast guard life raft systems',
    priority: 'medium',
    status: 'pending',
    department: 'Survival',
    workType: 'contractual',
    totalHours: 144,
    createdAt: new Date('2024-08-26'),
    dueDate: new Date('2024-09-18'),
    scheduledDate: new Date('2024-09-15'),
    steps: [
      { id: '11-1', name: 'Raft Inspection', departmentId: '5', estimatedHours: 24, order: 1 },
      { id: '11-2', name: 'Material Replacement', departmentId: '5', estimatedHours: 64, order: 2 },
      { id: '11-3', name: 'Inflation Testing', departmentId: '5', estimatedHours: 32, order: 3 },
      { id: '11-4', name: 'Deployment Testing', departmentId: '5', estimatedHours: 24, order: 4 },
    ]
  },
  {
    id: '12',
    workOrderNumber: 'WO-2024-012',
    repairOrderNumber: 'RO-ST1200-666',
    customerName: 'Naval Operations',
    title: 'Survival Equipment Transmission',
    description: 'Repair and upgrade survival equipment transmission systems',
    priority: 'medium',
    status: 'pending',
    department: 'Survival-TX',
    workType: 'contractual',
    totalHours: 88,
    createdAt: new Date('2024-08-27'),
    dueDate: new Date('2024-09-20'),
    scheduledDate: new Date('2024-09-17'),
    steps: [
      { id: '12-1', name: 'Signal Analysis', departmentId: '6', estimatedHours: 20, order: 1 },
      { id: '12-2', name: 'Circuit Upgrade', departmentId: '6', estimatedHours: 32, order: 2 },
      { id: '12-3', name: 'Range Testing', departmentId: '6', estimatedHours: 24, order: 3 },
      { id: '12-4', name: 'Environmental Testing', departmentId: '6', estimatedHours: 12, order: 4 },
    ]
  },
  // Late September - creating critical over-capacity situation
  {
    id: '13',
    workOrderNumber: 'WO-2024-013',
    repairOrderNumber: 'RO-F1300-777',
    customerName: 'Chemical Plant Safety',
    title: 'Industrial Fire System Emergency Repair',
    description: 'Emergency repair of chemical plant fire suppression system',
    priority: 'urgent',
    status: 'pending',
    department: 'Fire-ex',
    workType: 'contractual',
    totalHours: 160,
    createdAt: new Date('2024-08-28'),
    dueDate: new Date('2024-09-25'),
    scheduledDate: new Date('2024-09-22'),
    steps: [
      { id: '13-1', name: 'Emergency Assessment', departmentId: '1', estimatedHours: 24, order: 1 },
      { id: '13-2', name: 'Component Fabrication', departmentId: '1', estimatedHours: 64, order: 2 },
      { id: '13-3', name: 'System Integration', departmentId: '1', estimatedHours: 48, order: 3 },
      { id: '13-4', name: 'Safety Certification', departmentId: '1', estimatedHours: 24, order: 4 },
    ]
  },
  {
    id: '14',
    workOrderNumber: 'WO-2024-014',
    repairOrderNumber: 'RO-FT1400-888',
    customerName: 'Airport Emergency Services',
    title: 'Runway Fire Suppression Transmission',
    description: 'Critical transmission repair for runway fire suppression',
    priority: 'urgent',
    status: 'pending',
    department: 'Firex-TX',
    workType: 'contractual',
    totalHours: 136,
    createdAt: new Date('2024-08-29'),
    dueDate: new Date('2024-09-25'),
    scheduledDate: new Date('2024-09-23'),
    steps: [
      { id: '14-1', name: 'System Diagnostics', departmentId: '2', estimatedHours: 32, order: 1 },
      { id: '14-2', name: 'Transmission Overhaul', departmentId: '2', estimatedHours: 56, order: 2 },
      { id: '14-3', name: 'Integration Testing', departmentId: '2', estimatedHours: 32, order: 3 },
      { id: '14-4', name: 'Field Testing', departmentId: '2', estimatedHours: 16, order: 4 },
    ]
  },
  {
    id: '15',
    workOrderNumber: 'WO-2024-015',
    repairOrderNumber: 'RO-O1500-999',
    customerName: 'Emergency Medical Systems',
    title: 'Critical Oxygen System Rebuild',
    description: 'Complete rebuild of critical care oxygen systems',
    priority: 'urgent',
    status: 'pending',
    department: 'Oxygen',
    workType: 'contractual',
    totalHours: 152,
    createdAt: new Date('2024-08-30'),
    dueDate: new Date('2024-09-27'),
    scheduledDate: new Date('2024-09-25'),
    steps: [
      { id: '15-1', name: 'Complete Disassembly', departmentId: '3', estimatedHours: 32, order: 1 },
      { id: '15-2', name: 'Component Refabrication', departmentId: '3', estimatedHours: 64, order: 2 },
      { id: '15-3', name: 'System Rebuild', departmentId: '3', estimatedHours: 40, order: 3 },
      { id: '15-4', name: 'Compliance Testing', departmentId: '3', estimatedHours: 16, order: 4 },
    ]
  },
  {
    id: '16',
    workOrderNumber: 'WO-2024-016',
    repairOrderNumber: 'RO-OT1600-101',
    customerName: 'Paramedic Services',
    title: 'Fleet Oxygen Transmission Repair',
    description: 'Repair oxygen transmission systems for entire paramedic fleet',
    priority: 'high',
    status: 'pending',
    department: 'Oxygen-TX',
    workType: 'contractual',
    totalHours: 120,
    createdAt: new Date('2024-08-31'),
    dueDate: new Date('2024-09-28'),
    scheduledDate: new Date('2024-09-26'),
    steps: [
      { id: '16-1', name: 'Fleet Assessment', departmentId: '4', estimatedHours: 24, order: 1 },
      { id: '16-2', name: 'Batch Repair', departmentId: '4', estimatedHours: 56, order: 2 },
      { id: '16-3', name: 'Fleet Testing', departmentId: '4', estimatedHours: 24, order: 3 },
      { id: '16-4', name: 'Fleet Deployment', departmentId: '4', estimatedHours: 16, order: 4 },
    ]
  },
  {
    id: '17',
    workOrderNumber: 'WO-2024-017',
    repairOrderNumber: 'RO-S1700-202',
    customerName: 'Maritime Rescue',
    title: 'Emergency Survival Equipment Overhaul',
    description: 'Overhaul of emergency survival equipment for maritime rescue',
    priority: 'urgent',
    status: 'pending',
    department: 'Survival',
    workType: 'contractual',
    totalHours: 176,
    createdAt: new Date('2024-09-01'),
    dueDate: new Date('2024-09-28'),
    scheduledDate: new Date('2024-09-27'),
    steps: [
      { id: '17-1', name: 'Equipment Audit', departmentId: '5', estimatedHours: 40, order: 1 },
      { id: '17-2', name: 'Component Overhaul', departmentId: '5', estimatedHours: 80, order: 2 },
      { id: '17-3', name: 'System Integration', departmentId: '5', estimatedHours: 40, order: 3 },
      { id: '17-4', name: 'Deployment Testing', departmentId: '5', estimatedHours: 16, order: 4 },
    ]
  },
  {
    id: '18',
    workOrderNumber: 'WO-2024-018',
    repairOrderNumber: 'RO-ST1800-303',
    customerName: 'Search and Rescue',
    title: 'Advanced Survival Transmission System',
    description: 'Advanced transmission system for search and rescue operations',
    priority: 'high',
    status: 'pending',
    department: 'Survival-TX',
    workType: 'non-contract',
    totalHours: 104,
    createdAt: new Date('2024-09-02'),
    dueDate: new Date('2024-09-30'),
    scheduledDate: new Date('2024-09-28'),
    steps: [
      { id: '18-1', name: 'Advanced Diagnostics', departmentId: '6', estimatedHours: 24, order: 1 },
      { id: '18-2', name: 'System Upgrade', departmentId: '6', estimatedHours: 48, order: 2 },
      { id: '18-3', name: 'Range Optimization', departmentId: '6', estimatedHours: 20, order: 3 },
      { id: '18-4', name: 'Field Validation', departmentId: '6', estimatedHours: 12, order: 4 },
    ]
  }
];

export function useScheduling() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(sampleWorkOrders);
  const [departments] = useState<Department[]>(sampleDepartments);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('Fire-ex');

  // Filter work orders by selected department
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => wo.department === selectedDepartment);
  }, [workOrders, selectedDepartment]);

  const capacityData: CapacityData[] = useMemo(() => {
    return departments.map(dept => {
      const departmentWorkload = filteredWorkOrders
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
  }, [filteredWorkOrders, departments]);

  const scheduleWorkOrders = (): SchedulingResult[] => {
    const results: SchedulingResult[] = [];
    const departmentSchedules = new Map<string, Date>();
    
    // Initialize department schedules to current date
    departments.forEach(dept => {
      departmentSchedules.set(dept.id, new Date());
    });

    // Sort work orders by priority and creation date
    const sortedWorkOrders = [...filteredWorkOrders]
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
      const workOrder = filteredWorkOrders.find(wo => wo.id === result.workOrderId);
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
    workOrders: filteredWorkOrders,
    allWorkOrders: workOrders,
    departments,
    capacityData,
    scheduleWorkOrders,
    getDailySchedules,
    addWorkOrder,
    updateWorkOrderStatus,
    updateWorkOrder,
    selectedDepartment,
    setSelectedDepartment
  };
}