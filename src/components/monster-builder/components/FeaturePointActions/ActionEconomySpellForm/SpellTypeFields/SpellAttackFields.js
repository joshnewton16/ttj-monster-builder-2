// components/FeaturePointActions/ActionEconomySpellForm/SpellTypeFields/SpellAttackFields.js
import React from 'react';
import { 
  ACTIONTYPE, 
  SAVINGTHROWS, 
  DAMAGETYPES, 
  CONDITIONS, 
  OTHEREFFECTS,
  AREAOFEFFECT,
  RANGE_MULTIPLIERS,
  getPrimaryDamageForCR,
  getSecondaryDamageForCR
} from '../../../../constants/spell-parameters';

import { isInArray } from '../utils/helpers';

const SpellAttackFields = ({
  actionType,
  setActionType,
  savingThrow,
  setSavingThrow,
  primaryDamageType,
  setPrimaryDamageType,
  secondaryEffect,
  setSecondaryEffect,
  areaOfEffect,
  setAreaOfEffect,
  areaSize,
  setAreaSize,
  rangeMultiplier,
  setRangeMultiplier,
  baseRange,
  disabled,
  monster
}) => {
  // Get damage values based on CR and proficiency
  const primaryDamage = getPrimaryDamageForCR(monster.cr, monster.proficiencyBonus);
  const secondaryDamage = getSecondaryDamageForCR(monster.cr);

  return (
    <>
      <div className="flex gap-4">
        {/* Action Type - disabled if area effect is selected */}
        <div className={actionType === 'saving throw' ? "w-1/4" : "w-1/2"}>
          <label className="block text-sm font-medium mb-1">
            Action Type
          </label>
          <div>
            <select
              className="w-full p-2 border rounded"
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              disabled={!!areaOfEffect || disabled} // Disable if area effect is selected
            >
              {ACTIONTYPE.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {areaOfEffect && (
            <p className="text-xs text-gray-500 mt-1">
              Area effects always use saving throws
            </p>
          )}

        </div>

        {/* Saving Throw (only if actionType is saving throw) */}
        {actionType === 'saving throw' && (
          <div className="w-2/10">
            <label className="block text-sm font-medium mb-1">
              Saving Throw
            </label>
            <div>
              <select
                className="w-full p-2 border rounded"
                value={savingThrow}
                onChange={(e) => setSavingThrow(e.target.value)}
                disabled={disabled}
              >
                {SAVINGTHROWS.map((save) => (
                  <option key={save} value={save}>
                    {save}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )} 

        {/* Area of Effect */}
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-1">
            Area of Effect (Optional)
          </label>
          <div>
            <select
              className="w-full p-2 border rounded"
              value={areaOfEffect}
              onChange={(e) => setAreaOfEffect(e.target.value)}
              disabled={disabled}
            >
              <option value="">None (Single Target)</option>
              {AREAOFEFFECT.map((area) => (
                <option key={area} value={area}>
                  {area.charAt(0).toUpperCase() + area.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {areaOfEffect && (
            <p className="text-xs text-gray-500 mt-1">
              Adding an area effect costs +1 magic point and requires a saving throw
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        {/* Primary Damage Type */}
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-1">
            Primary Damage Type
          </label>
          <div>
            <select
              className="w-full p-2 border rounded"
              value={primaryDamageType}
              onChange={(e) => setPrimaryDamageType(e.target.value)}
              disabled={disabled}
            >
              {DAMAGETYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Damage: {primaryDamage.dice} ({primaryDamage.average} avg)
          </p>
        </div>

        {/* Secondary Effect (combined damage types and conditions) */}
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-1">
            Secondary Effect (Optional)
          </label>
          <div>
            <select
              className="w-full p-2 border rounded"
              value={secondaryEffect}
              onChange={(e) => setSecondaryEffect(e.target.value)}
              disabled={disabled}
            >
              <option value="none">None</option>
              <optgroup label="Additional Damage">
                {DAMAGETYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)} Damage
                  </option>
                ))}
              </optgroup>
              <optgroup label="Conditions">
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond.charAt(0).toUpperCase() + cond.slice(1)} Condition
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other Effects">
                {OTHEREFFECTS.map((othereff) => (
                  <option key={othereff} value={othereff}>
                    {othereff.charAt(0).toUpperCase() + othereff.slice(1)}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          {secondaryEffect !== 'none' && (
            <p className="text-xs text-gray-500 mt-1">
              Adding a secondary effect costs +1 magic point
              {isInArray(DAMAGETYPES, secondaryEffect) &&
                ` | Damage: ${secondaryDamage.dice} (${secondaryDamage.average} avg)`}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        {/* Range */}
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-1">
            Range
          </label>
          <div>
            <select
              className="w-full p-2 border rounded"
              value={rangeMultiplier}
              onChange={(e) => setRangeMultiplier(parseInt(e.target.value, 10))}
              disabled={disabled}
            >
              {RANGE_MULTIPLIERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({baseRange * option.value} ft.) {option.mpCost > 0 ? `+${option.mpCost} MP` : ''}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Base range: {baseRange} ft. (highest movement speed)
          </p>
        </div>


      </div>
    </>
  );
};

export default SpellAttackFields;