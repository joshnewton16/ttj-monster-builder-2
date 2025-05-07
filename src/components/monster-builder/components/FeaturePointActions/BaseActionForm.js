import React, { useState, useEffect } from 'react';
import { SRD_ACTIONS } from '../../constants/srd-data';

export function BaseActionForm({ 
  onSubmit, 
  availablePoints, 
  hasFirstAction,
  isLegendary = false,
  legendaryActions = []
}) {
  const [actionTitle, setActionTitle] = useState('');
  const [actionDescription, setActionDescription] = useState('');
  const [actionType, setActionType] = useState('Actions');
  
  // New state for attack properties
  const [attackType, setAttackType] = useState('melee');
  const [damageDice, setDamageDice] = useState('1d6');
  const [damageType, setDamageType] = useState('slashing');
  const [doesNotDealDamage, setDoesNotDealDamage] = useState(false);

  const handleActionSelect = (e) => {
    const actions = isLegendary ? legendaryActions : SRD_ACTIONS;
    const selectedAction = actions[e.target.value];
    if (selectedAction) {
      setActionTitle(selectedAction.name);
      
      if (selectedAction.damage && (selectedAction.useStr || selectedAction.useDex)) {
        try {
          const [dice, ...damageType] = selectedAction.damage.split(' ');
          const modifier = selectedAction.useStr ? '+STR' : '+DEX';
          const damageText = `${dice} ${modifier} ${damageType.join(' ')}`;
          setActionDescription(`${selectedAction.type} - ${damageText}`);
          
          // Set the form values based on the selected action
          setAttackType(selectedAction.useStr ? 'melee' : 'ranged');
          if (dice.match(/\d+d\d+/)) {
            setDamageDice(dice);
          }
          setDamageType(damageType.join(' ') || 'slashing');
        } catch (error) {
          console.error('Error processing damage:', error);
          setActionDescription(selectedAction.type || '');
        }
      } else {
        setActionDescription(selectedAction.type || '');
      }
    }
  };

  // Update description when attack properties change
  useEffect(() => {
    if (!doesNotDealDamage && attackType && damageDice && damageType) {
      let modifier;
      if (attackType === 'melee') {
        modifier = '+STR';
      } else if (attackType === 'melee-dex') {
        modifier = '+DEX';
      } else if (attackType === 'ranged') {
        modifier = '+DEX';
      }
      
      const damageText = `${damageDice} ${modifier} ${damageType}`;
      // Always update the description when attack properties change
      const attackTypeText = attackType === 'melee' || attackType === 'melee-dex' ? 'Melee' : 'Ranged';
      setActionDescription(`${attackTypeText} Weapon Attack - ${damageText}`);
    } else if (doesNotDealDamage) {
      // Optionally set a default description for non-damaging actions
      setActionDescription('');
    }
  }, [attackType, damageDice, damageType, doesNotDealDamage]);

  const handleSubmit = () => {
    if (!actionTitle || !actionDescription) return;
    
    const actions = isLegendary ? legendaryActions : SRD_ACTIONS;
    const srdAction = actions.find(a => a.name === actionTitle);
    
    let newAction = {
      name: actionTitle,
      category: isLegendary ? 'Legendary' : actionType,
      type: srdAction?.type || 'Custom',
      damage: doesNotDealDamage ? '' : `${damageDice} ${damageType}`,
      useStr: !doesNotDealDamage && attackType === 'melee',
      useDex: !doesNotDealDamage && (attackType === 'ranged' || attackType === 'melee-dex'),
      description: actionDescription,
    };

    // Handle feature point costs and isFirst flag
    if (isLegendary) {
      newAction.costFeaturePoint = true;
      newAction.isFirst = false;
      newAction.featurePointCost = 2;  // Set the cost to 2 points
    } else if (actionType === 'Actions') {
      newAction.isFirst = !hasFirstAction;
      newAction.costFeaturePoint = hasFirstAction;
    } else {
      newAction.isFirst = false;
      newAction.costFeaturePoint = true;
    }

    onSubmit(newAction);
    setActionTitle('');
    setActionDescription('');
    setActionType('Actions');
    setAttackType('melee');
    setDamageDice('1d6');
    setDamageType('slashing');
    setDoesNotDealDamage(false);
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">
        {isLegendary ? 'Legendary Action' : 'Action'}
      </h3>
      
      {/* Only show action type toggle for non-legendary actions */}
      {!isLegendary && (
        <div className="flex space-x-2 mb-4">
          <button
            className={`px-3 py-1 rounded ${
              actionType === 'Actions'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setActionType('Actions')}
          >
            Action
          </button>
          <button
            className={`px-3 py-1 rounded ${
              actionType === 'Bonus Actions'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setActionType('Bonus Actions')}
          >
            Bonus Action
          </button>
          <button
            className={`px-3 py-1 rounded ${
              actionType === 'Reactions'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setActionType('Reactions')}
          >
            Reaction
          </button>
        </div>
      )}
      <div>
        <select 
          className="w-1/2 p-2 border rounded"
          onChange={handleActionSelect}
          value=""
        >
          <option value="">
            {isLegendary ? 'Select a Legendary Action Template...' : 'Select an Action Template...'}
          </option>
          {(isLegendary ? legendaryActions : SRD_ACTIONS).map((action, index) => (
            <option key={index} value={index}>
              {action.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <input
          type="text"
          value={actionTitle}
          onChange={(e) => setActionTitle(e.target.value)}
          placeholder={isLegendary ? "Legendary Action Title" : "Action Title"}
          className="w-1/2 p-2 border rounded"
        />
      </div>
      
      {/* New attack properties form section */}
      <div className="p-3 border rounded bg-gray-50">
        <h4 className="font-medium mb-2">Attack Properties</h4>
        {/* Does not deal damage checkbox */}
        <div className="mb-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={doesNotDealDamage}
              onChange={(e) => setDoesNotDealDamage(e.target.checked)}
              className="h-4 w-4"
            />
            <span>Does not deal damage</span>
          </label>
        </div>

        {!doesNotDealDamage && (
          <div className="grid grid-cols-3 gap-2">
            {/* Attack Type */}
            <div>
              <label className="block text-sm mb-1">Attack Type</label>
              <select
                value={attackType}
                onChange={(e) => {
                  setAttackType(e.target.value);
                  // Immediately trigger description update handled in useEffect
                }}
                className="w-full p-2 border rounded"
              >
                <option value="melee">Melee (STR)</option>
                <option value="melee-dex">Melee (DEX)</option>
                <option value="ranged">Ranged (DEX)</option>
              </select>
            </div>
            
            {/* Damage Dice */}
            <div>
              <label className="block text-sm mb-1">Damage Dice</label>
              <select
                value={damageDice}
                onChange={(e) => {
                  setDamageDice(e.target.value);
                  // Immediately trigger description update handled in useEffect
                }}
                className="w-full p-2 border rounded"
              >
                <option value="1d4">1d4</option>
                <option value="1d6">1d6</option>
                <option value="1d8">1d8</option>
                <option value="1d10">1d10</option>
                <option value="1d12">1d12</option>
                <option value="2d6">2d6</option>
                <option value="2d8">2d8</option>
              </select>
            </div>
            
            {/* Damage Type */}
            <div>
              <label className="block text-sm mb-1">Damage Type</label>
              <select
                value={damageType}
                onChange={(e) => {
                  setDamageType(e.target.value);
                  // Immediately trigger description update handled in useEffect
                }}
                className="w-full p-2 border rounded"
              >
                <option value="bludgeoning">Bludgeoning</option>
                <option value="piercing">Piercing</option>
                <option value="slashing">Slashing</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      <div>
        <textarea
          value={actionDescription}
          onChange={(e) => setActionDescription(e.target.value)}
          placeholder={isLegendary ? "Legendary Action Description" : "Action Description"}
          className="w-1/2 p-2 border rounded h-16"
        />
      </div>
      <button 
        onClick={handleSubmit}
        disabled={!actionTitle || !actionDescription || availablePoints < (isLegendary ? 2 : 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        Add {isLegendary ? 'Legendary Action' : actionType.slice(0, -1)}
      </button>
    </div>
  );
}