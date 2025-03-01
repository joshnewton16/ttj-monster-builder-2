import React from 'react';
import { Check } from 'lucide-react';

export function FeaturePointsSummary({ 
  totalPoints, 
  availablePoints, 
  hasFirstAction, 
  hasFirstFeature,
  magicPoints 
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
      {magicPoints && magicPoints.total > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="font-medium text-blue-700">Magic Points</div>
            <div className="text-sm">
              <span className="font-semibold">{magicPoints.total - magicPoints.used}</span> / {magicPoints.total} points available
            </div>
          </div>
          <div className="text-sm text-gray-600">
            For basic spells and magical abilities
          </div>
        </div>
      )}
    </div>
  );
}