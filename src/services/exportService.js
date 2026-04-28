// Export Service — generates Markdown and JSON files for download

export function toMarkdown(stories) {
  const lines = [
    '# User Stories Export',
    `**Exported at:** ${new Date().toISOString()}`,
    `**Total Stories:** ${stories.length}`,
    '',
    '---',
    '',
  ];

  stories.forEach((story, index) => {
    lines.push(`## ${index + 1}. ${story.title}`);
    lines.push('');
    lines.push(`**Description:** ${story.description}`);
    lines.push('');
    lines.push(`**Story Points:** ${story.storyPoints}`);
    lines.push('');
    lines.push(`**Parent:** ${story.parent}`);
    lines.push('');
    lines.push('**Acceptance Criteria:**');
    story.acceptanceCriteria.forEach((ac) => {
      lines.push(`- ${ac}`);
    });
    lines.push('');
    lines.push(`**Traceability:** ${story.traceability}`);
    lines.push('');
    if (story.workItemId) {
      lines.push(`**Work Item ID:** ${story.workItemId}`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  });

  return lines.join('\n');
}

export function toJSON(stories) {
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalStories: stories.length,
    stories: stories.map(({ id, title, description, acceptanceCriteria, storyPoints, parent, traceability, workItemId }) => ({
      id,
      title,
      description,
      acceptanceCriteria,
      storyPoints,
      parent,
      traceability,
      workItemId,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
