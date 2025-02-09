import React, { useState } from 'react';
import { BasicInfo } from './components/BasicInfo';
import { Attributes } from './components/Attributes';
import { Proficiencies } from './components/Proficiencies';
import { ActionsFeatures } from './components/ActionsFeatures';
import { FeaturePoints } from './components/FeaturePoints';

const initialMonsterState = {
  name: '',
  cr: 1,
  proficiencyBonus: 2,
  size: 'Medium',
  attributes: {
    str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8
  },
  savingThrows: [],
  skills: [],
  languages: [],
  baseAction: null,
  baseFeature: null,
  additionalActions: [],
  additionalFeatures: []
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

  // Preview Panel Component
  const PreviewPanel = () => {
    const getActionString = (action) => {
      if (!action) return null;
      const strMod = calculateModifier(monster.attributes.str);
      const dexMod = calculateModifier(monster.attributes.dex);
      const mod = action.useDex ? dexMod : (action.useStr ? strMod : 0);
      const modString = mod >= 0 ? `+${mod}` : mod;
      
      // Split the damage string into dice and damage type
      const [dice, ...damageType] = action.damage.split(' ');
      return `${action.type}: ${dice}${modString} ${damageType.join(' ')}`;
    };

    return (
      <div className="preview-panel">
        <h2>Monster Features</h2>
        {/* Basic Info Section */}
        <div className="preview-section">
          <h3>Basic Info</h3>
          <div>Name: {monster.name}</div>
          <div>CR: {monster.cr}</div>
          <div>Proficiency Bonus: {monster.proficiencyBonus}</div>
          <div>AC: {monster.acText}</div>
          <div>HP: {monster.hp}</div>
          <div>Movement: {monster.speed.type}: {monster.speed.value}</div>
        </div>
        
        {/* Abilities Section */}
        <div className="preview-section">
          <h3>Abilities</h3>
          {monster.baseFeature && (
            <div className="preview-item">
              <strong>{monster.baseFeature.name}.</strong> {monster.baseFeature.description}
            </div>
          )}
          {monster.additionalFeatures?.map((feature, index) => (
            <div key={index} className="preview-item">
              <strong>{feature.name}.</strong> {feature.description}
            </div>
          ))}
        </div>

        {/* Actions Section */}
        <div className="preview-section">
          <h3>Actions</h3>
          {monster.baseAction && (
            <div className="preview-item">
              <strong>{monster.baseAction.name}.</strong> {getActionString(monster.baseAction)}
              {monster.baseAction.description && <div>{monster.baseAction.description}</div>}
            </div>
          )}
          {monster.additionalActions?.map((action, index) => (
            <div key={index} className="preview-item">
              <strong>{action.name}.</strong> {getActionString(action)}
              {action.description && <div>{action.description}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

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
        {step >= 2 && <PreviewPanel />}
      </div>
    );
  }

  return (
    <div className="monster-builder">
      <div className="space-y-6">
        {renderStep()}
        <div className="flex justify-between mt-4">
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