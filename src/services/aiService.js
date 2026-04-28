// Groq AI Service — uses Groq's free, ultra-fast inference API
// OpenAI-compatible chat completions endpoint with Llama 3.3 70B

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are an expert Agile business analyst. Your job is to extract user stories from meeting transcripts and requirements documents.

Always respond with a JSON array only — no preamble, no explanation, no markdown code fences. Each element must conform exactly to this schema:
{
  "title": string,
  "description": "As a [persona], I want [action], so that [outcome]",
  "acceptanceCriteria": string[],  // min 3 items, Given/When/Then format
  "storyPoints": number,           // Fibonacci: 1,2,3,5,8,13
  "parent": string,                // Epic or feature group
  "traceability": string           // Quote or paraphrase from source
}`;

function buildUserMessage(transcript, requirements, metadata) {
  const { product, feature, persona } = metadata;
  return `Product: ${product || 'Not specified'}
Feature: ${feature || 'Not specified'}
Primary Persona: ${persona || 'End User'}

== MEETING TRANSCRIPT ==
${transcript}

== RAW REQUIREMENTS ==
${requirements || 'None provided'}

Generate user stories covering all distinct features and intents mentioned above.`;
}

function stripCodeFences(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

export async function generateStories(transcript, requirements, metadata) {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not found. Please set VITE_GROQ_API_KEY in your .env file.');
  }

  const userMessage = buildUserMessage(transcript, requirements, metadata);

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.4,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error('Empty response from Groq API');
  }

  let stories;
  try {
    stories = JSON.parse(stripCodeFences(rawContent));
  } catch (parseError) {
    // Retry once with a stricter prompt
    console.warn('First parse failed, retrying with strict prompt...', parseError);
    const retryResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + '\n\nCRITICAL: Your response must be ONLY a valid JSON array. No text before or after. No code fences. Start with [ and end with ].' },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 4096,
      }),
    });

    if (!retryResponse.ok) {
      throw new Error(`Groq API retry failed (${retryResponse.status})`);
    }

    const retryData = await retryResponse.json();
    const retryContent = retryData.choices?.[0]?.message?.content;
    stories = JSON.parse(stripCodeFences(retryContent));
  }

  // Ensure each story has a unique ID and status fields
  return stories.map((story, index) => ({
    id: `story-${Date.now()}-${index}`,
    ...story,
    status: 'pending',
    approved: false,
    rejected: false,
    workItemId: null,
  }));
}

export async function regenerateStory(story, transcript, metadata) {
  const userMessage = `Product: ${metadata?.product || 'Not specified'}
Feature: ${metadata?.feature || 'Not specified'}
Primary Persona: ${metadata?.persona || 'End User'}

Original transcript context: ${story.traceability}

Full transcript for reference:
${transcript}

The following user story was rejected and needs to be regenerated with improvements:
Title: ${story.title}
Description: ${story.description}

Please generate exactly ONE improved user story that better captures the intent from the transcript. Respond with a JSON array containing exactly one story object.`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.5,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error (${response.status})`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  const stories = JSON.parse(stripCodeFences(rawContent));
  const newStory = stories[0];

  return {
    id: story.id,
    ...newStory,
    status: 'pending',
    approved: false,
    rejected: false,
    workItemId: null,
  };
}
