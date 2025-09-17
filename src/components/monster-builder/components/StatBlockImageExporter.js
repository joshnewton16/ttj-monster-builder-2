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
 * Supports one-column, two-column, and compact card layouts with manual column control
 */
const StatBlockImageExporter = ({ monster }) => {
  
  const statBlockRef = useRef(null);
  const layoutModeRef = useRef('single'); // 'single', 'two-column', 'compact'
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
   * Get layout dimensions based on current layout mode
   */
  const getLayoutDimensions = () => {
    const mode = layoutModeRef.current;
    switch (mode) {
      case 'single':
        return { widthInches: 3.25, maxHeightInches: 9.75 };
      case 'two-column':
        return { widthInches: 6.5, maxHeightInches: 9.75 };
      case 'compact':
        return { widthInches: 3.0, maxHeightInches: 5.0 }; // 3x5 card
      default:
        return { widthInches: 3.25, maxHeightInches: 9.75 };
    }
  };

  /**
   * Size warning check
   */
  const checkAndShowSizeWarning = async () => {
    try {
      const elementToCapture = document.getElementById('stat-block-to-capture');
      if (!elementToCapture) return;
      
      const dpi = 300;
      const { widthInches, maxHeightInches } = getLayoutDimensions();
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
          
          let buttonsContainer = document.getElementById('layout-buttons')?.parentNode;
          if (!buttonsContainer) {
            buttonsContainer = document.getElementById('download-button')?.parentNode;
          }
          if (buttonsContainer) {
            buttonsContainer.insertBefore(warningElement, buttonsContainer.firstChild);
          }
        }
        const currentMode = layoutModeRef.current;
        const suggestions = {
          'single': 'two-column or compact',
          'two-column': 'single or compact',
          'compact': 'single or two-column'
        };
        warningElement.innerHTML = `
          ⚠️ <strong>Warning:</strong> Image will be ${projectedHeightInches.toFixed(2)}" tall, exceeding the ${maxHeightInches}" limit for ${currentMode} layout.<br>
          Consider shortening descriptions or switching to ${suggestions[currentMode]} layout.
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
   * Generate and show the stat block modal with current settings
   */
  const showStatBlockModal = () => {
    const layoutMode = layoutModeRef.current;
    const useTwoColumns = layoutMode === 'two-column';
    const useCompactLayout = layoutMode === 'compact';

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
    
    const actions = monster.features ? 
      monster.features
        .filter(f => f.category === 'Actions')
        .sort((a, b) => {
          if (a.isMultiattack === true) return -1;
          if (b.isMultiattack === true) return 1;
          return 0;
        }) : [];
        
    const bonusActions = monster.features ? monster.features.filter(f => f.category === 'Bonus Actions') : [];
    const reactions = monster.features ? monster.features.filter(f => f.category === 'Reactions') : [];
    
    // Split features based on layout mode
    let leftAbilities, rightAbilities, leftActions, rightActions, leftBonusActions, rightBonusActions, leftReactions, rightReactions;
    
    if (useCompactLayout) {
      // Compact layout: all abilities in left, all actions/bonus/reactions in right
      leftAbilities = abilities;
      rightAbilities = [];
      leftActions = [];
      rightActions = actions;
      leftBonusActions = [];
      rightBonusActions = bonusActions;
      leftReactions = [];
      rightReactions = reactions;
    } else if (useTwoColumns) {
      // Two-column layout: distribute normally
      [leftAbilities, rightAbilities] = distributeFeaturesByLength(abilities, monster);
      [leftActions, rightActions] = distributeFeatures(actions, 'actions', monster, manualColumnAssignmentsRef.current);
      [leftBonusActions, rightBonusActions] = distributeFeatures(bonusActions, 'bonusActions', monster, manualColumnAssignmentsRef.current);
      [leftReactions, rightReactions] = distributeFeatures(reactions, 'reactions', monster, manualColumnAssignmentsRef.current);
    } else {
      // Single column: everything in left column
      leftAbilities = abilities;
      rightAbilities = [];
      leftActions = actions;
      rightActions = [];
      leftBonusActions = bonusActions;
      rightBonusActions = [];
      leftReactions = reactions;
      rightReactions = [];
    }
    
    // Setup global functions
    setupGlobalFunctions(actions, bonusActions, reactions);

    // Generate stat block HTML - we'll need to modify generateStatBlockHtml to support compact layout
    const statBlockHtml = generateStatBlockHtml(
      monster, 
      useTwoColumns || useCompactLayout, // Pass true for any multi-column layout
      previewModeRef.current, 
      leftAbilities, 
      rightAbilities, 
      leftActions, 
      rightActions, 
      leftBonusActions, 
      rightBonusActions, 
      leftReactions, 
      rightReactions,
      useCompactLayout // Add this parameter to indicate compact mode
    );
    
    // Set the HTML content of the stat block container
    statBlockContainer.innerHTML = statBlockHtml;
    
    // Add buttons for export and layout toggle
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.marginTop = '20px';
    buttonsContainer.style.textAlign = 'center';
    buttonsContainer.style.marginBottom = '15px';
    
    // Layout mode buttons
    const layoutButtonsContainer = document.createElement('div');
    layoutButtonsContainer.id = 'layout-buttons';
    layoutButtonsContainer.style.marginBottom = '10px';
    
    const singleColumnButton = document.createElement('button');
    singleColumnButton.textContent = 'Single Column';
    singleColumnButton.style.backgroundColor = layoutMode === 'single' ? '#2d5a87' : '#4a76a8';
    singleColumnButton.style.color = 'white';
    singleColumnButton.style.border = 'none';
    singleColumnButton.style.padding = '8px 16px';
    singleColumnButton.style.margin = '0 5px';
    singleColumnButton.style.borderRadius = '4px';
    singleColumnButton.style.cursor = 'pointer';
    
    const twoColumnButton = document.createElement('button');
    twoColumnButton.textContent = 'Two Column';
    twoColumnButton.style.backgroundColor = layoutMode === 'two-column' ? '#2d5a87' : '#4a76a8';
    twoColumnButton.style.color = 'white';
    twoColumnButton.style.border = 'none';
    twoColumnButton.style.padding = '8px 16px';
    twoColumnButton.style.margin = '0 5px';
    twoColumnButton.style.borderRadius = '4px';
    twoColumnButton.style.cursor = 'pointer';
    
    const compactButton = document.createElement('button');
    compactButton.textContent = 'Compact Card';
    compactButton.style.backgroundColor = layoutMode === 'compact' ? '#2d5a87' : '#4a76a8';
    compactButton.style.color = 'white';
    compactButton.style.border = 'none';
    compactButton.style.padding = '8px 16px';
    compactButton.style.margin = '0 5px';
    compactButton.style.borderRadius = '4px';
    compactButton.style.cursor = 'pointer';
    
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
    
    layoutButtonsContainer.appendChild(singleColumnButton);
    layoutButtonsContainer.appendChild(twoColumnButton);
    layoutButtonsContainer.appendChild(compactButton);
    
    buttonsContainer.appendChild(layoutButtonsContainer);
    buttonsContainer.appendChild(downloadButton);
    
    statBlockContainer.appendChild(buttonsContainer);
    
    // Add elements to DOM
    statBlockContainer.appendChild(closeButton);
    modal.appendChild(statBlockContainer);
    document.body.appendChild(modal);

    // Check size after modal is rendered
    setTimeout(() => {
      checkAndShowSizeWarning();
    }, 100);
    
    // Add click events for layout buttons
    singleColumnButton.addEventListener('click', () => {
      if (layoutModeRef.current !== 'single') {
        layoutModeRef.current = 'single';
        document.body.removeChild(document.getElementById('monster-stat-block-modal'));
        showStatBlockModal();
      }
    });
    
    twoColumnButton.addEventListener('click', () => {
      if (layoutModeRef.current !== 'two-column') {
        layoutModeRef.current = 'two-column';
        document.body.removeChild(document.getElementById('monster-stat-block-modal'));
        showStatBlockModal();
      }
    });
    
    compactButton.addEventListener('click', () => {
      if (layoutModeRef.current !== 'compact') {
        layoutModeRef.current = 'compact';
        document.body.removeChild(document.getElementById('monster-stat-block-modal'));
        showStatBlockModal();
      }
    });
    
    // Add click event to download button
    document.getElementById('download-button').addEventListener('click', async () => {
      try {
        // Switch to export mode (hide buttons)
        previewModeRef.current = false;
        
        // Regenerate the modal without buttons
        const currentModal = document.getElementById('monster-stat-block-modal');
        if (currentModal) {
          document.body.removeChild(currentModal);
          showStatBlockModal();
        }
        
        // Wait a moment for the modal to render
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const elementToCapture = document.getElementById('stat-block-to-capture');
        
        // Define dimensions based on layout mode
        const dpi = 300;
        const { widthInches } = getLayoutDimensions();
        const widthPixels = widthInches * dpi;
        
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
          scale: 2,
          useCORS: true
        });
        
        // Draw scaled image to final canvas
        const ctx = finalCanvas.getContext('2d');
        ctx.fillStyle = '#fdf1dc';
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.drawImage(highQualityCanvas, 0, 0, finalCanvas.width, finalCanvas.height);
        
        // Convert canvas to blob and download
        finalCanvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const layoutType = layoutModeRef.current;
          a.download = `${monster.name ? monster.name.toLowerCase().replace(/\s+/g, '-') : 'monster'}-stat-block-${layoutType}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          alert(`Image downloaded successfully!\nSize: ${widthInches}" × ${projectedHeightInches.toFixed(2)}" at ${dpi} DPI`);
          
          // Switch back to preview mode (show buttons)
          previewModeRef.current = true;
          
          // Regenerate the modal with buttons
          const currentModal = document.getElementById('monster-stat-block-modal');
          if (currentModal) {
            document.body.removeChild(currentModal);
            showStatBlockModal();
          }
        }, 'image/png');
      } catch (error) {
        console.error('Error generating image:', error);
        alert('Failed to generate image. See console for details.');
        
        // Switch back to preview mode on error
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