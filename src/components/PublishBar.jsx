import { useState } from 'react';
import { publishStory } from '../services/mcpClient.js';

export default function PublishBar({ stories, onPublished }) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishLog, setPublishLog] = useState([]);

  const approvedStories = stories.filter(s => s.approved && !s.workItemId);
  const hasPublishable = approvedStories.length > 0;
  const publishedCount = stories.filter(s => s.workItemId).length;

  const handlePublish = async () => {
    setIsPublishing(true);
    const newLogs = [];

    for (const story of approvedStories) {
      try {
        const result = await publishStory(story);
        newLogs.push({
          type: 'success',
          title: story.title,
          workItemId: result.workItemId,
          url: result.url,
          timestamp: result.timestamp,
        });
        onPublished(story.id, result.workItemId);
      } catch (error) {
        newLogs.push({
          type: 'error',
          title: story.title,
          error: error.message,
        });
      }
    }

    setPublishLog((prev) => [...prev, ...newLogs]);
    setIsPublishing(false);
  };

  return (
    <div className="action-bar publish-bar">
      <div className="publish-bar-top">
        <div className="action-bar-info">
          <span className="icon">🚀</span>
          <span>
            Publish to ADO / Jira via MCP
            {publishedCount > 0 && (
              <span className="published-count"> — {publishedCount} already published</span>
            )}
          </span>
        </div>
        <button
          id="publish-btn"
          className="btn btn-accent"
          onClick={handlePublish}
          disabled={!hasPublishable || isPublishing}
        >
          {isPublishing ? (
            <>
              <span className="spinner"></span>
              Publishing...
            </>
          ) : (
            <>🚀 Publish {approvedStories.length} {approvedStories.length === 1 ? 'Story' : 'Stories'}</>
          )}
        </button>
      </div>

      {publishLog.length > 0 && (
        <div className="publish-log">
          <h4>📜 Publish Log</h4>
          {publishLog.map((log, i) => (
            <div key={i} className={`publish-log-entry ${log.type}`}>
              {log.type === 'success' ? (
                <span>✓ <strong>{log.title}</strong> → <code>{log.workItemId}</code></span>
              ) : (
                <span>✗ <strong>{log.title}</strong> — {log.error}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
