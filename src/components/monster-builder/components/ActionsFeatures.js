import React, { useState } from 'react';
import { SRD_ACTIONS, SRD_FEATURES } from '../constants/srd-data';
import { Check } from 'lucide-react';

export function ActionsFeatures({ monster, setMonster }) {
  const [actionTitle, setActionTitle] = useState('');
  const [actionDescription, setActionDescription] = useState('');
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  const [selectedFeatureAction, setSelectedFeatureAction] = useState('');
  const [selectedAttackToModify, setSelectedAttackToModify] = useState('');
  const [secondaryDamageType, setSecondaryDamageType] = useState('');

  // Calculate total and available feature points
  function calculateFeaturePoints(cr, proficiencyBonus) {
    return (cr || 0) + (proficiencyBonus || 0);
  }

  const totalFeaturePoints = calculateFeaturePoints(monster.cr, monster.proficiencyBonus);
  const usedFeaturePoints = monster.features.reduce((total, feature) => {
    // Only count feature points for non-primary features
    if (feature.costFeaturePoint && !feature.isFirst) total += 1;
    return total;
  }, 0);
  const availableFeaturePoints = totalFeaturePoints - usedFeaturePoints;

  // Check if first action/feature exists
  const hasFirstAction = monster.features.some(f => f.category === 'Actions' && f.isFirst);
  const hasFirstFeature = monster.features.some(f => f.category === 'Abilities' && f.isFirst);

  // Check for existing multiattack and get its count
  const existingMultiattack = monster.features.find(f => f.isMultiattack);
  const multiattackCount = existingMultiattack ? existingMultiattack.attackCount - 1 : 0;

  const handleActionSelect = (e) => {
    const selectedAction = SRD_ACTIONS[e.target.value];
    if (selectedAction) {
      setActionTitle(selectedAction.name);
      
      if (selectedAction.damage && (selectedAction.useStr || selectedAction.useDex)) {
        try {
          const [dice, ...damageType] = selectedAction.damage.split(' ');
          const modifier = selectedAction.useStr ? '+STR' : '+DEX';
          const damageText = `${dice} ${modifier} ${damageType.join(' ')}`;
          setActionDescription(`${selectedAction.type} - ${damageText}`);
        } catch (error) {
          console.error('Error processing damage:', error);
          setActionDescription(selectedAction.type || '');
        }
      } else {
        setActionDescription(selectedAction.type || '');
      }
    }
  };

  const handleFeatureSelect = (e) => {
    const selectedFeature = SRD_FEATURES[e.target.value];
    if (selectedFeature) {
      setFeatureTitle(selectedFeature.name);
      setFeatureDescription(selectedFeature.description);
    }
  };

  const handleFeatureActionSelect = (e) => {
    setSelectedFeatureAction(e.target.value);
    // Reset other selections when changing action type
    setSelectedAttackToModify('');
    setSecondaryDamageType('');
  };

  const handleAddAction = () => {
    if (!actionTitle || !actionDescription) return;
    
    const srdAction = SRD_ACTIONS.find(a => a.name === actionTitle);
    
    const newAction = {
      name: actionTitle,
      category: 'Actions',
      type: srdAction?.type || 'Custom',
      damage: srdAction?.damage || '',
      useStr: srdAction?.useStr || false,
      useDex: srdAction?.useDex || false,
      description: actionDescription,
      isFirst: !hasFirstAction,
      costFeaturePoint: hasFirstAction // Only cost a point if not the first action
    };

    setMonster(prev => ({
      ...prev,
      features: [...prev.features, newAction]
    }));
  
    setActionTitle('');
    setActionDescription('');
  };

  const handleAddFeature = () => {
    if (!featureTitle || !featureDescription) return;
    
    const newFeature = {
      name: featureTitle,
      category: 'Abilities',
      description: featureDescription,
      isFirst: !hasFirstFeature,
      costFeaturePoint: hasFirstFeature // Only cost a point if not the first feature
    };

    setMonster(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));

    setFeatureTitle('');
    setFeatureDescription('');
  };

  const handleFeatureActionSubmit = () => {
    if (!selectedFeatureAction || availableFeaturePoints <= 0) return;

    switch (selectedFeatureAction) {
      case 'multiattack':
        if (multiattackCount >= 2) return; // Max 2 additional attacks
        
        if (existingMultiattack) {
          // Update existing multiattack
          setMonster(prev => ({
            ...prev,
            features: prev.features.map(feature => {
              if (feature.isMultiattack) {
                return {
                  ...feature,
                  attackCount: feature.attackCount + 1,
                  description: `${monster.name} attacks ${feature.attackCount + 1} times per round.`,
                  costFeaturePoint: true
                };
              }
              return feature;
            })
          }));
        } else {
          // Create new multiattack
          const newMultiattack = {
            name: 'Multiattack',
            category: 'Actions',
            description: `${monster.name} attacks twice per round.`,
            isMultiattack: true,
            attackCount: 2,
            costFeaturePoint: true
          };
          
          setMonster(prev => ({
            ...prev,
            features: [...prev.features, newMultiattack]
          }));
        }
        break;

      case 'modifyDamage':
        if (!selectedAttackToModify || !secondaryDamageType) return;
        
        setMonster(prev => ({
          ...prev,
          features: prev.features.map(feature => {
            if (feature.name === selectedAttackToModify) {
              return {
                ...feature,
                secondaryDamage: {
                  type: secondaryDamageType,
                  costFeaturePoint: true
                }
              };
            }
            return feature;
          })
        }));
        break;

      case 'doubleDamage':
        if (!selectedAttackToModify) return;
        
        setMonster(prev => ({
          ...prev,
          features: prev.features.map(feature => {
            if (feature.name === selectedAttackToModify) {
              return {
                ...feature,
                doubleDamage: true,
                costFeaturePoint: true
              };
            }
            return feature;
          })
        }));
        break;
    }

    // Reset selections after submission
    setSelectedFeatureAction('');
    setSelectedAttackToModify('');
    setSecondaryDamageType('');
  };

  // Get all existing attacks that can be modified
  const existingAttacks = monster.features.filter(f => 
    f.category === 'Actions' && f.damage && !f.isMultiattack
  );

  return (
    <div className="space-y-1">
      <h2 className="text-xl font-bold">Actions and Features</h2>
      <div className="bg-gray-100 p-1 rounded">
        <h3 className="font-semibold mb-2">Available Choices:</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center">
            <span className="font-medium">Actions:</span> 1
            {hasFirstAction && <Check size={16} className="ml-1 text-green-500" />}
          </div>
          <div className="flex items-center">
            <span className="font-medium">Features:</span> 1
            {hasFirstFeature && <Check size={16} className="ml-1 text-green-500" />}
          </div>
          <div>
            <span className="font-medium">Feature Points:</span>{' '}
            {availableFeaturePoints} / {totalFeaturePoints}
          </div>
        </div>
      </div>

      {/* Feature Point Actions */}
      <div className="space-y-2">
        <h3 className="font-semibold">Feature Point Actions</h3>
        <select 
          className="w-full p-2 border rounded"
          value={selectedFeatureAction}
          onChange={handleFeatureActionSelect}
        >
          <option value="">Select Feature Point Action...</option>
          <option value="multiattack" disabled={multiattackCount >= 2}>
            Add Multiattack ({2 - multiattackCount} remaining)
          </option>
          <option value="modifyDamage">Add Secondary Damage Type</option>
          <option value="doubleDamage">Double Attack Damage</option>
        </select>

        {(selectedFeatureAction === 'modifyDamage' || selectedFeatureAction === 'doubleDamage') && (
          <select
            className="w-full p-2 border rounded"
            value={selectedAttackToModify}
            onChange={(e) => setSelectedAttackToModify(e.target.value)}
          >
            <option value="">Select Attack to Modify...</option>
            {existingAttacks.map((attack, index) => (
              <option key={index} value={attack.name}>
                {attack.name}
              </option>
            ))}
          </select>
        )}

        {selectedFeatureAction === 'modifyDamage' && selectedAttackToModify && (
          <select
            className="w-full p-2 border rounded"
            value={secondaryDamageType}
            onChange={(e) => setSecondaryDamageType(e.target.value)}
          >
            <option value="">Select Secondary Damage Type...</option>
            <option value="acid">Acid</option>
            <option value="cold">Cold</option>
            <option value="fire">Fire</option>
            <option value="force">Force</option>
            <option value="lightning">Lightning</option>
            <option value="necrotic">Necrotic</option>
            <option value="poison">Poison</option>
            <option value="psychic">Psychic</option>
            <option value="radiant">Radiant</option>
            <option value="thunder">Thunder</option>
          </select>
        )}

        {selectedFeatureAction && (
          <button 
            onClick={handleFeatureActionSubmit}
            disabled={
              availableFeaturePoints <= 0 ||
              (selectedFeatureAction === 'modifyDamage' && (!selectedAttackToModify || !secondaryDamageType)) ||
              (selectedFeatureAction === 'doubleDamage' && !selectedAttackToModify) ||
              (selectedFeatureAction === 'multiattack' && multiattackCount >= 2)
            }
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Apply Feature Point Action
          </button>
        )}
      </div>

      {/* Regular Actions Section */}
      <div className="space-y-2">
        <h3 className="font-semibold">Action</h3>
        <select 
          className="w-full p-2 border rounded"
          onChange={handleActionSelect}
          value=""
        >
          <option value="">Select an Action Template...</option>
          {SRD_ACTIONS.map((action, index) => (
            <option key={index} value={index}>
              {action.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={actionTitle}
          onChange={(e) => setActionTitle(e.target.value)}
          placeholder="Action Title"
          className="w-full p-2 border rounded"
        />

        <textarea
          value={actionDescription}
          onChange={(e) => setActionDescription(e.target.value)}
          placeholder="Action Description"
          className="w-full p-2 border rounded h-16"
        />

        <button 
          onClick={handleAddAction}
          disabled={!actionTitle || !actionDescription || availableFeaturePoints <= 0}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Add Action
        </button>
      </div>

      {/* Regular Features Section */}
      <div className="space-y-2">
        <h3 className="font-semibold">Feature</h3>
        <select 
          className="w-full p-2 border rounded"
          onChange={handleFeatureSelect}
          value=""
        >
          <option value="">Select a Feature Template...</option>
          {SRD_FEATURES.map((feature, index) => (
            <option key={index} value={index}>
              {feature.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={featureTitle}
          onChange={(e) => setFeatureTitle(e.target.value)}
          placeholder="Feature Title"
          className="w-full p-2 border rounded"
        />

        <textarea
          value={featureDescription}
          onChange={(e) => setFeatureDescription(e.target.value)}
          placeholder="Feature Description"
          className="w-full p-2 border rounded h-16"
        />

        <button 
          onClick={handleAddFeature}
          disabled={!featureTitle || !featureDescription || availableFeaturePoints <= 0}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Add Feature
        </button>
      </div>
    </div>
  );
}