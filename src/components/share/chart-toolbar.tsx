'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type ChartTab = 'overview' | 'conditions' | 'medications' | 'labs' | 'history';

export type SortOption = 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc' | 'severity';

type FilterOption = { value: string; label: string };

const controlClass =
  'h-10 rounded-none border-0 border-b border-border bg-transparent shadow-none focus:ring-0 focus-visible:ring-0';

export function ChartToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  filterValue,
  filterOptions,
  onFilterChange,
  secondaryFilterValue,
  secondaryFilterOptions,
  onSecondaryFilterChange,
  resultCount,
  totalCount,
  onExpandAll,
  onCollapseAll,
  onClear,
  onCopySummary,
  hasActiveFilters,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  filterLabel?: string;
  filterValue: string;
  filterOptions: FilterOption[];
  onFilterChange: (value: string) => void;
  secondaryFilterLabel?: string;
  secondaryFilterValue?: string;
  secondaryFilterOptions?: FilterOption[];
  onSecondaryFilterChange?: (value: string) => void;
  resultCount: number;
  totalCount: number;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onClear: () => void;
  onCopySummary: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="space-y-0 overflow-hidden rounded-sm border border-border bg-card">
      <div className="grid gap-0 lg:grid-cols-[1.4fr_auto]">
        <div className="relative border-b border-border lg:border-b-0 lg:border-r">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search…"
            className="h-11 rounded-none border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
            aria-label="Search clinical chart"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3">
          <Select value={sort} onValueChange={(v) => onSortChange(v as SortOption)}>
            <SelectTrigger className={cn(controlClass, 'border-b sm:border-b-0 sm:border-r')}>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="name-asc">Name A–Z</SelectItem>
              <SelectItem value="name-desc">Name Z–A</SelectItem>
              <SelectItem value="date-desc">Newest</SelectItem>
              <SelectItem value="date-asc">Oldest</SelectItem>
              <SelectItem value="severity">Severity</SelectItem>
            </SelectContent>
          </Select>

          {filterOptions.length > 0 ? (
            <Select value={filterValue} onValueChange={onFilterChange}>
              <SelectTrigger className={cn(controlClass, 'border-b sm:border-b-0 sm:border-r')}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {filterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="border-b border-border sm:border-b-0 sm:border-r" />
          )}

          {secondaryFilterOptions && secondaryFilterOptions.length > 0 && onSecondaryFilterChange ? (
            <Select value={secondaryFilterValue} onValueChange={onSecondaryFilterChange}>
              <SelectTrigger className={cn(controlClass, 'col-span-2 sm:col-span-1')}>
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {secondaryFilterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="col-span-2 hidden border-border sm:col-span-1 sm:block" />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-3 py-2">
        <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
          <span className="text-foreground">{resultCount}</span>
          <span className="mx-1 opacity-40">/</span>
          <span>{totalCount}</span>
          <span className="ml-2 uppercase tracking-[0.14em]">
            {hasActiveFilters ? 'filtered' : 'results'}
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-0">
          {[
            { label: 'Expand', onClick: onExpandAll },
            { label: 'Collapse', onClick: onCollapseAll },
            { label: 'Copy', onClick: onCopySummary },
          ].map((action, i) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={cn(
                'px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/70 transition-colors hover:bg-muted hover:text-foreground',
                i > 0 && 'border-l border-border',
              )}
            >
              {action.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onClear}
            disabled={!hasActiveFilters}
            className={cn(
              'inline-flex items-center gap-1 border-l border-border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors',
              hasActiveFilters
                ? 'text-primary hover:bg-accent'
                : 'cursor-not-allowed text-muted-foreground/40',
            )}
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export function QuickFilterChips({
  chips,
  active,
  onToggle,
}: {
  chips: Array<{ id: string; label: string }>;
  active: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-px overflow-hidden rounded-sm border border-border bg-border">
      {chips.map((chip) => {
        const on = active.includes(chip.id);
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onToggle(chip.id)}
            className={cn(
              'bg-card px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors',
              on
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

export function matchesQuery(query: string, ...fields: Array<string | number | undefined | null>) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => String(f ?? '').toLowerCase().includes(q));
}

export function parseLooseDate(value: string): number {
  const t = Date.parse(value);
  if (!Number.isNaN(t)) return t;
  const m = value.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (m) {
    const parsed = Date.parse(`${m[2]} ${m[1]}, ${m[3]}`);
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (/^\d{4}$/.test(value)) return Date.parse(`${value}-01-01`);
  return 0;
}

const SEVERITY_RANK: Record<string, number> = {
  Severe: 4,
  High: 4,
  Moderate: 3,
  Mild: 2,
  Low: 1,
  Complaint: 1,
};

export function severityRank(value: string): number {
  return SEVERITY_RANK[value] ?? 0;
}
