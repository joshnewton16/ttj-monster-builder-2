// components/PreviewPanel/utils.js
export const calculateModifier = (attributeValue) => {
  return Math.floor((attributeValue - 10) / 2);
};

export const getActionString = (feature, monster) => {

  if (!feature.damage) return feature.description;

  const strMod = calculateModifier(monster.attributes.str);
  const dexMod = calculateModifier(monster.attributes.dex);
  const mod = feature.useDex ? dexMod : (feature.useStr ? strMod : 0);
  const modString = mod > 0 ? `+${mod}` : '';
  
  try {
    let description = '';
    let attackType = '';
    const [dice, ...damageType] = feature.damage.split(' ');

    if (feature.spellDetails) {
      attackType = " " + (feature.type || "") + (feature.description || "");
      console.log('attackType', attackType)
      if (feature.doubleDamage) {
        const [count, die] = dice.split('d').map(Number);
        const doubledCount = count * 2;
        const doubledValue = doubledCount + 'd' + die;
        console.log('doubledValue', doubledValue)
        attackType = attackType.replace(feature.spellDetails.primaryDamageDice, doubledValue);
      }
      description = attackType;
    } else { //double check this logic
      if (feature.type ===' Custom') {
        attackType = feature.description;
      } else {
        attackType = feature.type || "Attack";
      }

      console.log(feature.type, attackType);
      if (feature.doubleDamage) {
        const [count, die] = dice.split('d').map(Number);
        const doubledCount = count * 2;
        const doubledMod = mod * 2;
        const doubledModString = doubledMod >= 0 ? `+${doubledMod}` : doubledMod;
        
        description = `${attackType}: ${doubledCount}d${die}${doubledModString} ${damageType.join(' ')}`;
      } else {
        description = `${attackType}: ${dice}${modString} ${damageType.join(' ')}`;
      }

    }

    if (feature.secondaryEffect) {
      if (feature.secondaryEffect.type === 'damage') {
        description += ` plus ${feature.secondaryEffect.dice} ${feature.secondaryEffect.damageType} damage`;
      } else if (feature.secondaryEffect.type === 'condition') {
        description += `. ${feature.secondaryEffect.description}`;
      }
    }

    //console.log("Description:", description);

    return description;
  } catch (error) {
    return feature.description;
  }
};

export const getFeaturesByCategory = (features, category) => {
  return features.filter(feature => feature.category === category);
};
