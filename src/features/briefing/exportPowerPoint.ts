import type { Briefing } from '@/shared/types/domain';
import { exportFileName, type ExportSection } from './briefingRules';

/** One slide per section with plain default styling. Loaded on demand so the library stays out of the main bundle. */
export async function exportPowerPoint(b: Briefing, sections: ExportSection[], stamp: string): Promise<void> {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = `${b.audience}, ${b.period}`;

  const cover = pptx.addSlide();
  cover.addText(`${b.audience} briefing`, { x: 0.6, y: 2.2, w: 12, h: 1, fontSize: 32, bold: true });
  cover.addText(`${b.period}, ${b.scope}. Status ${b.status}, version ${b.version}. ${stamp}`, { x: 0.6, y: 3.3, w: 12, h: 0.6, fontSize: 16 });

  for (const s of sections) {
    const slide = pptx.addSlide();
    slide.addText(s.title, { x: 0.5, y: 0.3, w: 12.3, h: 0.7, fontSize: 26, bold: true });
    slide.addText(s.narrative || 'No narrative.', { x: 0.5, y: 1.1, w: 12.3, h: 1.6, fontSize: 15, valign: 'top' });
    const bullets = [...s.items.map((it) => `${it.label} (${it.reviewStatus})`), ...(s.lines ?? [])].map((text) => ({ text, options: { bullet: true } }));
    if (s.hidden) bullets.push({ text: `${s.hidden} item${s.hidden === 1 ? '' : 's'} restricted for this audience`, options: { bullet: true } });
    if (bullets.length) slide.addText(bullets, { x: 0.5, y: 2.9, w: 12.3, h: 4.2, fontSize: 13, valign: 'top' });
  }
  await pptx.writeFile({ fileName: `${exportFileName(b)}.pptx` });
}
