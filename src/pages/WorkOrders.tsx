import { Navigation } from '@/components/Navigation';
import { WorkOrdersTable } from '@/components/WorkOrdersTable';
import { useScheduling } from '@/hooks/useScheduling';

const departments = ['Fire-ex', 'Firex-TX', 'Oxygen', 'Oxygen-TX', 'Survival', 'Survival-TX'];

export default function WorkOrders() {
  const { selectedDepartment, setSelectedDepartment } = useScheduling();
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Navigation />
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
        {/* Department Filter Tabs */}
        <div className="border-b border-border">
          <div className="flex space-x-8">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  selectedDepartment === dept
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {selectedDepartment} Department
          </h2>
          <p className="text-muted-foreground">
            Work orders and capacity planning for {selectedDepartment}
          </p>
        </div>
          
          <WorkOrdersTable />
        </div>
      </div>
    </div>
  );
}