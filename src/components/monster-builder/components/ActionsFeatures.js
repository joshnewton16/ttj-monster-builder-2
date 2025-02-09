// ActionsFeatures.js
import React from 'react';
import { SRD_ACTIONS, SRD_FEATURES } from '../constants/srd-data';

export function ActionsFeatures({ monster, setMonster }) {
  function calculateModifier(attributeValue) {
    return Math.floor((attributeValue - 10) / 2);
  }

  return (
    <div>
      <h2>Base Actions & Features</h2>
      <div className="space-y-4">
        <div>
          <h3>Select Base Action</h3>
          <select
            className="w-full p-2 border rounded mb-2"
            value={monster.baseAction?.name || ''}
            onChange={e => {
              if (e.target.value === 'custom') {
                setMonster(prev => ({
                  ...prev,
                  baseAction: { name: '', type: '', damage: '', description: '' }
                }));
              } else {
                const action = SRD_ACTIONS.find(a => a.name === e.target.value);
                setMonster(prev => ({ ...prev, baseAction: action }));
              }
            }}
          >
            <option value="">Select an action...</option>
            {SRD_ACTIONS.map(action => {
              const strMod = calculateModifier(monster.attributes.str);
              const dexMod = calculateModifier(monster.attributes.dex);
              const mod = action.useDex ? dexMod : (action.useStr ? strMod : 0);
              const modString = mod >= 0 ? `+${mod}` : mod;
              // Split the damage string into dice and damage type
              const [dice, ...damageType] = action.damage.split(' ');
              return (
                <option key={action.name} value={action.name}>
                  {action.name} ({dice}{modString} {damageType.join(' ')})
                </option>
              );
            })}
            <option value="custom">Custom Action</option>
          </select>

          {monster.baseAction && monster.baseAction.name === '' && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Action Name"
                className="w-full p-2 border rounded"
                value={monster.baseAction.name}
                onChange={e => setMonster(prev => ({
                  ...prev,
                  baseAction: { ...prev.baseAction, name: e.target.value }
                }))}
              />
              <input
                type="text"
                placeholder="Attack Type (e.g., Melee Weapon Attack)"
                className="w-full p-2 border rounded"
                value={monster.baseAction.type}
                onChange={e => setMonster(prev => ({
                  ...prev,
                  baseAction: { ...prev.baseAction, type: e.target.value }
                }))}
              />
              <input
                type="text"
                placeholder="Damage (e.g., 1d8 slashing)"
                className="w-full p-2 border rounded"
                value={monster.baseAction.damage}
                onChange={e => setMonster(prev => ({
                  ...prev,
                  baseAction: { ...prev.baseAction, damage: e.target.value }
                }))}
              />
              <textarea
                placeholder="Description"
                className="w-full p-2 border rounded"
                value={monster.baseAction.description}
                onChange={e => setMonster(prev => ({
                  ...prev,
                  baseAction: { ...prev.baseAction, description: e.target.value }
                }))}
              />
            </div>
          )}
        </div>

        <div>
          <h3>Select Base Feature</h3>
          <select
            className="w-full p-2 border rounded mb-2"
            value={monster.baseFeature?.name || ''}
            onChange={e => {
              if (e.target.value === 'custom') {
                setMonster(prev => ({
                  ...prev,
                  baseFeature: { name: '', description: '' }
                }));
              } else {
                const feature = SRD_FEATURES.find(f => f.name === e.target.value);
                setMonster(prev => ({ ...prev, baseFeature: feature }));
              }
            }}
          >
            <option value="">Select a feature...</option>
            {SRD_FEATURES.map(feature => (
              <option key={feature.name} value={feature.name}>
                {feature.name}
              </option>
            ))}
            <option value="custom">Custom Feature</option>
          </select>

          {monster.baseFeature && monster.baseFeature.name === '' && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Feature Name"
                className="w-full p-2 border rounded"
                value={monster.baseFeature.name}
                onChange={e => setMonster(prev => ({
                  ...prev,
                  baseFeature: { ...prev.baseFeature, name: e.target.value }
                }))}
              />
              <textarea
                placeholder="Description"
                className="w-full p-2 border rounded"
                value={monster.baseFeature.description}
                onChange={e => setMonster(prev => ({
                  ...prev,
                  baseFeature: { ...prev.baseFeature, description: e.target.value }
                }))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}