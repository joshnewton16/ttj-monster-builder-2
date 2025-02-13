// components/FeaturePointActions/SkillAction.js
import React, { useState } from 'react';
import { SRD_SKILLS } from '../../constants/srd-data'

export function SkillAction({ monster, onSubmit, type }) {
  const [selectedSkills, setSelectedSkills] = useState([]);

  // For expertise, only show skills the monster is proficient in
  const availableSkills = type === 'expertise' 
    ? SRD_SKILLS.filter(skill => 
        monster.skills.includes(skill) && 
        !monster.expertise?.includes(skill)
      )
    : SRD_SKILLS.filter(skill => 
        !monster.skills.includes(skill)
      );

  const handleSkillSelect = (skill) => {
    if (type === 'expertise') {
      setSelectedSkills([skill]); // Only one skill for expertise
    } else {
      // For proficiencies, allow up to 2 selections
      if (selectedSkills.includes(skill)) {
        setSelectedSkills(prev => prev.filter(s => s !== skill));
      } else if (selectedSkills.length < 2) {
        setSelectedSkills(prev => [...prev, skill]);
      }
    }
  };

  const handleSubmit = () => {
    if ((type === 'expertise' && selectedSkills.length === 1) ||
        (type === 'proficiency' && selectedSkills.length === 2)) {
      onSubmit(type, selectedSkills);
      setSelectedSkills([]);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        {type === 'expertise' 
          ? 'Select one skill you are proficient in to gain expertise'
          : 'Select two skills to gain proficiency'}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {availableSkills.map(skill => (
          <div 
            key={skill}
            className={`p-2 border rounded cursor-pointer ${
              selectedSkills.includes(skill) 
                ? 'bg-blue-100 border-blue-500' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleSkillSelect(skill)}
          >
            {skill}
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={
          (type === 'expertise' && selectedSkills.length !== 1) ||
          (type === 'proficiency' && selectedSkills.length !== 2)
        }
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {type === 'expertise' ? 'Add Expertise' : 'Add Proficiencies'}
      </button>
    </div>
  );
}