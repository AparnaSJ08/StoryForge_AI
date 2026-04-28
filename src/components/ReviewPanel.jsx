import StoryCard from './StoryCard.jsx';

export default function ReviewPanel({ stories, onUpdate, onApprove, onReject, onRegenerate, onApproveAll, regeneratingIds }) {
  if (!stories || stories.length === 0) return null;

  const approvedCount = stories.filter(s => s.approved).length;
  const rejectedCount = stories.filter(s => s.rejected).length;
  const pendingCount = stories.length - approvedCount - rejectedCount;

  return (
    <div className="review-panel">
      <div className="review-panel-header">
        <div>
          <h2>
            <span className="icon">📋</span>
            Generated Stories
          </h2>
          <div className="review-stats">
            <span className="stat stat-total">{stories.length} total</span>
            <span className="stat stat-pending">{pendingCount} pending</span>
            <span className="stat stat-approved">{approvedCount} approved</span>
            <span className="stat stat-rejected">{rejectedCount} rejected</span>
          </div>
        </div>
        <button
          className="btn btn-success"
          onClick={onApproveAll}
          disabled={pendingCount === 0}
        >
          ✓ Approve All Pending
        </button>
      </div>

      <div className="story-grid">
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            onUpdate={onUpdate}
            onApprove={onApprove}
            onReject={onReject}
            onRegenerate={onRegenerate}
            isRegenerating={regeneratingIds.has(story.id)}
          />
        ))}
      </div>
    </div>
  );
}
