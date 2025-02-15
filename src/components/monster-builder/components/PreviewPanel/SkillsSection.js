// components/PreviewPanel/SkillsSection.js
import React from 'react';
import { Trash2 } from 'lucide-react';

export const SkillsSection = ({ 
  monster, 
  onDeleteExpertise, 
  onDeleteProficiency 
}) => {
  return (
    <div className="preview-section">
      <h3>Skills</h3>
      {monster.skills.map(skill => (
        <div key={skill} className="flex justify-between items-center">
          <span>
            {skill}
            {monster.expertise?.includes(skill) && (
              <span className="ml-2 text-green-600">(Expertise)</span>
            )}
          </span>
          <button
            onClick={() => {
              if (monster.expertise?.includes(skill)) {
                onDeleteExpertise(skill);
              } else {
                onDeleteProficiency(skill);
              }
            }}
            className="p-1 text-red-500 hover:text-red-700"
            aria-label={`Remove ${skill}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};