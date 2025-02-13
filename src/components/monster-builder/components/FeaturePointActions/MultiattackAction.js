import React from 'react';

export function MultiattackAction({ multiattackCount, onSubmit }) {
  return (
    <button 
      onClick={onSubmit}
      disabled={multiattackCount >= 2}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
    >
      Add Additional Attack ({2 - multiattackCount} remaining)
    </button>
  );
}