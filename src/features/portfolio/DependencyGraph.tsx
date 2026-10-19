import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import type { KeyboardEvent } from 'react';
import type { Dependency, GraphNode } from '@/shared/types/domain';
import { KIND_LABEL, LEFT_X, NODE_H, RIGHT_X, layout } from './graphLayout';

type Props = {
  nodes: GraphNode[];
  dependencies: Dependency[];
  programmeOf: Map<string, string>;
  visibleDependencyIds: Set<string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function DependencyGraph({ nodes, dependencies, programmeOf, visibleDependencyIds, selectedId, onSelect }: Props) {
  const theme = useTheme();
  const { pos, groups, tree, height } = layout(nodes, programmeOf);
  const selected = dependencies.find((d) => d.id === selectedId);
  const connected = new Set<string>(selected ? [selected.fromId, selected.toId] : []);
  const label = (id: string) => nodes.find((n) => n.id === id)?.label ?? id;
  const p = theme.palette;
  // Colour is kept for exceptions: only attention and breached relationships are coloured, nodes are neutral.
  const nodeFill = (kind: GraphNode['kind']) => (kind === 'programme' ? alpha(p.primary.main, 0.12) : p.background.default);
  const edge = (d: Dependency) => (d.position === 'breached' || d.position === 'attention' ? p.condition[d.position] : p.text.secondary);
  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id); }
  };
  return (
    <Box sx={{ overflowX: 'auto', '& [role="button"]:focus-visible': { outline: `2px solid ${p.primary.main}`, outlineOffset: 2, strokeWidth: 4 } }}>
      <svg viewBox={`0 0 780 ${height}`} role="group" aria-label="Dependency graph. Programmes and their projects on the left connect to datasets, models, teams, shared services and outcomes on the right. Tab to a relationship and press Enter to select it, or use the list view." style={{ minWidth: 700, width: '100%', fontFamily: theme.typography.fontFamily }}>
        <text x={LEFT_X} y={24} fontSize={12} fontWeight={700} fill={p.text.secondary}>Programmes and projects</text>
        {groups.map((g) => <text key={g.kind} x={RIGHT_X} y={g.y + 12} fontSize={12} fontWeight={700} fill={p.text.secondary}>{KIND_LABEL[g.kind]}</text>)}
        {tree.map((t) => {
          const pg = pos.get(t.programmeId);
          const last = pos.get(t.projectIds.at(-1) ?? '');
          if (!pg || !last) return null;
          return <path key={t.programmeId} aria-hidden d={`M${pg.x + 8},${pg.y + NODE_H} V${last.y + NODE_H / 2} ${t.projectIds.map((id) => `M${pg.x + 8},${(pos.get(id)?.y ?? 0) + NODE_H / 2} H${pos.get(id)?.x ?? 0}`).join(' ')}`} fill="none" stroke={p.divider} />;
        })}
        {dependencies.map((d) => {
          const a = pos.get(d.fromId); const b = pos.get(d.toId);
          if (!a || !b) return null;
          const visible = visibleDependencyIds.has(d.id);
          const isSel = d.id === selectedId;
          const x1 = a.x + a.w; const y1 = a.y + NODE_H / 2; const x2 = b.x; const y2 = b.y + NODE_H / 2;
          const c = (x1 + x2) / 2;
          return (
            <path key={d.id} d={`M${x1},${y1} C${c},${y1} ${c},${y2} ${x2},${y2}`} fill="none" stroke={edge(d)} strokeWidth={isSel ? 3 : 1.5}
              strokeOpacity={visible ? (selectedId && !isSel ? 0.25 : 0.9) : 0.08} strokeDasharray={d.reuseCandidate ? '5 4' : undefined}
              {...(visible ? { tabIndex: 0, role: 'button', 'aria-pressed': isSel, 'aria-label': `${label(d.fromId)} ${d.type} ${label(d.toId)}. Position ${d.position}. Owner ${d.owner}.` } : { 'aria-hidden': true })}
              style={{ cursor: visible ? 'pointer' : 'default' }} onClick={() => visible && onSelect(d.id)} onKeyDown={(e) => onKey(e, d.id)}>
              <title>{d.id}: {d.type}. {d.description}</title>
            </path>
          );
        })}
        {nodes.filter((n) => pos.has(n.id)).map((n) => {
          const b = pos.get(n.id)!;
          const dim = selectedId ? !connected.has(n.id) : false;
          const max = Math.floor(b.w / 6.8);
          return (
            <g key={n.id} opacity={dim ? 0.45 : 1} aria-hidden>
              <rect x={b.x} y={b.y} width={b.w} height={NODE_H} rx={3} fill={nodeFill(n.kind)} stroke={connected.has(n.id) ? p.primary.main : p.divider} strokeWidth={connected.has(n.id) ? 2 : 1} />
              <text x={b.x + 8} y={b.y + 17} fontSize={11.5} fontWeight={n.kind === 'programme' ? 700 : 400} fill={p.text.primary}>{n.label.length > max ? `${n.label.slice(0, max - 1)}...` : n.label}</text>
            </g>
          );
        })}
      </svg>
    </Box>
  );
}
