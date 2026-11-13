import { basename } from 'node:path';
import { readdir, stat } from 'node:fs/promises';
import { enums, parseConfig } from './config.js';
import { StudioError } from './contract.js';
import { canonicalRoot, readText, safePath } from './files.js';
import { exists } from './project.js';
import type { InstallPlan } from './install.js';
import { metadata } from './metadata.js';
import { planWebScaffold, type WebScaffoldOptions } from './web-scaffold.js';

const renderers: Record<string, [string, string]> = {
  Compatibility: ['GL Compatibility', 'gl_compatibility'],
  'Forward+': ['Forward Plus', 'forward_plus'], Mobile: ['Mobile', 'mobile'],
};

export async function planEngineScaffold(root: string, options: WebScaffoldOptions = {}) {
  const project = await canonicalRoot(root);
  const config = await readText(await safePath(project, 'project.yaml'));
  if (config === null) throw new StudioError('INVALID_CONFIG', 'Configure the engine in project.yaml before scaffolding');
  const document = parseConfig(config, 'project.yaml');
  const engine = document.getIn(['engine', 'name']);
  if (typeof engine !== 'string' || !enums['engine.name']!.includes(engine)) {
    throw new StudioError('INVALID_CONFIG', 'Choose a supported engine in project.yaml before scaffolding');
  }
  if (engine === 'Web') return planWebScaffold(project, config, options);
  if (options.starter !== undefined || options.title !== undefined || options.gitignore !== undefined) {
    throw new StudioError('INVALID_ARGUMENT', '--starter, --title and --gitignore are Web-only options');
  }
  const plan: InstallPlan = { project, version: metadata.version, changes: [] };
  const verification = { state: 'not_assessed', reason: 'Creating or detecting a project file does not verify its editor, import, build, tests or gameplay.' };
  const marker = engine === 'Godot' ? 'project.godot' : engine === 'Unity' ? 'ProjectSettings/ProjectVersion.txt'
    : engine === 'Unreal' ? (await readdir(project)).find(name => name.endsWith('.uproject')) : undefined;
  if (marker) {
    const path = await safePath(project, marker);
    if (await exists(path)) {
      if (!(await stat(path)).isFile()) throw new StudioError('FILE_CONFLICT', `Expected a regular engine project file: ${marker}`, 4);
      return { plan, engine, outcome: { state: 'already_present', path: marker, reason: 'Existing engine project preserved unchanged.' }, verification };
    }
  }
  if (engine !== 'Godot') {
    const reason = engine === 'Unity' ? 'Create the Unity project with Unity Hub using the selected version and 2D/3D template; then attach or inspect it.'
      : 'Create the Unreal project with the selected Unreal Editor, then attach or inspect it.';
    return { plan, engine, outcome: { state: 'not_assessed', reason }, verification };
  }
  const version = document.getIn(['engine', 'version']);
  const match = typeof version === 'string' ? /^(4\.\d+)(?:\.\d+)?(?:[-.](?:stable|rc\d+|beta\d+|dev\d+))?$/.exec(version) : null;
  if (!match) throw new StudioError('INVALID_CONFIG', 'Godot scaffolding requires an explicit Godot 4.x version string');
  const rendering = document.getIn(['engine', 'rendering']);
  if (typeof rendering !== 'string' || !Object.hasOwn(renderers, rendering)) {
    throw new StudioError('INVALID_CONFIG', 'Choose engine.rendering explicitly: Compatibility, Forward+ or Mobile');
  }
  const name = document.getIn(['project', 'name']) ?? basename(project);
  if (typeof name !== 'string' || !name.trim() || /[\0\r\n]/.test(name)) throw new StudioError('INVALID_CONFIG', 'project.name must be a nonempty single-line string');
  const [feature, method] = renderers[rendering]!;
  const content = `config_version=5\n\n[application]\n\nconfig/name=${JSON.stringify(name)}\nconfig/features=PackedStringArray("${match[1]}", "${feature}")\n; Set run/main_scene after creating the game's first scene.\n\n[rendering]\n\nrenderer/rendering_method="${method}"\n`;
  // Keep the choices used for generation stable until the transaction is applied.
  plan.changes.push({ path: 'project.yaml', before: config, after: config }, { path: 'project.godot', before: null, after: content });
  return { plan, engine, outcome: { state: 'planned', path: 'project.godot' }, verification };
}
