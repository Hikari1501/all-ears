import React, { useState } from 'react';
import { DragAndDropQuestion } from '../../types';
import { Check, X, GripVertical, ArrowRight } from 'lucide-react';

interface Props {
  question: DragAndDropQuestion;
  // Answer format: Record<string, string> mapping slotId -> itemId
  userPlacements: Record<string, string>;
  isAnswerRevealed: boolean;
  onUpdatePlacements: (placements: Record<string, string>) => void;
  disabled?: boolean;
}

export const DragAndDropView: React.FC<Props> = ({
  question,
  userPlacements,
  isAnswerRevealed,
  onUpdatePlacements,
  disabled = false,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Find items that have not yet been placed into a slot
  const unplacedItems = question.items.filter(
    item => !Object.values(userPlacements).includes(item.id)
  );

  const handleItemClick = (itemId: string) => {
    if (disabled || isAnswerRevealed) return;
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId(itemId);
    }
  };

  const handleSlotClick = (slotId: string) => {
    if (disabled || isAnswerRevealed) return;

    if (selectedItemId) {
      const next = { ...userPlacements };
      // If another slot had this item, remove it
      Object.keys(next).forEach(sId => {
        if (next[sId] === selectedItemId) delete next[sId];
      });
      next[slotId] = selectedItemId;
      onUpdatePlacements(next);
      setSelectedItemId(null);
    } else if (userPlacements[slotId]) {
      // Remove item from slot
      const next = { ...userPlacements };
      delete next[slotId];
      onUpdatePlacements(next);
    }
  };

  // Drag and drop events
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    if (disabled || isAnswerRevealed) return;
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    if (disabled || isAnswerRevealed) return;
    const itemId = e.dataTransfer.getData('text/plain');
    if (!itemId) return;

    const next = { ...userPlacements };
    Object.keys(next).forEach(sId => {
      if (next[sId] === itemId) delete next[sId];
    });
    next[slotId] = itemId;
    onUpdatePlacements(next);
  };

  return (
    <div className="space-y-4">
      {question.instruction && (
        <p className="text-xs text-slate-500 font-medium">{question.instruction}</p>
      )}

      {/* Target Slots */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Slots</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.slots.map((slot) => {
            const placedItemId = userPlacements[slot.id];
            const placedItem = question.items.find(i => i.id === placedItemId);

            const isCorrect = isAnswerRevealed && placedItem && placedItem.targetSlotId === slot.id;
            const isWrong = isAnswerRevealed && placedItem && placedItem.targetSlotId !== slot.id;

            return (
              <div
                key={slot.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, slot.id)}
                onClick={() => handleSlotClick(slot.id)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                  placedItem
                    ? isAnswerRevealed
                      ? isCorrect
                        ? 'border-emerald-500 bg-emerald-50/70'
                        : 'border-rose-400 bg-rose-50/70'
                      : 'border-brand-400 bg-brand-50/40 shadow-sm'
                    : selectedItemId
                    ? 'border-dashed border-brand-400 bg-brand-50/20 hover:bg-brand-50/60'
                    : 'border-dashed border-slate-300 bg-slate-50 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
                  <span>{slot.label}</span>
                  {isAnswerRevealed && placedItem && (
                    <span>
                      {isCorrect ? (
                        <Check className="w-4 h-4 text-emerald-600 font-bold" />
                      ) : (
                        <X className="w-4 h-4 text-rose-500 font-bold" />
                      )}
                    </span>
                  )}
                </div>

                {placedItem ? (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs">
                    <span>{placedItem.text}</span>
                    {!isAnswerRevealed && !disabled && (
                      <span className="text-[10px] text-slate-400 hover:text-rose-500">&times;</span>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic py-1 text-center">
                    {selectedItemId ? 'Click here to place item' : 'Drag item or click here'}
                  </div>
                )}

                {isAnswerRevealed && !isCorrect && (
                  <div className="mt-1.5 text-[11px] text-emerald-700 font-medium">
                    Correct: {question.items.find(i => i.targetSlotId === slot.id)?.text}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Items Bank */}
      {!isAnswerRevealed && unplacedItems.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Available Items</h4>
          <div className="flex flex-wrap gap-2">
            {unplacedItems.map((item) => {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  draggable={!disabled}
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onClick={() => handleItemClick(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-grab active:cursor-grabbing transition-all select-none ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-500/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800 shadow-xs'
                  }`}
                >
                  <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
