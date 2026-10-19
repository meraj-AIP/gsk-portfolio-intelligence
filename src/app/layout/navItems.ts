export type NavItem = { label: string; to: string; match: string[] };

export const NAV_ITEMS: NavItem[] = [
  { label: 'Portfolio overview', to: '/portfolio', match: ['/portfolio', '/dependencies', '/compare'] },
  { label: 'This week', to: '/this-week', match: ['/this-week', '/releases'] },
  { label: 'Programmes and projects', to: '/directory', match: ['/directory', '/programmes', '/projects'] },
  { label: 'Decisions and actions', to: '/decisions', match: ['/decisions'] },
  { label: 'Briefing', to: '/briefing', match: ['/briefing'] },
];

export const ADMIN_ITEMS: NavItem[] = [
  { label: 'Sources and quality', to: '/sources', match: ['/sources', '/audit'] },
  { label: 'Definitions', to: '/definitions', match: ['/definitions'] },
];

export const isActive = (item: NavItem, path: string) => item.match.some((m) => path === m || path.startsWith(`${m}/`));
