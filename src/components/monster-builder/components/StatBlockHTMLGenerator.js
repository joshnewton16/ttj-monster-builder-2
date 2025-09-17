// StatBlockHtmlGenerator.js - Generate HTML for stat blocks

import { getModifier } from '../functions/globalFunctions';
import { getActionString } from './PreviewPanel/utils';
import { formatSpeeds, getSkillBonus, getFeatureId } from './StatBlockUtils';

/**
 * Generate feature HTML for single column mode
 */
export const generateFeatureHtml = (features, category, monster) => {
  if (!features || features.length === 0) return '';
  
  let header = '';
  if (category !== 'Abilities') {
    header = `<h2 style="color: #7a200d; font-size: 18px; margin: 0; border-bottom: 1px solid #7a200d; padding-bottom: 4px; margin-bottom: 8px;">${category}</h2>`;
  }
  
  return `
    <div>
      ${header}
      ${features.map(feature => 
        `<p style="margin: 0;"><strong><em>${feature.imageDisplayName || feature.name}.</em></strong> ${getActionString(feature, monster)} </p>`
      ).join('<br/>')}
    </div>
  `;
};

/**
 * Generate control buttons for features
 */
export const generateControlButtons = (feature, index, column, categoryKey, totalInColumn, previewMode) => {
  if (!previewMode) return '';
  
  const featureId = getFeatureId(feature);
  
  const moveButton = `<button onclick="window.moveFeature('${featureId}', '${column}', '${column === 'left' ? 'right' : 'left'}', '${categoryKey}')" style="
    background: #4a76a8; 
    color: white; 
    border: none; 
    padding: 1px 4px; 
    font-size: 8px; 
    border-radius: 2px; 
    cursor: pointer; 
    margin-left: 4px;
  ">${column === 'left' ? '→' : '←'}</button>`;
  
  const upButton = index > 0 ? `<button onclick="window.moveFeatureVertical('${featureId}', '${column}', 'up', '${categoryKey}')" style="
    background: #666; 
    color: white; 
    border: none; 
    padding: 1px 4px; 
    font-size: 8px; 
    border-radius: 2px; 
    cursor: pointer; 
    margin-left: 2px;
  ">↑</button>` : '';
  
  const downButton = index < totalInColumn - 1 ? `<button onclick="window.moveFeatureVertical('${featureId}', '${column}', 'down', '${categoryKey}')" style="
    background: #666; 
    color: white; 
    border: none; 
    padding: 1px 4px; 
    font-size: 8px; 
    border-radius: 2px; 
    cursor: pointer; 
    margin-left: 2px;
  ">↓</button>` : '';
  
  return moveButton + upButton + downButton;
};

/**
 * Generate two-column section HTML
 */
export const generateTwoColumnSection = (leftFeatures, rightFeatures, categoryKey, category, monster, previewMode) => {
  if (leftFeatures.length === 0 && rightFeatures.length === 0) return '';
  
  const resetButton = previewMode ? `<button onclick="window.resetCategory('${categoryKey}')" style="
    background: #666; 
    color: white; 
    border: none; 
    padding: 2px 6px; 
    font-size: 10px; 
    border-radius: 2px; 
    cursor: pointer; 
    margin-left: 8px;
  ">Reset</button>` : '';
  
  return `
    <div>
      <!-- ${category} header (full width) -->
      <div style="margin-bottom: 10px;">
        <h2 style="color: #7a200d; font-size: 18px; margin: 0 0 4px 0;">
          ${category}
          ${resetButton}
        </h2>
        <div style="border-bottom: 1px solid #7a200d;"></div>
      </div>
      
      <!-- ${category} content (two columns) -->
      <div style="display: flex; gap: 20px;">
        <div style="flex: 1;">
          ${leftFeatures.map((feature, index) => {
            const buttons = generateControlButtons(feature, index, 'left', categoryKey, leftFeatures.length, previewMode);
            return `<p style="margin: 0;"><strong><em>${feature.imageDisplayName || feature.name}.</em></strong> ${getActionString(feature, monster)}${buttons}</p>`;
          }).join('<br/>')}
        </div>
        <div style="flex: 1;">
          ${rightFeatures.map((feature, index) => {
            const buttons = generateControlButtons(feature, index, 'right', categoryKey, rightFeatures.length, previewMode);
            return `<p style="margin: 0;"><strong><em>${feature.imageDisplayName || feature.name}.</em></strong> ${getActionString(feature, monster)}${buttons}</p>`;
          }).join('<br/>')}
        </div>
      </div>
    </div>
  `;
};

/**
 * Generate compact layout section for right column actions
 */
export const generateCompactActionsColumn = (actions, bonusActions, reactions, monster, previewMode) => {
  const allActions = [
    { features: actions, category: 'Actions', categoryKey: 'actions' },
    { features: bonusActions, category: 'Bonus Actions', categoryKey: 'bonusActions' },
    { features: reactions, category: 'Reactions', categoryKey: 'reactions' }
  ].filter(group => group.features.length > 0);

  if (allActions.length === 0) return '';

  return allActions.map(group => {
    const resetButton = previewMode ? `<button onclick="window.resetCategory('${group.categoryKey}')" style="
      background: #666; 
      color: white; 
      border: none; 
      padding: 2px 6px; 
      font-size: 8px; 
      border-radius: 2px; 
      cursor: pointer; 
      margin-left: 8px;
    ">Reset</button>` : '';

    return `
      <div style="margin-bottom: 15px;">
        <h2 style="color: #7a200d; font-size: 16px; margin: 0 0 4px 0;">
          ${group.category}
          ${resetButton}
        </h2>
        <div style="border-bottom: 1px solid #7a200d; margin-bottom: 8px;"></div>
        ${group.features.map((feature, index) => {
          const buttons = generateControlButtons(feature, index, 'right', group.categoryKey, group.features.length, previewMode);
          return `<p style="margin: 0 0 6px 0; font-size: 13px; line-height: 1.3;"><strong><em>${feature.imageDisplayName || feature.name}.</em></strong> ${getActionString(feature, monster)}${buttons}</p>`;
        }).join('')}
      </div>
    `;
  }).join('');
};

/**
 * Generate complete stat block HTML
 */
export const generateStatBlockHtml = (monster, useTwoColumns, previewMode, leftAbilities, rightAbilities, leftActions, rightActions, leftBonusActions, rightBonusActions, leftReactions, rightReactions, useCompactLayout = false) => {
  const width = useCompactLayout ? '600px' : (useTwoColumns ? '800px' : '400px');
  const padding = useCompactLayout ? '15px' : '20px';
  const fontSize = useCompactLayout ? '13px' : '14px';
  
  return `
    <div id="stat-block-to-capture" style="
      width: ${width};
      font-family: 'Noto Serif', 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
      background: #fdf1dc;
      padding: ${padding};
      border: 1px solid #ddd;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
      position: relative;
      background-image: url('https://www.gmbinder.com/images/YKGpEyy.png');
      background-size: cover;
      font-size: ${fontSize};
      line-height: 1.4;
    ">
      <!-- Title Section -->
      <div style="margin-bottom: ${useCompactLayout ? '8px' : '10px'};">
        <h1 style="color: #7a200d; font-size: ${useCompactLayout ? '20px' : '24px'}; margin: 0;">${monster.name || 'Unnamed Monster'}</h1>
        <p style="font-style: italic; margin: 0 0 ${useCompactLayout ? '6px' : '8px'} 0; font-size: ${useCompactLayout ? '12px' : '14px'};">
          ${monster.size} ${monster.creaturetype || 'Creature'}
        </p>
        <div style="border-bottom: 1px solid #7a200d;"></div>
      </div>
      
      ${generateStatsSection(monster, useTwoColumns, useCompactLayout)}
      ${generateMainContentSection(monster, useTwoColumns, useCompactLayout, previewMode, leftAbilities, rightAbilities, leftActions, rightActions, leftBonusActions, rightBonusActions, leftReactions, rightReactions)}
    </div>
  `;
};

/**
 * Generate stats section (attributes, AC, HP, etc.)
 */
const generateStatsSection = (monster, useTwoColumns, useCompactLayout) => {
  if (useTwoColumns || useCompactLayout) {
    return `
      <!-- Two Column Layout: Attributes on left, AC/HP/Speed on right -->
      <div style="display: flex; gap: ${useCompactLayout ? '15px' : '20px'}; margin-bottom: ${useCompactLayout ? '12px' : '15px'};">
        <!-- Left side: Attributes Table -->
        <div style="flex: 1;">
          ${generateAttributesTable(monster, useCompactLayout)}
        </div>
        
        <!-- Right side: AC, HP, Speed -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <p style="margin: 0 0 ${useCompactLayout ? '6px' : '8px'} 0; font-size: ${useCompactLayout ? '12px' : '14px'};"><strong>Armor Class</strong> ${monster.ac} ${monster.armorDescription ? `(${monster.armorDescription})` : ''}</p>
          <p style="margin: 0 0 ${useCompactLayout ? '6px' : '8px'} 0; font-size: ${useCompactLayout ? '12px' : '14px'};"><strong>Hit Points</strong> ${monster.hp} ${monster.hpFormula && monster.hpFormula !== monster.hp.toString() ? `(${monster.hpFormula})` : ''}</p>
          <p style="margin: 0 0 ${useCompactLayout ? '6px' : '8px'} 0; font-size: ${useCompactLayout ? '12px' : '14px'};"><strong>Speed</strong> ${formatSpeeds(monster)}</p>
        </div>
      </div>
      <div style="border-bottom: 1px solid #7a200d; margin-bottom: ${useCompactLayout ? '8px' : '10px'};"></div>
    `;
  } else {
    return `
      <!-- Single Column Layout: Original stacked layout -->
      <div style="margin-bottom: 10px;">
        <p style="margin: 0;"><strong>Armor Class</strong> ${monster.ac} ${monster.armorDescription ? `(${monster.armorDescription})` : ''}</p>
        <p style="margin: 0;"><strong>Hit Points</strong> ${monster.hp} ${monster.hpFormula && monster.hpFormula !== monster.hp.toString() ? `(${monster.hpFormula})` : ''}</p>
        <p style="margin: 0 0 8px 0;"><strong>Speed</strong> ${formatSpeeds(monster)}</p>
        <div style="border-bottom: 1px solid #7a200d;"></div>
      </div>
      <div style="margin-bottom: 15px;">
        ${generateAttributesTable(monster, false)}
        <div style="padding-top: 4px;">
          <div style="height: 1px; background-color: #7a200d; margin-top: 8px;"></div>
        </div>
      </div>
    `;
  }
};

/**
 * Generate main content section - this handles the different layouts
 */
const generateMainContentSection = (monster, useTwoColumns, useCompactLayout, previewMode, leftAbilities, rightAbilities, leftActions, rightActions, leftBonusActions, rightBonusActions, leftReactions, rightReactions) => {
  if (useCompactLayout) {
    // Compact layout: Skills/Languages/CR + Features on left, Actions on right
    return `
      <div style="display: flex; gap: 15px;">
        <!-- Left Column: Skills/Languages/CR + Features -->
        <div style="flex: 1;">
          ${generateAdditionalInfoSection(monster, useCompactLayout)}
          <!-- Features (Abilities) - no header in left column -->
          ${leftAbilities.length > 0 ? `
            <div style="margin-top: 10px;">
              ${leftAbilities.map(feature => 
                `<p style="margin: 0 0 6px 0; font-size: 12px; line-height: 1.3;"><strong><em>${feature.imageDisplayName || feature.name}.</em></strong> ${getActionString(feature, monster)}</p>`
              ).join('')}
            </div>
          ` : ''}
        </div>
        
        <!-- Right Column: All Actions -->
        <div style="flex: 1;">
          ${generateCompactActionsColumn(rightActions, rightBonusActions, rightReactions, monster, previewMode)}
        </div>
      </div>
    `;
  } else if (useTwoColumns) {
    // Regular two-column layout
    return `
      <div>
        ${generateAdditionalInfoSection(monster, useCompactLayout)}
        ${generateFeaturesSection(monster, useTwoColumns, previewMode, leftAbilities, rightAbilities, leftActions, rightActions, leftBonusActions, rightBonusActions, leftReactions, rightReactions)}
      </div>
    `;
  } else {
    // Single column layout
    return `
      <div>
        ${generateAdditionalInfoSection(monster, useCompactLayout)}
        ${generateFeaturesSection(monster, useTwoColumns, previewMode, leftAbilities, rightAbilities, leftActions, rightActions, leftBonusActions, rightBonusActions, leftReactions, rightReactions)}
      </div>
    `;
  }
};

/**
 * Generate attributes table
 */
const generateAttributesTable = (monster, useCompactLayout) => {
  const cellWidth = useCompactLayout ? '40px' : '50px';
  const cellPadding = useCompactLayout ? '4px 0' : '6px 0';
  const fontSize = useCompactLayout ? '11px' : '14px';
  
  return `
    <!-- Headers Row -->
    <div style="display: flex; justify-content: center; margin-bottom: ${useCompactLayout ? '6px' : '8px'};">
      <div style="width: ${cellWidth}; text-align: center; font-size: ${fontSize};"><strong></strong></div>
      <div style="width: ${cellWidth}; text-align: center; font-size: ${fontSize};"><strong>STR</strong></div>
      <div style="width: ${cellWidth}; text-align: center; font-size: ${fontSize};"><strong>DEX</strong></div>
      <div style="width: ${cellWidth}; text-align: center; font-size: ${fontSize};"><strong>CON</strong></div>
      <div style="width: ${cellWidth}; text-align: center; font-size: ${fontSize};"><strong>INT</strong></div>
      <div style="width: ${cellWidth}; text-align: center; font-size: ${fontSize};"><strong>WIS</strong></div>
      <div style="width: ${cellWidth}; text-align: center; font-size: ${fontSize};"><strong>CHA</strong></div>
    </div>
    
    <!-- Scores Row -->
    <div style="display: flex; justify-content: center;">
      <div style="width: ${cellWidth}; text-align: center; border: 1px solid #999; padding: ${cellPadding}; font-size: ${fontSize};"><strong>Score</strong></div>
      <div style="width: ${cellWidth}; text-align: center; border: 1px solid #999; padding: ${cellPadding}; border-left: none; font-size: ${fontSize};">${monster.attributes.str}</div>
      <div style="width: ${cellWidth}; text-align: center; border: 1px solid #999; padding: ${cellPadding}; border-left: none; font-size: ${fontSize};">${monster.attributes.dex}</div>
      <div style="width: ${cellWidth}; text-align: center; border: 1px solid #999; padding: ${cellPadding}; border-left: none; font-size: ${fontSize};">${monster.attributes.con}</div>
      <div style="width: ${cellWidth}; text-align: center; border: 1px solid #999; padding: ${cellPadding}; border-left: none; font-size: ${fontSize};">${monster.attributes.int}</div>
      <div style="width: ${cellWidth}; text-align: center; border: 1px solid #999; padding: ${cellPadding}; border-left: none; font-size: ${fontSize};">${monster.attributes.wis}</div>
      <div style="width: ${cellWidth}; text-align: center; border: 1px solid #999; padding: ${cellPadding}; border-left: none; font-size: ${fontSize};">${monster.attributes.cha}</div>
    </div>
    
    <!-- Modifiers Row -->
    <div style="display: flex; justify-content: center;">
      <div style="width: ${cellWidth}; text-align: center; border: 1px solid #999; padding: ${cellPadding}; border-top: none; font-size: ${fontSize};"><strong>Mod</strong></div>
      <div style="width: ${cellWidth}; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: ${cellPadding}; font-size: ${fontSize};">${getModifier(monster.attributes.str)}</div>
      <div style="width: ${cellWidth}; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: ${cellPadding}; font-size: ${fontSize};">${getModifier(monster.attributes.dex)}</div>
      <div style="width: ${cellWidth}; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: ${cellPadding}; font-size: ${fontSize};">${getModifier(monster.attributes.con)}</div>
      <div style="width: ${cellWidth}; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: ${cellPadding}; font-size: ${fontSize};">${getModifier(monster.attributes.int)}</div>
      <div style="width: ${cellWidth}; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: ${cellPadding}; font-size: ${fontSize};">${getModifier(monster.attributes.wis)}</div>
      <div style="width: ${cellWidth}; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: ${cellPadding}; font-size: ${fontSize};">${getModifier(monster.attributes.cha)}</div>
    </div>
    
    <!-- Saving Throws Row -->
    <div style="display: flex; justify-content: center;">
      <div style="width: ${cellWidth}; text-align: center; border: 1px solid #999; padding: ${cellPadding}; border-top: none; font-size: ${fontSize};"><strong>Save</strong></div>          
      ${['str', 'dex', 'con', 'int', 'wis', 'cha'].map(ability => {
        const hasSave = monster.savingThrows && monster.savingThrows.includes(ability);
        const value = hasSave ? (() => {
          const mod = parseInt(getModifier(monster.attributes[ability])) + monster.proficiencyBonus;
          return mod >= 0 ? `+${mod}` : mod;
        })() : '-';
        return `<div style="width: ${cellWidth}; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 3px 0; font-size: ${fontSize};">${value}</div>`;
      }).join('')}
    </div>
  `;
};

/**
 * Generate additional info section (skills, senses, languages, CR)
 */
const generateAdditionalInfoSection = (monster, useCompactLayout = false) => {
  const fontSize = useCompactLayout ? '12px' : '14px';
  const margin = useCompactLayout ? '0 0 4px 0' : '0';
  const bottomMargin = useCompactLayout ? '8px' : '10px';
  
  return `
    <div style="margin-bottom: ${bottomMargin};">
      ${monster.skills && monster.skills.length > 0 ? 
        `<p style="margin: ${margin}; font-size: ${fontSize};"><strong>Skills</strong> ${monster.skills.map(skill => {
          let skillName = '';
          
          if (typeof skill === 'string') {
            skillName = skill;
          } else if (typeof skill === 'object') {
            skillName = skill.name || '';
          }
          
          const skillBonus = getSkillBonus(skill, monster);
          const formattedModifier = skillBonus >= 0 ? `+${skillBonus}` : `${skillBonus}`;
          
          return `${skillName} ${formattedModifier}`;
        }).join(', ')}</p>` : ''}

      ${monster.senses && monster.senses.length > 0 ? 
        `<p style="margin: ${margin}; font-size: ${fontSize};"><strong>Senses</strong> ${monster.senses.map(sense => {
          return `${sense.type} (${sense.range} feet)`;
        }).join(', ')}</p>` : ''}
      
      ${monster.languages && monster.languages.length > 0 ? 
        `<p style="margin: ${margin}; font-size: ${fontSize};"><strong>Languages</strong> ${monster.languages.join(', ')}</p>` : ''}
      
      <p style="margin: 0 0 ${useCompactLayout ? '6px' : '8px'} 0; font-size: ${fontSize};"><strong>Challenge Rating</strong> ${monster.cr} ${monster.xp ? `(${monster.xp} XP)` : ''}</p>
      ${!useCompactLayout ? '<div style="border-bottom: 1px solid #7a200d;"></div>' : ''}
    </div>
  `;
};

/**
 * Generate features section
 */
const generateFeaturesSection = (monster, useTwoColumns, previewMode, leftAbilities, rightAbilities, leftActions, rightActions, leftBonusActions, rightBonusActions, leftReactions, rightReactions) => {
  if (useTwoColumns) {
    return `
      <div>
        <!-- Two column layout for Abilities (no header) -->
        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
          <div style="flex: 1;">
            ${leftAbilities.map(feature => 
              `<p style="margin: 0;"><strong><em>${feature.imageDisplayName || feature.name}.</em></strong> ${getActionString(feature, monster)}</p>`
            ).join('<br/>')}
          </div>
          <div style="flex: 1;">
            ${rightAbilities.map(feature => 
              `<p style="margin: 0;"><strong><em>${feature.imageDisplayName || feature.name}.</em></strong> ${getActionString(feature, monster)}</p>`
            ).join('<br/>')}
          </div>
        </div>
        
        ${generateTwoColumnSection(leftActions, rightActions, 'actions', 'Actions', monster, previewMode)}
        ${generateTwoColumnSection(leftBonusActions, rightBonusActions, 'bonusActions', 'Bonus Actions', monster, previewMode)}
        ${generateTwoColumnSection(leftReactions, rightReactions, 'reactions', 'Reactions', monster, previewMode)}
      </div>
    `;
  } else {
    const abilities = [...leftAbilities, ...rightAbilities];
    const actions = [...leftActions, ...rightActions];
    const bonusActions = [...leftBonusActions, ...rightBonusActions];
    const reactions = [...leftReactions, ...rightReactions];
    
    return `
      <div>
        ${generateFeatureHtml(abilities, 'Abilities', monster)}
        ${generateFeatureHtml(actions, 'Actions', monster)}
        ${generateFeatureHtml(bonusActions, 'Bonus Actions', monster)}
        ${generateFeatureHtml(reactions, 'Reactions', monster)}
      </div>
    `;
  }
};