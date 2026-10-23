import { z } from 'zod';

function blankToUndefined(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.preprocess(blankToUndefined, z.url().optional()),
  NEXT_PUBLIC_MOCK_LATENCY_MS: z.preprocess(
    blankToUndefined,
    z.coerce.number().int().min(0).max(10_000).default(600),
  ),
});

export interface AppEnv {
  apiUrl: string | undefined;
  mockLatencyMs: number;
}

export type EnvSource = Record<string, string | undefined>;

export class InvalidEnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidEnvError';
  }
}

export function parseEnv(source: EnvSource): AppEnv {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new InvalidEnvError(`Variáveis de ambiente inválidas: ${details}`);
  }
  return {
    apiUrl: result.data.NEXT_PUBLIC_API_URL?.replace(/\/+$/, ''),
    mockLatencyMs: result.data.NEXT_PUBLIC_MOCK_LATENCY_MS,
  };
}

export function readProcessEnv(): EnvSource {
  return {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_MOCK_LATENCY_MS: process.env.NEXT_PUBLIC_MOCK_LATENCY_MS,
  };
}
