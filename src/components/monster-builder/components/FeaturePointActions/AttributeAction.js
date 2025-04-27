// components/FeaturePointActions/AttributeAction.js
import React from 'react';

export function AttributeAction({ monster, onSubmit, availablePoints }) {
  // Calculate spent points (how many points above base value 8 have been spent)
  const calculateSpentPoints = () => {
    return Object.values(monster.attributes).reduce((total, value) => {
      return total + (value - 8); // 8 is the base attribute value
    }, 0);
  };

  // Get attribute feature points
  const featurePoints = monster.attributePointsFromFeatures || 0;
  
  // Function to handle adding attribute points
  const handleAddAttributePoints = () => {
    // Check if user has enough feature points (cost is 1)
    if (availablePoints >= 1) {
      // Calculate new attributePointsFromFeatures value
      const newAttributePoints = featurePoints + 2;
      
      // Prepare data for submission
      const attributeData = {
        attributePointsFromFeatures: newAttributePoints
      };
      //console.log('Current State', monster);
      //console.log('availablePoints: ', availablePoints);
      //console.log('newAttributePoints: ', newAttributePoints);
      //console.log('attributeData: ', attributeData);
      // Submit the data
      onSubmit(attributeData);
    }
  };

  return (
    <div className="p-4 border rounded mt-4">
      <h3 className="font-semibold mb-4">Add Attribute Points</h3>
      
      <div className="bg-gray-50 p-3 mb-4 rounded">
        <div className="mb-2">
          <span className="font-medium">Current Attribute Points from Features:</span> 
          <span className="ml-1">{featurePoints}</span>
        </div>
        <div>
          <span className="font-medium">Total Spent Attribute Points:</span> 
          <span className="ml-1">{calculateSpentPoints()}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-700">
          Spending 1 Feature Point will add 2 Attribute Points to your pool.
          You can distribute these points among your six attributes in the Attributes section.
        </p>
      </div>
      
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        onClick={handleAddAttributePoints}
        disabled={availablePoints < 1}
      >
        Add 2 Attribute Points (Cost: 1 Feature Point)
      </button>
    </div>
  );
}