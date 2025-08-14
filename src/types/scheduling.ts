export interface Department {
  id: string;
  name: string;
  totalCapacityHours: number;
  availableHours: number;
}

export interface ProcessStep {
  id: string;
  name: string;
  departmentId: string;
  estimatedHours: number;
  order: number;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  repairOrderNumber: string;
  customerName: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  department: 'Fire-ex' | 'Firex-TX' | 'Oxygen' | 'Oxygen-TX' | 'Survival' | 'Survival-TX';
  steps: ProcessStep[];
  createdAt: Date;
  dueDate?: Date;
  scheduledStartDate?: Date;
  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;
  totalHours: number;
}

export interface CapacityData {
  departmentId: string;
  departmentName: string;
  totalCapacity: number;
  usedCapacity: number;
  utilizationPercentage: number;
  backlogHours: number;
  backlogDays: number;
}

export interface SchedulingResult {
  workOrderId: string;
  estimatedStartDate: Date;
  estimatedCompletionDate: Date;
  totalDays: number;
  stepSchedules: {
    stepId: string;
    startDate: Date;
    endDate: Date;
    days: number;
  }[];
}