import { getSkillAbility } from '../constants/srd-data'; // Import from your constants file

/**
 * Shared utility functions for parsing and generating D&D monster markdown
 */
const MarkdownUtils = {
  /**
   * Calculate ability score modifier
   */
  getModifier: (score) => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  },

  /**
   * Calculate proficiency bonus based on CR
   */
  calculateProficiencyBonus: (cr) => {
    const crToNumber = (cr) => {
      if (cr.includes('/')) {
        const [numerator, denominator] = cr.split('/').map(Number);
        return numerator / denominator;
      }
      return Number(cr);
    };
    
    const crNum = crToNumber(cr);
    return Math.max(2, Math.floor(2 + (crNum - 1) / 4));
  },

  /**
   * Format speeds for markdown
   */
  formatSpeeds: (speed) => {
    return speed
      .filter(s => s.value > 0)
      .map(s => `${s.value} ft.${s.type.toLowerCase() !== 'walk' ? ` (${s.type.toLowerCase()})` : ''}`)
      .join(', ');
  },

  /**
   * Format saving throws for markdown
   */
  formatSavingThrows: (savingThrows, attributes, proficiencyBonus) => {
    if (!savingThrows || savingThrows.length === 0) return '';
    
    const saves = savingThrows.map(save => {
      const attr = save.toLowerCase();
      const attrScore = attributes[attr];
      const modifier = parseInt(MarkdownUtils.getModifier(attrScore)) + proficiencyBonus;
      const formattedModifier = modifier >= 0 ? `+${modifier}` : `${modifier}`;
      return `${save.toUpperCase()} ${formattedModifier}`;
    }).join(', ');
    
    return `**Saving Throws** :: ${saves}\n`;
  },

  /**
   * Format skills for markdown
   */
  formatSkills: (skills, attributes, proficiencyBonus) => {
    if (!skills || skills.length === 0) return '';
    
    const formattedSkills = skills.map(skill => {
      let skillName = '';
      let ability = '';
      
      // Handle both string and object formats for skills
      if (typeof skill === 'string') {
        skillName = skill;
        ability = getSkillAbility(skillName);
      } else if (typeof skill === 'object') {
        skillName = skill.name || '';
        ability = skill.ability ? skill.ability.toLowerCase() : getSkillAbility(skillName);
      }
      
      // Calculate the modifier
      const abilityMod = parseInt(MarkdownUtils.getModifier(attributes[ability]));
      const modifier = abilityMod + proficiencyBonus;
      const formattedModifier = modifier >= 0 ? `+${modifier}` : `${modifier}`;
      
      return `${skillName} ${formattedModifier}`;
    }).join(', ');
    
    return `**Skills** :: ${formattedSkills}\n`;
  },

  /**
   * Format languages for markdown
   */
  formatLanguages: (languages) => {
    if (!languages || languages.length === 0) return '';
    return `**Languages** :: ${languages.join(', ')}\n`;
  },

  /**
   * Format senses for markdown
   */
  formatSenses: (senses) => {
    if (!senses || senses.length === 0) return '';
    return senses.map(
      sense => {
        return `${sense.type} (${sense.range} feet)`;
      })
      .join(', ');
  },

  /**
   * Format features for markdown
   */
  formatFeatures: (features, category) => {
    if (!features || features.length === 0) return '';
    
    const filteredFeatures = features
      .filter(feature => feature.category === category)
      .map(feature => {
        return `***${feature.name}.*** ${feature.description}`;
      })
      .join('\n\n');
    
    if (category === 'Abilities') {
      return filteredFeatures;
    } else {
      return filteredFeatures ? `### ${category}\n${filteredFeatures}` : '';
    }
  },

  /**
   * Generate complete markdown from monster object
   */
  generateMarkdown: (monster) => {
    const markdown = `{{monster,frame,wide
## ${monster.name}
*${monster.size} ${monster.creaturetype || 'Creature'}, ${monster.alignment || 'unaligned'}*
___
**Armor Class** :: ${monster.ac} ${monster.acText ? `(${monster.acText})` : ''}
**Hit Points** :: ${monster.hp} ${monster.hpFormula ? `(${monster.hpFormula})` : ''}
**Speed** :: ${MarkdownUtils.formatSpeeds(monster.speed)}
___
|STR|DEX|CON|INT|WIS|CHA|
|:---:|:---:|:---:|:---:|:---:|:---:|
|${monster.attributes.str} (${MarkdownUtils.getModifier(monster.attributes.str)})|${monster.attributes.dex} (${MarkdownUtils.getModifier(monster.attributes.dex)})|${monster.attributes.con} (${MarkdownUtils.getModifier(monster.attributes.con)})|${monster.attributes.int} (${MarkdownUtils.getModifier(monster.attributes.int)})|${monster.attributes.wis} (${MarkdownUtils.getModifier(monster.attributes.wis)})|${monster.attributes.cha} (${MarkdownUtils.getModifier(monster.attributes.cha)})|
___
${MarkdownUtils.formatSavingThrows(monster.savingThrows, monster.attributes, monster.proficiencyBonus)}${MarkdownUtils.formatSkills(monster.skills, monster.attributes, monster.proficiencyBonus)}***Senses*** :: ${MarkdownUtils.formatSenses(monster.senses)}
${MarkdownUtils.formatLanguages(monster.languages)}**Challenge** :: ${monster.cr} ${monster.xp ? `(${monster.xp} XP)` : ''}
___
${MarkdownUtils.formatFeatures(monster.features, 'Abilities')}

${MarkdownUtils.formatFeatures(monster.features, 'Actions')}

${MarkdownUtils.formatFeatures(monster.features, 'Bonus Actions')}

${MarkdownUtils.formatFeatures(monster.features, 'Reactions')}
}}`;

    return markdown;
  },

  /**
   * Parse markdown string into monster object
   */
  parseMarkdown: (markdown) => {
    const parsedMonster = {
      name: '',
      size: '',
      creaturetype: '',
      alignment: '',
      ac: 0,
      acText: '',
      hp: 0,
      hpFormula: '',
      speed: [],
      attributes: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10
      },
      savingThrows: [],
      skills: [],
      senses: [],
      languages: [],
      cr: '',
      xp: '',
      proficiencyBonus: 2,
      features: []
    };

    try {
      // Remove the wrapper tags if present
      const cleanMarkdown = markdown.replace(/{{monster,frame,wide\n|\n}}/g, '');
      
      // Extract name
      const nameMatch = cleanMarkdown.match(/## (.*)/);
      if (nameMatch) parsedMonster.name = nameMatch[1].trim();

      // Extract size, type, and alignment
      const typeMatch = cleanMarkdown.match(/\*(.*) (.*), (.*)\*/);
      if (typeMatch) {
        parsedMonster.size = typeMatch[1].trim();
        parsedMonster.creaturetype = typeMatch[2].trim();
        parsedMonster.alignment = typeMatch[3].trim();
      }

      // Extract AC
      const acMatch = cleanMarkdown.match(/\*\*Armor Class\*\* :: (\d+)(?: \((.*)\))?/);
      if (acMatch) {
        parsedMonster.ac = parseInt(acMatch[1]);
        parsedMonster.acText = acMatch[2] ? acMatch[2] : '';
      }

      // Extract HP
      const hpMatch = cleanMarkdown.match(/\*\*Hit Points\*\* :: (\d+)(?: \((.*)\))?/);
      if (hpMatch) {
        parsedMonster.hp = parseInt(hpMatch[1]);
        parsedMonster.hpFormula = hpMatch[2] ? hpMatch[2] : '';
      }

      // Extract Speed
      const speedMatch = cleanMarkdown.match(/\*\*Speed\*\* :: (.*)/);
      if (speedMatch) {
        const speedText = speedMatch[1];
        const speedTypes = speedText.split(', ');
        
        parsedMonster.speed = speedTypes.map(type => {
          const walkMatch = type.match(/^(\d+) ft\.$/);
          if (walkMatch) {
            return { type: 'walk', value: parseInt(walkMatch[1]) };
          }
          
          const otherMatch = type.match(/^(\d+) ft\. \((.*)\)$/);
          if (otherMatch) {
            return { type: otherMatch[2], value: parseInt(otherMatch[1]) };
          }
          
          return null;
        }).filter(Boolean);
      }

      // Extract Ability Scores
      const tablePattern = /\|(\d+) \(([-+]\d+)\)\|(\d+) \(([-+]\d+)\)\|(\d+) \(([-+]\d+)\)\|(\d+) \(([-+]\d+)\)\|(\d+) \(([-+]\d+)\)\|(\d+) \(([-+]\d+)\)\|/;
      const tableMatch = cleanMarkdown.match(tablePattern);
      if (tableMatch) {
        parsedMonster.attributes = {
          str: parseInt(tableMatch[1]),
          dex: parseInt(tableMatch[3]),
          con: parseInt(tableMatch[5]),
          int: parseInt(tableMatch[7]),
          wis: parseInt(tableMatch[9]),
          cha: parseInt(tableMatch[11])
        };
      }

      // Extract Saving Throws
      const savingThrowsMatch = cleanMarkdown.match(/\*\*Saving Throws\*\* :: (.*?)(?=\n)/);
      if (savingThrowsMatch) {
        const savingThrowsText = savingThrowsMatch[1];
        parsedMonster.savingThrows = savingThrowsText.split(', ').map(save => save.split(' ')[0]);
      }

      // Extract Skills
      const skillsMatch = cleanMarkdown.match(/\*\*Skills\*\* :: (.*?)(?=\n)/);
      if (skillsMatch) {
        const skillsText = skillsMatch[1];
        parsedMonster.skills = skillsText.split(', ').map(skill => {
          const parts = skill.split(' ');
          return parts.slice(0, -1).join(' '); // Remove the modifier
        });
      }

      // Extract Senses
      const sensesMatch = cleanMarkdown.match(/\*\*\*Senses\*\*\* :: (.*?)(?=\n)/);
      if (sensesMatch) {
        const sensesText = sensesMatch[1];
        parsedMonster.senses = sensesText.split(', ').map(sense => {
          const match = sense.match(/(.*) \((\d+) feet\)/);
          if (match) {
            return {
              type: match[1],
              range: parseInt(match[2])
            };
          }
          return null;
        }).filter(Boolean);
      }

      // Extract Languages
      const languagesMatch = cleanMarkdown.match(/\*\*Languages\*\* :: (.*?)(?=\n)/);
      if (languagesMatch) {
        const languagesText = languagesMatch[1];
        parsedMonster.languages = languagesText.split(', ');
      }

      // Extract Challenge Rating and XP
      const crMatch = cleanMarkdown.match(/\*\*Challenge\*\* :: (.*?)(?: \((.*) XP\))?(?=\n)/);
      if (crMatch) {
        parsedMonster.cr = crMatch[1].trim();
        parsedMonster.xp = crMatch[2] ? crMatch[2] : '';
      }

      // Calculate proficiency bonus based on CR
      parsedMonster.proficiencyBonus = MarkdownUtils.calculateProficiencyBonus(parsedMonster.cr);

      // Extract Features (Abilities)
      const featuresSection = cleanMarkdown.substring(
        cleanMarkdown.indexOf('___\n', cleanMarkdown.indexOf('___\n') + 4) + 4,
        cleanMarkdown.indexOf('\n\n### Actions') > -1 ? cleanMarkdown.indexOf('\n\n### Actions') : cleanMarkdown.length
      );
      
      const featureMatches = featuresSection.match(/\*\*\*(.*?)\.\*\*\* (.*?)(?=\n\n\*\*\*|$)/gs);
      if (featureMatches) {
        featureMatches.forEach(match => {
          const featureMatch = match.match(/\*\*\*(.*?)\.\*\*\* (.*)/s);
          if (featureMatch) {
            parsedMonster.features.push({
              name: featureMatch[1],
              description: featureMatch[2].trim(),
              category: 'Abilities'
            });
          }
        });
      }

      // Extract Actions
      const actionsMatch = cleanMarkdown.match(/### Actions\n([\s\S]*?)(?=\n\n### |$)/);
      if (actionsMatch) {
        const actionsText = actionsMatch[1];
        const actionMatches = actionsText.match(/\*\*\*(.*?)\.\*\*\* (.*?)(?=\n\n\*\*\*|$)/gs);
        if (actionMatches) {
          actionMatches.forEach(match => {
            const actionMatch = match.match(/\*\*\*(.*?)\.\*\*\* (.*)/s);
            if (actionMatch) {
              parsedMonster.features.push({
                name: actionMatch[1],
                description: actionMatch[2].trim(),
                category: 'Actions'
              });
            }
          });
        }
      }

      // Extract Bonus Actions
      const bonusActionsMatch = cleanMarkdown.match(/### Bonus Actions\n([\s\S]*?)(?=\n\n### |$)/);
      if (bonusActionsMatch) {
        const bonusActionsText = bonusActionsMatch[1];
        const bonusActionMatches = bonusActionsText.match(/\*\*\*(.*?)\.\*\*\* (.*?)(?=\n\n\*\*\*|$)/gs);
        if (bonusActionMatches) {
          bonusActionMatches.forEach(match => {
            const bonusActionMatch = match.match(/\*\*\*(.*?)\.\*\*\* (.*)/s);
            if (bonusActionMatch) {
              parsedMonster.features.push({
                name: bonusActionMatch[1],
                description: bonusActionMatch[2].trim(),
                category: 'Bonus Actions'
              });
            }
          });
        }
      }

      // Extract Reactions
      const reactionsMatch = cleanMarkdown.match(/### Reactions\n([\s\S]*?)(?=\n\n### |$)/);
      if (reactionsMatch) {
        const reactionsText = reactionsMatch[1];
        const reactionMatches = reactionsText.match(/\*\*\*(.*?)\.\*\*\* (.*?)(?=\n\n\*\*\*|$)/gs);
        if (reactionMatches) {
          reactionMatches.forEach(match => {
            const reactionMatch = match.match(/\*\*\*(.*?)\.\*\*\* (.*)/s);
            if (reactionMatch) {
              parsedMonster.features.push({
                name: reactionMatch[1],
                description: reactionMatch[2].trim(),
                category: 'Reactions'
              });
            }
          });
        }
      }

      return parsedMonster;
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return null;
    }
  }
};

export default MarkdownUtils;