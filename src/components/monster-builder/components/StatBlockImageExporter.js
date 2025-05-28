import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { getSkillAbility } from '../constants/srd-data'; // Import from your constants file
import { getModifier } from '../functions/globalFunctions';
import { getActionString } from './PreviewPanel/utils';

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
    console.log('skill', skill);
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
    let intExpertise = 0;
    // Add Expertise
    if (monster.expertise && monster.expertise.length > 0) { 
      monster.expertise.map(expertise => {
        if (expertise === skill) {
          intExpertise = monster.proficiencyBonus;
        }
      })
    }

    // Add proficiency bonus
    return abilityMod + intExpertise + monster.proficiencyBonus;
  };

  /**
   * Generate and show the stat block modal with current settings
   */
  const showStatBlockModal = () => {
    const useTwoColumns = twoColumnsRef.current;

    //Troubleshooting block
    console.log(monster);
    if (Array.isArray(monster.features)) {
      monster.features.forEach(feature => {
        console.log(feature?.imageDisplayName || feature?.name || "Unnamed Feature");
      });
    } else {
      // If monster.features is a single object (not an array)
      console.log(monster.features?.imageDisplayName || monster.features?.name || "Unnamed Feature");
    }
    
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

    const distributeFeaturesByLength = (features, monster) => {
      if (!features || features.length === 0) return [[], []];
      if (features.length === 1) return [features, []];
      
      // For exactly 2 features, always put one in each column
      if (features.length === 2) {
        const multiattack = features.find(f => f.isMultiattack === true);
        const other = features.find(f => f.isMultiattack !== true);
        
        if (multiattack) {
          // Multiattack goes left, other goes right
          return [[multiattack], [other]];
        } else {
          // No multiattack, just split them
          return [[features[0]], [features[1]]];
        }
      }

      // Calculate text length for each feature
      const featuresWithLength = features.map(feature => {
        const name = feature.imageDisplayName || feature.name || '';
        const description = getActionString(feature, monster) || '';
        const totalLength = name.length + description.length;
        
        return {
          ...feature,
          textLength: totalLength
        };
      });

      console.log('Features with lengths:', featuresWithLength.map(f => ({
        name: f.name, 
        textLength: f.textLength
      })));

      // Separate Multiattack from other features
      const multiattack = featuresWithLength.find(f => f.isMultiattack === true);
      const otherFeatures = featuresWithLength.filter(f => f.isMultiattack !== true);

      // Start with even distribution of non-Multiattack features
      const half = Math.ceil(otherFeatures.length / 2);
      let leftColumn = otherFeatures.slice(0, half);
      let rightColumn = otherFeatures.slice(half);

      // Always put Multiattack at the top of left column if it exists
      if (multiattack) {
        leftColumn.unshift(multiattack);
      }

      // Calculate initial weights
      let leftLength = leftColumn.reduce((sum, f) => sum + f.textLength, 0);
      let rightLength = rightColumn.reduce((sum, f) => sum + f.textLength, 0);

      console.log('Initial distribution:', {
        left: leftColumn.map(f => ({name: f.name, length: f.textLength})),
        right: rightColumn.map(f => ({name: f.name, length: f.textLength})),
        leftTotal: leftLength,
        rightTotal: rightLength
      });

      // If right column is significantly heavier, try to balance by moving short items from right to left
      const movableFromRight = rightColumn.filter(f => f.isMultiattack !== true);
      const movableFromLeft = leftColumn.filter(f => f.isMultiattack !== true);

      // Sort potential moves by length (shortest first for better optimization)
      movableFromRight.sort((a, b) => a.textLength - b.textLength);
      movableFromLeft.sort((a, b) => b.textLength - a.textLength); // longest first when moving from left

      console.log('Movable features:', {
        fromRight: movableFromRight.map(f => ({name: f.name, length: f.textLength})),
        fromLeft: movableFromLeft.map(f => ({name: f.name, length: f.textLength}))
      });

      // Determine which direction to balance first
      const isLeftMuchHeavier = leftLength > rightLength * 1.5;
      const isRightMuchHeavier = rightLength > leftLength * 1.5;

      // If left is much heavier, move long items from left to right first
      if (isLeftMuchHeavier) {
        for (let feature of movableFromLeft.slice()) {
          const newLeftLength = leftLength - feature.textLength;
          const newRightLength = rightLength + feature.textLength;
          
          const currentImbalance = Math.abs(leftLength - rightLength);
          const newImbalance = Math.abs(newLeftLength - newRightLength);
          
          console.log(`Considering moving ${feature.name} from left to right:`, {
            currentImbalance,
            newImbalance,
            wouldImprove: newImbalance < currentImbalance,
            isLeftMuchHeavier: leftLength > rightLength * 1.5
          });
          
          if (newImbalance < currentImbalance) {
            console.log(`Moving ${feature.name} from left to right`);
            leftColumn = leftColumn.filter(f => f !== feature);
            rightColumn.push(feature);
            leftLength = newLeftLength;
            rightLength = newRightLength;
          }
        }
      }
      
      // Try moving short items from right to left to balance
      for (let feature of movableFromRight.slice()) { // Use slice() to avoid modifying array while iterating
        const newLeftLength = leftLength + feature.textLength;
        const newRightLength = rightLength - feature.textLength;
        
        // If this move improves balance, do it
        const currentImbalance = Math.abs(leftLength - rightLength);
        const newImbalance = Math.abs(newLeftLength - newRightLength);
        
        console.log(`Considering moving ${feature.name} from right to left:`, {
          currentImbalance,
          newImbalance,
          wouldImprove: newImbalance < currentImbalance,
          isRightMuchHeavier: rightLength > leftLength * 1.5
        });
        
        if (newImbalance < currentImbalance) { // Only move if it actually improves balance
          console.log(`Moving ${feature.name} from right to left`);
          
          // Remove from right, add to left (but after Multiattack if it exists)
          rightColumn = rightColumn.filter(f => f !== feature);
          if (multiattack) {
            leftColumn.splice(1, 0, feature); // Insert after Multiattack
          } else {
            leftColumn.unshift(feature); // Insert at beginning
          }
          leftLength = newLeftLength;
          rightLength = newRightLength;
        }
      }

      console.log('Final distribution:', {
        leftCount: leftColumn.length,
        rightCount: rightColumn.length,
        leftLength: leftLength,
        rightLength: rightLength,
        left: leftColumn.map(f => ({name: f.name})),
        right: rightColumn.map(f => ({name: f.name}))
      });

      return [leftColumn, rightColumn];
    };

    // Replace your existing distributeFeatures function with this:
    const distributeFeatures = (features, monster) => {
      return distributeFeaturesByLength(features, monster);
    };
    
    // Split features for two-column layout
    let [leftAbilities, rightAbilities] = useTwoColumns ? distributeFeatures(abilities, monster) : [abilities, []];
    let [leftActions, rightActions] = useTwoColumns ? distributeFeatures(actions, monster) : [actions, []];
    let [leftBonusActions, rightBonusActions] = useTwoColumns ? distributeFeatures(bonusActions, monster) : [bonusActions, []];
    let [leftReactions, rightReactions] = useTwoColumns ? distributeFeatures(reactions, monster) : [reactions, []];
    
    // Generate feature HTML for a single category
    const generateFeatureHtml = (features, category, showHeader = true) => {
      //console.log('Current State:', monster);
      if (!features || features.length === 0) return '';
      
      let header = '';
      if (showHeader && category !== 'Abilities') {
        header = `<h2 style="color: #7a200d; font-size: 18px; margin: 0; border-bottom: 1px solid #7a200d; padding-bottom: 4px; margin-bottom: 8px;">${category}</h2>`;
      }
      //<div style="margin-bottom: ${category === 'Abilities' ? '20px' : '10px'};">
      return `
        <div>
          ${header}
          ${features.map(feature => 
            `<p style="margin: 0;"><strong><em>${feature.imageDisplayName || feature.name}.</em></strong> ${getActionString(feature, monster)} </p>`
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

    const checkAndShowSizeWarning = async (useTwoColumns) => {
    try {
      console.log('Beginning Size Check');
      const elementToCapture = document.getElementById('stat-block-to-capture');
      if (!elementToCapture) return; // Element not ready yet
      
      const dpi = 300;
      const widthInches = useTwoColumns ? 6.5 : 3.25;
      const maxHeightInches = 9.75;
      const widthPixels = widthInches * dpi;
      
      // Capture at low scale just to measure
      const testCanvas = await html2canvas(elementToCapture, {
        backgroundColor: null,
        scale: 0.5, // Low scale for speed
        useCORS: true
      });
      
      // Calculate projected height
      const currentWidth = testCanvas.width;
      const currentHeight = testCanvas.height;
      const scaleFactor = widthPixels / currentWidth;
      const projectedHeightPixels = currentHeight * scaleFactor;
      const projectedHeightInches = projectedHeightPixels / dpi;

      console.log('projectedHeightInches', projectedHeightInches)
      
      // Show/hide warning
      let warningElement = document.getElementById('size-warning');
      if (projectedHeightInches > maxHeightInches) {
        console.log('Image is larger than max')
        if (!warningElement) {
          console.log('warningElement is false')
          warningElement = document.createElement('div');
          warningElement.id = 'size-warning';
          warningElement.style.cssText = `
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            text-align: center;
            font-size: 14px;
          `;
          // Try multiple ways to find the buttons container
          let buttonsContainer = document.getElementById('layout-toggle-button')?.parentNode;
          if (!buttonsContainer) {
            buttonsContainer = document.getElementById('download-button')?.parentNode;
          }
          if (!buttonsContainer) {
            // Fallback: find any div with text-align center
            buttonsContainer = Array.from(document.querySelectorAll('#monster-stat-block-modal div')).find(div => 
              div.style.textAlign === 'center'
            );
          }
          if (buttonsContainer) {
            buttonsContainer.insertBefore(warningElement, buttonsContainer.firstChild);
          } else {
            console.log('Could not find buttons container for warning');
          }
        }
        warningElement.innerHTML = `
          ⚠️ <strong>Warning:</strong> Image will be ${projectedHeightInches.toFixed(2)}" tall, exceeding the ${maxHeightInches}" limit.<br>
          Consider shortening descriptions or switching to ${useTwoColumns ? 'single' : 'two'} column layout.
        `;
      } else {
        // Remove warning if it exists and height is okay
        if (warningElement) {
          warningElement.remove();
        }
      }
    } catch (error) {
      console.log('Size check failed:', error); // Fail silently
    }
  };

  // Create stat block HTML
  const statBlockHtml = `
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
      <!-- Title Section -->
      <div style="margin-bottom: 10px;">
        <h1 style="color: #7a200d; font-size: 24px; margin: 0;">${monster.name || 'Unnamed Monster'}</h1>
        <p style="font-style: italic; margin: 0 0 8px 0;">
          ${monster.size} ${monster.creaturetype || 'Creature'}
        </p>
        <div style="border-bottom: 1px solid #7a200d;"></div>
      </div>
      
      <!-- Stats Section - Layout changes based on column preference -->
      ${useTwoColumns ? `
        <!-- Two Column Layout: Attributes on left, AC/HP/Speed on right -->
        <div style="display: flex; gap: 20px; margin-bottom: 15px;">
          <!-- Left side: Attributes Table -->
          <div style="flex: 1;">
            <!-- Headers Row -->
            <div style="display: flex; justify-content: center; margin-bottom: 8px;">
              <div style="width: 50px; text-align: center;"><strong></strong></div>
              <div style="width: 50px; text-align: center;"><strong>STR</strong></div>
              <div style="width: 50px; text-align: center;"><strong>DEX</strong></div>
              <div style="width: 50px; text-align: center;"><strong>CON</strong></div>
              <div style="width: 50px; text-align: center;"><strong>INT</strong></div>
              <div style="width: 50px; text-align: center;"><strong>WIS</strong></div>
              <div style="width: 50px; text-align: center;"><strong>CHA</strong></div>
            </div>
            
            <!-- Scores Row -->
            <div style="display: flex; justify-content: center;">
              <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0;"><strong>Score</strong></div>
              <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0; border-left: none;">${monster.attributes.str}</div>
              <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0; border-left: none;">${monster.attributes.dex}</div>
              <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0; border-left: none;">${monster.attributes.con}</div>
              <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0; border-left: none;">${monster.attributes.int}</div>
              <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0; border-left: none;">${monster.attributes.wis}</div>
              <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0; border-left: none;">${monster.attributes.cha}</div>
            </div>
            
            <!-- Modifiers Row -->
            <div style="display: flex; justify-content: center;">
              <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0; border-top: none;"><strong>Mod</strong></div>
              <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 6px 0;">${getModifier(monster.attributes.str)}</div>
              <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 6px 0;">${getModifier(monster.attributes.dex)}</div>
              <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 6px 0;">${getModifier(monster.attributes.con)}</div>
              <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 6px 0;">${getModifier(monster.attributes.int)}</div>
              <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 6px 0;">${getModifier(monster.attributes.wis)}</div>
              <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 6px 0;">${getModifier(monster.attributes.cha)}</div>
            </div>
            
            <!-- Saving Throws Row -->
            <div style="display: flex; justify-content: center;">
              <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0; border-top: none;"><strong>Save</strong></div>          
              <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 6px 0;">
                ${monster.savingThrows && monster.savingThrows.includes('str') ? 
                  (() => {
                    const mod = parseInt(getModifier(monster.attributes.str)) + monster.proficiencyBonus;
                    return mod >= 0 ? `+${mod}` : mod;
                  })() : '-'}
              </div>
              <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 3px 0;">
                ${monster.savingThrows && monster.savingThrows.includes('dex') ? 
                  (() => {
                    const mod = parseInt(getModifier(monster.attributes.dex)) + monster.proficiencyBonus;
                    return mod >= 0 ? `+${mod}` : mod;
                  })() : '-'}
              </div>
              <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 3px 0;">
                ${monster.savingThrows && monster.savingThrows.includes('con') ? 
                  (() => {
                    const mod = parseInt(getModifier(monster.attributes.con)) + monster.proficiencyBonus;
                    return mod >= 0 ? `+${mod}` : mod;
                  })() : '-'}
              </div>
              <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 3px 0;">
                ${monster.savingThrows && monster.savingThrows.includes('int') ? 
                  (() => {
                    const mod = parseInt(getModifier(monster.attributes.int)) + monster.proficiencyBonus;
                    return mod >= 0 ? `+${mod}` : mod;
                  })() : '-'}
              </div>
              <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 3px 0;">
                ${monster.savingThrows && monster.savingThrows.includes('wis') ? 
                  (() => {
                    const mod = parseInt(getModifier(monster.attributes.wis)) + monster.proficiencyBonus;
                    return mod >= 0 ? `+${mod}` : mod;
                  })() : '-'}
              </div>
              <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 3px 0;">
                ${monster.savingThrows && monster.savingThrows.includes('cha') ? 
                  (() => {
                    const mod = parseInt(getModifier(monster.attributes.cha)) + monster.proficiencyBonus;
                    return mod >= 0 ? `+${mod}` : mod;
                  })() : '-'}
              </div>
            </div>
          </div>
          
          <!-- Right side: AC, HP, Speed -->
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
            <p style="margin: 0 0 8px 0;"><strong>Armor Class</strong> ${monster.ac} ${monster.armorDescription ? `(${monster.armorDescription})` : ''}</p>
            <p style="margin: 0 0 8px 0;"><strong>Hit Points</strong> ${monster.hp} ${monster.hpFormula && monster.hpFormula !== monster.hp.toString() ? `(${monster.hpFormula})` : ''}</p>
            <p style="margin: 0 0 8px 0;"><strong>Speed</strong> ${formatSpeeds()}</p>
          </div>
        </div>
        <div style="border-bottom: 1px solid #7a200d; margin-bottom: 10px;"></div>
      ` : `
        <!-- Single Column Layout: Original stacked layout -->
        <div style="margin-bottom: 10px;">
          <p style="margin: 0;"><strong>Armor Class</strong> ${monster.ac} ${monster.armorDescription ? `(${monster.armorDescription})` : ''}</p>
          <p style="margin: 0;"><strong>Hit Points</strong> ${monster.hp} ${monster.hpFormula && monster.hpFormula !== monster.hp.toString() ? `(${monster.hpFormula})` : ''}</p>
          <p style="margin: 0 0 8px 0;"><strong>Speed</strong> ${formatSpeeds()}</p>
          <div style="border-bottom: 1px solid #7a200d;"></div>
        </div>
        <div style="margin-bottom: 15px;">
          <!-- Headers Row -->
          <div style="display: flex; justify-content: center; margin-bottom: 8px;">
            <div style="width: 50px; text-align: center;"><strong></strong></div>
            <div style="width: 50px; text-align: center;"><strong>STR</strong></div>
            <div style="width: 50px; text-align: center;"><strong>DEX</strong></div>
            <div style="width: 50px; text-align: center;"><strong>CON</strong></div>
            <div style="width: 50px; text-align: center;"><strong>INT</strong></div>
            <div style="width: 50px; text-align: center;"><strong>WIS</strong></div>
            <div style="width: 50px; text-align: center;"><strong>CHA</strong></div>
          </div>
          
          <!-- Scores Row -->
          <div style="display: flex; justify-content: center;">
            <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0;"><strong>Score</strong></div>
            <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0; border-left: none;">${monster.attributes.str}</div>
            <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0; border-left: none;">${monster.attributes.dex}</div>
            <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0; border-left: none;">${monster.attributes.con}</div>
            <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0; border-left: none;">${monster.attributes.int}</div>
            <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0; border-left: none;">${monster.attributes.wis}</div>
            <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0; border-left: none;">${monster.attributes.cha}</div>
          </div>
          
          <!-- Modifiers Row -->
          <div style="display: flex; justify-content: center;">
            <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0; border-top: none;"><strong>Mod</strong></div>
            <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 6px 0;">${getModifier(monster.attributes.str)}</div>
            <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 6px 0;">${getModifier(monster.attributes.dex)}</div>
            <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 6px 0;">${getModifier(monster.attributes.con)}</div>
            <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 6px 0;">${getModifier(monster.attributes.int)}</div>
            <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 6px 0;">${getModifier(monster.attributes.wis)}</div>
            <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 6px 0;">${getModifier(monster.attributes.cha)}</div>
          </div>
          
          <!-- Saving Throws Row -->
          <div style="display: flex; justify-content: center; margin-bottom: 8px;">
            <div style="width: 50px; text-align: center; border: 1px solid #999; padding: 6px 0; border-top: none;"><strong>Save</strong></div>          
            <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 6px 0;">
              ${monster.savingThrows && monster.savingThrows.includes('str') ? 
                (() => {
                  const mod = parseInt(getModifier(monster.attributes.str)) + monster.proficiencyBonus;
                  return mod >= 0 ? `+${mod}` : mod;
                })() : '-'}
            </div>
            <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 3px 0;">
              ${monster.savingThrows && monster.savingThrows.includes('dex') ? 
                (() => {
                  const mod = parseInt(getModifier(monster.attributes.dex)) + monster.proficiencyBonus;
                  return mod >= 0 ? `+${mod}` : mod;
                })() : '-'}
            </div>
            <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 3px 0;">
              ${monster.savingThrows && monster.savingThrows.includes('con') ? 
                (() => {
                  const mod = parseInt(getModifier(monster.attributes.con)) + monster.proficiencyBonus;
                  return mod >= 0 ? `+${mod}` : mod;
                })() : '-'}
            </div>
            <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 3px 0;">
              ${monster.savingThrows && monster.savingThrows.includes('int') ? 
                (() => {
                  const mod = parseInt(getModifier(monster.attributes.int)) + monster.proficiencyBonus;
                  return mod >= 0 ? `+${mod}` : mod;
                })() : '-'}
            </div>
            <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 3px 0;">
              ${monster.savingThrows && monster.savingThrows.includes('wis') ? 
                (() => {
                  const mod = parseInt(getModifier(monster.attributes.wis)) + monster.proficiencyBonus;
                  return mod >= 0 ? `+${mod}` : mod;
                })() : '-'}
            </div>
            <div style="width: 50px; text-align: center; border: 1px solid #999; border-top: none; border-left: none; background-color: #f5f5f5; padding: 3px 0;">
              ${monster.savingThrows && monster.savingThrows.includes('cha') ? 
                (() => {
                  const mod = parseInt(getModifier(monster.attributes.cha)) + monster.proficiencyBonus;
                  return mod >= 0 ? `+${mod}` : mod;
                })() : '-'}
            </div>
          </div>
          
          <!-- Bottom Separator Line -->
          <div style="padding-top: 4px;">
            <div style="height: 1px; background-color: #7a200d; margin-top: 8px;"></div>
          </div>
        </div>
      `}
      
      <!-- Additional Info Section -->
      <div style="margin-bottom: 10px;">
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
        
        <p style="margin: 0 0 8px 0;"><strong>Challenge Rating</strong> ${monster.cr} ${monster.xp ? `(${monster.xp} XP)` : ''}</p>
        <div style="border-bottom: 1px solid #7a200d;"></div>
      </div>
        
        <!-- Features and Actions Section -->
        ${useTwoColumns ? 
          `<div>
            <!-- Two column layout for Abilities (no header) -->
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
              <div style="flex: 1;">
                <!-- Abilities left column -->
                ${leftAbilities.length > 0 ? 
                  `<div>
                    ${leftAbilities.map(feature => 
                      `<p style="margin: 0;"><strong><em>${feature.imageDisplayName || feature.name}.</em></strong> ${getActionString(feature, monster)}</p>`
                    ).join('<br/>')}
                  </div>` : ''
                }
              </div>
              <div style="flex: 1;">
                <!-- Abilities right column -->
                ${rightAbilities.length > 0 ? 
                  `<div>
                    ${rightAbilities.map(feature => 
                      `<p style="margin: 0;"><strong><em>${feature.imageDisplayName || feature.name}.</em></strong> ${getActionString(feature, monster)}</p>`
                    ).join('<br/>')}
                  </div>` : ''
                }
              </div>
            </div>
            
            <!-- Actions section -->
            ${actions.length > 0 ? 
              `<div>
                <!-- Actions header (full width) -->
                <div style="margin-bottom: 10px;">
                  <h2 style="color: #7a200d; font-size: 18px; margin: 0 0 4px 0;">Actions</h2>
                  <div style="border-bottom: 1px solid #7a200d;"></div>
                </div>
                
                <!-- Actions content (two columns) -->
                <div style="display: flex; gap: 20px;">
                  <div style="flex: 1;">
                    ${leftActions.map(feature => {
                      return `<p style="margin: 0;"><strong><em>${feature.imageDisplayName || feature.name}.</em></strong> ${getActionString(feature, monster)}</p>`
                      }).join('<br/>')}
                  </div>
                  <div style="flex: 1;">
                    ${rightActions.map(feature => {
                      return `<p style="margin: 0;"><strong><em>${feature.imageDisplayName || feature.name}.</em></strong> ${getActionString(feature, monster)}</p>`
                    }).join('<br/>')}
                  </div>
                </div>
              </div>` : ''
            }
            
            <!-- Bonus Actions section -->
            ${bonusActions.length > 0 ? 
              `<div>
                <!-- Bonus Actions header (full width) -->
                <div style="margin-bottom: 10px;">
                  <h2 style="color: #7a200d; font-size: 18px; margin: 0 0 4px 0;">Bonus Actions</h2>
                  <div style="border-bottom: 1px solid #7a200d;"></div>
                </div>
                
                <!-- Bonus Actions content (two columns) -->
                <div style="display: flex; gap: 20px;">
                  <div style="flex: 1;">
                    ${leftBonusActions.map(feature => {
                      return `<p style="margin: 0;"><strong><em>${feature.imageDisplayName || feature.name}.</em></strong> ${getActionString(feature, monster)}</p>`
                      }).join('<br/>')}
                  </div>
                  <div style="flex: 1;">
                    ${rightBonusActions.map(feature => {
                      return `<p style="margin: 0;"><strong><em>${feature.imageDisplayName || feature.name}.</em></strong> ${getActionString(feature, monster)}</p>`
                      }).join('<br/>')}
                  </div>
                </div>
              </div>` : ''
            }
            
            <!-- Reactions section -->
            ${reactions.length > 0 ? 
              `<div>
                <!-- Reactions header (full width) -->
                <div style="margin-bottom: 10px;">
                  <h2 style="color: #7a200d; font-size: 18px; margin: 0 0 4px 0;">Reactions</h2>
                  <div style="border-bottom: 1px solid #7a200d;"></div>
                </div>
                
                <!-- Reactions content (two columns) -->
                <div style="display: flex; gap: 20px;">
                  <div style="flex: 1;">
                    ${leftReactions.map(feature => {
                      return `<p style="margin: 0;"><strong><em>${feature.imageDisplayName || feature.name}.</em></strong> ${getActionString(feature, monster)}</p>`
                      }).join('<br/>')}
                  </div>
                  <div style="flex: 1;">
                    ${rightReactions.map(feature => {
                      return `<p style="margin: 0;"><strong><em>${feature.imageDisplayName || feature.name}.</em></strong> ${getActionString(feature, monster)}</p>`
                      }).join('<br/>')}
                  </div>
                </div>
              </div>` : ''
            }
          </div>` : 
          `<div>
            ${abilities.length > 0 ? 
              `${abilities.map(feature => {
                      return `<p style="margin: 0;"><strong><em>${feature.imageDisplayName || feature.name}.</em></strong> ${getActionString(feature, monster)}</p>`
                      }).join('<br/>')}<br/>` : ''
            }
            
            ${actions.length > 0 ? 
              `<div style="margin-bottom: 10px;">
                <h2 style="color: #7a200d; font-size: 18px; margin: 0 0 4px 0;">Actions</h2>
                <div style="border-bottom: 1px solid #7a200d;"></div>
                <div style="margin-top: 8px;">
                  ${actions.map(action => 
                    `<p style="margin: 0;"><strong><em>${action.imageDisplayName || action.name}.</em></strong> ${getActionString(action, monster)}</p>`
                  ).join('<br/>')}
                </div>
              </div>` : ''
            }
            
            ${bonusActions.length > 0 ? 
              `<div style="margin-bottom: 10px;">
                <h2 style="color: #7a200d; font-size: 18px; margin: 0 0 4px 0;">Bonus Actions</h2>
                <div style="border-bottom: 1px solid #7a200d;"></div>
                <div style="margin-top: 8px;">
                  ${bonusActions.map(action => 
                    `<p style="margin: 0;"><strong><em>${action.imageDisplayName || action.name}.</em></strong> ${getActionString(action, monster)}</p>`
                  ).join('<br/>')}
                </div>
              </div>` : ''
            }
            
            ${reactions.length > 0 ? 
              `<div style="margin-bottom: 10px;">
                <h2 style="color: #7a200d; font-size: 18px; margin: 0 0 4px 0;">Reactions</h2>
                <div style="border-bottom: 1px solid #7a200d;"></div>
                <div style="margin-top: 8px;">
                  ${reactions.map(reaction => 
                    `<p style="margin: 0;"><strong><em>${reaction.imageDisplayName || reaction.name}.</em></strong> ${getActionString(reaction, monster)}</p>`
                  ).join('<br/>')}
                </div>
              </div>` : ''
            }
          </div>`
        }
      </div>
    `;


    
    // Set the HTML content of the stat block container
    statBlockContainer.innerHTML = statBlockHtml;
    
    // Add buttons for export and layout toggle
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.marginTop = '20px';
    buttonsContainer.style.textAlign = 'center';
    buttonsContainer.style.marginBottom = '15px';
    
    const layoutToggleButton = document.createElement('button');
    layoutToggleButton.id = 'layout-toggle-button';
    layoutToggleButton.textContent = useTwoColumns ? 'Switch to One Column' : 'Switch to Two Columns';
    layoutToggleButton.style.backgroundColor = '#4a76a8';
    layoutToggleButton.style.color = 'white';
    layoutToggleButton.style.border = 'none';
    layoutToggleButton.style.padding = '8px 16px';
    layoutToggleButton.style.marginRight = '10px';
    layoutToggleButton.style.borderRadius = '4px';
    layoutToggleButton.style.cursor = 'pointer';
    
    const downloadButton = document.createElement('button');
    downloadButton.id = 'download-button';
    downloadButton.textContent = 'Download Image';
    downloadButton.style.backgroundColor = '#7a200d';
    downloadButton.style.color = 'white';
    downloadButton.style.border = 'none';
    downloadButton.style.padding = '10px 20px';
    downloadButton.style.fontSize = '16px';
    downloadButton.style.borderRadius = '4px';
    downloadButton.style.cursor = 'pointer';
    
    buttonsContainer.appendChild(layoutToggleButton);
    buttonsContainer.appendChild(downloadButton);
    
    statBlockContainer.appendChild(buttonsContainer);
    
    // Add elements to DOM
    statBlockContainer.appendChild(closeButton);
    modal.appendChild(statBlockContainer);
    document.body.appendChild(modal);

    // Check size after modal is rendered
    setTimeout(() => {
      checkAndShowSizeWarning(useTwoColumns);
    }, 100);
        
    // Add click event to layout toggle button
    document.getElementById('layout-toggle-button').addEventListener('click', async () => {
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
        
        // Define dimensions based on column layout
        const dpi = 300;
        const widthInches = useTwoColumns ? 6.5 : 3.25;
        const maxHeightInches = 9.75;
        
        const widthPixels = widthInches * dpi;
        const maxHeightPixels = maxHeightInches * dpi;
        
        // First, capture at current scale to measure height
        const testCanvas = await html2canvas(elementToCapture, {
          backgroundColor: null,
          scale: 1,
          useCORS: true
        });
        
        // Calculate what the height would be at our target width
        const currentWidth = testCanvas.width;
        const currentHeight = testCanvas.height;
        const scaleFactor = widthPixels / currentWidth;
        const projectedHeightPixels = currentHeight * scaleFactor;
        const projectedHeightInches = projectedHeightPixels / dpi;
        
        // Create the final canvas with exact dimensions
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = widthPixels;
        finalCanvas.height = projectedHeightPixels;
        
        // Capture at high quality and scale to fit
        const highQualityCanvas = await html2canvas(elementToCapture, {
          backgroundColor: null,
          scale: 2, // High quality capture
          useCORS: true
        });
        
        // Draw scaled image to final canvas
        const ctx = finalCanvas.getContext('2d');
        ctx.fillStyle = '#fdf1dc'; // Match your background color
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.drawImage(highQualityCanvas, 0, 0, finalCanvas.width, finalCanvas.height);
        
        // Convert canvas to blob and download
        finalCanvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const layoutType = useTwoColumns ? 'two-column' : 'single-column';
          a.download = `${monster.name ? monster.name.toLowerCase().replace(/\s+/g, '-') : 'monster'}-stat-block-${layoutType}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          // Show success message
          alert(`Image downloaded successfully!\nSize: ${widthInches}" × ${projectedHeightInches.toFixed(2)}" at ${dpi} DPI`);
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