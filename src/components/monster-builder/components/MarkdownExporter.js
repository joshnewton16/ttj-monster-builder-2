import React from 'react';
import MarkdownUtils from './MarkdownUtils';

/**
 * Component for exporting D&D monster data to markdown
 */
const MarkdownExporter = ({ monster }) => {
  /**
   * Copy the generated markdown to clipboard
   */
  const handleExport = () => {
    const markdown = MarkdownUtils.generateMarkdown(monster);
    navigator.clipboard.writeText(markdown)
      .then(() => {
        alert('Markdown copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy markdown: ', err);
        alert('Failed to copy markdown to clipboard. See console for details.');
      });
  };

  return (
    <button
      className="nav-button export-button"
      onClick={handleExport}
      disabled={!monster.name} // Disable if monster has no name
    >
      Export Markdown
    </button>
  );
};

export default MarkdownExporter;