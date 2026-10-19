import type { BriefingFigures } from '@/shared/lib/assessment';
import { formatDate, gbpShort } from '@/shared/lib/format';
import type { Briefing, Snapshot } from '@/shared/types/domain';
import { isRestricted } from './briefingRules';
import type { BriefingItem } from './useBriefingItems';

export type Unresolved = BriefingFigures['unresolved'][number];

/** Everything a briefing carries beyond its sections, shared by the canvas and both exports so they cannot disagree. */
export type BriefingExtras = { stamp: string; figureLines: string[]; unresolved: Unresolved[]; hiddenUnresolved: number };

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const weekOf = (text: string): number | null => {
  const m = /W(?:eek\s*)?(\d{1,2})\b/i.exec(text);
  return m ? Number(m[1]) : null;
};

export const stampText = (snap: Snapshot | undefined, snapshotId: string): string =>
  (snap ? `Drawn from the week ${weekOf(snap.week) ?? snap.week} review snapshot, as of ${formatDate(snap.date)}.` : `Drawn from snapshot ${snapshotId}, which could not be found.`);

/** Reasons the stamp should not be trusted at face value: wrong week for the label, or not the review the reader is looking at. */
export function snapshotWarnings(b: Briefing, snap: Snapshot | undefined, viewed: Snapshot | undefined): string[] {
  if (!snap) return [`Snapshot ${b.snapshotId} does not exist, so the figures cannot be tied to a review.`];
  const out: string[] = [];
  const claimed = weekOf(b.period);
  const actual = weekOf(snap.week);
  if (claimed !== null && actual !== null && claimed !== actual) out.push(`This briefing is labelled ${b.period} but draws from the week ${actual} review snapshot.`);
  if (viewed && viewed.id !== snap.id) out.push(`The review bar shows ${viewed.label}. This briefing still draws from ${snap.label}, so its figures may differ from other screens.`);
  return out;
}

/** Calculated lines for the cost section. Cost totals are withheld from audiences that may not see cost detail. */
export function figureLines(f: BriefingFigures, audience: string): string[] {
  const { cost } = f;
  const outcomes = `${plural(f.measuredOutcomes, 'outcome')} measured; ${plural(f.forecastBenefits, 'benefit')} still a forecast. Counted separately, never added together.`;
  if (isRestricted(audience)) return ['Cost figures are restricted to leadership.', outcomes];
  const pct = cost.budget ? Math.round((Math.abs(cost.variance) / cost.budget) * 100) : null;
  const variance = cost.variance === 0 ? 'Forecast matches budget.'
    : `Forecast is ${gbpShort(Math.abs(cost.variance))} ${cost.variance > 0 ? 'over' : 'under'} budget${pct === null ? '' : ` (${pct} percent)`}.`;
  return [
    `Forecast ${gbpShort(cost.forecast)} against a budget of ${gbpShort(cost.budget)}.`,
    variance,
    `Direct cost records cover ${cost.coverage} of ${cost.of} projects in scope.`,
    ...(cost.sharedExcluded ? [`${gbpShort(cost.sharedExcluded)} of shared cost is excluded until finance confirms the allocation basis.`] : []),
    outcomes,
  ];
}

export function briefingExtras(b: Briefing, f: BriefingFigures, snap: Snapshot | undefined, resolve: (id: string) => BriefingItem): BriefingExtras {
  const restricted = isRestricted(b.audience);
  const unresolved = f.unresolved.filter((u) => !(restricted && resolve(u.id).audienceRestricted));
  return { stamp: stampText(snap, b.snapshotId), figureLines: figureLines(f, b.audience), unresolved, hiddenUnresolved: f.unresolved.length - unresolved.length };
}
