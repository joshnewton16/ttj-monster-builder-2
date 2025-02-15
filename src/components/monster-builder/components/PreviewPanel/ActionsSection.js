// components/PreviewPanel/ActionsSection.js
import React from 'react';
import { Trash2 } from 'lucide-react';
import { getFeaturesByCategory, getActionString } from './utils';

export const ActionsSection = ({ 
  monster, 
  setStep,
  onDeleteFeature
}) => {
  const renderFeature = (feature, index) => {
    const globalIndex = monster.features.findIndex(f => f === feature);
    
    return (
      <div key={index} className="preview-item">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <strong>{feature.name}.</strong> {getActionString(feature, monster, globalIndex)}
            {feature.isFirst && (
              <span className="ml-2 text-sm text-green-600">(Primary)</span>
            )}
          </div>
          <button
            onClick={() => onDeleteFeature(feature, globalIndex)}
            className="p-1 text-red-500 hover:text-red-700"
            aria-label="Delete feature"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  const renderMultiattack = (feature) => {
    const globalIndex = monster.features.findIndex(f => f === feature);
    
    return (
      <div className="preview-item">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <strong>Multiattack.</strong> {feature.description}
          </div>
          <button
            onClick={() => onDeleteFeature(feature, globalIndex)}
            className="p-1 text-red-500 hover:text-red-700"
            aria-label="Delete multiattack"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="preview-section">
      <h3 onClick={() => setStep(4)} className="cursor-pointer hover:text-blue-600">
        Actions
      </h3>
      {monster.features.find(f => f.isMultiattack) && 
        renderMultiattack(monster.features.find(f => f.isMultiattack))
      }
      {getFeaturesByCategory(monster.features, 'Actions')
        .filter(f => !f.isMultiattack)
        .map((feature, index) => renderFeature(feature, index)
      )}
    </div>
  );
};