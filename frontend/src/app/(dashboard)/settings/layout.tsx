import type { ReactNode } from 'react';

interface SettingsLayoutProps {
  children: ReactNode;
}

const settingsNav = [
  { href: '/settings/profile', label: 'Profile' },
  { href: '/settings/notifications', label: 'Notifications' },
  { href: '/settings/appearance', label: 'Appearance' },
  { href: '/settings/danger', label: 'Danger Zone' },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Settings navigation */}
        <nav className="lg:w-48 flex-shrink-0">
          <ul className="space-y-1">
            {settingsNav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Settings content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
