// Proficiencies.js
import React from 'react';
import { SRD_LANGUAGES, SRD_SKILL_NAMES } from '../constants/srd-data';

export function Proficiencies({ monster, setMonster }) {
  return (
    <div className="proficiencies-container">
      <h2 className="text-xl font-bold">Proficiencies & Languages</h2>

      <div className="proficiencies-section">
        <h3 className="font-semibold">
          Skills (Max: {monster.proficiencyBonus})
        </h3>
        <div className="proficiencies-grid">
          {SRD_SKILL_NAMES.map(skill => (
            <div key={skill} className="proficiency-item">
              <input
                type="checkbox"
                checked={monster.skills.includes(skill)}
                onChange={e => {
                  if (e.target.checked && monster.skills.length < monster.proficiencyBonus) {
                    setMonster(prev => ({
                      ...prev,
                      skills: [...prev.skills, skill]
                    }));
                  } else if (!e.target.checked) {
                    setMonster(prev => ({
                      ...prev,
                      skills: prev.skills.filter(s => s !== skill)
                    }));
                  }
                }}
              />
              <label>{skill}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="proficiencies-section">
        <h3 className="font-semibold">Languages</h3>
        <div className="proficiencies-grid">
          {SRD_LANGUAGES.map(language => (
            <div key={language} className="proficiency-item">
              <input
                type="checkbox"
                checked={monster.languages.includes(language)}
                onChange={e => {
                  if (e.target.checked) {
                    setMonster(prev => ({
                      ...prev,
                      languages: [...prev.languages, language]
                    }));
                  } else {
                    setMonster(prev => ({
                      ...prev,
                      languages: prev.languages.filter(l => l !== language)
                    }));
                  }
                }}
              />
              <label>{language}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}