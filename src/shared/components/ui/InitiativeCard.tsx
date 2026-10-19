import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AvatarName } from './AvatarName';
import { DomainTag } from './StatusChip';

export type Fact = { label: string; value: ReactNode };

type Props = {
  tag: string;
  leadTag?: boolean;
  status: ReactNode;
  title: string;
  description: string;
  facts: Fact[];
  highlight?: { label: string; text: ReactNode };
  owner: { name: string; role: string };
  to: string;
};

/** Initiative tile from the reference design: domain tag and health, title, purpose, fact grid, next milestone, owner. */
export function InitiativeCard({ tag, leadTag = false, status, title, description, facts, highlight, owner, to }: Props) {
  return (
    <Card sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <DomainTag strong={leadTag}>{tag}</DomainTag>
        {status}
      </Stack>
      <Box>
        <Typography variant="h2" component="h3" sx={{ fontSize: '1.1875rem' }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{description}</Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
        {facts.map((f) => (
          <Box key={f.label} sx={(t) => ({ bgcolor: t.palette.brand.canvas, px: 1, py: 0.75, borderRadius: 0.5 })}>
            <Typography variant="overline" component="p" sx={{ fontSize: '0.625rem' }}>{f.label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{f.value}</Typography>
          </Box>
        ))}
      </Box>
      {highlight ? (
        <Box sx={(t) => ({ bgcolor: t.palette.brand.canvas, px: 1, py: 0.75, borderRadius: 0.5 })}>
          <Typography variant="overline" component="p" sx={(t) => ({ fontSize: '0.625rem', color: t.palette.brand.accent })}>{highlight.label}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{highlight.text}</Typography>
        </Box>
      ) : null}
      <Stack direction="row" sx={{ mt: 'auto', pt: 1, justifyContent: 'space-between', alignItems: 'center' }}>
        <AvatarName name={owner.name} subtitle={owner.role} />
        <IconButton component={RouterLink} to={to} aria-label={`Open ${title}`} sx={{ border: 1, borderColor: 'divider' }} size="small"><ArrowOutwardIcon fontSize="small" /></IconButton>
      </Stack>
    </Card>
  );
}
