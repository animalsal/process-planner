import { useState } from 'react';
import { useScheduling } from '@/hooks/useScheduling';
import { WorkOrder } from '@/types/scheduling';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function WorkOrdersTable() {
  const { workOrders, scheduleWorkOrders, updateWorkOrder } = useScheduling();
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<WorkOrder>>({});

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
        <CardTitle>All Work Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">WO #</th>
                <th className="text-left p-3">RO #</th>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Work Type</th>
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
              {workOrders.map((workOrder) => {
                const isEditing = editingRow === workOrder.id;
                const estimatedCompletion = getEstimatedCompletion(workOrder.id);
                
                return (
                  <tr key={workOrder.id} className="border-b hover:bg-accent/50">
                    <td className="p-3 font-mono text-xs">{workOrder.workOrderNumber}</td>
                    <td className="p-3 font-mono text-xs">{workOrder.repairOrderNumber}</td>
                    <td className="p-3">{workOrder.customerName}</td>
                    <td className="p-3 font-medium">{workOrder.title}</td>
                    
                    <td className="p-3">
                      {isEditing ? (
                        <Select
                          value={editData.workType}
                          onValueChange={(value) => setEditData({...editData, workType: value as WorkOrder['workType']})}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="contractual">Contractual</SelectItem>
                            <SelectItem value="non-contract">Non-Contract</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={workOrder.workType === 'contractual' ? 'default' : 'secondary'}>
                          {workOrder.workType}
                        </Badge>
                      )}
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
                          <SelectContent>
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
                          <PopoverContent className="w-auto p-0" align="start">
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
                          <PopoverContent className="w-auto p-0" align="start">
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