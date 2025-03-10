// components/FeaturePointActions/ActionEconomySpellForm/utils/costCalculations.js

import { RANGE_MULTIPLIERS, DEFENSE_DURATIONS } from '../../../../constants/spell-parameters';

// Calculate the base magic point cost before recharge discount
export const calculateBaseMagicPointCost = ({
  castingTime,
  primaryEffectType,
  areaOfEffect,
  secondaryEffect,
  rangeMultiplier,
  defenseType,
  acBonus,
  healingDice,
  defenseDuration // Add this parameter
}) => {
  let cost = 0;

  // Base cost by casting time (updated costs)
  if (castingTime === 'action') {
    cost += 2; // Action spells cost 2 MP
  } else if (castingTime === 'bonus action' || castingTime === 'reaction') {
    cost += 3; // Bonus action and reaction spells cost 3 MP
  }

  // Additional costs based on primary effect type
  switch (primaryEffectType) {
    case 'Spell Attack':
      // Area effects cost more
      if (areaOfEffect) {
        cost += 1;
      }
      
      // Secondary effects cost more
      if (secondaryEffect !== 'none') {
        cost += 1;
      }
      
      // Range costs
      const rangeOption = RANGE_MULTIPLIERS.find(r => r.value === rangeMultiplier);
      if (rangeOption) {
        cost += rangeOption.mpCost;
      }
      break;
      
    case 'Defense':
      if (defenseType === 'ac') {
        // First 2 AC is free, +1 MP per 2 additional AC
        cost += Math.max(0, Math.ceil((acBonus - 2) / 2));
      } else {
        // Condition immunity costs 2 MP
        cost += 2;
      }
      
      // Add cost for extended duration
      const selectedDuration = DEFENSE_DURATIONS.find(d => d.value === defenseDuration);
      if (selectedDuration) {
        cost += selectedDuration.mpCost;
      }
      break;
      
    case 'Healing':
      // First d8 is included in base cost, +1 MP per additional d8
      cost += Math.max(0, healingDice - 1);
      break;
      
    case 'Adjust Movement':
      // Flat cost for movement adjustment
      cost += 1;
      break;
      
    case 'Control':
      // Base control cost already included in casting time cost
      // Range costs might apply
      const controlRangeOption = RANGE_MULTIPLIERS.find(r => r.value === rangeMultiplier);
      if (controlRangeOption) {
        cost += controlRangeOption.mpCost;
      }
      break;
      
    default:
      break;
  }

  return cost;
};

// Calculate final magic point cost after applying recharge discount
export const calculateFinalMagicPointCost = (baseCost, rechargeDiscount) => {
  return Math.max(1, baseCost - rechargeDiscount);
};