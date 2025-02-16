// hooks/useFeaturePoints.js
export function useFeaturePoints(monster) {
  if (!monster) {
    console.warn('Monster object is undefined in useFeaturePoints');
    return {
      totalFeaturePoints: 0,
      usedFeaturePoints: 0,
      availableFeaturePoints: 0,
      hasFirstAction: false,
      hasFirstFeature: false
    };
  }

  const calculateFeaturePoints = (cr, proficiencyBonus) => {
    return (cr || 0) + (proficiencyBonus || 0);
  };

  const totalFeaturePoints = calculateFeaturePoints(monster.cr, monster.proficiencyBonus);
  
  const usedFeaturePoints = monster.features.reduce((total, feature) => {
    let points = 0;
    
    // Basic feature cost (if not first)
    if (feature.costFeaturePoint && !feature.isFirst) {
      points += 1;
    }

    // Count modifications - secondary effects always cost a point
    if (feature.modificationCost || feature.secondaryEffect) {
      points += 1;
    }

    // Count doubled damage
    if (feature.doubleDamage) {
      points += 1;
    }

    // Count multiattack modifications
    if (feature.isMultiattack && feature.attackCount > 2) {
      points += feature.attackCount - 2;
    }

    if (feature.immunityModification) {
      points += feature.immunityModification.type === 'damage' ? 2 : 1;
    }
    // Handle resistances
    else if (feature.resistanceModification) {
      points += 1;
    }

    else if (feature.senseModification) {
      points += 1;
    }

    console.log(`Feature ${feature.name} using ${points} points (isFirst: ${feature.isFirst}, hasSecondary: ${!!feature.secondaryEffect}, modCost: ${!!feature.modificationCost})`);
    return total + points;
  }, 0);

  const hasFirstAction = monster.features.some(f => f.category === 'Actions' && f.isFirst);
  const hasFirstFeature = monster.features.some(f => f.category === 'Abilities' && f.isFirst);
  const availableFeaturePoints = totalFeaturePoints - usedFeaturePoints;

  console.log(`Total Points: ${totalFeaturePoints}, Used Points: ${usedFeaturePoints}`);

  return {
    totalFeaturePoints,
    usedFeaturePoints,
    availableFeaturePoints,
    hasFirstAction,
    hasFirstFeature
  };
}