import React, { useState } from 'react';

const Kanban = ({ columns = [], renderCard, onCardMove }) => {
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const handleDragStart = (e, card, sourceColId) => {
    setDraggedCard({ card, sourceColId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    if (draggedCard && draggedCard.sourceColId !== targetColId) {
      onCardMove(draggedCard.card, draggedCard.sourceColId, targetColId);
    }
    setDraggedCard(null);
    setDragOverCol(null);
  };

  return (
    <div className="flex w-full h-full overflow-x-auto pb-4 gap-5 items-start">
      {columns.map(col => (
        <div 
          key={col.id} 
          className={`flex-shrink-0 w-80 flex flex-col bg-surface-1 rounded-2xl border transition-all duration-200 max-h-full ${
            dragOverCol === col.id 
              ? 'border-accent-blue/40 shadow-[0_0_20px_rgba(79,124,255,0.1)]' 
              : 'border-border-subtle'
          }`}
          onDragOver={(e) => handleDragOver(e, col.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, col.id)}
        >
          <div className="p-3.5 border-b border-border-subtle flex items-center justify-between bg-surface-2/60 backdrop-blur-sm rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              {col.color && (
                <div className="w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-offset-surface-1" style={{ backgroundColor: col.color, boxShadow: `0 0 8px ${col.color}40` }}></div>
              )}
              <h3 className="font-semibold text-text-main text-sm">{col.label}</h3>
            </div>
            <span className="bg-surface-3 text-text-secondary text-xs py-0.5 px-2 rounded-full font-medium border border-border-subtle">
              {col.cards?.length || 0}
            </span>
          </div>
          
          <div className="p-3 overflow-y-auto flex-1 min-h-[150px] space-y-3">
            {col.cards?.map(card => (
              <div
                key={card.id}
                draggable
                onDragStart={(e) => handleDragStart(e, card, col.id)}
                className="cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-all duration-200"
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
