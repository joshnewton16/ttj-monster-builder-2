// components/PreviewPanel/BasicInfo.js
import React from 'react';
import { Trash2 } from 'lucide-react';

export const BasicInfo = ({ monster, setStep, onDeleteMovement }) => {
  const renderMovement = () => {
    return (
      <div className="space-y-1">
        {monster.speed
          .filter(speed => speed.value > 0)
          .map((speed) => (
            <div 
              key={speed.type}
              className="flex justify-between items-center"
            >
              <span>{speed.type} ({speed.value} ft.)</span>
              {(speed.type !== 'Walk' || !monster.speed.some(s => s.value > 0 && s.type !== 'Walk')) && (
                <button
                  onClick={() => onDeleteMovement(speed.type)}
                  className="p-1 text-red-500 hover:text-red-700"
                  aria-label={`Delete ${speed.type} movement`}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="preview-section mb-4">
      <h3 onClick={() => setStep(1)} className="cursor-pointer hover:text-blue-600">
        Basic Info
      </h3>
      <div>
        <div>Name: {monster.name}</div>
        <div>CR: {monster.cr}</div>
        <div>Proficiency Bonus: {monster.proficiencyBonus}</div>
        <div>AC: {monster.acText}</div>
        <div>HP: {monster.hp}</div>
        <div>
          <strong>Movement:</strong>
          {renderMovement()}
        </div>
      </div>
    </div>
  );
};