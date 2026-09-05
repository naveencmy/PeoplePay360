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
      className="bg-[#161B22] border border-[rgba(255,255,255,0.08)] p-4 rounded-lg shadow-sm cursor-pointer hover:border-[#4F7CFF]/50 transition"
      onClick={() => navigate(`/employees/${employee.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <AvatarBadge name={employee.name} imageUrl={employee.avatarUrl} />
        <StatusPill status={employee.status} />
      </div>
      <div className="mt-2">
        <h4 className="font-medium text-gray-100">{employee.name}</h4>
        <p className="text-sm text-gray-400 mt-1">{employee.jobPosition}</p>
        <p className="text-xs text-gray-500 mt-1">{employee.department}</p>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-x-auto pb-4">
      <Kanban 
        columns={columns} 
        onDragEnd={handleDragEnd} 
        renderCard={renderCard}
        columnClassName="bg-black/20 rounded-xl p-3 border border-[rgba(255,255,255,0.05)] min-w-[300px]"
      />
    </div>
  );
}
