import React from 'react';
import { getSkillAbility } from '../constants/srd-data'; // Import from your constants file

/**
 * Component for generating D&D monster markdown
 */
const MarkdownExporter = ({ monster }) => {
  /**
   * Convert monster data to markdown string
   */
  const generateMarkdown = () => {
    // Calculate ability score modifiers
    const getModifier = (score) => {
      const modifier = Math.floor((score - 10) / 2);
      return modifier >= 0 ? `+${modifier}` : `${modifier}`;
    };

    // Format speeds
    const formatSpeeds = () => {
      return monster.speed
        .filter(s => s.value > 0)
        .map(s => `${s.value} ft.${s.type.toLowerCase() !== 'walk' ? ` (${s.type.toLowerCase()})` : ''}`)
        .join(', ');
    };

    // Format saving throws if present
    const formatSavingThrows = () => {
      if (!monster.savingThrows || monster.savingThrows.length === 0) return '';
      
      const saves = monster.savingThrows.map(save => {
        const attr = save.toLowerCase();
        const attrScore = monster.attributes[attr];
        const modifier = parseInt(getModifier(attrScore)) + monster.proficiencyBonus;
        const formattedModifier = modifier >= 0 ? `+${modifier}` : `${modifier}`;
        return `${save.toUpperCase()} ${formattedModifier}`;
      }).join(', ');
      
      return `**Saving Throws** :: ${saves}\n`;
    };

    // Format skills if present
    const formatSkills = () => {
      if (!monster.skills || monster.skills.length === 0) return '';
      
      const skills = monster.skills.map(skill => {
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
        const abilityMod = parseInt(getModifier(monster.attributes[ability]));
        const modifier = abilityMod + monster.proficiencyBonus;
        const formattedModifier = modifier >= 0 ? `+${modifier}` : `${modifier}`;
        
        return `${skillName} ${formattedModifier}`;
      }).join(', ');
      
      return `**Skills** :: ${skills}\n`;
    };

    // Format languages if present
    const formatLanguages = () => {
      if (!monster.languages || monster.languages.length === 0) return '';
      return `**Languages** :: ${monster.languages.join(', ')}\n`;
    };

    // Format features
    const formatFeatures = () => {
      if (!monster.features || monster.features.length === 0) return '';
      
      return monster.features
        .filter(feature => feature.category === 'Abilities')
        .map(feature => {
          return `***${feature.name}.*** ${feature.description}`;
        })
        .join('\n\n');
    };

    // Format actions
    const formatActions = () => {
      if (!monster.features || monster.features.length === 0) return '';
      
      const actions = monster.features
        .filter(feature => feature.category === 'Actions')
        .map(action => {
          return `***${action.name}.*** ${action.description}`;
        })
        .join('\n\n');
      
      return actions ? `### Actions\n${actions}` : '';
    };

    // Format bonus actions
    const formatBonusActions = () => {
      if (!monster.features || monster.features.length === 0) return '';
      
      const bonusActions = monster.features
        .filter(feature => feature.category === 'Bonus Actions')
        .map(action => {
          return `***${action.name}.*** ${action.description}`;
        })
        .join('\n\n');
      
      return bonusActions ? `### Bonus Actions\n${bonusActions}` : '';
    };

    // Format reactions
    const formatReactions = () => {
      if (!monster.features || monster.features.length === 0) return '';
      
      const reactions = monster.features
        .filter(feature => feature.category === 'Reactions')
        .map(reaction => {
          return `***${reaction.name}.*** ${reaction.description}`;
        })
        .join('\n\n');
      
      return reactions ? `### Reactions\n${reactions}` : '';
    };

    // Build the complete markdown
    const markdown = `{{monster,frame,wide
## ${monster.name}
*${monster.size} ${monster.type || 'Creature'}, ${monster.alignment || 'unaligned'}*
___
**Armor Class** :: ${monster.ac} ${monster.acText ? `(${monster.acText})` : ''}
**Hit Points** :: ${monster.hp} ${monster.hpFormula ? `(${monster.hpFormula})` : ''}
**Speed** :: ${formatSpeeds()}
___
|STR|DEX|CON|INT|WIS|CHA|
|:---:|:---:|:---:|:---:|:---:|:---:|
|${monster.attributes.str} (${getModifier(monster.attributes.str)})|${monster.attributes.dex} (${getModifier(monster.attributes.dex)})|${monster.attributes.con} (${getModifier(monster.attributes.con)})|${monster.attributes.int} (${getModifier(monster.attributes.int)})|${monster.attributes.wis} (${getModifier(monster.attributes.wis)})|${monster.attributes.cha} (${getModifier(monster.attributes.cha)})|
___
${formatSavingThrows()}${formatSkills()}${monster.senses ? `**Senses** :: ${monster.senses}\n` : ''}${formatLanguages()}**Challenge** :: ${monster.cr} ${monster.xp ? `(${monster.xp} XP)` : ''}
___
${formatFeatures()}

${formatActions()}

${formatBonusActions()}

${formatReactions()}
}}`;

    return markdown;
  };

  /**
   * Copy the generated markdown to clipboard
   */
  const handleExport = () => {
    const markdown = generateMarkdown();
    navigator.clipboard.writeText(markdown)
      .then(() => {
        alert('Markdown copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy markdown: ', err);
        alert('Failed to copy markdown to clipboard. See console for details.');
      });
  };

  return (
    <button
      className="nav-button export-button"
      onClick={handleExport}
      disabled={!monster.name} // Disable if monster has no name
    >
      Export Markdown
    </button>
  );
};

export default MarkdownExporter;