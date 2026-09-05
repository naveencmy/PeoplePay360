import React from 'react';
import { useNavigate } from 'react-router-dom';
import Kanban from '@/components/ui/Kanban';
import AvatarBadge from '@/components/ui/AvatarBadge';
import StatusPill from '@/components/ui/StatusPill';
import { useUpdateEmployee } from '@/hooks/useEmployees';

export default function EmployeeKanban({ employees }) {
  const navigate = useNavigate();
  const updateDepartment = useUpdateEmployee();

  // Group by department
  const columns = ['Engineering', 'HR', 'Sales', 'Marketing', 'Unassigned'].map(dept => ({
    id: dept,
    title: dept,
    cards: (employees || []).filter(e => (e.department || 'Unassigned') === dept).map(e => ({
      id: e.id,
      ...e
    }))
  }));

  const handleDragEnd = async (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    
    const newDepartment = destination.droppableId;
    await updateDepartment.mutateAsync({ id: draggableId, department: newDepartment });
  };

  const renderCard = (employee) => (
    <div 
      className="bg-surface-2 border border-border-subtle hover:border-accent-blue/50 p-4 rounded-xl shadow-card cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
      onClick={() => navigate(`/employees/${employee.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <AvatarBadge name={employee.name} imageUrl={employee.avatarUrl} size="sm" />
        <StatusPill status={employee.status || 'Active'} />
      </div>
      <div className="mt-2">
        <h4 className="font-semibold text-text-main text-sm">{employee.name}</h4>
        <p className="text-xs text-text-muted mt-0.5">{employee.jobPosition || 'Employee'}</p>
        <div className="mt-3 pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted font-mono">
          <span>{employee.employeeId || `EMP-${employee.id}`}</span>
          <span className="capitalize">{employee.employeeType || 'Full-time'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-x-auto pb-4">
      <Kanban 
        columns={columns} 
        onDragEnd={handleDragEnd} 
        renderCard={renderCard}
        columnClassName="bg-surface-1/60 rounded-xl p-3.5 border border-border-subtle min-w-[280px]"
      />
    </div>
  );
}
