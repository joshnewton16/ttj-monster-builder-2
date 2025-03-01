// components/FeaturePointActions/ActionEconomySpellForm/SpellPreview.js
import React from 'react';
import { getCategoryFromCastingTime } from './utils/helpers';

const SpellPreview = ({
  spellName,
  rechargeOption,
  spellDescription,
  castingTime
}) => {
  return (
    <div className="bg-gray-50 p-3 rounded border">
      <h4 className="font-medium">Spell Preview</h4>
      <div className="text-sm mt-1">
        <strong>{spellName || "[Spell Name]"}</strong>
        {rechargeOption !== 'none' && (
          <span className="font-medium ml-1">
            ({rechargeOption === 'recharge4-6' 
              ? 'Recharge 4-6' 
              : rechargeOption === 'recharge5-6' 
                ? 'Recharge 5-6' 
                : 'Recharge 6'})
          </span>
        )}
        <p className="mt-1">
          {spellDescription}
        </p>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Will appear in: <span className="font-medium">{getCategoryFromCastingTime(castingTime)}</span> section
      </div>
    </div>
  );
};

export default SpellPreview;