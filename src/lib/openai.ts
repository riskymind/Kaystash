import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// gpt-5-nano only works via the Responses API — the Chat Completions API
// returns empty content for this model. See docs/ai-integration-plan.md.
export const AI_MODEL = 'gpt-5-nano';
