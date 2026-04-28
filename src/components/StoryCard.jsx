import { useState } from 'react';

const FIBONACCI = [1, 2, 3, 5, 8, 13];

export default function StoryCard({ story, onUpdate, onApprove, onReject, onRegenerate, isRegenerating }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  const startEdit = () => {
    setEditData({
      title: story.title,
      description: story.description,
      acceptanceCriteria: [...story.acceptanceCriteria],
      storyPoints: story.storyPoints,
      parent: story.parent,
    });
    setIsEditing(true);
  };

  const saveEdit = () => {
    onUpdate(story.id, editData);
    setIsEditing(false);
    setEditData(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const updateCriteria = (index, value) => {
    const updated = [...editData.acceptanceCriteria];
    updated[index] = value;
    setEditData({ ...editData, acceptanceCriteria: updated });
  };

  const addCriteria = () => {
    setEditData({
      ...editData,
      acceptanceCriteria: [...editData.acceptanceCriteria, ''],
    });
  };

  const removeCriteria = (index) => {
    const updated = editData.acceptanceCriteria.filter((_, i) => i !== index);
    setEditData({ ...editData, acceptanceCriteria: updated });
  };

  const statusClass = story.approved ? 'approved' : story.rejected ? 'rejected' : 'pending';
  const statusLabel = story.approved ? '✓ Approved' : story.rejected ? '✗ Rejected' : '◯ Pending';

  return (
    <div className={`story-card ${statusClass} ${isRegenerating ? 'regenerating' : ''}`}>
      <div className="story-card-header">
        <div className="story-card-badges">
          <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
          <span className="points-badge">{story.storyPoints} pts</span>
          {story.workItemId && (
            <span className="work-item-badge">🔗 {story.workItemId}</span>
          )}
        </div>
        <div className="story-card-actions">
          {!isEditing && (
            <>
              <button className="btn btn-sm btn-ghost" onClick={startEdit} title="Edit story">
                ✏️
              </button>
              {!story.approved && (
                <button className="btn btn-sm btn-success" onClick={() => onApprove(story.id)} title="Approve">
                  ✓
                </button>
              )}
              {!story.rejected && (
                <button className="btn btn-sm btn-danger" onClick={() => onReject(story.id)} title="Reject">
                  ✗
                </button>
              )}
              {story.rejected && (
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() => onRegenerate(story.id)}
                  disabled={isRegenerating}
                  title="Regenerate"
                >
                  {isRegenerating ? <span className="spinner-sm"></span> : '↺'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="story-card-edit">
          <div className="edit-field">
            <label>Title</label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            />
          </div>
          <div className="edit-field">
            <label>Description</label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="edit-field">
            <label>Story Points</label>
            <select
              value={editData.storyPoints}
              onChange={(e) => setEditData({ ...editData, storyPoints: parseInt(e.target.value) })}
            >
              {FIBONACCI.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="edit-field">
            <label>Parent / Epic</label>
            <input
              type="text"
              value={editData.parent}
              onChange={(e) => setEditData({ ...editData, parent: e.target.value })}
            />
          </div>
          <div className="edit-field">
            <label>Acceptance Criteria</label>
            {editData.acceptanceCriteria.map((ac, i) => (
              <div key={i} className="criteria-edit-row">
                <textarea
                  value={ac}
                  onChange={(e) => updateCriteria(i, e.target.value)}
                  rows={2}
                />
                <button className="btn btn-sm btn-danger" onClick={() => removeCriteria(i)}>×</button>
              </div>
            ))}
            <button className="btn btn-sm btn-ghost" onClick={addCriteria}>+ Add Criterion</button>
          </div>
          <div className="edit-actions">
            <button className="btn btn-primary" onClick={saveEdit}>💾 Save Changes</button>
            <button className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="story-card-body">
          <h3 className="story-title">{story.title}</h3>
          <p className="story-description">{story.description}</p>

          <div className="story-meta">
            <span className="meta-item">
              <span className="meta-label">Parent:</span> {story.parent}
            </span>
          </div>

          <div className="story-criteria">
            <h4>Acceptance Criteria</h4>
            <ul>
              {story.acceptanceCriteria.map((ac, i) => (
                <li key={i}>{ac}</li>
              ))}
            </ul>
          </div>

          <button
            className="traceability-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '▾' : '▸'} Traceability
          </button>
          {isExpanded && (
            <div className="traceability-content">
              <p>📌 {story.traceability}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
