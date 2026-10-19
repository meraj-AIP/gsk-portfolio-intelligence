import type { Briefing, BriefingSection } from '@/shared/types/domain';
import { SectionCard } from '@/shared/components/SectionCard';
import { isRestricted } from './briefingRules';
import { FiguresBlock } from './FiguresBlock';
import { InsertAssessment } from './InsertAssessment';
import { UnresolvedSection } from './UnresolvedSection';
import type { ExtrasState } from './useBriefingExtras';

/** Figures go under the cost section; the leadership position section offers the calculated assessment as a start. */
export function sectionExtra(b: Briefing, state: ExtrasState, editable: boolean) {
  return function SectionExtra(s: BriefingSection, setNarrative: (n: string) => void) {
    if (s.key === 'cost') return <FiguresBlock state={state} />;
    if (s.key === 'position' && editable && !isRestricted(b.audience)) {
      return <InsertAssessment scope={b.scope} snapshotId={b.snapshotId} narrative={s.narrative} onInsert={setNarrative} />;
    }
    return null;
  };
}

/** A briefing without a cost section still carries the figures; every briefing ends with its unresolved conclusions. */
export function CanvasFooter({ sections, state }: { sections: BriefingSection[]; state: ExtrasState }) {
  const hasCost = sections.some((s) => s.key === 'cost');
  return (
    <>
      {hasCost ? null : (
        <SectionCard title={`${sections.length + 1}. Cost and outcome figures`}>
          <FiguresBlock state={state} />
        </SectionCard>
      )}
      <UnresolvedSection state={state} position={sections.length + (hasCost ? 1 : 2)} />
    </>
  );
}
