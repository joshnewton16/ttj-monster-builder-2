// hooks/useFeatureModification.js
export function useFeatureModification(monster, setMonster) {
  const getSecondaryDamageForCR = (cr) => {
    if (cr <= 1) return { dice: "1d6", average: 3 };
    if (cr <= 5) return { dice: "3d6", average: 9 };
    if (cr <= 8) return { dice: "4d8", average: 16 };
    if (cr <= 12) return { dice: "8d8", average: 32 };
    if (cr <= 15) return { dice: "6d12", average: 39 };
    return { dice: "8d12", average: 52 };
  };

  const addMultiattack = (existingMultiattack) => {
    if (existingMultiattack) {
      setMonster(prev => ({
        ...prev,
        features: prev.features.map(feature => {
          if (feature.isMultiattack) {
            return {
              ...feature,
              attackCount: feature.attackCount + 1,
              description: `${monster.name} attacks ${feature.attackCount + 1} times per round.`,
              costFeaturePoint: true
            };
          }
          return feature;
        })
      }));
    } else {
      const newMultiattack = {
        name: 'Multiattack',
        category: 'Actions',
        description: `${monster.name} attacks twice per round.`,
        isMultiattack: true,
        attackCount: 2,
        costFeaturePoint: true
      };
      
      setMonster(prev => ({
        ...prev,
        features: [...prev.features, newMultiattack]
      }));
    }
    console.log('State after add:', monster);
  };

  const addSecondaryEffect = (attackName, effectType, effect) => {
    setMonster(prev => {
      const newFeatures = [...prev.features];
      const featureIndex = newFeatures.findIndex(f => f.name === attackName);
      
      if (featureIndex !== -1) {
        const feature = newFeatures[featureIndex];
        
        if (effectType === 'damage') {
          const secondaryDamage = getSecondaryDamageForCR(monster.cr);
          newFeatures[featureIndex] = {
            ...feature,
            secondaryEffect: {
              type: 'damage',
              damageType: effect,
              dice: secondaryDamage.dice,
              average: secondaryDamage.average,
              description: `On a successful hit, ${monster.name} does an additional ${secondaryDamage.dice} (average ${secondaryDamage.average}) ${effect} damage.`
            },
            costFeaturePoint: !feature.isFirst  // Set costFeaturePoint instead of modificationCost
          };
        } else if (effectType === 'condition') {
          newFeatures[featureIndex] = {
            ...feature,
            secondaryEffect: {
              type: 'condition',
              condition: effect,
              description: `On a successful hit, the target gains the ${effect} condition.`
            },
            costFeaturePoint: !feature.isFirst  // Set costFeaturePoint instead of modificationCost
          };
        }
      }

      return {
        ...prev,
        features: newFeatures
      };
    });
  };

  const doubleDamage = (attackName) => {
    setMonster(prev => ({
      ...prev,
      features: prev.features.map(feature => {
        if (feature.name === attackName && !feature.doubleDamage) {
          return {
            ...feature,
            doubleDamage: true,
            costFeaturePoint: !feature.isFirst
          };
        }
        return feature;
      })
    }));
  };

  return {
    addMultiattack,
    addSecondaryEffect,
    doubleDamage,
    getSecondaryDamageForCR
  };
}