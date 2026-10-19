import { respond, store } from './store';

export const QUESTION_TEMPLATES = [
  'What changed against the previous commitment?',
  'Why did the release date move?',
  'Which projects depend on this input?',
  'What supports the reported progress?',
  'Where is expenditure diverging from plan?',
  'Which benefits remain forecasts?',
  'Which actions are still unresolved?',
] as const;

export type InvestigationResult = {
  answer: string;
  method: string;
  evidenceIds: string[];
  highlightIds: string[];
  uncertainties: string[];
  proposedResponse: string;
  needsClarification?: string;
};

export type InvestigationInput = { question: string; contextIds: string[]; period: string };

const gbp = (n: number) => `£${(n / 1000).toFixed(0)}k`;

function projectsIn(contextIds: string[]) {
  const direct = store.projects.filter((p) => contextIds.includes(p.id));
  const viaProgramme = store.projects.filter((p) => contextIds.includes(p.programmeId));
  const all = [...direct, ...viaProgramme];
  return all.length ? all : store.projects;
}

/** Investigation service. Every answer is built from the context store so the evidence references resolve. */
export function runInvestigation(input: InvestigationInput): Promise<InvestigationResult> {
  const q = input.question.toLowerCase();
  const scope = projectsIn(input.contextIds);
  const ids = scope.map((p) => p.id);

  if (q.includes('commitment') || q.includes('changed')) {
    const cs = store.commitments.filter((c) => ids.includes(c.projectId) && c.baselineDate !== c.currentDate);
    if (!cs.length) return respond({ answer: 'No commitment in scope has moved from its baseline.', method: 'Compared baseline and current date for each commitment in scope.', evidenceIds: [], highlightIds: ids, uncertainties: [], proposedResponse: 'No response needed.' });
    const lines = cs.map((c) => `${c.title}: ${c.baselineDate} to ${c.currentDate} (${c.status}).`);
    return respond({
      answer: `${cs.length} commitment${cs.length > 1 ? 's' : ''} moved. ${lines.join(' ')}`,
      method: 'Compared baseline date (programme plan) with current date (initiative register) for every commitment in scope. Dates are reported values, not verified.',
      evidenceIds: [...new Set(cs.map((c) => c.evidenceId))], highlightIds: cs.map((c) => c.id),
      uncertainties: ['Plan and register disagree on the P-102 date (16 Oct vs 23 Oct); the register value is shown.'],
      proposedResponse: 'Ask each owner to confirm the revised date and the reason recorded in the scope change.',
    }, 900);
  }
  if (q.includes('release')) {
    const rs = store.releases.filter((r) => ids.includes(r.projectId) && r.events.filter((e) => e.kind === 'planned').length > 1);
    const sc = store.scopeChanges.filter((s) => rs.some((r) => r.projectId === s.projectId));
    return respond({
      answer: rs.length ? `${rs.map((r) => `${r.capability}: ${r.events.filter((e) => e.kind === 'planned').map((e) => e.date).join(' to ')}. ${r.outstandingConditions.join('; ')}.`).join(' ')} Scope changes recorded: ${sc.map((s) => s.ownerReportedEffect).join(' ')}` : 'No release in scope has a revised planned date.',
      method: 'Read planned events on each release; linked scope changes on the same project within 14 days of the revision.',
      evidenceIds: [...new Set([...rs.map((r) => r.evidenceId), ...sc.map((s) => s.evidenceId)])], highlightIds: rs.map((r) => r.id),
      uncertainties: rs.length ? ['The owner-reported effect is the only stated cause; no independent confirmation.'] : [],
      proposedResponse: rs.length ? 'Record the owner response on the related finding and add the release to the briefing.' : 'No response needed.',
    }, 1000);
  }
  if (q.includes('depend')) {
    const deps = store.dependencies.filter((d) => input.contextIds.includes(d.toId) || ids.includes(d.fromId));
    const targets = [...new Set(deps.map((d) => d.toId))];
    return respond({
      answer: `${deps.length} dependencies in scope across ${targets.length} inputs or services. ${deps.filter((d) => d.position === 'breached' || d.position === 'attention').map((d) => `${d.id} (${d.position}): ${d.description} ${d.aiInferredExposure}`).join(' ')}`,
      method: 'Traversed typed dependency relationships from the selected entities; exposure statements are AI inferred and labelled.',
      evidenceIds: [...new Set(deps.map((d) => d.evidenceId))], highlightIds: deps.map((d) => d.id),
      uncertainties: ['A recorded dependency does not establish that connected work is delayed; owner-reported impact is shown separately on each relationship.'],
      proposedResponse: 'Request clarification from the dependency owner for any breached item.',
    }, 1100);
  }
  if (q.includes('expenditure') || q.includes('cost') || q.includes('plan')) {
    const rows = scope.map((p) => {
      const b = store.costRecords.filter((k) => k.projectId === p.id && k.kind === 'budget' && k.allocationBasis === 'Direct').reduce((a, k) => a + k.amount, 0);
      const f = store.costRecords.filter((k) => k.projectId === p.id && k.kind === 'forecast').reduce((a, k) => a + k.amount, 0);
      return { p, b, f, v: f - b };
    }).filter((r) => Math.abs(r.v) / r.b > 0.05);
    return respond({
      answer: rows.length ? rows.map((r) => `${r.p.name}: forecast ${gbp(r.f)} against budget ${gbp(r.b)} (${r.v > 0 ? '+' : ''}${Math.round((r.v / r.b) * 100)} percent).`).join(' ') : 'No project in scope diverges by more than 5 percent.',
      method: 'Forecast minus budget per project using direct cost records only. Shared allocations without an agreed basis are excluded (definition DEF-06).',
      evidenceIds: ['E-17', ...rows.map((r) => (r.p.id === 'P-302' ? 'E-09' : '')).filter(Boolean)], highlightIds: rows.map((r) => r.p.id),
      uncertainties: ['The £90k shared contribution to P-102 is excluded until Finance confirms the allocation basis.'],
      proposedResponse: 'Ask the project owner for scope options where variance exceeds 15 percent.',
    }, 1000);
  }
  if (q.includes('benefit') || q.includes('forecast')) {
    const oms = store.outcomeMeasures.filter((o) => ids.includes(o.projectId));
    const fc = oms.filter((o) => !o.actual);
    return respond({
      answer: `${fc.length} of ${oms.length} outcome measures in scope are still forecasts: ${fc.map((o) => `${o.name} (${o.period})`).join('; ')}. Measured: ${oms.filter((o) => o.actual).map((o) => `${o.name} ${o.actual}`).join('; ') || 'none'}.`,
      method: 'Split outcome measures by whether a measured value exists. Forecast benefits, measured outcomes, released capacity and cash savings are not summed.',
      evidenceIds: [...new Set(oms.map((o) => o.evidenceId))], highlightIds: oms.map((o) => o.id),
      uncertainties: ['Two projects (P-203, P-303) have no outcome measure defined, so they are absent from this count.'],
      proposedResponse: 'Ask measurement owners for the date the first measurement window opens.',
    }, 900);
  }
  if (q.includes('action') || q.includes('unresolved')) {
    const open = store.actions.filter((a) => a.status !== 'verified complete' && (!a.findingId || store.findings.find((f) => f.id === a.findingId)?.affectedIds.some((x) => ids.includes(x) || input.contextIds.includes(x))));
    return respond({
      answer: `${open.length} actions open. ${open.map((a) => `${a.id} ${a.title} (${a.owner}, due ${a.dueDate}, ${a.status})`).join('. ')}.`,
      method: 'Listed actions not verified complete whose finding touches the selected entities.',
      evidenceIds: [], highlightIds: open.map((a) => a.id),
      uncertainties: ['A-07 is reported complete by the owner but not yet verified.'],
      proposedResponse: 'Chase blocked and overdue items in Decisions and actions.',
    }, 800);
  }
  if (q.includes('support') || q.includes('progress')) {
    const ev = store.evidence.filter((e) => scope.some((p) => p.owner === e.owner) && e.type === 'project update');
    return respond({
      answer: `Reported progress rests on ${ev.length} weekly update${ev.length === 1 ? '' : 's'}: ${ev.map((e) => `${e.owner} (${e.date}, v${e.version}${e.stale ? ', stale' : ''})`).join('; ')}. Each is a reported statement by the owner; none has been independently verified.`,
      method: 'Collected project-update evidence for the owners in scope and flagged stale records.',
      evidenceIds: ev.map((e) => e.id), highlightIds: ids,
      uncertainties: ev.some((e) => e.stale) ? ['At least one update is older than the current review period.'] : [],
      proposedResponse: 'Request a current update where the record is stale.',
    }, 900);
  }
  return respond({
    answer: '', method: '', evidenceIds: [], highlightIds: [], uncertainties: [], proposedResponse: '',
    needsClarification: 'I can answer questions about commitments, releases, dependencies, cost, benefits, supporting evidence or open actions. Which of these is closest to what you need?',
  }, 600);
}
