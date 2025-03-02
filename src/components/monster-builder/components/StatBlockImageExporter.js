import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { getSkillAbility } from '../constants/srd-data'; // Import from your constants file

/**
 * Component for generating and exporting D&D monster stat blocks as images
 */
const StatBlockImageExporter = ({ monster }) => {
  const statBlockRef = useRef(null);

  /**
   * Calculate ability score modifiers
   */
  const getModifier = (score) => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

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
   * Export the stat block as an image
   */
  const handleExportImage = async () => {
    // Create stat block modal
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.zIndex = '1000';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    
    // Create stat block container
    const statBlockContainer = document.createElement('div');
    statBlockContainer.style.padding = '20px';
    statBlockContainer.style.backgroundColor = 'white';
    statBlockContainer.style.borderRadius = '5px';
    statBlockContainer.style.maxWidth = '90%';
    statBlockContainer.style.maxHeight = '90%';
    statBlockContainer.style.overflow = 'auto';
    statBlockContainer.style.position = 'relative';
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.border = 'none';
    closeButton.style.background = 'none';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
      document.body.removeChild(modal);
    };
    
    // Set the HTML content of the stat block
    statBlockContainer.innerHTML = `
      <div id="stat-block-to-capture" style="
        width: 400px;
        font-family: 'Noto Serif', 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
        background: #fdf1dc;
        padding: 20px;
        border: 1px solid #ddd;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
        position: relative;
        background-image: url('https://www.gmbinder.com/images/YKGpEyy.png');
        background-size: cover;
      ">
        <div style="border-bottom: 1px solid #7a200d; margin-bottom: 10px;">
          <h1 style="color: #7a200d; font-size: 24px; margin: 0;">${monster.name || 'Unnamed Monster'}</h1>
          <p style="font-style: italic; margin: 0;">
            ${monster.size} ${monster.type || 'Creature'}, ${monster.alignment || 'unaligned'}
          </p>
        </div>
        
        <div style="border-bottom: 1px solid #7a200d; margin-bottom: 10px; padding-bottom: 10px;">
          <p style="margin: 0;"><strong>Armor Class</strong> ${monster.ac} ${monster.acText ? `(${monster.acText})` : ''}</p>
          <p style="margin: 0;"><strong>Hit Points</strong> ${monster.hp} ${monster.hpFormula ? `(${monster.hpFormula})` : ''}</p>
          <p style="margin: 0;"><strong>Speed</strong> ${formatSpeeds()}</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; text-align: center; border-bottom: 1px solid #7a200d; margin-bottom: 10px; padding-bottom: 10px;">
          <div style="flex: 1;">
            <p style="margin: 0;"><strong>STR</strong></p>
            <p style="margin: 0;">${monster.attributes.str} (${getModifier(monster.attributes.str)})</p>
          </div>
          <div style="flex: 1;">
            <p style="margin: 0;"><strong>DEX</strong></p>
            <p style="margin: 0;">${monster.attributes.dex} (${getModifier(monster.attributes.dex)})</p>
          </div>
          <div style="flex: 1;">
            <p style="margin: 0;"><strong>CON</strong></p>
            <p style="margin: 0;">${monster.attributes.con} (${getModifier(monster.attributes.con)})</p>
          </div>
          <div style="flex: 1;">
            <p style="margin: 0;"><strong>INT</strong></p>
            <p style="margin: 0;">${monster.attributes.int} (${getModifier(monster.attributes.int)})</p>
          </div>
          <div style="flex: 1;">
            <p style="margin: 0;"><strong>WIS</strong></p>
            <p style="margin: 0;">${monster.attributes.wis} (${getModifier(monster.attributes.wis)})</p>
          </div>
          <div style="flex: 1;">
            <p style="margin: 0;"><strong>CHA</strong></p>
            <p style="margin: 0;">${monster.attributes.cha} (${getModifier(monster.attributes.cha)})</p>
          </div>
        </div>
        
        <div style="border-bottom: 1px solid #7a200d; margin-bottom: 10px; padding-bottom: 10px;">
          ${monster.savingThrows && monster.savingThrows.length > 0 ? 
            `<p style="margin: 0;"><strong>Saving Throws</strong> ${monster.savingThrows.map(save => {
              const attr = save.toLowerCase();
              const attrScore = monster.attributes[attr];
              const modifier = parseInt(getModifier(attrScore)) + monster.proficiencyBonus;
              const formattedModifier = modifier >= 0 ? `+${modifier}` : `${modifier}`;
              return `${save.toUpperCase()} ${formattedModifier}`;
            }).join(', ')}</p>` : ''}
          
          ${monster.skills && monster.skills.length > 0 ? 
            `<p style="margin: 0;"><strong>Skills</strong> ${monster.skills.map(skill => {
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
            }).join(', ')}</p>` : ''}
          
          ${monster.senses ? `<p style="margin: 0;"><strong>Senses</strong> ${monster.senses}</p>` : ''}
          
          ${monster.languages && monster.languages.length > 0 ? 
            `<p style="margin: 0;"><strong>Languages</strong> ${monster.languages.join(', ')}</p>` : ''}
          
          <p style="margin: 0;"><strong>Challenge</strong> ${monster.cr} ${monster.xp ? `(${monster.xp} XP)` : ''}</p>
        </div>
        
        ${monster.features && monster.features.filter(f => f.category === 'Abilities').length > 0 ? 
          `<div style="margin-bottom: 10px;">
            ${monster.features.filter(f => f.category === 'Abilities').map(feature => 
              `<p style="margin: 0;"><strong><em>${feature.name}.</em></strong> ${feature.description}</p>`
            ).join('<br/>')}
          </div>` : ''}
        
        ${monster.features && monster.features.filter(f => f.category === 'Actions').length > 0 ? 
          `<div style="margin-bottom: 10px;">
            <h2 style="color: #7a200d; font-size: 18px; margin: 0; border-bottom: 1px solid #7a200d;">Actions</h2>
            ${monster.features.filter(f => f.category === 'Actions').map(action => 
              `<p style="margin: 0;"><strong><em>${action.name}.</em></strong> ${action.description}</p>`
            ).join('<br/>')}
          </div>` : ''}
        
        ${monster.features && monster.features.filter(f => f.category === 'Bonus Actions').length > 0 ? 
          `<div style="margin-bottom: 10px;">
            <h2 style="color: #7a200d; font-size: 18px; margin: 0; border-bottom: 1px solid #7a200d;">Bonus Actions</h2>
            ${monster.features.filter(f => f.category === 'Bonus Actions').map(action => 
              `<p style="margin: 0;"><strong><em>${action.name}.</em></strong> ${action.description}</p>`
            ).join('<br/>')}
          </div>` : ''}
        
        ${monster.features && monster.features.filter(f => f.category === 'Reactions').length > 0 ? 
          `<div style="margin-bottom: 10px;">
            <h2 style="color: #7a200d; font-size: 18px; margin: 0; border-bottom: 1px solid #7a200d;">Reactions</h2>
            ${monster.features.filter(f => f.category === 'Reactions').map(reaction => 
              `<p style="margin: 0;"><strong><em>${reaction.name}.</em></strong> ${reaction.description}</p>`
            ).join('<br/>')}
          </div>` : ''}
      </div>
      
      <div style="margin-top: 20px; text-align: center;">
        <button id="download-button" style="
          background-color: #7a200d;
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 16px;
          border-radius: 4px;
          cursor: pointer;
        ">Download Image</button>
      </div>
    `;
    
    // Add elements to DOM
    statBlockContainer.appendChild(closeButton);
    modal.appendChild(statBlockContainer);
    document.body.appendChild(modal);
    
    // Add click event to download button
    document.getElementById('download-button').addEventListener('click', async () => {
      try {
        const elementToCapture = document.getElementById('stat-block-to-capture');
        const canvas = await html2canvas(elementToCapture, {
          backgroundColor: null,
          scale: 2, // Higher scale for better quality
          useCORS: true
        });
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          // Create download link
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${monster.name ? monster.name.toLowerCase().replace(/\s+/g, '-') : 'monster'}-stat-block.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          // Show success message
          alert('Image downloaded successfully!');
        }, 'image/png');
      } catch (error) {
        console.error('Error generating image:', error);
        alert('Failed to generate image. See console for details.');
      }
    });
  };

  return (
    <button
      className="nav-button export-button"
      onClick={handleExportImage}
      disabled={!monster.name} // Disable if monster has no name
    >
      Export Image
    </button>
  );
};

export default StatBlockImageExporter;