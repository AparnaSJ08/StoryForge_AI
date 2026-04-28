import { toMarkdown, toJSON, downloadFile } from '../services/exportService.js';

export default function ExportBar({ stories }) {
  const approvedStories = stories.filter(s => s.approved);
  const hasApproved = approvedStories.length > 0;

  const handleExportMarkdown = () => {
    const content = toMarkdown(approvedStories);
    downloadFile(content, 'user-stories.md', 'text/markdown');
  };

  const handleExportJSON = () => {
    const content = toJSON(approvedStories);
    downloadFile(content, 'user-stories.json', 'application/json');
  };

  return (
    <div className="action-bar export-bar">
      <div className="action-bar-info">
        <span className="icon">📦</span>
        <span>Export {approvedStories.length} approved {approvedStories.length === 1 ? 'story' : 'stories'}</span>
      </div>
      <div className="action-bar-buttons">
        <button
          id="export-md-btn"
          className="btn btn-secondary"
          onClick={handleExportMarkdown}
          disabled={!hasApproved}
        >
          📄 Download Markdown
        </button>
        <button
          id="export-json-btn"
          className="btn btn-secondary"
          onClick={handleExportJSON}
          disabled={!hasApproved}
        >
          📋 Download JSON
        </button>
      </div>
    </div>
  );
}
