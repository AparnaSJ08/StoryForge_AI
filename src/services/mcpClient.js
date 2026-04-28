// MCP Client — abstracts tool dispatch for publishing stories
// In production: replace the import with a real MCP server dispatch (SSE or HTTP)

import { handleToolCall } from '../mocks/mockMCPServer.js';

export async function publishStory(story) {
  const toolCall = {
    tool: 'create_work_item',
    params: {
      type: 'User Story',
      title: story.title,
      description: story.description,
      acceptanceCriteria: story.acceptanceCriteria.join('\n'),
      storyPoints: story.storyPoints,
      parent: story.parent,
      tags: ['ai-generated'],
    },
  };
  return await handleToolCall(toolCall);
}

export async function updateStory(id, story) {
  const toolCall = {
    tool: 'update_work_item',
    params: {
      id,
      type: 'User Story',
      title: story.title,
      description: story.description,
      acceptanceCriteria: story.acceptanceCriteria.join('\n'),
      storyPoints: story.storyPoints,
      parent: story.parent,
      tags: ['ai-generated'],
    },
  };
  return await handleToolCall(toolCall);
}
