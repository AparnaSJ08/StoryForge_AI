// Mock MCP Server — simulates ADO/Jira work item creation
// In production, replace with real MCP server SSE endpoint

const SUPPORTED_TOOLS = ['create_work_item', 'update_work_item'];
let counter = 1000;

export async function handleToolCall({ tool, params }) {
  if (!SUPPORTED_TOOLS.includes(tool)) {
    throw new Error(`Unknown tool: ${tool}`);
  }
  // Simulate network latency
  await new Promise(r => setTimeout(r, 600));
  counter++;
  return {
    workItemId: `PROJ-${counter}`,
    url: `https://mock.devops.local/workitems/${counter}`,
    status: 'created',
    timestamp: new Date().toISOString(),
  };
}
