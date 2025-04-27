import React from 'react';
import { getModifier } from '../functions/globalFunctions';
import { getActionString } from './PreviewPanel/utils';
import { RECHARGE_OPTIONS } from '../constants/spell-parameters';
import { getSkillAbility } from '../constants/srd-data';

/**
 * Component for exporting D&D monster stat blocks as Markdown for Homebrewery
 */
const MarkdownExporter = ({ monster }) => {
  /**
   * Format speeds
   */
  const formatSpeeds = () => {
    return monster.speed
      .filter(s => s.value > 0)
      .map(s => `${s.value} ft.${s.type.toLowerCase() !== 'walk' ? ` (${s.type.toLowerCase()})` : ''}`)
      .join(', ');
  };
  
  /**
   * Calculate the bonus for a skill
   */
  const getSkillBonus = (skill) => {
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
    
    // Calculate the base ability modifier
    const abilityMod = parseInt(getModifier(monster.attributes[ability]));
    
    // Add proficiency bonus
    return abilityMod + monster.proficiencyBonus;
  };

  /**
   * Generate markdown for the monster stat block
   */
  const generateMarkdown = () => {
    // Filter monster features by category
    const abilities = monster.features ? monster.features.filter(f => f.category === 'Abilities' && f.isHidden !== true) : [];
    
    // Sort actions to ensure Multiattack appears first
    const actions = monster.features ? 
      monster.features
        .filter(f => f.category === 'Actions')
        .sort((a, b) => {
          // If a is Multiattack, it comes first
          if (a.isMultiattack === true) return -1;
          // If b is Multiattack, it comes first
          if (b.isMultiattack === true) return 1;
          // Otherwise, maintain original order
          return 0;
        }) : [];
        
    const bonusActions = monster.features ? monster.features.filter(f => f.category === 'Bonus Actions') : [];
    const reactions = monster.features ? monster.features.filter(f => f.category === 'Reactions') : [];

    // Start building markdown
    let markdown = '';
    
    // Add custom CSS for styling
    markdown += `<style>\n`;
    markdown += `  .custom-monster {\n`;
    markdown += `    font-family: 'Noto Serif', 'Palatino Linotype', 'Book Antiqua', Palatino, serif;\n`;
    markdown += `    background: #fdf1dc;\n`;
    markdown += `    background-image: url('https://www.gmbinder.com/images/YKGpEyy.png');\n`;
    markdown += `    background-size: cover;\n`;
    markdown += `    padding: 20px;\n`;
    markdown += `    border: 1px solid #ddd;\n`;
    markdown += `    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);\n`;
    markdown += `    margin-bottom: 1em;\n`;
    markdown += `  }\n`;
    markdown += `  .custom-monster h1 {\n`;
    markdown += `    color: #7a200d;\n`;
    markdown += `    font-size: 24px;\n`;
    markdown += `    margin: 0;\n`;
    markdown += `    font-family: 'Noto Serif', 'Palatino Linotype', 'Book Antiqua', Palatino, serif;\n`;
    markdown += `  }\n`;
    markdown += `  .custom-monster h2 {\n`;
    markdown += `    color: #7a200d;\n`;
    markdown += `    font-size: 18px;\n`;
    markdown += `    margin: 0;\n`;
    markdown += `    border-bottom: 1px solid #7a200d;\n`;
    markdown += `    padding-bottom: 4px;\n`;
    markdown += `    margin-bottom: 8px;\n`;
    markdown += `    font-family: 'Noto Serif', 'Palatino Linotype', 'Book Antiqua', Palatino, serif;\n`;
    markdown += `  }\n`;
    markdown += `  .custom-monster hr {\n`;
    markdown += `    border-color: #7a200d;\n`;
    markdown += `    border-width: 1px 0 0 0;\n`;
    markdown += `  }\n`;
    markdown += `  .custom-monster table {\n`;
    markdown += `    width: 100%;\n`;
    markdown += `    margin-bottom: 10px;\n`;
    markdown += `  }\n`;
    markdown += `  .custom-monster p {\n`;
    markdown += `    margin: 0 0 8px 0;\n`;
    markdown += `  }\n`;
    markdown += `</style>\n\n`;
    
    // Begin the custom styled monster block
    markdown += `<div class='custom-monster'>\n\n`;
    
    // Title Section
    markdown += `# ${monster.name || 'Unnamed Monster'}\n`;
    markdown += `*${monster.size} ${monster.creaturetype || 'Creature'}*\n`;
    markdown += `___\n`;
    
    // Stats Section
    markdown += `**Armor Class** ${monster.ac} ${monster.armorDescription ? `(${monster.armorDescription})` : ''}\n`;
    markdown += `**Hit Points** ${monster.hp} ${monster.hpFormula ? `(${monster.hpFormula})` : ''}\n`;
    markdown += `**Speed** ${formatSpeeds()}\n`;
    markdown += `___\n`;
    
    // Ability Scores Table
    markdown += `|STR|DEX|CON|INT|WIS|CHA|\n`;
    markdown += `|:---:|:---:|:---:|:---:|:---:|:---:|\n`;
    markdown += `|${monster.attributes.str} (${getModifier(monster.attributes.str)})|${monster.attributes.dex} (${getModifier(monster.attributes.dex)})|${monster.attributes.con} (${getModifier(monster.attributes.con)})|${monster.attributes.int} (${getModifier(monster.attributes.int)})|${monster.attributes.wis} (${getModifier(monster.attributes.wis)})|${monster.attributes.cha} (${getModifier(monster.attributes.cha)})|\n`;
    markdown += `___\n`;
    
    // Additional Info Section
    if (monster.savingThrows && monster.savingThrows.length > 0) {
      const savingThrowsText = ['str', 'dex', 'con', 'int', 'wis', 'cha']
        .filter(ability => monster.savingThrows.includes(ability))
        .map(ability => {
          const abilityName = ability.charAt(0).toUpperCase() + ability.slice(1);
          const mod = parseInt(getModifier(monster.attributes[ability])) + monster.proficiencyBonus;
          return `${abilityName} ${mod >= 0 ? `+${mod}` : mod}`;
        })
        .join(', ');
      
      markdown += `**Saving Throws** ${savingThrowsText}\n`;
    }
    
    if (monster.skills && monster.skills.length > 0) {
      const skillsText = monster.skills.map(skill => {
        let skillName = '';
        
        // Handle both string and object formats for skills
        if (typeof skill === 'string') {
          skillName = skill;
        } else if (typeof skill === 'object') {
          skillName = skill.name || '';
        }
        
        const skillBonus = getSkillBonus(skill);
        const formattedModifier = skillBonus >= 0 ? `+${skillBonus}` : `${skillBonus}`;
        
        return `${skillName} ${formattedModifier}`;
      }).join(', ');
      
      markdown += `**Skills** ${skillsText}\n`;
    }
    
    if (monster.senses && monster.senses.length > 0) {
      const sensesText = monster.senses.map(sense => {
        let senseName = sense.type;
        let senseRange = sense.range;
        
        return `${senseName} (${senseRange} feet)`;
      }).join(', ');
      
      markdown += `**Senses** ${sensesText}\n`;
    }
    
    if (monster.languages && monster.languages.length > 0) {
      markdown += `**Languages** ${monster.languages.join(', ')}\n`;
    }
    
    markdown += `**Challenge** ${monster.cr} ${monster.xp ? `(${monster.xp} XP)` : ''}\n`;
    markdown += `___\n`;
    
    // Traits/Abilities Section
    if (abilities.length > 0) {
      abilities.forEach(ability => {
        const rechargeText = ability.spellDetails?.recharge 
          ? ` (${RECHARGE_OPTIONS.find(option => option.value === ability.spellDetails.recharge)?.label || ability.spellDetails.recharge})`
          : '';
        
        markdown += `***${ability.name}${rechargeText}.*** ${getActionString(ability, monster)}\n\n`;
      });
    }
    
    // Actions Section
    if (actions.length > 0) {
      markdown += `## Actions\n`;
      actions.forEach(action => {
        const rechargeText = action.spellDetails?.recharge 
          ? ` (${RECHARGE_OPTIONS.find(option => option.value === action.spellDetails.recharge)?.label || action.spellDetails.recharge})`
          : '';
        
        markdown += `***${action.name}${rechargeText}.*** ${getActionString(action, monster)}\n\n`;
      });
    }
    
    // Bonus Actions Section
    if (bonusActions.length > 0) {
      markdown += `## Bonus Actions\n`;
      bonusActions.forEach(bonusAction => {
        const rechargeText = bonusAction.spellDetails?.recharge 
          ? ` (${RECHARGE_OPTIONS.find(option => option.value === bonusAction.spellDetails.recharge)?.label || bonusAction.spellDetails.recharge})`
          : '';
        
        markdown += `***${bonusAction.name}${rechargeText}.*** ${getActionString(bonusAction, monster)}\n\n`;
      });
    }
    
    // Reactions Section
    if (reactions.length > 0) {
      markdown += `## Reactions\n`;
      reactions.forEach(reaction => {
        const rechargeText = reaction.spellDetails?.recharge 
          ? ` (${RECHARGE_OPTIONS.find(option => option.value === reaction.spellDetails.recharge)?.label || reaction.spellDetails.recharge})`
          : '';
        
        markdown += `***${reaction.name}${rechargeText}.*** ${getActionString(reaction, monster)}\n\n`;
      });
    }
    
    // End the custom styled monster block
    markdown += `</div>\n`;
    
    return markdown;
  };

  /**
   * Export markdown to a file
   */
  const handleExportMarkdown = () => {
    const markdown = generateMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${monster.name ? monster.name.toLowerCase().replace(/\s+/g, '-') : 'monster'}-homebrewery.md`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  return (
    <button
      className="nav-button export-button"
      onClick={handleExportMarkdown}
      disabled={!monster.name} // Disable if monster has no name
    >
      Export to Homebrewery
    </button>
  );
};

export default MarkdownExporter;