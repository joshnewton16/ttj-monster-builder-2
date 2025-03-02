import React from 'react';

export function MultiattackAction({ multiattackCount, onSubmit }) {
  const handleSubmit = () => {
    // Create the multiattack feature with the proper category
    const multiattackFeature = {
      name: 'Multiattack',
      description: `The creature makes ${multiattackCount + 2} attacks on its turn.`,
      category: 'Actions', // Explicitly set category to "Actions"
      isMultiattack: true,
      attackCount: multiattackCount + 2
    };
    
    onSubmit(multiattackFeature);
  };

  return (
    <button 
      onClick={handleSubmit}
      disabled={multiattackCount >= 2}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
    >
      Add Additional Attack ({2 - multiattackCount} remaining)
    </button>
  );
}