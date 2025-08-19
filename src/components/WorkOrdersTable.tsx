import { useState, useMemo, useEffect } from 'react';
import { useScheduling } from '@/hooks/useScheduling';
import { WorkOrder } from '@/types/scheduling';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Save, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';

export function WorkOrdersTable() {
  const { workOrders, scheduleWorkOrders, updateWorkOrder } = useScheduling();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<WorkOrder>>({});
  const [selectedWorkOrders, setSelectedWorkOrders] = useState<Set<string>>(new Set());
  const [massUpdateData, setMassUpdateData] = useState<Partial<WorkOrder>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    workOrderNumber: '',
    customerName: '',
    title: '',
    priority: '',
    status: '',
    contracted: '',
    scheduledDate: undefined as Date | undefined,
    dueDate: undefined as Date | undefined
  });

  // Initialize filters from URL params
  useEffect(() => {
    const scheduledDateParam = searchParams.get('scheduledDate');
    if (scheduledDateParam) {
      setFilters(prev => ({
        ...prev,
        scheduledDate: new Date(scheduledDateParam)
      }));
      setShowFilters(true);
    }
  }, [searchParams]);

  // Filter work orders based on current filters
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(workOrder => {
      if (filters.workOrderNumber && !workOrder.workOrderNumber.toLowerCase().includes(filters.workOrderNumber.toLowerCase())) {
        return false;
      }
      if (filters.customerName && !workOrder.customerName.toLowerCase().includes(filters.customerName.toLowerCase())) {
        return false;
      }
      if (filters.title && !workOrder.title.toLowerCase().includes(filters.title.toLowerCase())) {
        return false;
      }
      if (filters.priority && workOrder.priority !== filters.priority) {
        return false;
      }
      if (filters.status && workOrder.status !== filters.status) {
        return false;
      }
      if (filters.contracted && ((filters.contracted === 'yes' && workOrder.workType !== 'contractual') || (filters.contracted === 'no' && workOrder.workType !== 'non-contract'))) {
        return false;
      }
      if (filters.scheduledDate && workOrder.scheduledDate) {
        const workOrderDate = new Date(workOrder.scheduledDate).toISOString().split('T')[0];
        const filterDate = filters.scheduledDate.toISOString().split('T')[0];
        if (workOrderDate !== filterDate) {
          return false;
        }
      }
      if (filters.dueDate && workOrder.dueDate) {
        const workOrderDate = new Date(workOrder.dueDate).toISOString().split('T')[0];
        const filterDate = filters.dueDate.toISOString().split('T')[0];
        if (workOrderDate !== filterDate) {
          return false;
        }
      }
      return true;
    });
  }, [workOrders, filters]);

  const clearFilters = () => {
    setFilters({
      workOrderNumber: '',
      customerName: '',
      title: '',
      priority: '',
      status: '',
      contracted: '',
      scheduledDate: undefined,
      dueDate: undefined
    });
    setSearchParams({});
  };

  const scheduledResults = scheduleWorkOrders();
  
  const getEstimatedCompletion = (workOrderId: string) => {
    const result = scheduledResults.find(r => r.workOrderId === workOrderId);
    return result?.estimatedCompletionDate;
  };

  const handleEdit = (workOrder: WorkOrder) => {
    setEditingRow(workOrder.id);
    setEditData(workOrder);
  };

  const handleSave = () => {
    if (editingRow && editData) {
      updateWorkOrder(editingRow, editData);
      setEditingRow(null);
      setEditData({});
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData({});
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWorkOrders(new Set(filteredWorkOrders.map(wo => wo.id)));
    } else {
      setSelectedWorkOrders(new Set());
    }
  };

  const handleSelectWorkOrder = (workOrderId: string, checked: boolean) => {
    const newSelected = new Set(selectedWorkOrders);
    if (checked) {
      newSelected.add(workOrderId);
    } else {
      newSelected.delete(workOrderId);
    }
    setSelectedWorkOrders(newSelected);
  };

  const handleMassUpdate = () => {
    if (selectedWorkOrders.size === 0) {
      toast({
        title: "No work orders selected",
        description: "Please select work orders to update.",
        variant: "destructive"
      });
      return;
    }

    const updates: Partial<WorkOrder> = {};
    if (massUpdateData.priority) updates.priority = massUpdateData.priority;
    if (massUpdateData.dueDate) updates.dueDate = massUpdateData.dueDate;
    if (massUpdateData.scheduledDate) updates.scheduledDate = massUpdateData.scheduledDate;

    if (Object.keys(updates).length === 0) {
      toast({
        title: "No updates specified",
        description: "Please specify at least one field to update.",
        variant: "destructive"
      });
      return;
    }

    selectedWorkOrders.forEach(workOrderId => {
      updateWorkOrder(workOrderId, updates);
    });

    toast({
      title: "Mass update completed",
      description: `Updated ${selectedWorkOrders.size} work orders successfully.`
    });

    setSelectedWorkOrders(new Set());
    setMassUpdateData({});
  };

  const getPriorityColor = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'in_progress': return 'bg-primary text-primary-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'on_hold': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>All Work Orders ({filteredWorkOrders.length})</CardTitle>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 border border-border rounded-lg bg-accent/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Work Order #</label>
                <Input
                  placeholder="Search work order number"
                  value={filters.workOrderNumber}
                  onChange={(e) => setFilters({...filters, workOrderNumber: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Customer</label>
                <Input
                  placeholder="Search customer name"
                  value={filters.customerName}
                  onChange={(e) => setFilters({...filters, customerName: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="Search title"
                  value={filters.title}
                  onChange={(e) => setFilters({...filters, title: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select
                  value={filters.priority}
                  onValueChange={(value) => setFilters({...filters, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="">All priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({...filters, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Contracted</label>
                <Select
                  value={filters.contracted}
                  onValueChange={(value) => setFilters({...filters, contracted: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Scheduled Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.scheduledDate ? format(filters.scheduledDate, 'MMM dd, yyyy') : 'All dates'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.scheduledDate}
                      onSelect={(date) => setFilters({...filters, scheduledDate: date})}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dueDate ? format(filters.dueDate, 'MMM dd, yyyy') : 'All dates'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dueDate}
                      onSelect={(date) => setFilters({...filters, dueDate: date})}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}
        {/* Mass Update Controls */}
        {selectedWorkOrders.size > 0 && (
          <div className="mb-6 p-4 border border-border rounded-lg bg-accent/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Mass Update ({selectedWorkOrders.size} selected)</h3>
              <Button variant="outline" onClick={() => setSelectedWorkOrders(new Set())}>
                Clear Selection
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select
                  value={massUpdateData.priority || ''}
                  onValueChange={(value) => setMassUpdateData({...massUpdateData, priority: value as WorkOrder['priority']})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {massUpdateData.dueDate ? format(massUpdateData.dueDate, 'MMM dd, yyyy') : 'Set due date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={massUpdateData.dueDate}
                      onSelect={(date) => setMassUpdateData({...massUpdateData, dueDate: date})}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Scheduled Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {massUpdateData.scheduledDate ? format(massUpdateData.scheduledDate, 'MMM dd, yyyy') : 'Set scheduled date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={massUpdateData.scheduledDate}
                      onSelect={(date) => setMassUpdateData({...massUpdateData, scheduledDate: date})}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button onClick={handleMassUpdate} className="w-full">
              Apply Mass Update
            </Button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-center p-3 w-12">
                  <Checkbox
                    checked={selectedWorkOrders.size === filteredWorkOrders.length && filteredWorkOrders.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all work orders"
                  />
                </th>
                <th className="text-left p-3">WO #</th>
                <th className="text-left p-3">RO #</th>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Contracted</th>
                <th className="text-left p-3">Priority</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Due Date</th>
                <th className="text-left p-3">Scheduled Date</th>
                <th className="text-left p-3">Est. Completion</th>
                <th className="text-left p-3">Total Hours</th>
                <th className="text-center p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkOrders.map((workOrder) => {
                const isEditing = editingRow === workOrder.id;
                const estimatedCompletion = getEstimatedCompletion(workOrder.id);
                
                return (
                  <tr key={workOrder.id} className="border-b hover:bg-accent/50">
                    <td className="p-3 text-center">
                      <Checkbox
                        checked={selectedWorkOrders.has(workOrder.id)}
                        onCheckedChange={(checked) => handleSelectWorkOrder(workOrder.id, checked as boolean)}
                        aria-label={`Select work order ${workOrder.workOrderNumber}`}
                      />
                    </td>
                    <td className="p-3 font-mono text-xs">{workOrder.workOrderNumber}</td>
                    <td className="p-3 font-mono text-xs">{workOrder.repairOrderNumber}</td>
                    <td className="p-3">{workOrder.customerName}</td>
                    <td className="p-3 font-medium">{workOrder.title}</td>
                    
                    <td className="p-3">
                      <Badge variant={workOrder.workType === 'contractual' ? 'default' : 'secondary'}>
                        {workOrder.workType === 'contractual' ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    
                    <td className="p-3">
                      {isEditing ? (
                        <Select
                          value={editData.priority}
                          onValueChange={(value) => setEditData({...editData, priority: value as WorkOrder['priority']})}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getPriorityColor(workOrder.priority)}>
                          {workOrder.priority}
                        </Badge>
                      )}
                    </td>
                    
                    <td className="p-3">
                      <Badge className={getStatusColor(workOrder.status)}>
                        {workOrder.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    
                    <td className="p-3">
                      {isEditing ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-40 justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {editData.dueDate ? format(editData.dueDate, 'MMM dd, yyyy') : 'Set due date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                            <Calendar
                              mode="single"
                              selected={editData.dueDate}
                              onSelect={(date) => setEditData({...editData, dueDate: date})}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <span className={workOrder.dueDate ? '' : 'text-muted-foreground'}>
                          {workOrder.dueDate ? format(workOrder.dueDate, 'MMM dd, yyyy') : 'Not set'}
                        </span>
                      )}
                    </td>
                    
                    <td className="p-3">
                      {isEditing ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-40 justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {editData.scheduledDate ? format(editData.scheduledDate, 'MMM dd, yyyy') : 'Set scheduled date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                            <Calendar
                              mode="single"
                              selected={editData.scheduledDate}
                              onSelect={(date) => setEditData({...editData, scheduledDate: date})}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <span className={workOrder.scheduledDate ? '' : 'text-muted-foreground'}>
                          {workOrder.scheduledDate ? format(workOrder.scheduledDate, 'MMM dd, yyyy') : 'Not set'}
                        </span>
                      )}
                    </td>
                    
                    <td className="p-3">
                      <span className={estimatedCompletion ? '' : 'text-muted-foreground'}>
                        {estimatedCompletion ? format(estimatedCompletion, 'MMM dd, yyyy') : 'Not scheduled'}
                      </span>
                    </td>
                    
                    <td className="p-3 text-center">{workOrder.totalHours}h</td>
                    
                    <td className="p-3">
                      <div className="flex items-center justify-center space-x-2">
                        {isEditing ? (
                          <>
                            <Button size="sm" onClick={handleSave} className="h-8">
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancel} className="h-8">
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(workOrder)}
                            className="h-8"
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}