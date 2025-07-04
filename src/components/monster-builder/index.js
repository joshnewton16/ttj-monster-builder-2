import React, { useState } from 'react';
import { BasicInfo } from './components/BasicInfo';
import { Attributes } from './components/Attributes';
import { Proficiencies } from './components/Proficiencies';
import { ActionsFeatures } from './components/ActionsFeatures';
import PreviewPanel from './components/PreviewPanel';
import MarkdownExporter from './components/MarkdownExporter'; // Import markdown exporter
import StateExport from './components/StateExport';
import StateImport from './components/StateImport';
import StatBlockImageExporter from './components/StatBlockImageExporter'; // Import image exporter

const initialMonsterState = {
  name: '',
  cr: 0,
  creaturetype: '',
  baseArmorType: 'Natural Armor',
  customAC: 0,
  ac: 13,
  acText: '',
  diceNotation: '',
  hp: 0,
  hpFormula: '',
  proficiencyBonus: 2,
  size: 'Medium',
  speed: [
          { type: 'Walk', value: 0 },
          { type: 'Fly', value: 0 },
          { type: 'Swim', value: 0 },
          { type: 'Climb', value: 0 },
          { type: 'Burrow', value: 0 }
        ],
  attributes: {
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10
  },
  savingThrows: [],
  skills: [],
  languages: [],
  features: []
};

function MonsterBuilder() {
  const [step, setStep] = useState(1);
  const [availablePoints, setAvailablePoints] = useState(10);
  const [monster, setMonster] = useState(initialMonsterState);
  const [maxPointsForCR, setMaxPointsForCR] = useState(10);
  
  // NEW: Add editing state
  const [editingFeature, setEditingFeature] = useState(null);

  // NEW: Edit handler
  const handleEditFeature = (feature, globalIndex) => {
    console.log('handleEditFeature called!', feature, globalIndex);
    const allowedCategories = ['Actions', 'Bonus Actions', 'Reactions'];
    if (!allowedCategories.includes(feature.category)) {
      return;
    }

    const featureType = feature.spellDetails ? 'spell' : 'non-spell';
    console.log('Feature type determined:', featureType);

    setEditingFeature({
      feature,
      globalIndex,
      type: featureType
    });
    
    console.log('Setting step to 4');
    // Navigate to ActionsFeatures step
    setStep(4);
  };

  // NEW: Update feature function
  const updateFeatureAtIndex = (globalIndex, updatedFeatureData) => {
    setMonster(prevMonster => ({
      ...prevMonster,
      features: prevMonster.features.map((feature, index) => 
        index === globalIndex ? { ...feature, ...updatedFeatureData } : feature
      )
    }));
    setEditingFeature(null);
  };

// In your parent component where CR is changed, modify the handleCRChange function

function handleCRChange(newCR) {
  const profBonus = Math.floor((newCR - 1) / 4) + 2;
  
  // Calculate max attribute points based on CR
  let maxAttrPoints = 10;
  if (newCR >= 2 && newCR <= 5) maxAttrPoints = 20;
  if (newCR >= 6 && newCR <= 8) maxAttrPoints = 25;
  if (newCR >= 9 && newCR <= 12) maxAttrPoints = 30;
  if (newCR >= 13 && newCR <= 15) maxAttrPoints = 35;
  if (newCR > 15) maxAttrPoints = 40;
  
  // Update the monster's CR and proficiency bonus
  setMonster(prev => ({
    ...prev,
    cr: newCR,
    proficiencyBonus: profBonus
  }));
  
  // Store the maxAttrPoints in state to pass to the Attributes component
  setMaxPointsForCR(maxAttrPoints);
}

  function renderStep() {
    const stepContent = () => {
      
      switch (step) {
        case 1:
          return <BasicInfo monster={monster} setMonster={setMonster} onCRChange={handleCRChange} />;
        case 2:
          return (
            <Attributes 
              monster={monster} 
              setMonster={setMonster}
            />
          );
        case 3:
          return <Proficiencies monster={monster} setMonster={setMonster} />;
        case 4:
          //console.log(monster);
          return (
            <ActionsFeatures 
              monster={monster} 
              setMonster={setMonster}
              // NEW: Pass editing props to ActionsFeatures
              editingFeature={editingFeature}
              setEditingFeature={setEditingFeature}
              updateFeatureAtIndex={updateFeatureAtIndex}
            />
          );
        default:
          return null;
      }
    };

    // Only show the preview panel in steps 2 and higher
    return (
      <div className={step >= 2 ? 'actions-features-container' : ''} style={{ 
          display: step >= 2 ? 'flex' : 'block',
          width: '100%',
          gap: '20px',
          justifyContent: 'space-between'
        }}>
        <div className={step >= 2 ? 'selection-panel' : ''} style={{ 
          flex: '1 1 65%', 
          maxWidth: '65%'
        }}>
          {stepContent()}

          <div className="flex justify-start gap-4 mt-6 mb-4">
            {/* Add Export buttons */}
            <MarkdownExporter monster={monster} />
            <StateExport monster={monster} />
            <StateImport setMonster={setMonster} />
            <StatBlockImageExporter monster={monster} />
     
          </div>
          <div className="flex justify-start gap-4 mt-6 mb-4 outline-double p-4">
            <button
              className="nav-button prev-button"
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              disabled={step === 1}
            >
              Previous
            </button>
            <button
              className="nav-button next-button"
              onClick={() => setStep(prev => Math.min(5, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
        {step >= 2 && (
          <div className="preview-container" style={{ 
            flex: '1 1 35%',
            height: 'calc(100vh - 120px)', 
            overflowY: 'auto',
            position: 'sticky',
            top: '20px',
            borderLeft: '1px solid #e5e7eb',
            paddingLeft: '20px',
            marginBottom: '20px',
            boxSizing: 'border-box'
          }}>
            <PreviewPanel 
              monster={monster} 
              setMonster={setMonster} 
              setStep={setStep}
              // NEW: Pass edit handler to PreviewPanel
              onEditFeature={handleEditFeature}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="monster-builder" style={{ maxWidth: '1400px', width: '90%', margin: '0 auto' }}>
      <div className="space-y-6" style={{ width: '100%' }}>
        {renderStep()}
      </div>
    </div>
  );
}

export default MonsterBuilder;