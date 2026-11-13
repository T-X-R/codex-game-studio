import { readdir } from 'node:fs/promises';
import { StudioError } from './contract.js';
import { readText, safePath } from './files.js';

export async function inspectAdrDependencies(root: string, directory = 'docs/architecture') {
  const absolute = await safePath(root, directory);
  let names: string[];
  try {
    names = (await readdir(absolute, { withFileTypes: true }))
      .filter(entry => (entry.isFile() || entry.isSymbolicLink()) && /^adr-.*\.md$/.test(entry.name))
      .map(entry => entry.name).sort();
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOTDIR') throw new StudioError('INVALID_ARGUMENT', `ADR input must be a directory: ${directory}`);
    if (code !== 'ENOENT') throw error;
    names = [];
  }
  const files = names.map(name => `${directory}/${name}`);
  const graph = new Map<string, Set<string>>();
  const declared = new Set<string>(), duplicates = new Set<string>(), selfReferences = new Set<string>();
  const noDepsSection = new Set<string>(), unfilledDeps = new Set<string>(), invalidFiles: string[] = [];
  for (const name of names) {
    const path = `${directory}/${name}`;
    const text = await readText(await safePath(root, path));
    if (text === null) throw new StudioError('ASSESSMENT_INCOMPLETE', `ADR disappeared during inspection: ${path}`, 3);
    const id = name.match(/adr-[0-9]+/i)?.[0].toLowerCase();
    if (!id) { invalidFiles.push(path); continue; }
    if (declared.has(id)) duplicates.add(id);
    declared.add(id);
    if (!graph.has(id)) graph.set(id, new Set());
    let inSection = false;
    const rows: string[] = [];
    for (const line of text.split(/\r?\n/)) {
      if (line.startsWith('## ')) inSection = line.startsWith('## ADR Dependencies');
      if (inSection && line.includes('**Depends On**')) rows.push(line);
    }
    if (!rows.length) { noDepsSection.add(id); continue; }
    const targets = new Set((rows.join('\n').match(/adr-[0-9]+/gi) ?? []).map(value => value.toLowerCase()));
    const firstCell = rows[0]!.split('|')[2]?.trim() || rows[0]!;
    if (!targets.size && firstCell.startsWith('[')) unfilledDeps.add(id);
    for (const target of targets) {
      // Source semantics ignore self mentions; expose them so reviewers can
      // distinguish that convention from a proof of no self dependency.
      if (target === id) { selfReferences.add(id); continue; }
      graph.get(id)!.add(target);
      if (!graph.has(target)) graph.set(target, new Set());
    }
  }
  const nodes = [...graph.keys()].sort();
  const edges = nodes.flatMap(from => [...graph.get(from)!].sort().map(to => ({ from, to })));
  const reach = new Map<string, Set<string>>();
  for (const id of nodes) {
    const seen = new Set<string>(), pending = [...graph.get(id)!];
    while (pending.length) {
      const target = pending.pop()!;
      if (seen.has(target)) continue;
      seen.add(target);
      pending.push(...graph.get(target)!);
    }
    reach.set(id, seen);
  }
  const cyclic = new Set(nodes.filter(id => reach.get(id)!.has(id)));
  const cycles = [...cyclic].map(id => ({ id,
    dependencies: [...graph.get(id)!].filter(target => reach.get(target)!.has(id)).sort() }));
  const blockedByCycle = nodes.filter(id => !cyclic.has(id) && [...cyclic].some(target => reach.get(id)!.has(target)));
  const remaining = new Set(nodes.filter(id => !cyclic.has(id) && !blockedByCycle.includes(id)));
  const order: string[] = [], placed = new Set<string>();
  while (remaining.size) {
    const layer = [...remaining].filter(id => [...graph.get(id)!].every(target => placed.has(target)));
    if (!layer.length) throw new Error('ADR graph ordering could not resolve an acyclic remainder');
    for (const id of layer) { remaining.delete(id); placed.add(id); order.push(id); }
  }
  return { project: root, scope: 'adr-dependencies', directory, qualityAssessed: false, files, edges,
    noDepsSection: [...noDepsSection].sort(), unfilledDeps: [...unfilledDeps].sort(),
    missingDependencies: nodes.filter(id => !declared.has(id)), duplicateIds: [...duplicates].sort(),
    invalidFiles, ignoredSelfReferences: [...selfReferences].sort(), cycles, blockedByCycle, order,
    reason: files.length ? null : `No ADRs found in ${directory}/.` };
}
