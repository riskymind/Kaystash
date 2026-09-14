import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '@/auth';
import { openai } from '@/lib/openai';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateAutoTagsAction, generateSummaryAction, explainCodeAction, optimizePromptAction } from './ai';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/openai', () => ({
  openai: { responses: { create: vi.fn() } },
  AI_MODEL: 'gpt-5-nano',
}));
vi.mock('@/lib/rate-limit', () => ({ checkRateLimit: vi.fn() }));

const mockAuth = vi.mocked(auth);
const mockCreate = vi.mocked(openai.responses.create);
const mockCheckRateLimit = vi.mocked(checkRateLimit);

function mockSession(overrides?: { isPro?: boolean }) {
  mockAuth.mockResolvedValue({
    user: { id: 'user_1', isPro: overrides?.isPro ?? true },
  } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckRateLimit.mockResolvedValue({ success: true, remaining: 19, reset: 0 });
});

describe('generateAutoTagsAction', () => {
  it('returns an error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const result = await generateAutoTagsAction({ title: 'A snippet', content: 'code' });

    expect(result).toEqual({ success: false, error: 'Not authenticated.' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns an error for free (non-Pro) users', async () => {
    mockSession({ isPro: false });

    const result = await generateAutoTagsAction({ title: 'A snippet', content: 'code' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/pro feature/i);
    }
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns an error when title is missing', async () => {
    mockSession();

    const result = await generateAutoTagsAction({ title: '', content: 'code' });

    expect(result).toEqual({ success: false, error: 'Invalid title or content.' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns an error when rate limited', async () => {
    mockSession();
    mockCheckRateLimit.mockResolvedValue({ success: false, remaining: 0, reset: Date.now() });

    const result = await generateAutoTagsAction({ title: 'A snippet', content: 'code' });

    expect(result).toEqual({ success: false, error: 'Too many AI requests. Please try again later.' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('parses tags from a {"tags": [...]} response and normalizes them', async () => {
    mockSession();
    mockCreate.mockResolvedValue({ output_text: '{"tags": ["React", " Hooks ", "react"]}' } as never);

    const result = await generateAutoTagsAction({ title: 'useAuth hook', content: 'export function useAuth() {}' });

    expect(result).toEqual({ success: true, data: { tags: ['react', 'hooks'] } });
  });

  it('parses tags from a bare array response', async () => {
    mockSession();
    mockCreate.mockResolvedValue({ output_text: '["typescript", "generics"]' } as never);

    const result = await generateAutoTagsAction({ title: 'Generic helper', content: 'type Foo<T> = T' });

    expect(result).toEqual({ success: true, data: { tags: ['typescript', 'generics'] } });
  });

  it('caps suggestions at 5 tags', async () => {
    mockSession();
    mockCreate.mockResolvedValue({
      output_text: '{"tags": ["a", "b", "c", "d", "e", "f", "g"]}',
    } as never);

    const result = await generateAutoTagsAction({ title: 'Item', content: 'content' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toHaveLength(5);
    }
  });

  it('truncates content to 2000 chars before calling the API', async () => {
    mockSession();
    mockCreate.mockResolvedValue({ output_text: '{"tags": ["long"]}' } as never);

    await generateAutoTagsAction({ title: 'Item', content: 'x'.repeat(5000) });

    const call = mockCreate.mock.calls[0][0];
    const inputContent = String(call.input);
    // the fixed prefix + "Content:\n" + 2000 chars is the max we ever send
    expect(inputContent.length).toBeLessThanOrEqual(
      'Return JSON tags for the item below.\n\nTitle: Item\n\nContent:\n'.length + 2000,
    );
  });

  it('returns an error when the model response cannot be parsed into tags', async () => {
    mockSession();
    mockCreate.mockResolvedValue({ output_text: 'not json' } as never);

    const result = await generateAutoTagsAction({ title: 'Item', content: 'content' });

    expect(result).toEqual({
      success: false,
      error: 'AI could not generate tag suggestions. Please try again.',
    });
  });

  it('returns a generic error when the OpenAI call throws', async () => {
    mockSession();
    mockCreate.mockRejectedValue(new Error('network error'));

    const result = await generateAutoTagsAction({ title: 'Item', content: 'content' });

    expect(result).toEqual({ success: false, error: 'AI request failed. Please try again.' });
  });
});

describe('generateSummaryAction', () => {
  it('returns an error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const result = await generateSummaryAction({ title: 'A snippet', content: 'code' });

    expect(result).toEqual({ success: false, error: 'Not authenticated.' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns an error for free (non-Pro) users', async () => {
    mockSession({ isPro: false });

    const result = await generateSummaryAction({ title: 'A snippet', content: 'code' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/pro feature/i);
    }
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns an error when title is missing', async () => {
    mockSession();

    const result = await generateSummaryAction({ title: '', content: 'code' });

    expect(result).toEqual({ success: false, error: 'Invalid title or content.' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns an error when rate limited', async () => {
    mockSession();
    mockCheckRateLimit.mockResolvedValue({ success: false, remaining: 0, reset: Date.now() });

    const result = await generateSummaryAction({ title: 'A snippet', content: 'code' });

    expect(result).toEqual({ success: false, error: 'Too many AI requests. Please try again later.' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns the trimmed summary from a plain-text response', async () => {
    mockSession();
    mockCreate.mockResolvedValue({
      output_text: '  A reusable React hook for handling authentication state.  ',
    } as never);

    const result = await generateSummaryAction({
      title: 'useAuth hook',
      content: 'export function useAuth() {}',
    });

    expect(result).toEqual({
      success: true,
      data: { summary: 'A reusable React hook for handling authentication state.' },
    });
  });

  it('strips surrounding quotes from the response', async () => {
    mockSession();
    mockCreate.mockResolvedValue({
      output_text: '"A concise one-line summary."',
    } as never);

    const result = await generateSummaryAction({ title: 'Item', content: 'content' });

    expect(result).toEqual({ success: true, data: { summary: 'A concise one-line summary.' } });
  });

  it('summarizes from a URL when no content is available (link items)', async () => {
    mockSession();
    mockCreate.mockResolvedValue({ output_text: 'A handy dev-tools reference site.' } as never);

    const result = await generateSummaryAction({ title: 'Dev Tools', url: 'https://example.com' });

    expect(result).toEqual({ success: true, data: { summary: 'A handy dev-tools reference site.' } });
    const call = mockCreate.mock.calls[0][0];
    expect(String(call.input)).toContain('URL: https://example.com');
  });

  it('summarizes from a file name when no content is available (file/image items)', async () => {
    mockSession();
    mockCreate.mockResolvedValue({ output_text: 'A screenshot of the dashboard layout.' } as never);

    const result = await generateSummaryAction({ title: 'Dashboard', fileName: 'dashboard.png' });

    expect(result).toEqual({ success: true, data: { summary: 'A screenshot of the dashboard layout.' } });
    const call = mockCreate.mock.calls[0][0];
    expect(String(call.input)).toContain('File name: dashboard.png');
  });

  it('truncates content to 2000 chars before calling the API', async () => {
    mockSession();
    mockCreate.mockResolvedValue({ output_text: 'A summary.' } as never);

    await generateSummaryAction({ title: 'Item', content: 'x'.repeat(5000) });

    const call = mockCreate.mock.calls[0][0];
    const inputContent = String(call.input);
    expect(inputContent.length).toBeLessThanOrEqual(
      'Title: Item\n\nContent:\n'.length + 2000,
    );
  });

  it('caps the summary length at 300 chars', async () => {
    mockSession();
    mockCreate.mockResolvedValue({ output_text: 'x'.repeat(500) } as never);

    const result = await generateSummaryAction({ title: 'Item', content: 'content' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.summary).toHaveLength(300);
    }
  });

  it('returns an error when the model response is empty', async () => {
    mockSession();
    mockCreate.mockResolvedValue({ output_text: '   ' } as never);

    const result = await generateSummaryAction({ title: 'Item', content: 'content' });

    expect(result).toEqual({
      success: false,
      error: 'AI could not generate a summary. Please try again.',
    });
  });

  it('returns a generic error when the OpenAI call throws', async () => {
    mockSession();
    mockCreate.mockRejectedValue(new Error('network error'));

    const result = await generateSummaryAction({ title: 'Item', content: 'content' });

    expect(result).toEqual({ success: false, error: 'AI request failed. Please try again.' });
  });
});

describe('explainCodeAction', () => {
  it('returns an error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const result = await explainCodeAction({ title: 'A snippet', content: 'code' });

    expect(result).toEqual({ success: false, error: 'Not authenticated.' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns an error for free (non-Pro) users', async () => {
    mockSession({ isPro: false });

    const result = await explainCodeAction({ title: 'A snippet', content: 'code' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/pro feature/i);
    }
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns an error when title is missing', async () => {
    mockSession();

    const result = await explainCodeAction({ title: '', content: 'code' });

    expect(result).toEqual({ success: false, error: 'Invalid title or content.' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns an error when content is missing', async () => {
    mockSession();

    const result = await explainCodeAction({ title: 'A snippet', content: '' });

    expect(result).toEqual({ success: false, error: 'Invalid title or content.' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns an error when rate limited', async () => {
    mockSession();
    mockCheckRateLimit.mockResolvedValue({ success: false, remaining: 0, reset: Date.now() });

    const result = await explainCodeAction({ title: 'A snippet', content: 'code' });

    expect(result).toEqual({ success: false, error: 'Too many AI requests. Please try again later.' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns the trimmed explanation from the model response', async () => {
    mockSession();
    mockCreate.mockResolvedValue({
      output_text: '  This function debounces a callback using `setTimeout`.  ',
    } as never);

    const result = await explainCodeAction({
      title: 'useDebounce hook',
      content: 'export function useDebounce() {}',
      language: 'typescript',
    });

    expect(result).toEqual({
      success: true,
      data: { explanation: 'This function debounces a callback using `setTimeout`.' },
    });
    const call = mockCreate.mock.calls[0][0];
    expect(String(call.input)).toContain('Language: typescript');
  });

  it('omits the language line when not provided', async () => {
    mockSession();
    mockCreate.mockResolvedValue({ output_text: 'Explanation text.' } as never);

    await explainCodeAction({ title: 'Item', content: 'echo hi' });

    const call = mockCreate.mock.calls[0][0];
    expect(String(call.input)).not.toContain('Language:');
  });

  it('truncates content to 2000 chars before calling the API', async () => {
    mockSession();
    mockCreate.mockResolvedValue({ output_text: 'Explanation.' } as never);

    await explainCodeAction({ title: 'Item', content: 'x'.repeat(5000) });

    const call = mockCreate.mock.calls[0][0];
    const inputContent = String(call.input);
    expect(inputContent.length).toBeLessThanOrEqual(
      'Title: Item\n\nContent:\n'.length + 2000,
    );
  });

  it('returns an error when the model response is empty', async () => {
    mockSession();
    mockCreate.mockResolvedValue({ output_text: '   ' } as never);

    const result = await explainCodeAction({ title: 'Item', content: 'content' });

    expect(result).toEqual({
      success: false,
      error: 'AI could not generate an explanation. Please try again.',
    });
  });

  it('returns a generic error when the OpenAI call throws', async () => {
    mockSession();
    mockCreate.mockRejectedValue(new Error('network error'));

    const result = await explainCodeAction({ title: 'Item', content: 'content' });

    expect(result).toEqual({ success: false, error: 'AI request failed. Please try again.' });
  });
});

describe('optimizePromptAction', () => {
  it('returns an error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const result = await optimizePromptAction({ title: 'A prompt', content: 'Write some code' });

    expect(result).toEqual({ success: false, error: 'Not authenticated.' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns an error for free (non-Pro) users', async () => {
    mockSession({ isPro: false });

    const result = await optimizePromptAction({ title: 'A prompt', content: 'Write some code' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/pro feature/i);
    }
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns an error when title is missing', async () => {
    mockSession();

    const result = await optimizePromptAction({ title: '', content: 'Write some code' });

    expect(result).toEqual({ success: false, error: 'Invalid title or content.' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns an error when content is missing', async () => {
    mockSession();

    const result = await optimizePromptAction({ title: 'A prompt', content: '' });

    expect(result).toEqual({ success: false, error: 'Invalid title or content.' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns an error when rate limited', async () => {
    mockSession();
    mockCheckRateLimit.mockResolvedValue({ success: false, remaining: 0, reset: Date.now() });

    const result = await optimizePromptAction({ title: 'A prompt', content: 'Write some code' });

    expect(result).toEqual({ success: false, error: 'Too many AI requests. Please try again later.' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns the trimmed optimized prompt from the model response', async () => {
    mockSession();
    mockCreate.mockResolvedValue({
      output_text: '  Write a Python function that reverses a linked list in place.  ',
    } as never);

    const result = await optimizePromptAction({
      title: 'Reverse a list',
      content: 'reverse a list',
    });

    expect(result).toEqual({
      success: true,
      data: { optimizedPrompt: 'Write a Python function that reverses a linked list in place.' },
    });
  });

  it('truncates content to 2000 chars before calling the API', async () => {
    mockSession();
    mockCreate.mockResolvedValue({ output_text: 'Optimized prompt.' } as never);

    await optimizePromptAction({ title: 'Item', content: 'x'.repeat(5000) });

    const call = mockCreate.mock.calls[0][0];
    const inputContent = String(call.input);
    expect(inputContent.length).toBeLessThanOrEqual(
      'Title: Item\n\nPrompt:\n'.length + 2000,
    );
  });

  it('returns an error when the model response is empty', async () => {
    mockSession();
    mockCreate.mockResolvedValue({ output_text: '   ' } as never);

    const result = await optimizePromptAction({ title: 'Item', content: 'content' });

    expect(result).toEqual({
      success: false,
      error: 'AI could not optimize this prompt. Please try again.',
    });
  });

  it('returns a generic error when the OpenAI call throws', async () => {
    mockSession();
    mockCreate.mockRejectedValue(new Error('network error'));

    const result = await optimizePromptAction({ title: 'Item', content: 'content' });

    expect(result).toEqual({ success: false, error: 'AI request failed. Please try again.' });
  });
});
