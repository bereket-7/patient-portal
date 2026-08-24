'use client';

import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme/theme-provider';
import type { ThemePreference } from '@/lib/theme';

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { preference, resolved, setPreference } = useTheme();
  const ActiveIcon = resolved === 'dark' ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('text-white/80 hover:bg-white/10 hover:text-white', className)}
          aria-label="Theme"
          title="Theme"
        >
          <ActiveIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="normal-case tracking-normal text-muted-foreground">
          Appearance
        </DropdownMenuLabel>
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = preference === option.value;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setPreference(option.value)}
              className={cn(selected && 'font-semibold')}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{option.label}</span>
              {selected ? <Check className="h-4 w-4 text-primary" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
