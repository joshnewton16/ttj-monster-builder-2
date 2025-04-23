import React from 'react';

/**
 * Component for exporting D&D monster data to markdown
 */
const StateExport = ({ monster }) => {
  /**
   * Copy the generated markdown to clipboard
   */
  const handleExport = () => {
	  const jsonData = JSON.stringify(monster, null, 2);
	  
	  // Create a Blob with the JSON data
	  const blob = new Blob([jsonData], { type: 'application/json' });
	  
	  // Create a URL for the Blob
	  const url = URL.createObjectURL(blob);
	  
	  // Create a temporary link element
	  const link = document.createElement('a');
	  link.href = url;
	  
	  // Set the file name
	  link.download = `monster-${monster.name || 'untitled'}.json`;
	  
	  // Append to the document, click it, and remove it
	  document.body.appendChild(link);
	  link.click();
	  document.body.removeChild(link);
	  
	  // Clean up the URL object
	  URL.revokeObjectURL(url);
  };

  return (
    <button
      className="nav-button export-button"
      onClick={handleExport}
      disabled={!monster.name} // Disable if monster has no name
    >
      Export Data
    </button>
  );
};

export default StateExport;