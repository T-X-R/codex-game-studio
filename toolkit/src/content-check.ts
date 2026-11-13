import { parseDocument } from 'yaml';
import { parse as parseToml } from 'smol-toml';

export interface ContentIssue { code: string; message: string }
export interface ContentMetadata { name?: string; body: string; issues: ContentIssue[] }
const namespace = /^game-studio(?:-[a-z0-9]+)*$/;
const legacyRuntime = /\.claude[/\\]|CLAUDE_SKILL_DIR|\$ARGUMENTS\b|\bAskUserQuestion\b/;

export function runtimeIssues(text: string): ContentIssue[] {
  const match = legacyRuntime.exec(text);
  return match ? [{ code: 'LEGACY_RUNTIME', message: `Claude runtime reference: ${match[0]}` }] : [];
}

function metadata(value: unknown, directory: string, allowed: string[], required: string[]): ContentIssue[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [{ code: 'INVALID_METADATA', message: 'Metadata must be a mapping' }];
  }
  const fields = value as Record<string, unknown>;
  const issues: ContentIssue[] = [];
  for (const key of required) {
    if (typeof fields[key] !== 'string' || !(fields[key] as string).trim()) {
      issues.push({ code: 'INVALID_METADATA', message: `${key} must be a nonempty string` });
    }
  }
  for (const key of Object.keys(fields)) {
    if (!allowed.includes(key)) issues.push({ code: 'UNSUPPORTED_METADATA', message: `Field outside the canonical migration profile: ${key}` });
  }
  if (typeof fields.name === 'string' && (!namespace.test(fields.name) || fields.name !== directory)) {
    issues.push({ code: 'INVALID_NAME', message: 'Canonical name must match its folder/file and use the game-studio namespace' });
  }
  if (Object.hasOwn(fields, 'metadata') && (!fields.metadata || typeof fields.metadata !== 'object' || Array.isArray(fields.metadata))) {
    issues.push({ code: 'INVALID_METADATA', message: 'metadata must be a mapping' });
  }
  return issues;
}

export function validateSkill(text: string, directory: string): ContentMetadata {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!match) return { body: '', issues: [{ code: 'INVALID_FRONTMATTER', message: 'Skill needs closed YAML frontmatter at the start' }] };
  const body = text.slice(match[0].length);
  try {
    const document = parseDocument(match[1]!, { uniqueKeys: true });
    if (document.errors.length) throw new Error(document.errors[0]!.message);
    const value = document.toJS({ maxAliasCount: 20 });
    const issues = metadata(value, directory, ['name', 'description', 'metadata'], ['name', 'description']);
    if (!body.trim()) issues.push({ code: 'EMPTY_INSTRUCTIONS', message: 'Skill instructions are empty' });
    issues.push(...runtimeIssues(text));
    return { name: typeof value?.name === 'string' ? value.name : undefined, body, issues };
  } catch (error) {
    return { body, issues: [{ code: 'INVALID_FRONTMATTER', message: `Invalid YAML: ${(error as Error).message}` }] };
  }
}

export function validateRole(text: string, filename: string): ContentMetadata {
  try {
    const value = parseToml(text);
    const fields = ['name', 'description', 'developer_instructions'];
    const issues = metadata(value, filename, fields, fields);
    const body = typeof value.developer_instructions === 'string' ? value.developer_instructions : '';
    issues.push(...runtimeIssues(body));
    return { name: typeof value.name === 'string' ? value.name : undefined, body, issues };
  } catch (error) {
    return { body: '', issues: [{ code: 'INVALID_TOML', message: `Invalid TOML: ${(error as Error).message}` }] };
  }
}
