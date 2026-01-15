// Navigation Configuration
export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
}

export const marketingNav: NavItem[] = [
  { title: 'Features', href: '/#features' },
  { title: 'Pricing', href: '/pricing' },
  { title: 'Docs', href: '/docs', external: true },
];

export const dashboardNav: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: 'home' },
  { title: 'Paymasters', href: '/paymasters', icon: 'wallet' },
  { title: 'Analytics', href: '/analytics', icon: 'chart' },
  { title: 'Settings', href: '/settings', icon: 'settings' },
];

export const dashboardSecondaryNav: NavItem[] = [
  { title: 'Documentation', href: '/docs', icon: 'book', external: true },
  { title: 'Support', href: '/support', icon: 'help' },
];
