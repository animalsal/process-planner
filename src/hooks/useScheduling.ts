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
    department: 'Fire-ex',
    workType: 'contractual',
    totalHours: 45,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
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
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
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
    repairOrderNumber: 'RO-Z300-789',
    customerName: 'TechFlow Industries',
    title: 'Pressure Valve Overhaul',
    description: 'Complete overhaul of pressure valve system',
    priority: 'medium',
    status: 'in_progress',
    department: 'Oxygen',
    workType: 'contractual',
    totalHours: 28,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    steps: [
      { id: '3-1', name: 'Material Cutting', departmentId: '1', estimatedHours: 3, order: 1 },
      { id: '3-2', name: 'Welding', departmentId: '4', estimatedHours: 8, order: 2 },
      { id: '3-3', name: 'Surface Finishing', departmentId: '5', estimatedHours: 4, order: 3 },
      { id: '3-4', name: 'Quality Check', departmentId: '3', estimatedHours: 3, order: 4 },
    ]
  },
  {
    id: '4',
    workOrderNumber: 'WO-2024-004',
    repairOrderNumber: 'RO-A100-456',
    customerName: 'Marine Solutions Ltd',
    title: 'Hydraulic System Rebuild',
    description: 'Complete rebuild of hydraulic control system for offshore platform',
    priority: 'urgent',
    status: 'pending',
    department: 'Oxygen-TX',
    workType: 'non-contract',
    totalHours: 96,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '4-1', name: 'Pump Disassembly', departmentId: '1', estimatedHours: 8, order: 1 },
      { id: '4-2', name: 'Component Inspection', departmentId: '3', estimatedHours: 6, order: 2 },
      { id: '4-3', name: 'Precision Machining', departmentId: '1', estimatedHours: 24, order: 3 },
      { id: '4-4', name: 'Reassembly', departmentId: '2', estimatedHours: 10, order: 4 },
      { id: '4-5', name: 'Final Testing', departmentId: '3', estimatedHours: 4, order: 5 },
    ]
  },
  {
    id: '5',
    workOrderNumber: 'WO-2024-005',
    repairOrderNumber: 'RO-B250-883',
    customerName: 'PowerGen Systems',
    title: 'Generator Control Module',
    description: 'Replace and calibrate generator control module for backup power system',
    priority: 'urgent',
    status: 'pending',
    department: 'Survival',
    workType: 'contractual',
    totalHours: 42,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '5-1', name: 'Disassembly & Inspection', departmentId: '1', estimatedHours: 6, order: 1 },
      { id: '5-2', name: 'Gear Machining', departmentId: '1', estimatedHours: 18, order: 2 },
      { id: '5-3', name: 'Welding Repairs', departmentId: '4', estimatedHours: 8, order: 3 },
      { id: '5-4', name: 'Assembly', departmentId: '2', estimatedHours: 4, order: 4 },
      { id: '5-5', name: 'Quality Testing', departmentId: '3', estimatedHours: 2, order: 5 },
    ]
  },
  {
    id: '6',
    workOrderNumber: 'WO-2024-006',
    repairOrderNumber: 'RO-TF-789',
    customerName: 'TechFlow Industries',
    title: 'Valve Assembly Production',
    description: 'Batch production of industrial valves',
    priority: 'high',
    status: 'pending',
    department: 'Survival-TX',
    workType: 'non-contract',
    totalHours: 64,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '6-1', name: 'Raw Material Prep', departmentId: '1', estimatedHours: 12, order: 1 },
      { id: '6-2', name: 'CNC Machining', departmentId: '1', estimatedHours: 28, order: 2 },
      { id: '6-3', name: 'Welding Operations', departmentId: '4', estimatedHours: 16, order: 3 },
      { id: '6-4', name: 'Assembly', departmentId: '2', estimatedHours: 6, order: 4 },
      { id: '6-5', name: 'Quality Control', departmentId: '3', estimatedHours: 2, order: 5 },
    ]
  },
  {
    id: '7',
    workOrderNumber: 'WO-2024-007',
    repairOrderNumber: 'RO-AG-456',
    customerName: 'AgriTech Solutions',
    title: 'Harvester Component Repair',
    description: 'Seasonal harvester equipment repairs',
    priority: 'high',
    status: 'pending',
    department: 'Fire-ex',
    workType: 'contractual',
    totalHours: 42,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '7-1', name: 'Component Analysis', departmentId: '3', estimatedHours: 4, order: 1 },
      { id: '7-2', name: 'Machining Repairs', departmentId: '1', estimatedHours: 20, order: 2 },
      { id: '7-3', name: 'Welding Work', departmentId: '4', estimatedHours: 12, order: 3 },
      { id: '7-4', name: 'Final Assembly', departmentId: '2', estimatedHours: 4, order: 4 },
      { id: '7-5', name: 'Testing', departmentId: '3', estimatedHours: 2, order: 5 },
    ]
  },
  {
    id: '8',
    workOrderNumber: 'WO-2024-008',
    repairOrderNumber: 'RO-MI-234',
    customerName: 'Marine Industries',
    title: 'Ship Engine Overhaul',
    description: 'Complete marine engine overhaul and rebuild',
    priority: 'medium',
    status: 'pending',
    department: 'Firex-TX',
    workType: 'non-contract',
    totalHours: 78,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '8-1', name: 'Engine Disassembly', departmentId: '1', estimatedHours: 16, order: 1 },
      { id: '8-2', name: 'Component Machining', departmentId: '1', estimatedHours: 32, order: 2 },
      { id: '8-3', name: 'Welding & Repairs', departmentId: '4', estimatedHours: 18, order: 3 },
      { id: '8-4', name: 'Engine Assembly', departmentId: '2', estimatedHours: 8, order: 4 },
      { id: '8-5', name: 'Quality & Testing', departmentId: '3', estimatedHours: 4, order: 5 },
    ]
  },
  {
    id: '9',
    workOrderNumber: 'WO-2024-009',
    repairOrderNumber: 'RO-CT-567',
    customerName: 'Construction Tech',
    title: 'Excavator Arm Fabrication',
    description: 'Heavy-duty excavator arm manufacturing',
    priority: 'medium',
    status: 'pending',
    department: 'Oxygen',
    workType: 'contractual',
    totalHours: 56,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '9-1', name: 'Steel Cutting', departmentId: '1', estimatedHours: 8, order: 1 },
      { id: '9-2', name: 'Precision Machining', departmentId: '1', estimatedHours: 24, order: 2 },
      { id: '9-3', name: 'Heavy Welding', departmentId: '4', estimatedHours: 20, order: 3 },
      { id: '9-4', name: 'Assembly & Fitting', departmentId: '2', estimatedHours: 3, order: 4 },
      { id: '9-5', name: 'Load Testing', departmentId: '3', estimatedHours: 1, order: 5 },
    ]
  },
  {
    id: '10',
    workOrderNumber: 'WO-2024-010',
    repairOrderNumber: 'RO-EG-890',
    customerName: 'Energy Grid Corp',
    title: 'Turbine Blade Repair',
    description: 'Wind turbine blade structural repairs',
    priority: 'high',
    status: 'pending',
    department: 'Oxygen-TX',
    workType: 'non-contract',
    totalHours: 48,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '10-1', name: 'Damage Assessment', departmentId: '3', estimatedHours: 4, order: 1 },
      { id: '10-2', name: 'Material Prep', departmentId: '1', estimatedHours: 8, order: 2 },
      { id: '10-3', name: 'Composite Welding', departmentId: '4', estimatedHours: 24, order: 3 },
      { id: '10-4', name: 'Finishing Work', departmentId: '5', estimatedHours: 8, order: 4 },
      { id: '10-5', name: 'Final Inspection', departmentId: '3', estimatedHours: 4, order: 5 },
    ]
  },
  {
    id: '11',
    workOrderNumber: 'WO-2024-011',
    repairOrderNumber: 'RO-AP-123',
    customerName: 'Aerospace Parts Ltd',
    title: 'Aircraft Component Manufacturing',
    description: 'Precision aircraft components for commercial jets',
    priority: 'urgent',
    status: 'pending',
    department: 'Survival',
    workType: 'contractual',
    totalHours: 72,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '11-1', name: 'Material Inspection', departmentId: '3', estimatedHours: 6, order: 1 },
      { id: '11-2', name: 'Precision Machining', departmentId: '1', estimatedHours: 40, order: 2 },
      { id: '11-3', name: 'Specialized Welding', departmentId: '4', estimatedHours: 16, order: 3 },
      { id: '11-4', name: 'Assembly & Calibration', departmentId: '2', estimatedHours: 6, order: 4 },
      { id: '11-5', name: 'Aerospace Testing', departmentId: '3', estimatedHours: 4, order: 5 },
    ]
  },
  {
    id: '12',
    workOrderNumber: 'WO-2024-012',
    repairOrderNumber: 'RO-AU-456',
    customerName: 'AutoParts Depot',
    title: 'Brake System Components',
    description: 'High-volume brake disc manufacturing',
    priority: 'medium',
    status: 'pending',
    department: 'Survival-TX',
    workType: 'non-contract',
    totalHours: 36,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '12-1', name: 'Material Setup', departmentId: '1', estimatedHours: 4, order: 1 },
      { id: '12-2', name: 'CNC Operations', departmentId: '1', estimatedHours: 20, order: 2 },
      { id: '12-3', name: 'Heat Treatment', departmentId: '5', estimatedHours: 8, order: 3 },
      { id: '12-4', name: 'Quality Check', departmentId: '3', estimatedHours: 4, order: 4 },
    ]
  },
  {
    id: '13',
    workOrderNumber: 'WO-2024-013',
    repairOrderNumber: 'RO-PE-789',
    customerName: 'Petroleum Equipment Inc',
    title: 'Drilling Equipment Repair',
    description: 'Oil drilling equipment maintenance and repair',
    priority: 'urgent',
    status: 'pending',
    department: 'Fire-ex',
    workType: 'contractual',
    totalHours: 68,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '13-1', name: 'Equipment Teardown', departmentId: '1', estimatedHours: 12, order: 1 },
      { id: '13-2', name: 'Heavy Machining', departmentId: '1', estimatedHours: 32, order: 2 },
      { id: '13-3', name: 'Structural Welding', departmentId: '4', estimatedHours: 16, order: 3 },
      { id: '13-4', name: 'Hydraulic Assembly', departmentId: '2', estimatedHours: 6, order: 4 },
      { id: '13-5', name: 'Pressure Testing', departmentId: '3', estimatedHours: 2, order: 5 },
    ]
  },
  {
    id: '14',
    workOrderNumber: 'WO-2024-014',
    repairOrderNumber: 'RO-FP-234',
    customerName: 'Food Processing Systems',
    title: 'Conveyor System Rebuild',
    description: 'Industrial conveyor system overhaul',
    priority: 'medium',
    status: 'pending',
    department: 'Firex-TX',
    workType: 'non-contract',
    totalHours: 44,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '14-1', name: 'System Analysis', departmentId: '3', estimatedHours: 4, order: 1 },
      { id: '14-2', name: 'Component Machining', departmentId: '1', estimatedHours: 20, order: 2 },
      { id: '14-3', name: 'Frame Welding', departmentId: '4', estimatedHours: 12, order: 3 },
      { id: '14-4', name: 'Motor Assembly', departmentId: '2', estimatedHours: 6, order: 4 },
      { id: '14-5', name: 'System Testing', departmentId: '3', estimatedHours: 2, order: 5 },
    ]
  },
  {
    id: '15',
    workOrderNumber: 'WO-2024-015',
    repairOrderNumber: 'RO-RM-567',
    customerName: 'Railway Maintenance Co',
    title: 'Train Wheel Assembly',
    description: 'Locomotive wheel assembly and balancing',
    priority: 'high',
    status: 'pending',
    department: 'Oxygen',
    workType: 'contractual',
    totalHours: 54,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '15-1', name: 'Wheel Inspection', departmentId: '3', estimatedHours: 2, order: 1 },
      { id: '15-2', name: 'Precision Turning', departmentId: '1', estimatedHours: 24, order: 2 },
      { id: '15-3', name: 'Axle Welding', departmentId: '4', estimatedHours: 16, order: 3 },
      { id: '15-4', name: 'Wheel Assembly', departmentId: '2', estimatedHours: 8, order: 4 },
      { id: '15-5', name: 'Balance Testing', departmentId: '3', estimatedHours: 4, order: 5 },
    ]
  },
  {
    id: '16',
    workOrderNumber: 'WO-2024-016',
    repairOrderNumber: 'RO-PT-890',
    customerName: 'Power Tools International',
    title: 'Motor Housing Production',
    description: 'High-volume motor housing manufacturing',
    priority: 'medium',
    status: 'pending',
    department: 'Oxygen-TX',
    workType: 'non-contract',
    totalHours: 32,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '16-1', name: 'Aluminum Cutting', departmentId: '1', estimatedHours: 8, order: 1 },
      { id: '16-2', name: 'CNC Machining', departmentId: '1', estimatedHours: 16, order: 2 },
      { id: '16-3', name: 'Assembly', departmentId: '2', estimatedHours: 6, order: 3 },
      { id: '16-4', name: 'Quality Control', departmentId: '3', estimatedHours: 2, order: 4 },
    ]
  },
  {
    id: '17',
    workOrderNumber: 'WO-2024-017',
    repairOrderNumber: 'RO-WM-123',
    customerName: 'Waste Management Corp',
    title: 'Compactor Cylinder Repair',
    description: 'Hydraulic cylinder rebuild for waste compactor',
    priority: 'urgent',
    status: 'pending',
    department: 'Survival',
    workType: 'contractual',
    totalHours: 46,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '17-1', name: 'Cylinder Disassembly', departmentId: '1', estimatedHours: 6, order: 1 },
      { id: '17-2', name: 'Rod Machining', departmentId: '1', estimatedHours: 18, order: 2 },
      { id: '17-3', name: 'Welding Repairs', departmentId: '4', estimatedHours: 14, order: 3 },
      { id: '17-4', name: 'Cylinder Assembly', departmentId: '2', estimatedHours: 6, order: 4 },
      { id: '17-5', name: 'Pressure Testing', departmentId: '3', estimatedHours: 2, order: 5 },
    ]
  },
  {
    id: '18',
    workOrderNumber: 'WO-2024-018',
    repairOrderNumber: 'RO-SP-456',
    customerName: 'Steel Processing Ltd',
    title: 'Rolling Mill Components',
    description: 'Steel rolling mill roller replacement',
    priority: 'high',
    status: 'pending',
    department: 'Survival-TX',
    workType: 'non-contract',
    totalHours: 84,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '18-1', name: 'Roller Removal', departmentId: '1', estimatedHours: 8, order: 1 },
      { id: '18-2', name: 'Heavy Machining', departmentId: '1', estimatedHours: 48, order: 2 },
      { id: '18-3', name: 'Heat Treatment', departmentId: '5', estimatedHours: 16, order: 3 },
      { id: '18-4', name: 'Installation', departmentId: '2', estimatedHours: 8, order: 4 },
      { id: '18-5', name: 'Calibration', departmentId: '3', estimatedHours: 4, order: 5 },
    ]
  },
  {
    id: '19',
    workOrderNumber: 'WO-2024-019',
    repairOrderNumber: 'RO-CP-789',
    customerName: 'Chemical Processing Inc',
    title: 'Reactor Vessel Repair',
    description: 'Chemical reactor pressure vessel maintenance',
    priority: 'urgent',
    status: 'pending',
    department: 'Fire-ex',
    workType: 'contractual',
    totalHours: 76,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '19-1', name: 'Safety Inspection', departmentId: '3', estimatedHours: 8, order: 1 },
      { id: '19-2', name: 'Vessel Machining', departmentId: '1', estimatedHours: 32, order: 2 },
      { id: '19-3', name: 'Specialized Welding', departmentId: '4', estimatedHours: 24, order: 3 },
      { id: '19-4', name: 'System Assembly', departmentId: '2', estimatedHours: 8, order: 4 },
      { id: '19-5', name: 'Pressure Testing', departmentId: '3', estimatedHours: 4, order: 5 },
    ]
  },
  {
    id: '20',
    workOrderNumber: 'WO-2024-020',
    repairOrderNumber: 'RO-MM-234',
    customerName: 'Mining Machinery Co',
    title: 'Crusher Jaw Replacement',
    description: 'Heavy-duty rock crusher jaw replacement',
    priority: 'high',
    status: 'pending',
    department: 'Firex-TX',
    workType: 'non-contract',
    totalHours: 62,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '20-1', name: 'Jaw Removal', departmentId: '1', estimatedHours: 8, order: 1 },
      { id: '20-2', name: 'Hardened Steel Machining', departmentId: '1', estimatedHours: 28, order: 2 },
      { id: '20-3', name: 'Reinforcement Welding', departmentId: '4', estimatedHours: 18, order: 3 },
      { id: '20-4', name: 'Installation', departmentId: '2', estimatedHours: 6, order: 4 },
      { id: '20-5', name: 'Crush Testing', departmentId: '3', estimatedHours: 2, order: 5 },
    ]
  },
  {
    id: '21',
    workOrderNumber: 'WO-2024-021',
    repairOrderNumber: 'RO-LH-567',
    customerName: 'Logistics Hub Systems',
    title: 'Automated Sorting Equipment',
    description: 'Warehouse automation equipment repair',
    priority: 'medium',
    status: 'pending',
    department: 'Oxygen',
    workType: 'contractual',
    totalHours: 38,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '21-1', name: 'System Diagnosis', departmentId: '3', estimatedHours: 4, order: 1 },
      { id: '21-2', name: 'Component Machining', departmentId: '1', estimatedHours: 18, order: 2 },
      { id: '21-3', name: 'Frame Welding', departmentId: '4', estimatedHours: 10, order: 3 },
      { id: '21-4', name: 'Electronics Assembly', departmentId: '2', estimatedHours: 4, order: 4 },
      { id: '21-5', name: 'System Testing', departmentId: '3', estimatedHours: 2, order: 5 },
    ]
  },
  {
    id: '22',
    workOrderNumber: 'WO-2024-022',
    repairOrderNumber: 'RO-PG-890',
    customerName: 'Power Generation Ltd',
    title: 'Generator Rotor Rebuild',
    description: 'Industrial generator rotor overhaul',
    priority: 'urgent',
    status: 'pending',
    department: 'Oxygen-TX',
    workType: 'non-contract',
    totalHours: 88,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '22-1', name: 'Rotor Disassembly', departmentId: '1', estimatedHours: 12, order: 1 },
      { id: '22-2', name: 'Core Machining', departmentId: '1', estimatedHours: 44, order: 2 },
      { id: '22-3', name: 'Coil Welding', departmentId: '4', estimatedHours: 20, order: 3 },
      { id: '22-4', name: 'Rotor Assembly', departmentId: '2', estimatedHours: 8, order: 4 },
      { id: '22-5', name: 'Balance Testing', departmentId: '3', estimatedHours: 4, order: 5 },
    ]
  },
  {
    id: '23',
    workOrderNumber: 'WO-2024-023',
    repairOrderNumber: 'RO-TE-123',
    customerName: 'Textile Equipment Corp',
    title: 'Loom Frame Fabrication',
    description: 'Industrial textile loom frame manufacturing',
    priority: 'low',
    status: 'pending',
    department: 'Survival',
    workType: 'contractual',
    totalHours: 34,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '23-1', name: 'Material Cutting', departmentId: '1', estimatedHours: 6, order: 1 },
      { id: '23-2', name: 'Frame Machining', departmentId: '1', estimatedHours: 16, order: 2 },
      { id: '23-3', name: 'Frame Welding', departmentId: '4', estimatedHours: 8, order: 3 },
      { id: '23-4', name: 'Assembly', departmentId: '2', estimatedHours: 3, order: 4 },
      { id: '23-5', name: 'Quality Check', departmentId: '3', estimatedHours: 1, order: 5 },
    ]
  },
  {
    id: '24',
    workOrderNumber: 'WO-2024-024',
    repairOrderNumber: 'RO-PC-456',
    customerName: 'Packaging Corp',
    title: 'Sealing Machine Repair',
    description: 'Industrial packaging sealing machine overhaul',
    priority: 'medium',
    status: 'pending',
    department: 'Survival-TX',
    workType: 'non-contract',
    totalHours: 28,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '24-1', name: 'Machine Analysis', departmentId: '3', estimatedHours: 2, order: 1 },
      { id: '24-2', name: 'Part Machining', departmentId: '1', estimatedHours: 12, order: 2 },
      { id: '24-3', name: 'Heat Sealer Repair', departmentId: '5', estimatedHours: 8, order: 3 },
      { id: '24-4', name: 'Assembly', departmentId: '2', estimatedHours: 4, order: 4 },
      { id: '24-5', name: 'Performance Testing', departmentId: '3', estimatedHours: 2, order: 5 },
    ]
  },
  {
    id: '25',
    workOrderNumber: 'WO-2024-025',
    repairOrderNumber: 'RO-RB-789',
    customerName: 'Robotics & Automation',
    title: 'Robot Arm Calibration',
    description: 'Industrial robot arm precision calibration',
    priority: 'high',
    status: 'pending',
    department: 'Fire-ex',
    workType: 'contractual',
    totalHours: 26,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    steps: [
      { id: '25-1', name: 'System Diagnosis', departmentId: '3', estimatedHours: 4, order: 1 },
      { id: '25-2', name: 'Precision Machining', departmentId: '1', estimatedHours: 12, order: 2 },
      { id: '25-3', name: 'Joint Assembly', departmentId: '2', estimatedHours: 6, order: 3 },
      { id: '25-4', name: 'Calibration Testing', departmentId: '3', estimatedHours: 4, order: 5 },
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