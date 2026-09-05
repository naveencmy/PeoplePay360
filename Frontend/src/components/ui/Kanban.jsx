import React, { useState } from 'react';

const Kanban = ({ columns = [], renderCard, onCardMove }) => {
  const [draggedCard, setDraggedCard] = useState(null);

  const handleDragStart = (e, card, sourceColId) => {
    setDraggedCard({ card, sourceColId });
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image hack for better UX if needed
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    if (draggedCard && draggedCard.sourceColId !== targetColId) {
      onCardMove(draggedCard.card, draggedCard.sourceColId, targetColId);
    }
    setDraggedCard(null);
  };

  return (
    <div className="flex w-full h-full overflow-x-auto pb-4 gap-6 items-start">
      {columns.map(col => (
        <div 
          key={col.id} 
          className="flex-shrink-0 w-80 flex flex-col bg-[#0B0D10] rounded-lg border border-[rgba(255,255,255,0.08)] max-h-full"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.id)}
        >
          <div className="p-3 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between bg-[#161B22] rounded-t-lg">
            <div className="flex items-center gap-2">
              {col.color && (
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }}></div>
              )}
              <h3 className="font-semibold text-gray-200">{col.label}</h3>
            </div>
            <span className="bg-gray-800 text-gray-300 text-xs py-1 px-2 rounded-full font-medium">
              {col.cards?.length || 0}
            </span>
          </div>
          
          <div className="p-3 overflow-y-auto flex-1 min-h-[150px] space-y-3">
            {col.cards?.map(card => (
              <div
                key={card.id}
                draggable
                onDragStart={(e) => handleDragStart(e, card, col.id)}
                className="cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform"
              >
                {renderCard(card)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export { Kanban };

export default Kanban;
