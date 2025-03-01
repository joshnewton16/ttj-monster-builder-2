// components/FeaturePointActions/ActionEconomySpellForm/InfoBoxes.js
import React from 'react';

export const InfoBoxes = ({
  atActionEconomySpellLimit,
  maxActionEconomySpells,
  monster,
  baseMagicPointCost,
  selectedRecharge,
  finalMagicPointCost,
  availableMagicPoints,
  hasEnoughMagicPoints,
  actionEconomySpellCount,
  rechargeCount
}) => {
  return (
    <>
      {/* Action Economy Spell Limit Warning */}
      {atActionEconomySpellLimit && (
        <div className="bg-red-50 p-3 rounded border border-red-200 mb-4">
          <h4 className="font-medium text-red-800">Maximum Spells Reached</h4>
          <p className="text-sm text-red-600">
            This monster can only have {maxActionEconomySpells} action economy spells 
            (twice its proficiency bonus of {monster.proficiencyBonus}).
          </p>
        </div>
      )}

      {/* Magic Points Info */}
      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <h4 className="font-medium text-blue-800">Magic Points</h4>
        <div className="text-sm text-blue-600 flex flex-col gap-1">
          <div className="flex justify-between">
            <span>Base Cost:</span>
            <span>{baseMagicPointCost}</span>
          </div>
          <div className="flex justify-between">
            <span>Recharge Discount:</span>
            <span>-{selectedRecharge.mpValue}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Final Cost:</span>
            <span>{finalMagicPointCost}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-blue-200">
            <span>Available:</span>
            <span>{availableMagicPoints}</span>
          </div>
        </div>
        {!hasEnoughMagicPoints && (
          <p className="text-xs text-red-600 mt-2">
            Not enough magic points available
          </p>
        )}
        <div className="text-xs text-gray-600 mt-2">
          <p>Spell Count: {actionEconomySpellCount}/{maxActionEconomySpells}</p>
          <p>Recharge Abilities: {rechargeCount}/2</p>
        </div>
      </div>
    </>
  );
};

export default InfoBoxes;