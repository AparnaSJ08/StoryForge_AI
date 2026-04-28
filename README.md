# StoryForge AI — AI-Augmented User Story Generation using MCP

**StoryForge AI** converts raw meeting transcripts and requirements into structured, editable Agile user stories using AI (Groq/Llama 3.3 70B), with a **Model Context Protocol (MCP)** abstraction layer for publishing stories to project management tools like Azure DevOps or Jira.

> **One command to run:** `npm install && npm run dev`

---

## 🎯 What This App Does

1. **Paste** a meeting transcript or raw requirements
2. **AI generates** structured user stories (title, description, acceptance criteria, story points, parent epic, traceability)
3. **Review & edit** each story — approve, reject, or regenerate individually
4. **Export** approved stories as Markdown or JSON
5. **Publish** to ADO/Jira via the MCP tool abstraction layer (mock MCP server included)

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────┐
│            Web UI (React + Vite)          │
│   InputPanel → StoryCards → ReviewPanel   │
└───────────────────┬──────────────────────┘
                    │ API calls (fetch)
┌───────────────────▼──────────────────────┐
│           AI Service Module              │
│   aiService.js  →  Groq API (Llama 3.3) │
└───────────────────┬──────────────────────┘
                    │ structured story objects
┌───────────────────▼──────────────────────┐
│           MCP Client Module              │
│   mcpClient.js  →  Mock MCP Server       │
└──────────────────────────────────────────┘
```

**Key design principles:**
- **MCP client** is the only module that publishes stories. The UI never talks directly to any issue tracker.
- **AI service** is the only module that calls the LLM API. Business logic is not mixed with API calls.
- **State flows one direction:** Input → Generated → Reviewed → Published.

---

## 📁 Project File Structure

```
userstory-gen/
├── index.html                    ← Entry HTML with Inter font
├── package.json                  ← Dependencies & scripts
├── vite.config.js                ← Vite config (envDir points to parent for .env)
├── .gitignore
└── src/
    ├── main.jsx                  ← React DOM entry point
    ├── App.jsx                   ← Root component + global state management
    ├── index.css                 ← Complete design system (dark theme, glassmorphism)
    ├── components/
    │   ├── InputPanel.jsx        ← Transcript/requirements input + metadata fields
    │   ├── StoryCard.jsx         ← Single story display with inline edit + approve/reject
    │   ├── ReviewPanel.jsx       ← Story list with stats + "Approve All" control
    │   ├── ExportBar.jsx         ← Markdown & JSON download buttons
    │   └── PublishBar.jsx        ← MCP publish trigger + live publish log
    ├── services/
    │   ├── aiService.js          ← Groq/Llama AI integration (story generation)
    │   ├── mcpClient.js          ← MCP tool dispatch abstraction layer
    │   └── exportService.js      ← Markdown & JSON file generators
    └── mocks/
        └── mockMCPServer.js      ← In-process mock MCP server
```

---

## 📄 Key Files

### `src/services/aiService.js` — AI Story Generation
- Calls **Groq API** (`https://api.groq.com/openai/v1/chat/completions`) with `llama-3.3-70b-versatile`
- Sends a structured **system prompt** instructing the LLM to return a JSON array of user stories
- Each story includes: `title`, `description` (As a/I want/So that), `acceptanceCriteria` (Given/When/Then), `storyPoints` (Fibonacci), `parent` (epic), and `traceability` (source quote)
- **Defensive parsing:** strips markdown code fences and retries with a stricter prompt if JSON parsing fails
- Exports two functions:
  - `generateStories(transcript, requirements, metadata)` — bulk generation
  - `regenerateStory(story, transcript, metadata)` — single story re-generation

### `src/services/mcpClient.js` — MCP Client (Tool Abstraction)
- **This is the MCP integration layer.** The UI calls `publishStory(story)` — it never constructs REST URLs to ADO/Jira.
- Dispatches structured **tool calls** (`create_work_item`, `update_work_item`) with typed parameters
- Currently imports the mock server; **to switch to a real MCP server, only this one import changes**
- Exports:
  - `publishStory(story)` → dispatches `create_work_item` tool call
  - `updateStory(id, story)` → dispatches `update_work_item` tool call

### `src/mocks/mockMCPServer.js` — Mock MCP Server
- Simulates the MCP tool-dispatch contract **in-process** (no network needed)
- Validates tool names against `SUPPORTED_TOOLS` whitelist
- Simulates **600ms network latency** for realism
- Returns MCP-standard responses: `{ workItemId, url, status, timestamp }`
- Auto-increments work item IDs: `PROJ-1001`, `PROJ-1002`, etc.

### `src/App.jsx` — Root Component
- Manages all global state: stories array, loading, errors, regeneration tracking
- Orchestrates the full flow: Generate → Review → Export → Publish
- Tracks header stats (generated / approved / published counts)

### `src/components/StoryCard.jsx` — Story Card
- Renders a single user story with all 5 required fields
- Supports **inline editing** of every field (title, description, criteria, story points, parent)
- Approve (✓), Reject (✗), and Regenerate (↺) actions
- Collapsible **traceability section** showing the source transcript quote
- Visual status: green border = approved, red = rejected, grey = pending

### `src/components/PublishBar.jsx` — Publish to ADO/Jira
- Loops through approved stories and calls `mcpClient.publishStory()` for each
- Displays a **live publish log**: `✓ Story Title → PROJ-1042`
- Updates each card with its work item ID badge once published

### `src/services/exportService.js` — Export
- `toMarkdown(stories)` — generates formatted `.md` with headers per story
- `toJSON(stories)` — wraps stories with `exportedAt` and `totalStories` metadata
- `downloadFile()` — triggers browser download via `Blob` + `URL.createObjectURL`

---

## 🔌 How MCP is Implemented

### The Problem MCP Solves
Without MCP, the UI would need hardcoded REST calls to specific tools (e.g., `POST https://dev.azure.com/.../workitems`). This creates tight coupling — switching from ADO to Jira requires rewriting the UI.

### MCP Architecture

```
User clicks "Publish"
        │
        ▼
  PublishBar.jsx
  calls mcpClient.publishStory(story)
        │
        ▼
  mcpClient.js
  dispatches { tool: "create_work_item", params: {...} }
  ← This is the MCP contract: tool name + typed params
        │
        ▼
  mockMCPServer.js
  validates tool name → generates fake work item ID
  returns { workItemId: "PROJ-1042", status: "created" }
  after 600ms simulated latency
        │
        ▼
  UI displays: "✓ Published as PROJ-1042"
```


---

## 🚀 How to Run

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com/)

### Setup

```bash
# 1. Navigate to the project
cd userstory-gen

# 2. Install dependencies
npm install

# 3. Create .env in the parent directory (AI_Narrator/)
#    with your Groq API key:
#    VITE_GROQ_API_KEY=gsk_your_key_here

# 4. Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🛠️ Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | React 18 + Vite 5 | Fast HMR, component model suits card UI |
| Styling | Vanilla CSS (dark theme) | No framework dependency, full design control |
| AI | Groq API (Llama 3.3 70B) | Free tier, ultra-fast inference (~10x faster than cloud LLMs) |
| MCP | In-process mock module | No credentials needed; same contract as real MCP |
| Export | `Blob` + `URL.createObjectURL` | Native browser APIs, zero library overhead |


