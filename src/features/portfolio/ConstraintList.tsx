import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { CONDITION_SHORT } from '@/shared/lib/format';
import { KIND_SINGULAR, plural, type ScopedConstraint } from './ConstraintModel';

type Props = { constraints: ScopedConstraint[]; selectedId: string | null; onSelect: (id: string) => void };

/** One compact row per constraint. Only attention and breached get colour; everything else is plain text. */
export function ConstraintList({ constraints, selectedId, onSelect }: Props) {
  return (
    <Stack component="ul" sx={{ m: 0, p: 0, listStyle: 'none', gap: 0.75 }}>
      {constraints.map((c) => {
        const sel = c.node.id === selectedId;
        const exception = c.worst === 'breached' || c.worst === 'attention';
        const findings = c.findingIds.length;
        return (
          <li key={c.node.id}>
            <ButtonBase onClick={() => onSelect(c.node.id)} aria-pressed={sel}
              sx={{ display: 'block', width: '100%', textAlign: 'left', p: 1, border: 1, borderRadius: 0.5, borderColor: sel ? 'primary.main' : 'divider', bgcolor: sel ? 'background.default' : 'background.paper', '&:focus-visible': { outline: 2, outlineStyle: 'solid', outlineColor: 'primary.main' } }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.node.label}</Typography>
                {exception ? <ConditionChip condition={c.worst} compact /> : <Typography variant="caption">{CONDITION_SHORT[c.worst]}</Typography>}
              </Stack>
              <Typography variant="caption" sx={{ display: 'block' }}>
                {KIND_SINGULAR[c.node.kind]}, {c.node.owner ? `owned by ${c.node.owner}` : 'owner not recorded'}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                {plural(c.inScopeProjectIds.length, 'project')} in {plural(c.inScopeProgrammeIds.length, 'programme')}, {findings ? plural(findings, 'linked finding') : 'no linked findings'}
              </Typography>
            </ButtonBase>
          </li>
        );
      })}
    </Stack>
  );
}
