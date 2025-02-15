// components/PreviewPanel/AttributesSection.js
import React from 'react';
import { Trash2 } from 'lucide-react';

export const AttributesSection = ({ 
  monster, 
  setStep, 
  calculateModifier, 
  onDeleteAttributePoints 
}) => {
  return (
    <div className="preview-section">
      <h3 onClick={() => setStep(2)} className="cursor-pointer hover:text-blue-600">
        Attributes
      </h3>
      <div>
        {Object.entries(monster.attributes).map(([attr, value]) => {
          const modifier = calculateModifier(value);
          const modifierText = modifier >= 0 ? `+${modifier}` : modifier;
          const isProficientSave = monster.savingThrows.includes(attr);
          const saveModifier = isProficientSave ? modifier + monster.proficiencyBonus : modifier;
          const saveModifierText = saveModifier >= 0 ? `+${saveModifier}` : saveModifier;

          return (
            <div key={attr}>
              {attr.toUpperCase()}: {value} ({modifierText}) Save: {saveModifierText}
            </div>
          );
        })}
      </div>
      {monster.attributePointsFromFeatures && (
        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
          <span>+2 Attribute Points from Feature Point</span>
          <button
            onClick={onDeleteAttributePoints}
            className="p-1 text-red-500 hover:text-red-700"
            aria-label="Remove attribute points"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};