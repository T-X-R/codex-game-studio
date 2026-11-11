export type Status = 'ok' | 'failed' | 'blocked' | 'not_assessed';

export interface Result<T = unknown> {
  schemaVersion: 1;
  command: string;
  status: Status;
  data: T;
  artifacts: { path: string; type: string; sha256?: string }[];
  warnings: string[];
  error: { code: string; message: string } | null;
}

export class StudioError extends Error {
  constructor(public code: string, message: string, public exitCode = 2) {
    super(message);
  }
}

export function success<T>(command: string, data: T): Result<T> {
  return { schemaVersion: 1, command, status: 'ok', data, artifacts: [], warnings: [], error: null };
}

export function failure(command: string, error: unknown): { result: Result<null>; exitCode: number } {
  const known = error instanceof StudioError;
  const exitCode = known ? error.exitCode : 1;
  return {
    exitCode,
    result: {
      ...success(command, null),
      status: exitCode === 3 ? 'not_assessed' : exitCode === 4 ? 'blocked' : 'failed',
      error: { code: known ? error.code : 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Unexpected failure' },
    },
  };
}
