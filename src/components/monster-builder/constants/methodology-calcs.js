export const getSavingThrowCount = (monster) => {
    return Math.floor(monster.proficiencyBonus / 2);
  };

  export const getProficiencyCount = (monster) => {
    return monster.proficiencyBonus;
  };

  export const getFeaturePoints = (monster) => {
    return monster.cr + monster.proficiencyBonus;
  };