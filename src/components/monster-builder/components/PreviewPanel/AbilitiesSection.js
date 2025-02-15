// components/PreviewPanel/AbilitiesSection.js
import React from 'react';
import { Trash2 } from 'lucide-react';

export const AbilitiesSection = ({ 
  features, 
  setStep,
  onDeleteFeature
}) => {
  const renderFeature = (feature, index) => {
    const globalIndex = features.findIndex(f => f === feature);
    
    return (
      <div key={index} className="preview-item">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <strong>{feature.name}.</strong> {feature.description}
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

  return (
    <div className="preview-section mb-4">
      <h3 onClick={() => setStep(4)} className="cursor-pointer hover:text-blue-600">
        Abilities
      </h3>
      {features.map((feature, index) => 
        renderFeature(feature, index)
      )}
    </div>
  );
};