import type { ReactNode } from 'react';
import { Syne } from 'next/font/google';

const display = Syne({
  subsets: ['latin'],
  variable: '--font-chart-display',
  weight: ['500', '600', '700', '800'],
});

/** Teal/green brand from patient portal auth surfaces (not navy). */
const chartTheme = {
  ['--color-primary' as string]: '#0d9488',
  ['--color-primary-foreground' as string]: '#ffffff',
  ['--color-header' as string]: '#14261f',
  ['--color-header-foreground' as string]: '#f4f2ee',
  ['--color-ring' as string]: '#0d9488',
  ['--color-accent' as string]: '#ecfdf8',
  ['--color-accent-foreground' as string]: '#0f766e',
};

export default function ProviderLayout({ children }: { children: ReactNode }) {
  return (
    <div className={display.variable} style={chartTheme}>
      {children}
    </div>
  );
}
