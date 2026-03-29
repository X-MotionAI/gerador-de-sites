// ---------------------------------------------------------------------------
// claude-client.ts — Claude API wrapper using the official Anthropic SDK
// ---------------------------------------------------------------------------

import Anthropic from '@anthropic-ai/sdk';
import type { AgentInvocation } from './types';

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_MAX_TOKENS = 8192;
const DEFAULT_TEMPERATURE = 0.7;

export class ClaudeClient {
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Sends a single request to Claude and returns the full text response.
   */
  async invoke(invocation: AgentInvocation): Promise<string> {
    const {
      systemPrompt,
      userMessage,
      model = DEFAULT_MODEL,
      maxTokens = DEFAULT_MAX_TOKENS,
      temperature = DEFAULT_TEMPERATURE,
    } = invocation;

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      const textBlocks = response.content.filter(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      );

      if (textBlocks.length === 0) {
        throw new ClaudeClientError(
          'A resposta do Claude nao conteve nenhum bloco de texto.',
          'EMPTY_RESPONSE'
        );
      }

      return textBlocks.map((block) => block.text).join('');
    } catch (error) {
      if (error instanceof ClaudeClientError) {
        throw error;
      }

      if (error instanceof Anthropic.APIError) {
        throw new ClaudeClientError(
          `Erro na API do Anthropic: ${error.message} (status: ${error.status})`,
          'API_ERROR',
          error
        );
      }

      throw new ClaudeClientError(
        `Erro inesperado ao invocar o Claude: ${error instanceof Error ? error.message : String(error)}`,
        'UNKNOWN_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Sends a request to Claude and returns an async generator that yields
   * text chunks as they arrive via server-sent events.
   */
  async *stream(invocation: AgentInvocation): AsyncGenerator<string, void, undefined> {
    const {
      systemPrompt,
      userMessage,
      model = DEFAULT_MODEL,
      maxTokens = DEFAULT_MAX_TOKENS,
      temperature = DEFAULT_TEMPERATURE,
    } = invocation;

    try {
      const stream = this.client.messages.stream({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          yield event.delta.text;
        }
      }
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new ClaudeClientError(
          `Erro de streaming na API do Anthropic: ${error.message} (status: ${error.status})`,
          'STREAM_ERROR',
          error
        );
      }

      throw new ClaudeClientError(
        `Erro inesperado durante streaming: ${error instanceof Error ? error.message : String(error)}`,
        'UNKNOWN_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Convenience method: invokes Claude and parses the response as JSON.
   * Extracts JSON from markdown code fences if present.
   */
  async invokeAndParseJson<T = unknown>(invocation: AgentInvocation): Promise<T> {
    const raw = await this.invoke(invocation);

    const jsonMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : raw.trim();

    try {
      return JSON.parse(jsonString) as T;
    } catch (parseError) {
      throw new ClaudeClientError(
        `Falha ao interpretar a resposta do Claude como JSON. Resposta bruta (primeiros 500 caracteres): ${raw.slice(0, 500)}`,
        'JSON_PARSE_ERROR'
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Custom error class
// ---------------------------------------------------------------------------

export type ClaudeClientErrorCode =
  | 'EMPTY_RESPONSE'
  | 'API_ERROR'
  | 'STREAM_ERROR'
  | 'JSON_PARSE_ERROR'
  | 'UNKNOWN_ERROR';

export class ClaudeClientError extends Error {
  public readonly code: ClaudeClientErrorCode;
  public readonly cause?: Error;

  constructor(message: string, code: ClaudeClientErrorCode, cause?: Error) {
    super(message);
    this.name = 'ClaudeClientError';
    this.code = code;
    this.cause = cause;
    Object.setPrototypeOf(this, ClaudeClientError.prototype);
  }
}

// ---------------------------------------------------------------------------
// Singleton instance for convenience
// ---------------------------------------------------------------------------

let defaultClient: ClaudeClient | null = null;

export function getClaudeClient(): ClaudeClient {
  if (!defaultClient) {
    defaultClient = new ClaudeClient();
  }
  return defaultClient;
}
