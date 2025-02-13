import React, { useState } from 'react';
import { SRD_FEATURES } from '../constants/srd-data';

export function BaseFeatureForm({ onSubmit, availablePoints, hasFirstFeature }) {
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');

  const handleFeatureSelect = (e) => {
    const selectedFeature = SRD_FEATURES[e.target.value];
    if (selectedFeature) {
      setFeatureTitle(selectedFeature.name);
      setFeatureDescription(selectedFeature.description);
    }
  };

  const handleSubmit = () => {
    if (!featureTitle || !featureDescription) return;
    
    const newFeature = {
      name: featureTitle,
      category: 'Abilities',
      description: featureDescription,
      isFirst: !hasFirstFeature,
      costFeaturePoint: hasFirstFeature
    };

    onSubmit(newFeature);
    setFeatureTitle('');
    setFeatureDescription('');
  };

  return (
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
        onClick={handleSubmit}
        disabled={!featureTitle || !featureDescription || availablePoints <= 0}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        Add Feature
      </button>
    </div>
  );
}