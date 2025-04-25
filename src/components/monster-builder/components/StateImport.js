import React, { useRef } from 'react';

/**
 * Component for importing D&D monster data from JSON
 */
const StateImport = ({ setMonster }) => {
  const fileInputRef = useRef(null);
  
  /**
   * Trigger the file input click
   */
  const handleImportClick = () => {
    fileInputRef.current.click();
  };
  
  /**
   * Process the selected file
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Optional: Validate the imported data structure here
        // For example, check if required fields exist
        if (!importedData.name) {
          alert('Invalid monster data: Missing name property');
          return;
        }
        
        // Update the application state with imported data
        setMonster(importedData);
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
      } catch (error) {
        alert('Failed to parse the imported file. Make sure it\'s a valid JSON file.');
        console.error('Import error:', error);
      }
    };
    
    reader.readAsText(file);
  };
  
  return (
    <>
      <button
        className="nav-button import-button"
        onClick={handleImportClick}
      >
        Import Data
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />
    </>
  );
};

export default StateImport;