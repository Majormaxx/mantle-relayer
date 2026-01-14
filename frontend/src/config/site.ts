// Site Configuration
export const siteConfig = {
  name: 'Mantle Gasless Relayer',
  description:
    'Enable gasless transactions for your users on the Mantle network',
  url: 'https://relayer.mantle.xyz',
  ogImage: 'https://relayer.mantle.xyz/og.png',
  links: {
    twitter: 'https://twitter.com/0xMantle',
    github: 'https://github.com/mantlenetworkio',
    discord: 'https://discord.gg/mantle',
    docs: 'https://docs.mantle.xyz',
  },
} as const;

export type SiteConfig = typeof siteConfig;
