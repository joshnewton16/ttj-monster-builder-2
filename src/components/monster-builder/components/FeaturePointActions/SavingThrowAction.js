// components/FeaturePointActions/AttributeAction.js
import React from 'react';

export function SavingThrowAction({ monster, onSubmit, availablePoints }) {
  // Calculate spent points (how many points above base value 8 have been spent)
  const calculateSpentPoints = () => {
    return Object.values(monster.savingThrows).reduce((total, value) => {
      return total + value;
    }, 0);
  };

  // Get saving throw feature points
  const featurePoints = monster.savingThrowsFromFeatures || 0;
  
  // Function to handle adding attribute points
  const handleAddSavingThrows = () => {
    // Check if user has enough feature points (cost is 1)
    if (availablePoints >= 1) {
      // Calculate new attributePointsFromFeatures value
      const newSavingThrowPoints = featurePoints + 1;
      
      // Prepare data for submission
      const savingThrowData = {
        savingThrowsFromFeatures: newSavingThrowPoints
      };
      console.log('Current State', monster);
      console.log('availablePoints: ', availablePoints);
      console.log('newSavingThrowPoints: ', newSavingThrowPoints);
      console.log('savingThrowData: ', savingThrowData);
      // Submit the data
      onSubmit(savingThrowData);
      console.log('Current State', monster);
    }
  };

  return (
    <div className="p-4 border rounded mt-4">
      <h3 className="font-semibold mb-4">Add Saving Throw</h3>
      
{/*       <div className="bg-gray-50 p-3 mb-4 rounded">
        <div className="mb-2">
          <span className="font-medium">Current Attribute Points from Features:</span> 
          <span className="ml-1">{featurePoints}</span>
        </div>
        <div>
          <span className="font-medium">Total Spent Attribute Points:</span> 
          <span className="ml-1">{calculateSpentPoints()}</span>
        </div>
      </div> */}
      
      <div className="mb-4">
        <p className="text-sm text-gray-700">
          Spending 1 Feature Point will add 1 Saving Throw to your pool.
        </p>
      </div>
      
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        onClick={handleAddSavingThrows}
        disabled={availablePoints < 1}
      >
        Add 1 Saving Throw (Cost: 1 Feature Point)
      </button>
    </div>
  );
}