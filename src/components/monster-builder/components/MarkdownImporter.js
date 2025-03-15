import React, { useRef } from 'react';
import MarkdownUtils from './MarkdownUtils';

/**
 * Component for importing D&D monster data from markdown
 */
const MarkdownImporter = ({ onImport }) => {
  const fileInputRef = useRef(null);

  /**
   * Handle file upload and reading
   */
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const markdown = e.target.result;
      const parsedMonster = MarkdownUtils.parseMarkdown(markdown);
      if (parsedMonster) {
        onImport(parsedMonster);
        alert('Monster imported successfully!');
      } else {
        alert('Failed to parse markdown. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  /**
   * Handle paste from clipboard
   */
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsedMonster = MarkdownUtils.parseMarkdown(text);
      if (parsedMonster) {
        onImport(parsedMonster);
        alert('Monster imported successfully from clipboard!');
      } else {
        alert('Failed to parse markdown from clipboard. Please check the format.');
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      alert('Failed to read from clipboard. Make sure you have granted clipboard permissions.');
    }
  };

  /**
   * Trigger file input click
   */
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="import-container">
      <input
        type="file"
        accept=".md,.txt"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      <button 
        className="nav-button import-button" 
        onClick={handleImportClick}
      >
        Import from File
      </button>
      <button 
        className="nav-button import-button" 
        onClick={handlePaste}
      >
        Import from Clipboard
      </button>
    </div>
  );
};

export default MarkdownImporter;