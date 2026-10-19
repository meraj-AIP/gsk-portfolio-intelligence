import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CloseIcon from '@mui/icons-material/Close';
import type { ReactNode } from 'react';
import type { BriefingSection } from '@/shared/types/domain';
import { EntityLink } from '@/shared/components/EntityLink';
import { isRestricted } from './briefingRules';
import type { BriefingItem } from './useBriefingItems';

type Props = {
  sections: BriefingSection[]; resolve: (id: string) => BriefingItem; readOnly: boolean; onChange: (sections: BriefingSection[]) => void; audience: string;
  /** Calculated content attached under a section, kept outside the editable narrative. */
  extra?: (s: BriefingSection, setNarrative: (narrative: string) => void) => ReactNode;
  footer?: ReactNode;
};

/** Editable briefing canvas. Narrative without supporting items is marked for substantiation. */
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
    <Stack sx={{ gap: 2 }}>
      {sections.map((s, i) => {
        const items = s.itemIds.map(resolve).filter((it) => !(restricted && it.audienceRestricted));
        const hidden = s.itemIds.length - items.length;
        const unsupported = s.narrative.trim().length > 0 && !items.some((it) => !it.needsSubstantiation);
        return (
          <Box key={s.key} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 0.5 }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <Typography variant="h3" sx={{ flex: 1 }}>{i + 1}. {s.title}</Typography>
              {unsupported ? <Chip label="Marked for substantiation" color="warning" variant="outlined" /> : null}
              {!readOnly ? <><IconButton size="small" aria-label="Move up" onClick={() => move(i, -1)}><ArrowUpwardIcon fontSize="small" /></IconButton><IconButton size="small" aria-label="Move down" onClick={() => move(i, 1)}><ArrowDownwardIcon fontSize="small" /></IconButton></> : null}
            </Stack>
            {readOnly ? <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>{s.narrative || <em>No narrative.</em>}</Typography>
              : <TextField fullWidth multiline minRows={2} value={s.narrative} onChange={(e) => setNarrative(i, e.target.value)} placeholder="Narrative for this section" sx={{ mt: 1 }} />}
            {extra?.(s, (n) => setNarrative(i, n))}
            <Stack sx={{ gap: 0.5, mt: 1 }}>
              {items.map((it) => (
                <Box key={it.id}>
                  <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                    <Chip label={it.kind} size="small" variant="outlined" />
                    <Typography variant="body2" sx={{ flex: 1 }}><EntityLink id={it.id} label={it.label} /></Typography>
                    {it.needsSubstantiation ? <Chip label="Needs substantiation" size="small" color="warning" variant="outlined" /> : null}
                    <Typography variant="caption">{it.reviewStatus}</Typography>
                    {!readOnly ? <IconButton size="small" aria-label={`Remove ${it.id}`} onClick={() => removeItem(i, it.id)}><CloseIcon fontSize="small" /></IconButton> : null}
                  </Stack>
                  {it.detail ? <Typography variant="caption" component="p" sx={{ pl: 1, borderLeft: 2, borderColor: 'warning.main', color: 'text.secondary' }}>AI interpretation: {it.detail}</Typography> : null}
                </Box>
              ))}
              {hidden ? <Typography variant="caption">{hidden} item{hidden === 1 ? '' : 's'} hidden for this audience (cost detail is restricted to leadership).</Typography> : null}
              {items.length === 0 && !hidden ? <Typography variant="caption">No supporting items.</Typography> : null}
            </Stack>
          </Box>
        );
      })}
      {footer}
    </Stack>
  );
}
