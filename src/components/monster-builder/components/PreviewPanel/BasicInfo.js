// components/PreviewPanel/BasicInfo.js
import React from 'react';
import { Trash2 } from 'lucide-react';

export const BasicInfo = ({ monster, setStep, onDeleteMovement, onDeleteSense, onDeleteLanguage }) => {
  const renderMovement = () => {
    return (
      <div className="space-y-1">
        {monster.speed
          .filter(speed => speed.value > 0)
          .map((speed) => (
            <div 
              key={speed.type}
              className="flex justify-between items-center"
            >
              <span>{speed.type} ({speed.value} ft.)</span>
              {(speed.type !== 'Walk' || !monster.speed.some(s => s.value > 0 && s.type !== 'Walk')) && (
                <button
                  onClick={() => onDeleteMovement(speed.type)}
                  className="p-1 text-red-500 hover:text-red-700"
                  aria-label={`Delete ${speed.type} movement`}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
      </div>
    );
  };

  // In BasicInfo component
const renderSenses = () => {
  if (!monster.senses?.length) return null;
  
  return (
    <div className="space-y-1">
      {monster.senses.map((sense) => (
        <div 
          key={sense.type}
          className="flex justify-between items-center"
        >
          <span>
            {sense.type.charAt(0).toUpperCase() + sense.type.slice(1)} {sense.range} ft.
          </span>
          <button
            onClick={() => onDeleteSense(sense.type)}
            className="p-1 text-red-500 hover:text-red-700"
            aria-label={`Delete ${sense.type}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

const renderLanguages = () => {
  if (!monster.languages?.length) return null;
  
  return (
    <div className="space-y-1">
      {monster.languages.map((language) => (
        <div 
          key={language}
          className="flex justify-between items-center"
        >
          <span>
            {language.charAt(0).toUpperCase() + language.slice(1)} {language.range}
          </span>
          <button
            onClick={() => onDeleteLanguage(language)}
            className="p-1 text-red-500 hover:text-red-700"
            aria-label={`Delete ${language}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

  return (
    <div className="preview-section mb-4">
      <h3 onClick={() => setStep(1)} className="cursor-pointer hover:text-blue-600">
        Basic Info
      </h3>
      <div>
        <div>Name: {monster.name}</div>
        <div>Creature Type: {monster.creaturetype}</div>
        <div>CR: {monster.cr}</div>
        <div>Proficiency Bonus: {monster.proficiencyBonus}</div>
        <div>AC: {monster.acText}</div>
        <div>HP: {monster.hp}</div>
        <div>
          <strong>Movement:</strong>
          {renderMovement()}
        </div>
        <div>
          <strong>Senses:</strong>
          {renderSenses()}
        </div>
        <div>
          <strong>Languages:</strong>
          {renderLanguages()}
        </div>
      </div>
    </div>
  );
};