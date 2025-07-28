import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
  getFeatureId, 
  distributeFeatures, 
  distributeFeaturesByLength 
} from './StatBlockUtils';
import { generateStatBlockHtml } from './StatBlockHTMLGenerator';

/**
 * Component for generating and exporting D&D monster stat blocks as images
 * Supports toggling between one and two-column layouts with manual column control
 */
const StatBlockImageExporter = ({ monster }) => {
  console.log(monster);
  const statBlockRef = useRef(null);
  const twoColumnsRef = useRef(false);
  const manualColumnAssignmentsRef = useRef({
    actions: { left: [], right: [] },
    bonusActions: { left: [], right: [] },
    reactions: { left: [], right: [] }
  });
  const previewModeRef = useRef(true);

  /**
   * Move a feature between columns
   */
  const moveFeature = (feature, fromColumn, toColumn, categoryKey) => {
    const featureId = getFeatureId(feature);
    const assignments = manualColumnAssignmentsRef.current[categoryKey];
    
    assignments[fromColumn] = assignments[fromColumn].filter(id => id !== featureId);
    
    if (!assignments[toColumn].includes(featureId)) {
      assignments[toColumn].push(featureId);
    }
    
    regenerateModal();
  };

  /**
   * Move a feature up or down within its column
   */
  const moveFeatureVertical = (feature, column, direction, categoryKey) => {
    const featureId = getFeatureId(feature);
    const assignments = manualColumnAssignmentsRef.current[categoryKey];
    const columnArray = assignments[column];
    
    const currentIndex = columnArray.indexOf(featureId);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'up') {
      newIndex = Math.max(0, currentIndex - 1);
    } else {
      newIndex = Math.min(columnArray.length - 1, currentIndex + 1);
    }
    
    if (newIndex === currentIndex) return;
    
    columnArray.splice(currentIndex, 1);
    columnArray.splice(newIndex, 0, featureId);
    
    regenerateModal();
  };

  /**
   * Reset manual assignments for a category
   */
  const resetCategoryAssignments = (categoryKey) => {
    manualColumnAssignmentsRef.current[categoryKey] = { left: [], right: [] };
    regenerateModal();
  };

  /**
   * Regenerate the modal
   */
  const regenerateModal = () => {
    const currentModal = document.getElementById('monster-stat-block-modal');
    if (currentModal) {
      document.body.removeChild(currentModal);
      showStatBlockModal();
    }
  };

  /**
   * Setup global functions for button interactions
   */
  const setupGlobalFunctions = (actions, bonusActions, reactions) => {
    window.moveFeature = (featureId, fromColumn, toColumn, categoryKey) => {
      const allFeatures = [...actions, ...bonusActions, ...reactions];
      const feature = allFeatures.find(f => getFeatureId(f) === featureId);
      if (feature) {
        moveFeature(feature, fromColumn, toColumn, categoryKey);
      }
    };

    window.moveFeatureVertical = (featureId, column, direction, categoryKey) => {
      const allFeatures = [...actions, ...bonusActions, ...reactions];
      const feature = allFeatures.find(f => getFeatureId(f) === featureId);
      if (feature) {
        moveFeatureVertical(feature, column, direction, categoryKey);
      }
    };

    window.resetCategory = (categoryKey) => {
      resetCategoryAssignments(categoryKey);
    };
  };

  /**
   * Size warning check
   */
  const checkAndShowSizeWarning = async (useTwoColumns) => {
    try {
      const elementToCapture = document.getElementById('stat-block-to-capture');
      if (!elementToCapture) return;
      
      const dpi = 300;
      const widthInches = useTwoColumns ? 6.5 : 3.25;
      const maxHeightInches = 9.75;
      const widthPixels = widthInches * dpi;
      
      const testCanvas = await html2canvas(elementToCapture, {
        backgroundColor: null,
        scale: 0.5,
        useCORS: true
      });
      
      const currentWidth = testCanvas.width;
      const currentHeight = testCanvas.height;
      const scaleFactor = widthPixels / currentWidth;
      const projectedHeightPixels = currentHeight * scaleFactor;
      const projectedHeightInches = projectedHeightPixels / dpi;
      
      let warningElement = document.getElementById('size-warning');
      if (projectedHeightInches > maxHeightInches) {
        if (!warningElement) {
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
          
          let buttonsContainer = document.getElementById('layout-toggle-button')?.parentNode;
          if (!buttonsContainer) {
            buttonsContainer = document.getElementById('download-button')?.parentNode;
          }
          if (buttonsContainer) {
            buttonsContainer.insertBefore(warningElement, buttonsContainer.firstChild);
          }
        }
        warningElement.innerHTML = `
          ⚠️ <strong>Warning:</strong> Image will be ${projectedHeightInches.toFixed(2)}" tall, exceeding the ${maxHeightInches}" limit.<br>
          Consider shortening descriptions or switching to ${useTwoColumns ? 'single' : 'two'} column layout.
        `;
      } else {
        if (warningElement) {
          warningElement.remove();
        }
      }
    } catch (error) {
      console.log('Size check failed:', error);
    }
  };

  /**
   * Generate and show the stat block modal
   */
  const showStatBlockModal = () => {
    const useTwoColumns = twoColumnsRef.current;
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'monster-stat-block-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
    `;
    
    // Create container
    const statBlockContainer = document.createElement('div');
    statBlockContainer.style.cssText = `
      padding: 20px;
      background-color: white;
      border-radius: 5px;
      max-width: 90%;
      max-height: 90%;
      overflow: auto;
      position: relative;
    `;
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      border: none;
      background: none;
      font-size: 20px;
      cursor: pointer;
    `;
    closeButton.onclick = () => document.body.removeChild(modal);

    // Filter and sort features
const abilities = monster.features ? 
  monster.features
    .filter(f => f.category === 'Abilities' && f.isHidden !== true)
    .map(feature => {
      // Check if this is a Spellcasting ability that needs fixing
      if (feature.name === 'Spellcasting' && 
          feature.description && 
          !feature.description.includes('spell attack bonus')) {
        
        // Create a copy of the feature to avoid mutating the original
        const updatedFeature = { ...feature };

        const abilityMap = {
          'Intelligence': 'int',
          'Wisdom': 'wis',
          'Charisma': 'cha'
        };

        // Varibles
        const abilityScore = monster.attributes[abilityMap[feature.spellcasting.ability]];
        const abilityMod = Math.floor((abilityScore - 10) / 2);
        const spellAttackBonus = abilityMod + monster.proficiencyBonus;
        const spellSaveDC = 8 + spellAttackBonus;
        
        // Find and replace the spellcasting ability sentence
        const spellcastingAbilityRegex = /Its spellcasting ability is (\w+)\./;
        const match = updatedFeature.description.match(spellcastingAbilityRegex);
        
        if (match) {
          const spellcastingAbility = match[1];
          const oldSentence = match[0];
          const newSentence = `Its spellcasting ability is ${spellcastingAbility} (spell attack bonus: +${spellAttackBonus}, spell save DC: ${spellSaveDC}).`;
          
          updatedFeature.description = updatedFeature.description.replace(oldSentence, newSentence);
        }
        
        return updatedFeature;
      }
      
      // Return the feature unchanged if it doesn't need fixing
      return feature;
    }) : [];

    const actions = monster.features ? 
      monster.features
        .filter(f => f.category === 'Actions')
        .sort((a, b) => {
          if (a.isMultiattack === true) return -1;
          if (b.isMultiattack === true) return 1;
          return 0;
        }) : [];
        
    const bonusActions = monster.features ? 
      monster.features.filter(f => f.category === 'Bonus Actions') : [];
    const reactions = monster.features ? 
      monster.features.filter(f => f.category === 'Reactions') : [];
    
    // Distribute features
    let [leftAbilities, rightAbilities] = useTwoColumns ? 
      distributeFeaturesByLength(abilities, monster) : [abilities, []];
    let [leftActions, rightActions] = useTwoColumns ? 
      distributeFeatures(actions, 'actions', monster, manualColumnAssignmentsRef.current) : [actions, []];
    let [leftBonusActions, rightBonusActions] = useTwoColumns ? 
      distributeFeatures(bonusActions, 'bonusActions', monster, manualColumnAssignmentsRef.current) : [bonusActions, []];
    let [leftReactions, rightReactions] = useTwoColumns ? 
      distributeFeatures(reactions, 'reactions', monster, manualColumnAssignmentsRef.current) : [reactions, []];
    
    // Setup global functions
    setupGlobalFunctions(actions, bonusActions, reactions);

    // Generate HTML
    const statBlockHtml = generateStatBlockHtml(
      monster, 
      useTwoColumns, 
      previewModeRef.current,
      leftAbilities, 
      rightAbilities, 
      leftActions, 
      rightActions, 
      leftBonusActions, 
      rightBonusActions, 
      leftReactions, 
      rightReactions
    );
    
    statBlockContainer.innerHTML = statBlockHtml;
    
    // Add control buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      margin-top: 20px;
      text-align: center;
      margin-bottom: 15px;
    `;
    
    const layoutToggleButton = document.createElement('button');
    layoutToggleButton.id = 'layout-toggle-button';
    layoutToggleButton.textContent = useTwoColumns ? 'Switch to One Column' : 'Switch to Two Columns';
    layoutToggleButton.style.cssText = `
      background-color: #4a76a8;
      color: white;
      border: none;
      padding: 8px 16px;
      margin-right: 10px;
      border-radius: 4px;
      cursor: pointer;
    `;
    
    const downloadButton = document.createElement('button');
    downloadButton.id = 'download-button';
    downloadButton.textContent = 'Download Image';
    downloadButton.style.cssText = `
      background-color: #7a200d;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 16px;
      border-radius: 4px;
      cursor: pointer;
    `;
    
    buttonsContainer.appendChild(layoutToggleButton);
    buttonsContainer.appendChild(downloadButton);
    statBlockContainer.appendChild(buttonsContainer);
    statBlockContainer.appendChild(closeButton);
    modal.appendChild(statBlockContainer);
    document.body.appendChild(modal);

    // Check size warning
    setTimeout(() => checkAndShowSizeWarning(useTwoColumns), 100);
        
    // Layout toggle event
    layoutToggleButton.addEventListener('click', () => {
      twoColumnsRef.current = !twoColumnsRef.current;
      document.body.removeChild(modal);
      showStatBlockModal();
    });
    
    // Download event
    downloadButton.addEventListener('click', async () => {
      try {
        // Switch to export mode
        previewModeRef.current = false;
        document.body.removeChild(modal);
        showStatBlockModal();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const elementToCapture = document.getElementById('stat-block-to-capture');
        const dpi = 300;
        const widthInches = useTwoColumns ? 6.5 : 3.25;
        const widthPixels = widthInches * dpi;
        
        // Capture and process
        const testCanvas = await html2canvas(elementToCapture, {
          backgroundColor: null,
          scale: 1,
          useCORS: true
        });
        
        const currentWidth = testCanvas.width;
        const currentHeight = testCanvas.height;
        const scaleFactor = widthPixels / currentWidth;
        const projectedHeightPixels = currentHeight * scaleFactor;
        const projectedHeightInches = projectedHeightPixels / dpi;
        
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = widthPixels;
        finalCanvas.height = projectedHeightPixels;
        
        const highQualityCanvas = await html2canvas(elementToCapture, {
          backgroundColor: null,
          scale: 2,
          useCORS: true
        });
        
        const ctx = finalCanvas.getContext('2d');
        ctx.fillStyle = '#fdf1dc';
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.drawImage(highQualityCanvas, 0, 0, finalCanvas.width, finalCanvas.height);
        
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
          
          alert(`Image downloaded successfully!\nSize: ${widthInches}" × ${projectedHeightInches.toFixed(2)}" at ${dpi} DPI`);
          
          // Switch back to preview mode
          previewModeRef.current = true;
          const currentModal = document.getElementById('monster-stat-block-modal');
          if (currentModal) {
            document.body.removeChild(currentModal);
            showStatBlockModal();
          }
        }, 'image/png');
      } catch (error) {
        console.error('Error generating image:', error);
        alert('Failed to generate image. See console for details.');
        
        previewModeRef.current = true;
        const currentModal = document.getElementById('monster-stat-block-modal');
        if (currentModal) {
          document.body.removeChild(currentModal);
          showStatBlockModal();
        }
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
      disabled={!monster.name}
    >
      Export Image
    </button>
  );
};

export default StatBlockImageExporter;