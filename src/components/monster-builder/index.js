import React, { useState } from 'react';
import { BasicInfo } from './components/BasicInfo';
import { Attributes } from './components/Attributes';
import { Proficiencies } from './components/Proficiencies';
import { ActionsFeatures } from './components/ActionsFeatures';
import { FeaturePoints } from './components/FeaturePoints';
import PreviewPanel from './components/PreviewPanel';

const initialMonsterState = {
  name: '',
  cr: 0,
  baseArmorType: 'Natural Armor',
  customAC: 0,
  ac: 10,
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
    str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8
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

  function calculateModifier(attributeValue) {
    return Math.floor((attributeValue - 10) / 2);
  }

  function handleCRChange(newCR) {
    const profBonus = Math.floor((newCR - 1) / 4) + 2;
    let attrPoints = 10;
    if (newCR >= 2 && newCR <= 5) attrPoints = 20;
    if (newCR >= 6 && newCR <= 8) attrPoints = 30;
    if (newCR >= 9 && newCR <= 12) attrPoints = 40;
    if (newCR >= 13 && newCR <= 15) attrPoints = 50;
    if (newCR > 15) attrPoints = 60;
    
    setMonster(prev => ({
      ...prev,
      cr: newCR,
      proficiencyBonus: profBonus
    }));
    setAvailablePoints(attrPoints);
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
              availablePoints={availablePoints}
              setAvailablePoints={setAvailablePoints}
            />
          );
        case 3:
          return <Proficiencies monster={monster} setMonster={setMonster} />;
        case 4:
          return <ActionsFeatures monster={monster} setMonster={setMonster} />;
        case 5:
          return <FeaturePoints monster={monster} setMonster={setMonster} />;
        default:
          return null;
      }
    };

    // Only show the preview panel in steps 4 and 5
    return (
      <div className={step >= 2 ? 'actions-features-container' : ''}>
        <div className={step >= 2 ? 'selection-panel' : ''}>
          {stepContent()}
        </div>
        {step >= 2 && <PreviewPanel monster={monster} setMonster={setMonster} setStep={setStep}/>}
      </div>
    );
  }

  return (
    <div className="monster-builder">
      <div className="space-y-6">
        {renderStep()}
        <div className="flex justify-start gap-32 mt-1">
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
    </div>
  );
}

export default MonsterBuilder;