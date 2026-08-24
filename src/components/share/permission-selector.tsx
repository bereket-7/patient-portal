'use client';

import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';
import {
  SHARE_PERMISSION_OPTIONS,
  type SharePermission,
} from '@/lib/types/share';
import { Pill, ShieldAlert, Stethoscope, FlaskConical, Layers } from 'lucide-react';

const ICONS: Record<SharePermission, ComponentType<{ className?: string }>> = {
  ALL: Layers,
  MEDICATIONS: Pill,
  ALLERGIES: ShieldAlert,
  CONDITIONS: Stethoscope,
  RECENT_LABS: FlaskConical,
};

export function PermissionSelector({
  value,
  onChange,
  disabled,
}: {
  value: SharePermission;
  onChange: (permission: SharePermission) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {SHARE_PERMISSION_OPTIONS.map((option) => {
        const Icon = ICONS[option.id];
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={cn(
              'group flex items-start gap-3 rounded-lg border p-3.5 text-left transition-all',
              'hover:border-primary/40 hover:bg-accent/40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected
                ? 'border-primary bg-accent/60 shadow-sm ring-1 ring-primary/20'
                : 'border-border bg-card',
              disabled && 'pointer-events-none opacity-60',
            )}
          >
            <span
              className={cn(
                'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors',
                selected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary',
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">{option.label}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                {option.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
