import { useState } from 'react';

export default function InputPanel({ onGenerate, isLoading }) {
  const [transcript, setTranscript] = useState('');
  const [requirements, setRequirements] = useState('');
  const [product, setProduct] = useState('');
  const [feature, setFeature] = useState('');
  const [persona, setPersona] = useState('');

  const canGenerate = transcript.trim().length > 0 && !isLoading;

  const handleGenerate = () => {
    if (!canGenerate) return;
    onGenerate(transcript, requirements, { product, feature, persona });
  };

  const handleSampleFill = () => {
    setTranscript(`In our planning meeting, we discussed that users need to log in with Google or email. New users should be able to sign up and get a welcome email. Admins need to be able to view all users and deactivate accounts. The dashboard should show recent activity. Users also asked for password reset functionality and the ability to update their profile picture. We need to implement two-factor authentication for admin accounts.`);
    setRequirements(`1. User authentication must support OAuth (Google) and email/password
2. New user onboarding flow with welcome email
3. Admin panel for user management
4. Activity dashboard with recent actions
5. Password reset via email link
6. Profile management including avatar upload
7. Two-factor authentication for admin roles`);
    setProduct('UserHub Platform');
    setFeature('User Management & Authentication');
    setPersona('End User');
  };

  return (
    <div className="input-panel">
      <div className="input-panel-header">
        <div>
          <h2>
            <span className="icon">📝</span>
            Input Sources
          </h2>
          <p className="subtitle">Paste your meeting transcript and requirements to generate structured user stories</p>
        </div>
        <button className="btn btn-ghost" onClick={handleSampleFill} title="Fill with sample data">
          <span>🧪</span> Load Sample
        </button>
      </div>

      <div className="input-grid">
        <div className="input-group input-group-full">
          <label htmlFor="transcript">
            Meeting Transcript <span className="required">*</span>
          </label>
          <textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript, discussion notes, or any raw text containing feature discussions..."
            rows={6}
          />
        </div>

        <div className="input-group input-group-full">
          <label htmlFor="requirements">
            Raw Requirements <span className="optional">(optional)</span>
          </label>
          <textarea
            id="requirements"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Add any existing requirements, feature lists, or specifications..."
            rows={4}
          />
        </div>

        <div className="input-group">
          <label htmlFor="product">Product Name</label>
          <input
            id="product"
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="e.g., UserHub Platform"
          />
        </div>

        <div className="input-group">
          <label htmlFor="feature">Feature / Module</label>
          <input
            id="feature"
            type="text"
            value={feature}
            onChange={(e) => setFeature(e.target.value)}
            placeholder="e.g., Authentication"
          />
        </div>

        <div className="input-group">
          <label htmlFor="persona">Primary Persona</label>
          <input
            id="persona"
            type="text"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder="e.g., End User"
          />
        </div>
      </div>

      <div className="input-actions">
        <button
          id="generate-btn"
          className="btn btn-primary btn-lg"
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Analyzing & Generating...
            </>
          ) : (
            <>
              <span>✨</span> Generate User Stories
            </>
          )}
        </button>
      </div>
    </div>
  );
}
