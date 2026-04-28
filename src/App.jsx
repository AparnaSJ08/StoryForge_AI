import { useState, useCallback } from 'react';
import InputPanel from './components/InputPanel.jsx';
import ReviewPanel from './components/ReviewPanel.jsx';
import ExportBar from './components/ExportBar.jsx';
import PublishBar from './components/PublishBar.jsx';
import { generateStories, regenerateStory } from './services/aiService.js';

export default function App() {
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regeneratingIds, setRegeneratingIds] = useState(new Set());
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastMetadata, setLastMetadata] = useState({});

  const handleGenerate = useCallback(async (transcript, requirements, metadata) => {
    setIsLoading(true);
    setError(null);
    setLastTranscript(transcript);
    setLastMetadata(metadata);

    try {
      const result = await generateStories(transcript, requirements, metadata);
      setStories(result);
    } catch (err) {
      setError(err.message);
      console.error('Generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdate = useCallback((storyId, updates) => {
    setStories(prev => prev.map(s =>
      s.id === storyId ? { ...s, ...updates } : s
    ));
  }, []);

  const handleApprove = useCallback((storyId) => {
    setStories(prev => prev.map(s =>
      s.id === storyId ? { ...s, approved: true, rejected: false, status: 'approved' } : s
    ));
  }, []);

  const handleReject = useCallback((storyId) => {
    setStories(prev => prev.map(s =>
      s.id === storyId ? { ...s, rejected: true, approved: false, status: 'rejected' } : s
    ));
  }, []);

  const handleApproveAll = useCallback(() => {
    setStories(prev => prev.map(s =>
      !s.rejected ? { ...s, approved: true, status: 'approved' } : s
    ));
  }, []);

  const handleRegenerate = useCallback(async (storyId) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    setRegeneratingIds(prev => new Set(prev).add(storyId));

    try {
      const newStory = await regenerateStory(story, lastTranscript, lastMetadata);
      setStories(prev => prev.map(s =>
        s.id === storyId ? newStory : s
      ));
    } catch (err) {
      setError(`Regeneration failed: ${err.message}`);
    } finally {
      setRegeneratingIds(prev => {
        const next = new Set(prev);
        next.delete(storyId);
        return next;
      });
    }
  }, [stories, lastTranscript, lastMetadata]);

  const handlePublished = useCallback((storyId, workItemId) => {
    setStories(prev => prev.map(s =>
      s.id === storyId ? { ...s, workItemId, status: 'published' } : s
    ));
  }, []);

  const approvedCount = stories.filter(s => s.approved).length;
  const publishedCount = stories.filter(s => s.workItemId).length;

  return (
    <div className="app">
      {/* Ambient background */}
      <div className="bg-gradient"></div>
      <div className="bg-grid"></div>

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-area">
            <div className="logo-icon">⚡</div>
            <div>
              <h1>StoryForge <span className="text-accent">AI</span></h1>
              <p className="tagline">AI-Augmented User Story Generation using MCP</p>
            </div>
          </div>
          {stories.length > 0 && (
            <div className="header-stats">
              <div className="header-stat">
                <span className="header-stat-value">{stories.length}</span>
                <span className="header-stat-label">Generated</span>
              </div>
              <div className="header-stat">
                <span className="header-stat-value">{approvedCount}</span>
                <span className="header-stat-label">Approved</span>
              </div>
              <div className="header-stat">
                <span className="header-stat-value">{publishedCount}</span>
                <span className="header-stat-label">Published</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <InputPanel onGenerate={handleGenerate} isLoading={isLoading} />

        {error && (
          <div className="error-toast">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-card">
              <div className="loading-animation">
                <div className="pulse-ring"></div>
                <div className="pulse-ring delay-1"></div>
                <div className="pulse-ring delay-2"></div>
                <span className="loading-icon">🤖</span>
              </div>
              <h3>Analyzing Transcript...</h3>
              <p>Groq AI is extracting features and generating structured user stories</p>
            </div>
          </div>
        )}

        <ReviewPanel
          stories={stories}
          onUpdate={handleUpdate}
          onApprove={handleApprove}
          onReject={handleReject}
          onRegenerate={handleRegenerate}
          onApproveAll={handleApproveAll}
          regeneratingIds={regeneratingIds}
        />

        {stories.length > 0 && (
          <div className="action-bars">
            <ExportBar stories={stories} />
            <PublishBar stories={stories} onPublished={handlePublished} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Powered by <strong>Groq AI</strong> · Llama 3.3 70B · MCP Architecture</p>
      </footer>
    </div>
  );
}
