import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useBriefings } from '@/shared/api/hooks';
import { PageHeader } from '@/shared/components/PageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { can } from '@/shared/lib/permissions';
import type { Briefing, BriefingStatus } from '@/shared/types/domain';
import { BriefingActions } from './BriefingActions';
import { BriefingEyebrow, BriefingPicker } from './BriefingHeader';
import { BriefingCanvas } from './BriefingCanvas';
import { CanvasFooter, sectionExtra } from './CanvasExtras';
import { BriefingControls } from './BriefingControls';
import { BriefingExport } from './BriefingExport';
import { isFrozen, shownSections } from './briefingRules';
import { NewBriefingDialog } from './NewBriefingDialog';
import { PublishConfirmDialog } from './PublishConfirmDialog';
import { SnapshotStamp } from './SnapshotStamp';
import { PublishedBriefingPanel } from './PublishedBriefingPanel';
import { useBriefingExtras } from './useBriefingExtras';
import { useBriefingItems } from './useBriefingItems';
import { useBriefingWorkflow } from './useBriefingWorkflow';

/** S13. Turns the maintained portfolio record into a stakeholder review output, with evidence and review status intact. */
export function BriefingPage() {
  const { user } = useAuth();
  const briefings = useBriefings();
  const { resolve, ready } = useBriefingItems();
  const [selectedId, setSelectedId] = useUrlParam('briefing');
  const [draft, setDraft] = useState<Briefing | null>(null);
  const [preview, setPreview] = useState(false);
  const [creating, setCreating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const flow = useBriefingWorkflow(draft, setDraft);
  const extras = useBriefingExtras(draft, resolve);
  const requestMove = (to: BriefingStatus) => (to === 'published' ? setConfirming(true) : flow.move(to));

  useEffect(() => {
    if (!briefings.data || (draft && draft.id === selectedId)) return;
    const pick = briefings.data.find((b) => b.id === selectedId) ?? (selectedId ? null : briefings.data.find((b) => b.status === 'draft') ?? briefings.data[0]);
    if (!pick) return;
    setDraft(pick);
    // Pinning the id in the URL keeps a background refetch from replacing unsaved edits with the default pick.
    if (!selectedId) setSelectedId(pick.id);
  }, [briefings.data, draft, selectedId, setSelectedId]);

  const open = (b: Briefing) => { setDraft(b); setSelectedId(b.id); setPreview(false); };
  const reload = async () => {
    const fresh = (await briefings.refetch()).data?.find((b) => b.id === draft?.id);
    if (fresh) setDraft(fresh);
  };

  if (briefings.isError) return <ErrorState message="Briefings could not be loaded." onRetry={() => void briefings.refetch()} />;
  if (!briefings.data || !ready) return <LoadingState rows={8} />;
  const dialog = <NewBriefingDialog open={creating} onClose={() => setCreating(false)} onCreated={open} />;
  if (!draft) {
    return (
      <>
        <PageHeader title="Briefing preparation" actions={can(user, 'prepare briefing') ? <Button variant="contained" color="secondary" onClick={() => setCreating(true)}>New briefing</Button> : undefined} />
        <EmptyState title={selectedId ? `Briefing ${selectedId} was not found` : 'No briefings yet'} hint="The portfolio lead starts a briefing from a template; it then appears here." />
        {dialog}
      </>
    );
  }
  const frozen = isFrozen(draft);
  const editable = !frozen && (draft.status === 'draft' || draft.status === 'under review') && can(user, 'prepare briefing');

  return (
    <>
      <PageHeader eyebrow={<BriefingEyebrow b={draft} />} title="Briefing preparation"
        subtitle={`${draft.audience}, ${draft.scope}, ${draft.period}. Publishing creates a versioned snapshot; later corrections become a revision.`}
        actions={<BriefingActions briefing={draft} editable={editable} busy={flow.busy} preview={preview} onTogglePreview={() => setPreview((v) => !v)} onSave={flow.saveDraft} onMove={requestMove} onNew={() => setCreating(true)} />}
        meta={<BriefingPicker all={briefings.data} current={draft.id} onOpen={open} />} />
      <SnapshotStamp briefing={draft} />
      {flow.error ? (
        <Alert severity="error" sx={{ mb: 2 }} action={flow.conflict ? <Button color="inherit" size="small" onClick={() => void reload()}>Reload</Button> : undefined}>
          {flow.error}{flow.conflict ? ' Reloading discards your unsaved edits.' : ''}
        </Alert>
      ) : null}
      {flow.saved ? <Alert severity="success" sx={{ mb: 2 }}>Briefing saved with its selected records, evidence references, audience and snapshot.</Alert> : null}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack sx={{ gap: 3 }}>
            {frozen ? <SectionCard title="Published version"><PublishedBriefingPanel briefing={draft} onRevised={open} /></SectionCard> : null}
            <SectionCard title="Export"><BriefingExport briefing={draft} resolve={resolve} extras={extras.extras} /></SectionCard>
            <BriefingControls key={draft.id} draft={draft} editable={editable} resolve={resolve} onChange={setDraft} />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h2">{frozen ? 'Published content' : preview ? `Preview for ${draft.audience}` : 'Briefing canvas'}</Typography>
            <Typography variant="overline">{draft.scope}, {draft.period}</Typography>
          </Stack>
          <BriefingCanvas sections={shownSections(draft)} resolve={resolve} readOnly={preview || !editable} audience={draft.audience} onChange={(sections) => setDraft({ ...draft, sections })}
            extra={sectionExtra(draft, extras, editable && !preview)} footer={<CanvasFooter sections={shownSections(draft)} state={extras} />} />
        </Grid>
      </Grid>
      {dialog}
      <PublishConfirmDialog open={confirming} state={extras} onCancel={() => setConfirming(false)} onConfirm={() => { setConfirming(false); flow.move('published'); }} />
    </>
  );
}
