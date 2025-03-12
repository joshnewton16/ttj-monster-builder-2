import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { getSkillAbility } from '../constants/srd-data'; // Import from your constants file
import { getModifier } from '../functions/globalFunctions';

/**
 * Component for generating and exporting D&D monster stat blocks as images
 * Supports toggling between one and two-column layouts
 */
const StatBlockImageExporter = ({ monster }) => {
  const statBlockRef = useRef(null);
  // Use ref instead of state to avoid re-render issues
  const twoColumnsRef = useRef(false);

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
   * Split features into two columns while maintaining category grouping
   */
  const distributeFeatures = (features) => {
    if (!features || features.length === 0) return [[], []];
    
    // If only 1 feature, put it in the left column
    if (features.length === 1) return [features, []];
    
    // For 2+ features, split them between columns
    const half = Math.ceil(features.length / 2);
    return [features.slice(0, half), features.slice(half)];
  };

  function renderAttributeRow(attributeName, isLastInRow = false) {
    const upperAttr = attributeName.toUpperCase();
    const attrScore = monster.attributes[attributeName];
    const baseModifier = getModifier(attrScore);
    
    const hasSavingThrow = monster.savingThrows && monster.savingThrows.includes(attributeName);
    const savingThrowValue = hasSavingThrow ? 
      (() => {
        const modifier = parseInt(baseModifier) + monster.proficiencyBonus;
        return modifier >= 0 ? `+${modifier}` : `${modifier}`;
      })() : '-';
    
    return `
      <td style="padding-right: 10px; border-left: 2px solid #999; border-top: 2px solid #999; border-bottom: 2px solid #999;"><p style="margin: 0"><strong>${upperAttr}</strong></p></td>
      <td style="border-top: 2px solid #999; border-bottom: 2px solid #999;"><p style="margin: 0;">${attrScore}</p></td>
      <td style="padding-right: 5px; background-color: #f5f5f5; border-top: 2px solid #999; border-bottom: 2px solid #999;"><p style="margin: 0;">${baseModifier}</p></td>
      <td style="padding-right: 5px; background-color: #f5f5f5; border-right: 2px solid #999; border-top: 2px solid #999; border-bottom: 2px solid #999;"><p style="margin: 0;">${savingThrowValue}</p></td>
    `;
  }

  /**
   * Generate and show the stat block modal with current settings
   */
  const showStatBlockModal = () => {
    const useTwoColumns = twoColumnsRef.current;
    
    // Create stat block modal
    const modal = document.createElement('div');
    modal.id = 'monster-stat-block-modal';
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
    
    // Split features for two-column layout
    let [leftAbilities, rightAbilities] = useTwoColumns ? distributeFeatures(abilities) : [abilities, []];
    let [leftActions, rightActions] = useTwoColumns ? distributeFeatures(actions) : [actions, []];
    let [leftBonusActions, rightBonusActions] = useTwoColumns ? distributeFeatures(bonusActions) : [bonusActions, []];
    let [leftReactions, rightReactions] = useTwoColumns ? distributeFeatures(reactions) : [reactions, []];
    
    // Generate feature HTML for a single category
    const generateFeatureHtml = (features, category, showHeader = true) => {
      if (!features || features.length === 0) return '';
      
      let header = '';
      if (showHeader && category !== 'Abilities') {
        header = `<h2 style="color: #7a200d; font-size: 18px; margin: 0;">${category}</h2>`;
      }
      
      return `
        <div style="margin-bottom: ${category === 'Abilities' ? '20px' : '10px'};">
          ${header}
          ${features.map(feature => 
            `<p style="margin: 0;"><strong><em>${feature.name}.</em></strong> ${feature.description}</p>`
          ).join('<br/>')}
        </div>
      `;
    };
    
    // Generate columns based on layout preference
    let leftColumnHtml = '';
    let rightColumnHtml = '';
    
    if (useTwoColumns) {
      // Two-column layout with categories split between columns
      // Abilities section
      if (abilities.length > 0) {
        leftColumnHtml += generateFeatureHtml(leftAbilities, 'Abilities');
        rightColumnHtml += generateFeatureHtml(rightAbilities, 'Abilities', false);
      }
      
      // Actions section
      if (actions.length > 0) {
        leftColumnHtml += generateFeatureHtml(leftActions, 'Actions');
        rightColumnHtml += generateFeatureHtml(rightActions, 'Actions', leftActions.length === 0);
      }
      
      // Bonus Actions section
      if (bonusActions.length > 0) {
        leftColumnHtml += generateFeatureHtml(leftBonusActions, 'Bonus Actions');
        rightColumnHtml += generateFeatureHtml(rightBonusActions, 'Bonus Actions', leftBonusActions.length === 0);
      }
      
      // Reactions section
      if (reactions.length > 0) {
        leftColumnHtml += generateFeatureHtml(leftReactions, 'Reactions');
        rightColumnHtml += generateFeatureHtml(rightReactions, 'Reactions', leftReactions.length === 0);
      }
    } else {
      // Single-column layout
      leftColumnHtml += generateFeatureHtml(abilities, 'Abilities');
      leftColumnHtml += generateFeatureHtml(actions, 'Actions');
      leftColumnHtml += generateFeatureHtml(bonusActions, 'Bonus Actions');
      leftColumnHtml += generateFeatureHtml(reactions, 'Reactions');
    }
    
    // Set the HTML content of the stat block
    statBlockContainer.innerHTML = `
      <div id="stat-block-to-capture" style="
        width: ${useTwoColumns ? '800px' : '400px'};
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
            ${monster.size} ${monster.creaturetype || 'Creature'}, ${monster.alignment || 'unaligned'}
          </p>
        </div>
        
        <div style="border-bottom: 1px solid #7a200d; margin-bottom: 10px; padding-bottom: 10px;">
          <p style="margin: 0;"><strong>Armor Class</strong> ${monster.ac} ${monster.acText ? `(${monster.acText})` : ''}</p>
          <p style="margin: 0;"><strong>Hit Points</strong> ${monster.hp} ${monster.hpFormula ? `(${monster.hpFormula})` : ''}</p>
          <p style="margin: 0;"><strong>Speed</strong> ${formatSpeeds()}</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; text-align: center; border-bottom: 1px solid #7a200d; margin-bottom: 10px; padding-bottom: 10px;">
          <table width=450px;>
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th style="font-size: 10px;">Mod</th>
                <th style="font-size: 10px;">Save</th>
                <th></th>
                <th></th>
                <th style="font-size: 10px;">Mod</th>
                <th style="font-size: 10px;">Save</th>
                <th></th>
                <th></th>
                <th style="font-size: 10px;">Mod</th>
                <th style="font-size: 10px;">Save</th>                                
              </tr>
            </thead>
            <tr>
              ${renderAttributeRow('str')}
              ${renderAttributeRow('dex')}
              ${renderAttributeRow('con')}
            </tr>
            <tr>
              ${renderAttributeRow('int')}
              ${renderAttributeRow('wis')}
              ${renderAttributeRow('cha')}
            </tr>
          </table>
        </div>
        
        <div style="border-bottom: 1px solid #7a200d; margin-bottom: 10px; padding-bottom: 10px;">
            
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

          ${monster.senses && monster.senses.length > 0 ? 
            `<p style="margin: 0;"><strong>Senses</strong> ${monster.senses.map(sense => {
              let senseName = sense.type;
              let senseRange = sense.range;
              
              return `${senseName} (${senseRange} feet)`;
            }).join(', ')}</p>` : ''}
          
          ${monster.languages && monster.languages.length > 0 ? 
            `<p style="margin: 0;"><strong>Languages</strong> ${monster.languages.join(', ')}</p>` : ''}
          
          <p style="margin: 0;"><strong>Challenge Rating</strong> ${monster.cr} ${monster.xp ? `(${monster.xp} XP)` : ''}</p>
        </div>
        
        ${useTwoColumns ? 
          `<div>
            <!-- Two column layout for Abilities (no header) -->
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
              <div style="flex: 1;">
                <!-- Abilities left column -->
                ${leftAbilities.length > 0 ? 
                  `<div>
                    ${leftAbilities.map(feature => 
                      `<p style="margin: 0;"><strong><em>${feature.name}.</em></strong> ${feature.description}</p>`
                    ).join('<br/>')}
                  </div>` : ''
                }
              </div>
              <div style="flex: 1;">
                <!-- Abilities right column -->
                ${rightAbilities.length > 0 ? 
                  `<div>
                    ${rightAbilities.map(feature => 
                      `<p style="margin: 0;"><strong><em>${feature.name}.</em></strong> ${feature.description}</p>`
                    ).join('<br/>')}
                  </div>` : ''
                }
              </div>
            </div>
            
            <!-- Actions section -->
            ${actions.length > 0 ? 
              `<div>
                <!-- Actions header (full width) -->
                <div style="margin-bottom: 10px; border-bottom: 1px solid #7a200d;">
                  <h2 style="color: #7a200d; font-size: 18px; margin: 0;">Actions</h2>
                </div>
                
                <!-- Actions content (two columns) -->
                <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                  <div style="flex: 1;">
                    ${leftActions.map(feature => 
                      `<p style="margin: 0;"><strong><em>${feature.name}.</em></strong> ${feature.description}</p>`
                    ).join('<br/>')}
                  </div>
                  <div style="flex: 1;">
                    ${rightActions.map(feature => 
                      `<p style="margin: 0;"><strong><em>${feature.name}.</em></strong> ${feature.description}</p>`
                    ).join('<br/>')}
                  </div>
                </div>
              </div>` : ''
            }
            
            <!-- Bonus Actions section -->
            ${bonusActions.length > 0 ? 
              `<div>
                <!-- Bonus Actions header (full width) -->
                <div style="margin-bottom: 10px; border-bottom: 1px solid #7a200d;">
                  <h2 style="color: #7a200d; font-size: 18px; margin: 0;">Bonus Actions</h2>
                </div>
                
                <!-- Bonus Actions content (two columns) -->
                <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                  <div style="flex: 1;">
                    ${leftBonusActions.map(feature => 
                      `<p style="margin: 0;"><strong><em>${feature.name}.</em></strong> ${feature.description}</p>`
                    ).join('<br/>')}
                  </div>
                  <div style="flex: 1;">
                    ${rightBonusActions.map(feature => 
                      `<p style="margin: 0;"><strong><em>${feature.name}.</em></strong> ${feature.description}</p>`
                    ).join('<br/>')}
                  </div>
                </div>
              </div>` : ''
            }
            
            <!-- Reactions section -->
            ${reactions.length > 0 ? 
              `<div>
                <!-- Reactions header (full width) -->
                <div style="margin-bottom: 10px; border-bottom: 1px solid #7a200d;">
                  <h2 style="color: #7a200d; font-size: 18px; margin: 0;">Reactions</h2>
                </div>
                
                <!-- Reactions content (two columns) -->
                <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                  <div style="flex: 1;">
                    ${leftReactions.map(feature => 
                      `<p style="margin: 0;"><strong><em>${feature.name}.</em></strong> ${feature.description}</p>`
                    ).join('<br/>')}
                  </div>
                  <div style="flex: 1;">
                    ${rightReactions.map(feature => 
                      `<p style="margin: 0;"><strong><em>${feature.name}.</em></strong> ${feature.description}</p>`
                    ).join('<br/>')}
                  </div>
                </div>
              </div>` : ''
            }
          </div>` : 
          `${leftColumnHtml}`
        }
      </div>
      
      <div style="margin-top: 20px; text-align: center;">
        <div style="margin-bottom: 15px;">
          <button id="layout-toggle-button" style="
            background-color: #4a76a8;
            color: white;
            border: none;
            padding: 8px 16px;
            margin-right: 10px;
            border-radius: 4px;
            cursor: pointer;
          ">${useTwoColumns ? 'Switch to One Column' : 'Switch to Two Columns'}</button>
          
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
      </div>
    `;
    
    // Add elements to DOM
    statBlockContainer.appendChild(closeButton);
    modal.appendChild(statBlockContainer);
    document.body.appendChild(modal);
    
    // Add click event to layout toggle button
    document.getElementById('layout-toggle-button').addEventListener('click', () => {
      // Toggle the layout preference
      twoColumnsRef.current = !twoColumnsRef.current;
      
      // Remove the current modal
      document.body.removeChild(document.getElementById('monster-stat-block-modal'));
      
      // Regenerate the modal with the new layout
      showStatBlockModal();
    });
    
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

  /**
   * Export the stat block as an image
   */
  const handleExportImage = () => {
    showStatBlockModal();
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