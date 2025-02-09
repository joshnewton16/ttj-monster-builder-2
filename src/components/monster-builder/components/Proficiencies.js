// Proficiencies.js
import React from 'react';
import { SRD_LANGUAGES, SRD_SKILLS } from '../constants/srd-data';

export function Proficiencies({ monster, setMonster }) {
  return (
    <div className="proficiencies-container">
      <h2>Proficiencies & Languages</h2>
      
      <div className="proficiencies-section">
        <h3 className="section-header">
          Saving Throws (Max: {Math.floor(monster.proficiencyBonus / 2)})
        </h3>
        <div className="proficiencies-grid">
          {Object.keys(monster.attributes).map(save => (
            <div key={save} className="proficiency-item">
              <input
                type="checkbox"
                checked={monster.savingThrows.includes(save)}
                onChange={e => {
                  if (e.target.checked && monster.savingThrows.length < Math.floor(monster.proficiencyBonus / 2)) {
                    setMonster(prev => ({
                      ...prev,
                      savingThrows: [...prev.savingThrows, save]
                    }));
                  } else if (!e.target.checked) {
                    setMonster(prev => ({
                      ...prev,
                      savingThrows: prev.savingThrows.filter(s => s !== save)
                    }));
                  }
                }}
              />
              <label>{save.toUpperCase()}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="proficiencies-section">
        <h3 className="section-header">
          Skills (Max: {monster.proficiencyBonus})
        </h3>
        <div className="proficiencies-grid">
          {SRD_SKILLS.map(skill => (
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
        <h3 className="section-header">Languages</h3>
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