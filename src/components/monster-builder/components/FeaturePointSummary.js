import React from 'react';
import { Check } from 'lucide-react';

export function FeaturePointsSummary({ 
  totalPoints, 
  availablePoints, 
  hasFirstAction, 
  hasFirstFeature 
}) {
  return (
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
          {availablePoints} / {totalPoints}
        </div>
      </div>
    </div>
  );
}