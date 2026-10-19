import type { Briefing, BriefingSection, BriefingStatus } from '@/shared/types/domain';
import type { Capability } from '@/shared/lib/permissions';
import type { BriefingExtras } from './briefingFigures';
import type { BriefingItem } from './useBriefingItems';

export const AUDIENCES = ['Enterprise Data and AI leadership', 'Business sponsors', 'Project leads'];
const FULL_AUDIENCE = 'Enterprise Data and AI leadership';
export const isRestricted = (audience: string) => audience !== FULL_AUDIENCE;

type Move = { label: string; to: BriefingStatus; capability: Capability; primary: boolean };

/** Mirrors the write API's allowed moves so the screen never offers one the server would refuse. */
export const MOVES: Partial<Record<BriefingStatus, Move[]>> = {
  draft: [{ label: 'Send for review', to: 'under review', capability: 'prepare briefing', primary: true }],
  'under review': [
    { label: 'Approve', to: 'approved', capability: 'prepare briefing', primary: true },
    { label: 'Return to draft', to: 'draft', capability: 'prepare briefing', primary: false },
  ],
  approved: [
    { label: 'Publish', to: 'published', capability: 'publish briefing', primary: true },
    { label: 'Return to draft', to: 'draft', capability: 'prepare briefing', primary: false },
  ],
};

export const isFrozen = (b: Briefing) => b.status === 'published' || b.status === 'superseded';

/** What a reader sees: the frozen content once published, the working copy before that. */
export const shownSections = (b: Briefing): BriefingSection[] => (isFrozen(b) && b.published ? b.published.sections : b.sections);

/** lines carry calculated figures or unresolved conclusions: plain text, never mixed with the owner-reported items. */
export type ExportSection = { key: string; title: string; narrative: string; items: BriefingItem[]; hidden: number; lines?: string[] };

/** Applies the same audience restriction as the canvas, so an export never shows more than the preview did. */
export function exportSections(b: Briefing, resolve: (id: string) => BriefingItem): ExportSection[] {
  const restricted = isRestricted(b.audience);
  return shownSections(b).map((s) => {
    const items = s.itemIds.map(resolve).filter((it) => !(restricted && it.audienceRestricted));
    return { key: s.key, title: s.title, narrative: s.narrative, items, hidden: s.itemIds.length - items.length };
  });
}

/** Adds the calculated figures after the cost section (or at the end) and closes with the unresolved conclusions. */
export function withExtras(sections: ExportSection[], x: BriefingExtras): ExportSection[] {
  const figures: ExportSection = { key: 'figures', title: 'Cost and outcome figures (calculated from records)', narrative: x.stamp, items: [], hidden: 0, lines: x.figureLines };
  const unresolved: ExportSection = {
    key: 'unresolved', title: 'Unresolved conclusions', items: [], hidden: x.hiddenUnresolved,
    narrative: x.unresolved.length ? 'These conclusions are not yet agreed or closed and are reported with their status.' : 'No unresolved conclusions in scope.',
    lines: x.unresolved.map((u) => `${u.title} (${u.id}): ${u.reason}`),
  };
  const at = sections.findIndex((s) => s.key === 'cost');
  const out = at < 0 ? [...sections, figures] : [...sections.slice(0, at + 1), figures, ...sections.slice(at + 1)];
  return [...out, unresolved];
}

export const exportFileName = (b: Briefing) => `${b.audience} ${b.period}`.replace(/[^A-Za-z0-9 ]+/g, '').trim().replace(/\s+/g, '-');

export function teamsMessage(b: Briefing, sections: ExportSection[], link: string, stamp: string): string {
  const head = `${b.audience} briefing, ${b.period} (${b.scope}). Status: ${b.status}, version ${b.version}. ${stamp}`;
  const body = sections.map((s) => {
    const lines = [...s.items.map((it) => `- ${it.label} [${it.reviewStatus}]`), ...(s.lines ?? []).map((l) => `- ${l}`)];
    if (s.hidden) lines.push(`- ${s.hidden} item${s.hidden === 1 ? '' : 's'} restricted for this audience`);
    return [`**${s.title}**`, s.narrative || 'No narrative.', ...lines].join('\n');
  });
  return [head, ...body, `Open in the portfolio workspace: ${link}`].join('\n\n');
}
