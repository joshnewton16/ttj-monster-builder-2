import React from 'react';

export function AttributeAction({ onSubmit }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Adds 2 attribute points to your available points pool.
      </p>
      <button
        onClick={() => onSubmit()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        Add Attribute Points
      </button>
    </div>
  );
}