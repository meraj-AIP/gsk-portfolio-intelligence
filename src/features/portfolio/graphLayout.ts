import type { GraphNode } from '@/shared/types/domain';

export const KIND_LABEL: Record<GraphNode['kind'], string> = { programme: 'Programmes', project: 'Projects', dataset: 'Datasets', model: 'Models', team: 'Teams', service: 'Shared services', outcome: 'Outcomes' };
const RIGHT_KINDS: GraphNode['kind'][] = ['dataset', 'model', 'team', 'service', 'outcome'];

export const ROW_H = 34;
export const NODE_W = 230;
export const NODE_H = 26;
export const LEFT_X = 20;
export const RIGHT_X = 520;
const INDENT = 18;

export type Box = { x: number; y: number; w: number };
export type Layout = { pos: Map<string, Box>; groups: { kind: GraphNode['kind']; y: number }[]; tree: { programmeId: string; projectIds: string[] }[]; height: number };

/**
 * Left column: each programme followed by its projects, indented. Right column: everything else grouped by kind.
 * Computed from the full node set so positions stay stable while the user filters.
 */
export function layout(nodes: GraphNode[], programmeOf: Map<string, string>): Layout {
  const pos = new Map<string, Box>();
  const tree: Layout['tree'] = [];
  const projects = nodes.filter((n) => n.kind === 'project');
  let left = 40;
  const placeProject = (n: GraphNode) => { pos.set(n.id, { x: LEFT_X + INDENT, y: left, w: NODE_W - INDENT }); left += ROW_H; };
  for (const pg of nodes.filter((n) => n.kind === 'programme')) {
    pos.set(pg.id, { x: LEFT_X, y: left, w: NODE_W });
    left += ROW_H;
    const children = projects.filter((p) => programmeOf.get(p.id) === pg.id);
    children.forEach(placeProject);
    tree.push({ programmeId: pg.id, projectIds: children.map((c) => c.id) });
    left += 6;
  }
  projects.filter((p) => !pos.has(p.id)).forEach(placeProject);

  let right = 40;
  const groups: Layout['groups'] = [];
  for (const kind of RIGHT_KINDS) {
    const list = nodes.filter((n) => n.kind === kind);
    if (!list.length) continue;
    groups.push({ kind, y: right });
    right += 18;
    list.forEach((n) => { pos.set(n.id, { x: RIGHT_X, y: right, w: NODE_W }); right += ROW_H; });
    right += 10;
  }
  return { pos, groups, tree, height: Math.max(left, right) + 20 };
}
