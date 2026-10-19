import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CloseIcon from '@mui/icons-material/Close';
import type { ReactNode } from 'react';
import { StatementFrame } from '@/shared/components/ui/Statement';
import type { BriefingSection } from '@/shared/types/domain';
import { EntityLink } from '@/shared/components/EntityLink';
import { SectionCard } from '@/shared/components/SectionCard';
import { DomainTag, StatusChip } from '@/shared/components/ui/StatusChip';
import { isRestricted } from './briefingRules';
import type { BriefingItem } from './useBriefingItems';

type Props = {
  sections: BriefingSection[]; resolve: (id: string) => BriefingItem; readOnly: boolean; onChange: (sections: BriefingSection[]) => void; audience: string;
  /** Calculated content attached under a section, kept outside the editable narrative. */
  extra?: (s: BriefingSection, setNarrative: (narrative: string) => void) => ReactNode;
  footer?: ReactNode;
};

function Item({ it, onRemove }: { it: BriefingItem; onRemove?: () => void }) {
  return (
    <Box sx={(t) => ({ py: 1, borderTop: `1px solid ${t.palette.divider}` })}>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <DomainTag>{it.kind}</DomainTag>
        <Typography variant="body2" sx={{ flex: 1, minWidth: 160 }}><EntityLink id={it.id} label={it.label} /></Typography>
        {it.needsSubstantiation ? <StatusChip tone="warning">Needs substantiation</StatusChip> : null}
        <Typography variant="caption">{it.reviewStatus}</Typography>
        {onRemove ? <IconButton size="small" aria-label={`Remove ${it.id}`} onClick={onRemove}><CloseIcon fontSize="small" /></IconButton> : null}
      </Stack>
      {it.detail ? <Box sx={{ mt: 1 }}><StatementFrame type="AI interpretation"><Typography variant="body2">{it.detail}</Typography></StatementFrame></Box> : null}
    </Box>
  );
}

/** Editable briefing canvas, one numbered card per section. Narrative without supporting items is marked for substantiation. */
export function BriefingCanvas({ sections, resolve, readOnly, onChange, audience, extra, footer }: Props) {
  const move = (i: number, dir: -1 | 1) => {
    const next = [...sections];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };
  const setNarrative = (i: number, narrative: string) => onChange(sections.map((s, k) => (k === i ? { ...s, narrative } : s)));
  const removeItem = (i: number, id: string) => onChange(sections.map((s, k) => (k === i ? { ...s, itemIds: s.itemIds.filter((x) => x !== id) } : s)));
  const restricted = isRestricted(audience);
  return (
    <Stack sx={{ gap: 3 }}>
      {sections.map((s, i) => {
        const items = s.itemIds.map(resolve).filter((it) => !(restricted && it.audienceRestricted));
        const hidden = s.itemIds.length - items.length;
        const unsupported = s.narrative.trim().length > 0 && !items.some((it) => !it.needsSubstantiation);
        const actions = (
          <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
            {unsupported ? <StatusChip tone="warning">Marked for substantiation</StatusChip> : null}
            {!readOnly ? <><IconButton size="small" aria-label="Move up" onClick={() => move(i, -1)}><ArrowUpwardIcon fontSize="small" /></IconButton><IconButton size="small" aria-label="Move down" onClick={() => move(i, 1)}><ArrowDownwardIcon fontSize="small" /></IconButton></> : null}
          </Stack>
        );
        return (
          <SectionCard key={s.key} title={`${i + 1}. ${s.title}`} badge={`${items.length} item${items.length === 1 ? '' : 's'}`} actions={actions}>
            {readOnly ? <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{s.narrative || <em>No narrative.</em>}</Typography>
              : <TextField fullWidth multiline minRows={2} value={s.narrative} onChange={(e) => setNarrative(i, e.target.value)} placeholder="Narrative for this section" />}
            {extra?.(s, (n) => setNarrative(i, n))}
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="overline" component="p" sx={{ mb: 0.5 }}>Supporting items</Typography>
              {items.map((it) => <Item key={it.id} it={it} {...(readOnly ? {} : { onRemove: () => removeItem(i, it.id) })} />)}
              {hidden ? <Typography variant="caption" component="p">{hidden} item{hidden === 1 ? '' : 's'} hidden for this audience (cost detail is restricted to leadership).</Typography> : null}
              {items.length === 0 && !hidden ? <Typography variant="caption" component="p">No supporting items.</Typography> : null}
            </Box>
          </SectionCard>
        );
      })}
      {footer}
    </Stack>
  );
}
