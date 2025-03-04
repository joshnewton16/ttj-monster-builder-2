// components/PreviewPanel/utils.js
export const calculateModifier = (attributeValue) => {
  return Math.floor((attributeValue - 10) / 2);
};

export const getActionString = (feature, monster) => {
  if (!feature.damage) return feature.description;

  const strMod = calculateModifier(monster.attributes.str);
  const dexMod = calculateModifier(monster.attributes.dex);
  const mod = feature.useDex ? dexMod : (feature.useStr ? strMod : 0);
  const modString = mod >= 0 ? `+${mod}` : mod;
  
  try {
    let description = '';
    const [dice, ...damageType] = feature.damage.split(' ');

    const attackType = feature.type || (feature.spellDetails ? feature.description : "Attack");
    
    if (feature.doubleDamage) {
      const [count, die] = dice.split('d').map(Number);
      const doubledCount = count * 2;
      const doubledMod = mod * 2;
      const doubledModString = doubledMod >= 0 ? `+${doubledMod}` : doubledMod;
      description = `${attackType}: ${doubledCount}d${die}${doubledModString} ${damageType.join(' ')}`;
    } else {
      description = `${attackType}: ${dice}${modString} ${damageType.join(' ')}`;
    }

    if (feature.secondaryEffect) {
      if (feature.secondaryEffect.type === 'damage') {
        description += ` plus ${feature.secondaryEffect.dice} ${feature.secondaryEffect.damageType} damage`;
      } else if (feature.secondaryEffect.type === 'condition') {
        description += `. ${feature.secondaryEffect.description}`;
      }
    }

    return description;
  } catch (error) {
    return feature.description;
  }
};

export const getFeaturesByCategory = (features, category) => {
  return features.filter(feature => feature.category === category);
};
