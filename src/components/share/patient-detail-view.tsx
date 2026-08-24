'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowUpRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartToolbar,
  QuickFilterChips,
  matchesQuery,
  parseLooseDate,
  severityRank,
  type ChartTab,
  type SortOption,
} from '@/components/share/chart-toolbar';
import {
  ALLERGY_DETAILS,
  CONDITION_DETAILS,
  ENCOUNTER_DETAILS,
  LAB_DETAILS,
  MEDICATION_DETAILS,
  PROCEDURE_DETAILS,
  VITAL_DETAILS,
  type AllergyDetail,
  type ConditionDetail,
  type EncounterDetail,
  type LabDetail,
  type MedicationDetail,
  type ProcedureDetail,
  type VitalDetail,
} from '@/lib/mock/clinical-details';
import type { SharedPatientDetail } from '@/lib/share-summary';
import type { CholesterolReading } from '@/lib/types/health-records';
import { sharePermissionLabel } from '@/lib/types/share';
import { cn } from '@/lib/utils';

const HDL_GOAL = 50;
const HDL_CHART_HEIGHT = 180;

function HdlTrendChart({ readings }: { readings: CholesterolReading[] }) {
  const max = Math.max(...readings.map((r) => r.value), HDL_GOAL, 1);
  const latest = readings[readings.length - 1];
  const first = readings[0];
  const delta = latest && first ? latest.value - first.value : 0;
  const goalTop = HDL_CHART_HEIGHT - (HDL_GOAL / max) * HDL_CHART_HEIGHT;

  return (
    <div className="overflow-hidden rounded-sm border border-border bg-card">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Latest HDL
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {latest?.value}
            <span className="ml-1.5 text-sm font-medium text-muted-foreground">mg/dL</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-sm px-2.5 py-1 text-[11px] font-semibold',
              latest?.inRange
                ? 'bg-primary text-primary-foreground'
                : 'bg-destructive/10 text-destructive',
            )}
          >
            {latest?.inRange ? 'At goal' : 'Below goal'}
          </span>
          <span className="inline-flex items-center rounded-sm bg-muted px-2.5 py-1 text-[11px] font-semibold tabular-nums text-foreground">
            {delta > 0 ? '+' : ''}
            {delta} since {first?.year}
          </span>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <div className="relative" style={{ height: HDL_CHART_HEIGHT }}>
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="border-t border-border/70" />
            ))}
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
            style={{ top: goalTop }}
          >
            <div className="h-px flex-1 border-t border-dashed border-primary/50" />
            <span className="ml-2 shrink-0 bg-card px-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              Goal {HDL_GOAL}
            </span>
          </div>

          <div className="relative z-20 flex h-full items-end gap-3 sm:gap-4">
            {readings.map((r, i) => {
              const height = Math.max((r.value / max) * HDL_CHART_HEIGHT, 12);
              const isLatest = i === readings.length - 1;
              return (
                <div key={r.year} className="group flex h-full flex-1 flex-col items-center justify-end">
                  <span
                    className={cn(
                      'mb-2 text-xs font-semibold tabular-nums transition-colors',
                      isLatest ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    {r.value}
                  </span>
                  <div
                    className={cn(
                      'w-full max-w-14 rounded-t-sm transition-[height,opacity] duration-300',
                      r.inRange
                        ? isLatest
                          ? 'bg-primary'
                          : 'bg-primary/75'
                        : 'bg-destructive/70',
                      'group-hover:opacity-90',
                    )}
                    style={{ height }}
                    title={`${r.year}: ${r.value} mg/dL`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 sm:gap-4">
          {readings.map((r, i) => (
            <div key={r.year} className="flex flex-1 justify-center">
              <span
                className={cn(
                  'text-[11px] font-medium tabular-nums',
                  i === readings.length - 1 ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {r.year}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> In range
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-destructive/70" /> Below goal
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-px w-4 border-t border-dashed border-primary/50" /> Goal line
          </span>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function Section({
  index,
  title,
  hint,
  children,
}: {
  index: string;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] font-medium text-primary">{index}</span>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/70">
            {title}
          </h2>
        </div>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function EmptyScope({ label }: { label: string }) {
  return (
    <div className="rounded-sm border border-dashed border-border bg-muted/40 px-5 py-10 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function DetailLink({ href, label = 'Open full detail' }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-90 active:opacity-80"
    >
      <span>{label}</span>
      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}

function FieldGrid({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function sortByName<T>(items: T[], getName: (item: T) => string, dir: 'asc' | 'desc') {
  return [...items].sort((a, b) => {
    const cmp = getName(a).localeCompare(getName(b));
    return dir === 'asc' ? cmp : -cmp;
  });
}

function sortByDate<T>(items: T[], getDate: (item: T) => string, dir: 'asc' | 'desc') {
  return [...items].sort((a, b) => {
    const cmp = parseLooseDate(getDate(a)) - parseLooseDate(getDate(b));
    return dir === 'asc' ? cmp : -cmp;
  });
}

function applySort<T>(
  items: T[],
  sort: SortOption,
  getName: (item: T) => string,
  getDate: (item: T) => string,
  getSeverity?: (item: T) => string,
) {
  if (sort === 'name-asc') return sortByName(items, getName, 'asc');
  if (sort === 'name-desc') return sortByName(items, getName, 'desc');
  if (sort === 'date-asc') return sortByDate(items, getDate, 'asc');
  if (sort === 'date-desc') return sortByDate(items, getDate, 'desc');
  if (sort === 'severity' && getSeverity) {
    return [...items].sort((a, b) => severityRank(getSeverity(b)) - severityRank(getSeverity(a)));
  }
  return items;
}

const tabTriggerClass = cn(
  'flex-1 rounded-sm border border-border bg-card px-3 py-3 text-sm font-semibold text-muted-foreground shadow-none',
  'data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
  'hover:bg-muted/50 data-[state=active]:hover:bg-primary',
);

export function PatientDetailView({
  detail,
  expiresAtLabel,
  token,
}: {
  detail: SharedPatientDetail;
  expiresAtLabel: string;
  token: string;
}) {
  const { profile } = detail;
  const base = `/patient/share/${encodeURIComponent(token)}`;

  const [tab, setTab] = useState<ChartTab>(
    detail.showVitals || detail.showConditions || detail.showAllergies
      ? 'overview'
      : detail.showMedications
        ? 'medications'
        : detail.showLabs
          ? 'labs'
          : 'overview',
  );
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('name-asc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);

  const allConditions = useMemo(
    () => CONDITION_DETAILS.filter((c) => detail.conditions.some((d) => d.id === c.id)),
    [detail.conditions],
  );
  const allMedications = useMemo(
    () => MEDICATION_DETAILS.filter((m) => detail.medications.some((d) => d.id === m.id)),
    [detail.medications],
  );
  const allLabs = useMemo(
    () => LAB_DETAILS.filter((l) => detail.observations.some((d) => d.id === l.id)),
    [detail.observations],
  );
  const allVitals = useMemo(
    () => VITAL_DETAILS.filter((v) => detail.vitals.some((d) => d.id === v.id)),
    [detail.vitals],
  );
  const allEncounters = useMemo(
    () =>
      detail.encounters.length
        ? ENCOUNTER_DETAILS.filter((e) => detail.encounters.some((d) => d.id === e.id))
        : [],
    [detail.encounters],
  );
  const allProcedures = useMemo(
    () =>
      detail.procedures.length
        ? PROCEDURE_DETAILS.filter((p) => detail.procedures.some((d) => d.id === p.id))
        : [],
    [detail.procedures],
  );
  const allAllergies = useMemo(
    () =>
      detail.showAllergies
        ? ALLERGY_DETAILS.filter((a) => detail.allergies.includes(a.name))
        : [],
    [detail.showAllergies, detail.allergies],
  );

  const activeOnly = quickFilters.includes('active');
  const highRisk = quickFilters.includes('high-risk');
  const abnormalLabs = quickFilters.includes('abnormal');

  const conditions = useMemo(() => {
    let items = allConditions.filter((c) =>
      matchesQuery(query, c.name, c.icd10, c.snomed, c.notes, c.severity, c.status, c.recordedBy),
    );
    if (statusFilter !== 'all') items = items.filter((c) => c.status === statusFilter);
    if (severityFilter !== 'all') items = items.filter((c) => c.severity === severityFilter);
    if (activeOnly) items = items.filter((c) => c.status === 'Active');
    if (highRisk) items = items.filter((c) => c.severity === 'Severe' || c.severity === 'Moderate');
    return applySort(items, sort, (c) => c.name, (c) => c.period, (c) => c.severity);
  }, [allConditions, query, statusFilter, severityFilter, activeOnly, highRisk, sort]);

  const medications = useMemo(() => {
    let items = allMedications.filter((m) =>
      matchesQuery(
        query,
        m.name,
        m.dosage,
        m.indication,
        m.prescriber,
        m.pharmacy,
        m.status,
        m.rxNorm,
        m.instructions,
      ),
    );
    if (statusFilter !== 'all') items = items.filter((m) => m.status === statusFilter);
    if (activeOnly) items = items.filter((m) => m.status === 'Active');
    return applySort(items, sort, (m) => m.name, (m) => m.prescribedDate);
  }, [allMedications, query, statusFilter, activeOnly, sort]);

  const labs = useMemo(() => {
    let items = allLabs.filter((l) =>
      matchesQuery(
        query,
        l.name,
        l.value,
        l.interpretation,
        l.loinc,
        l.performingLab,
        l.notes,
        l.status,
      ),
    );
    if (statusFilter !== 'all') items = items.filter((l) => l.status === statusFilter);
    if (severityFilter !== 'all') {
      items = items.filter((l) =>
        severityFilter === 'abnormal'
          ? !/normal|desirable|at goal|goal/i.test(l.interpretation)
          : l.interpretation.toLowerCase().includes(severityFilter.toLowerCase()),
      );
    }
    if (abnormalLabs) {
      items = items.filter((l) => !/normal|desirable|at goal|^goal/i.test(l.interpretation));
    }
    return applySort(items, sort, (l) => l.name, (l) => l.date);
  }, [allLabs, query, statusFilter, severityFilter, abnormalLabs, sort]);

  const vitals = useMemo(() => {
    let items = allVitals.filter((v) =>
      matchesQuery(query, v.label, v.value, v.unit, v.trend, v.notes, v.method),
    );
    return applySort(items, sort, (v) => v.label, (v) => v.date);
  }, [allVitals, query, sort]);

  const allergies = useMemo(() => {
    let items = allAllergies.filter((a) =>
      matchesQuery(query, a.name, a.category, a.reaction, a.criticality, a.notes),
    );
    if (severityFilter !== 'all') items = items.filter((a) => a.criticality === severityFilter);
    if (highRisk) items = items.filter((a) => a.criticality === 'High');
    return applySort(items, sort, (a) => a.name, (a) => a.onset, (a) => a.criticality);
  }, [allAllergies, query, severityFilter, highRisk, sort]);

  const encounters = useMemo(() => {
    let items = allEncounters.filter((e) =>
      matchesQuery(query, e.type, e.reason, e.facility, e.practitioner, e.assessment, e.status),
    );
    if (statusFilter !== 'all') items = items.filter((e) => e.status === statusFilter);
    return applySort(items, sort, (e) => e.type, (e) => e.date);
  }, [allEncounters, query, statusFilter, sort]);

  const procedures = useMemo(() => {
    let items = allProcedures.filter((p) =>
      matchesQuery(query, p.name, p.performer, p.findings, p.code, p.status),
    );
    if (statusFilter !== 'all') items = items.filter((p) => p.status === statusFilter);
    return applySort(items, sort, (p) => p.name, (p) => p.date);
  }, [allProcedures, query, statusFilter, sort]);

  const tabCounts: Record<ChartTab, number> = {
    overview: vitals.length + allergies.length + Math.min(conditions.length, 3) + medications.length,
    conditions: conditions.length,
    medications: medications.length,
    labs: labs.length,
    history: encounters.length + procedures.length,
  };

  const currentIds = useMemo(() => {
    if (tab === 'conditions') return conditions.map((c) => c.id);
    if (tab === 'medications') return medications.map((m) => m.id);
    if (tab === 'labs') return labs.map((l) => l.id);
    if (tab === 'history') return [...encounters.map((e) => e.id), ...procedures.map((p) => p.id)];
    return [
      ...vitals.map((v) => v.id),
      ...allergies.map((a) => a.id),
      ...conditions.slice(0, 3).map((c) => `ov-c-${c.id}`),
      ...medications.map((m) => `ov-m-${m.id}`),
    ];
  }, [tab, conditions, medications, labs, encounters, procedures, vitals, allergies]);

  const resultCount = currentIds.length;
  const totalCount = useMemo(() => {
    if (tab === 'conditions') return allConditions.length;
    if (tab === 'medications') return allMedications.length;
    if (tab === 'labs') return allLabs.length;
    if (tab === 'history') return allEncounters.length + allProcedures.length;
    return allVitals.length + allAllergies.length + Math.min(allConditions.length, 3) + allMedications.length;
  }, [tab, allConditions, allMedications, allLabs, allEncounters, allProcedures, allVitals, allAllergies]);

  const filterOptions = useMemo(() => {
    if (tab === 'conditions') {
      return [
        { value: 'all', label: 'All statuses' },
        { value: 'Active', label: 'Active' },
        { value: 'Resolved', label: 'Resolved' },
      ];
    }
    if (tab === 'medications') {
      return [
        { value: 'all', label: 'All statuses' },
        { value: 'Active', label: 'Active' },
      ];
    }
    if (tab === 'labs') {
      return [
        { value: 'all', label: 'All statuses' },
        { value: 'Final', label: 'Final' },
      ];
    }
    if (tab === 'history') {
      return [
        { value: 'all', label: 'All statuses' },
        { value: 'Finished', label: 'Finished' },
        { value: 'Completed', label: 'Completed' },
      ];
    }
    return [{ value: 'all', label: 'All statuses' }];
  }, [tab]);

  const secondaryFilterOptions = useMemo(() => {
    if (tab === 'conditions' || tab === 'overview') {
      return [
        { value: 'all', label: 'All severities' },
        { value: 'Severe', label: 'Severe' },
        { value: 'Moderate', label: 'Moderate' },
        { value: 'Mild', label: 'Mild' },
        { value: 'Complaint', label: 'Complaint' },
      ];
    }
    if (tab === 'labs') {
      return [
        { value: 'all', label: 'All results' },
        { value: 'abnormal', label: 'Needs attention' },
        { value: 'Normal', label: 'Normal' },
      ];
    }
    return [];
  }, [tab]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    statusFilter !== 'all' ||
    severityFilter !== 'all' ||
    quickFilters.length > 0 ||
    sort !== 'name-asc';

  function clearFilters() {
    setQuery('');
    setStatusFilter('all');
    setSeverityFilter('all');
    setQuickFilters([]);
    setSort('name-asc');
  }

  function toggleQuick(id: string) {
    setQuickFilters((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function copySummary() {
    const lines = [
      `Patient: ${profile.fullName}`,
      `MRN: ${profile.mrn}`,
      `Share scope: ${sharePermissionLabel(detail.permission)}`,
      `Expires: ${expiresAtLabel}`,
      '',
      `Conditions (${conditions.length}): ${conditions.map((c) => c.name).join('; ') || '—'}`,
      `Medications (${medications.length}): ${medications.map((m) => m.name).join('; ') || '—'}`,
      `Labs (${labs.length}): ${labs.map((l) => `${l.name}=${l.value}`).join('; ') || '—'}`,
      `Allergies (${allergies.length}): ${allergies.map((a) => a.name).join('; ') || '—'}`,
      `Encounters (${encounters.length}): ${encounters.map((e) => e.reason).join('; ') || '—'}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      toast.success('Chart summary copied');
    } catch {
      toast.error('Could not copy summary');
    }
  }

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-sm border border-border bg-card">
        <div className="h-1 bg-primary" />
        <div className="grid gap-0 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="border-b border-border p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <h1 className="font-[family-name:var(--font-chart-display)] text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              {profile.fullName}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Search, filter, and expand clinical items. Token expires {expiresAtLabel}.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              <Meta label="MRN" value={profile.mrn} />
              <Meta label="Date of birth" value={profile.dateOfBirth} />
              <Meta label="Sex / age" value={`${profile.gender} · ${profile.age}`} />
              <Meta label="Blood type" value={profile.bloodType} />
              <Meta label="HealthEx ID" value={profile.healthExPatientId} />
              <Meta label="PCP" value={profile.primaryCarePhysician} />
              <Meta label="Coverage" value={profile.insurance} />
              <Meta label="Phone" value={profile.phone} />
            </dl>
          </div>
          <div className="flex flex-col justify-between gap-6 bg-muted/40 p-6 sm:p-8">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Location
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{profile.address}</p>
              <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Emergency
              </p>
              <p className="mt-2 text-sm text-foreground/80">{profile.emergencyContact}</p>
            </div>
            <div className="border-t border-border pt-5">
              <p className="font-mono text-[11px] tracking-wide text-muted-foreground">{profile.email}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as ChartTab);
          setExpanded([]);
        }}
        className="space-y-4"
      >
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-none bg-transparent p-0 sm:grid-cols-3 lg:grid-cols-5">
          {(
            [
              ['overview', 'Overview'],
              ['conditions', 'Conditions'],
              ['medications', 'Medications'],
              ['labs', 'Labs'],
              ['history', 'History'],
            ] as const
          ).map(([value, label]) => (
            <TabsTrigger key={value} value={value} className={tabTriggerClass}>
              <span className="flex items-center justify-center gap-2">
                {label}
                <span
                  className={cn(
                    'min-w-5 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                    tab === value ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {tabCounts[value]}
                </span>
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="space-y-2">
          <QuickFilterChips
            chips={[
              { id: 'active', label: 'Active only' },
              { id: 'high-risk', label: 'Higher risk' },
              { id: 'abnormal', label: 'Labs attention' },
            ]}
            active={quickFilters}
            onToggle={toggleQuick}
          />
          <ChartToolbar
            query={query}
            onQueryChange={setQuery}
            sort={sort}
            onSortChange={setSort}
            filterLabel="Status"
            filterValue={statusFilter}
            filterOptions={filterOptions}
            onFilterChange={setStatusFilter}
            secondaryFilterLabel="Severity"
            secondaryFilterValue={severityFilter}
            secondaryFilterOptions={secondaryFilterOptions}
            onSecondaryFilterChange={setSeverityFilter}
            resultCount={resultCount}
            totalCount={totalCount}
            onExpandAll={() => setExpanded(currentIds)}
            onCollapseAll={() => setExpanded([])}
            onClear={clearFilters}
            onCopySummary={copySummary}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        <TabsContent value="overview" className="mt-2 space-y-8 focus-visible:outline-none">
          {vitals.length > 0 ? (
            <Section index="01" title="Vitals" hint="Expand for method, trend, and history">
              <Accordion type="multiple" className="space-y-2" value={expanded} onValueChange={setExpanded}>
                {vitals.map((v) => (
                  <VitalAccordion key={v.id} vital={v} base={base} />
                ))}
              </Accordion>
            </Section>
          ) : (
            <EmptyScope label={allVitals.length ? 'No vitals match your filters' : 'Vitals not included in this share'} />
          )}

          {allergies.length > 0 && (
            <Section index="02" title="Allergies" hint="Expand for reaction and criticality">
              <Accordion type="multiple" className="space-y-2" value={expanded} onValueChange={setExpanded}>
                {allergies.map((a) => (
                  <AllergyAccordion key={a.id} allergy={a} />
                ))}
              </Accordion>
            </Section>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            {conditions.length > 0 ? (
              <Section index="03" title="Conditions snapshot">
                <Accordion type="multiple" className="space-y-2" value={expanded} onValueChange={setExpanded}>
                  {conditions.slice(0, 3).map((c) => (
                    <AccordionItem key={c.id} value={`ov-c-${c.id}`}>
                      <AccordionTrigger>
                        <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-2 pr-2">
                          <span className="font-semibold">{c.name}</span>
                          <span className="text-xs text-muted-foreground">{c.severity}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{c.notes}</p>
                        <DetailLink href={`${base}/condition/${c.id}`} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Section>
            ) : (
              <EmptyScope label={allConditions.length ? 'No conditions match' : 'Conditions not included'} />
            )}

            {medications.length > 0 ? (
              <Section index="04" title="Medications snapshot">
                <Accordion type="multiple" className="space-y-2" value={expanded} onValueChange={setExpanded}>
                  {medications.map((m) => (
                    <AccordionItem key={m.id} value={`ov-m-${m.id}`}>
                      <AccordionTrigger>
                        <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-2 pr-2">
                          <span className="font-semibold">{m.name}</span>
                          <span className="text-xs text-primary">{m.status}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{m.instructions}</p>
                        <DetailLink href={`${base}/medication/${m.id}`} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Section>
            ) : (
              <EmptyScope label={allMedications.length ? 'No medications match' : 'Medications not included'} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="conditions" className="mt-0 focus-visible:outline-none">
          {conditions.length > 0 ? (
            <Section index="02" title="Conditions" hint="Expand each condition for coding, notes, and care plan">
              <Accordion type="multiple" className="space-y-2" value={expanded} onValueChange={setExpanded}>
                {conditions.map((c) => (
                  <ConditionAccordion key={c.id} condition={c} base={base} />
                ))}
              </Accordion>
            </Section>
          ) : (
            <EmptyScope label={allConditions.length ? 'No conditions match your filters' : 'Conditions not included in this share'} />
          )}
        </TabsContent>

        <TabsContent value="medications" className="mt-0 focus-visible:outline-none">
          {medications.length > 0 ? (
            <Section index="03" title="Medications" hint="Expand for dosing, pharmacy, interactions">
              <Accordion type="multiple" className="space-y-2" value={expanded} onValueChange={setExpanded}>
                {medications.map((m) => (
                  <MedicationAccordion key={m.id} medication={m} base={base} />
                ))}
              </Accordion>
            </Section>
          ) : (
            <EmptyScope label={allMedications.length ? 'No medications match your filters' : 'Medications not included in this share'} />
          )}
        </TabsContent>

        <TabsContent value="labs" className="mt-0 space-y-8 focus-visible:outline-none">
          {labs.length > 0 ? (
            <Section index="06" title="Lab results" hint="Expand for LOINC, ranges, and prior values">
              <Accordion type="multiple" className="space-y-2" value={expanded} onValueChange={setExpanded}>
                {labs.map((lab) => (
                  <LabAccordion key={lab.id} lab={lab} base={base} />
                ))}
              </Accordion>
            </Section>
          ) : (
            <EmptyScope label={allLabs.length ? 'No labs match your filters' : 'Labs not included in this share'} />
          )}

          {detail.showCholesterol && detail.cholesterol.length > 0 && !query.trim() && (
            <Section index="04" title="HDL trend" hint="mg/dL · goal ≥ 50">
              <HdlTrendChart readings={detail.cholesterol} />
            </Section>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0 space-y-8 focus-visible:outline-none">
          {encounters.length > 0 ? (
            <Section index="07" title="Encounters" hint="Expand for assessment and plan">
              <Accordion type="multiple" className="space-y-2" value={expanded} onValueChange={setExpanded}>
                {encounters.map((e) => (
                  <EncounterAccordion key={e.id} encounter={e} base={base} />
                ))}
              </Accordion>
            </Section>
          ) : (
            <EmptyScope label={allEncounters.length ? 'No encounters match your filters' : 'Encounters not included in this share'} />
          )}

          {procedures.length > 0 && (
            <Section index="08" title="Procedures">
              <Accordion type="multiple" className="space-y-2" value={expanded} onValueChange={setExpanded}>
                {procedures.map((p) => (
                  <ProcedureAccordion key={p.id} procedure={p} base={base} />
                ))}
              </Accordion>
            </Section>
          )}

          {detail.coverage.length > 0 && !query.trim() && (
            <Section index="09" title="Coverage">
              <div className="grid gap-3 sm:grid-cols-2">
                {detail.coverage.map((c) => (
                  <div key={c.id} className="rounded-sm border border-border bg-card p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-medium">{c.payer}</p>
                      <span className="text-[11px] font-medium uppercase tracking-wide text-primary">
                        {c.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{c.plan}</p>
                    <p className="mt-4 font-mono text-[11px] text-muted-foreground">{c.memberId}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VitalAccordion({ vital: v, base }: { vital: VitalDetail; base: string }) {
  return (
    <AccordionItem value={v.id}>
      <AccordionTrigger>
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-2 pr-2">
          <span className="font-semibold">{v.label}</span>
          <span className="tabular-nums text-foreground">
            {v.value} <span className="text-muted-foreground">{v.unit}</span>
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        <FieldGrid
          items={[
            { label: 'Recorded', value: v.date },
            { label: 'Method', value: v.method },
            { label: 'Trend', value: v.trend },
            { label: 'Reference', value: v.reference },
            { label: 'Recorded by', value: v.recordedBy },
            { label: 'Location', value: v.location },
          ]}
        />
        <p className="text-sm text-muted-foreground">{v.notes}</p>
        <ul className="divide-y divide-border overflow-hidden rounded-sm border border-border">
          {v.history.map((h) => (
            <li key={h.date} className="flex justify-between px-3 py-2 text-sm">
              <span className="text-muted-foreground">{h.date}</span>
              <span className="tabular-nums font-medium">{h.value}</span>
            </li>
          ))}
        </ul>
        <DetailLink href={`${base}/vital/${v.id}`} />
      </AccordionContent>
    </AccordionItem>
  );
}

function AllergyAccordion({ allergy: a }: { allergy: AllergyDetail }) {
  return (
    <AccordionItem value={a.id}>
      <AccordionTrigger>
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-2 pr-2">
          <span className="font-semibold">{a.name}</span>
          <span className="text-xs uppercase tracking-wide text-primary">{a.criticality}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        <FieldGrid
          items={[
            { label: 'Category', value: a.category },
            { label: 'Reaction', value: a.reaction },
            { label: 'Onset', value: a.onset },
            { label: 'Verification', value: a.verification },
            { label: 'Recorded by', value: a.recordedBy },
          ]}
        />
        <p className="text-sm text-muted-foreground">{a.notes}</p>
      </AccordionContent>
    </AccordionItem>
  );
}

function ConditionAccordion({ condition: c, base }: { condition: ConditionDetail; base: string }) {
  return (
    <AccordionItem value={c.id}>
      <AccordionTrigger>
        <div className="flex min-w-0 flex-1 flex-col gap-1 pr-2 text-left sm:flex-row sm:items-baseline sm:justify-between">
          <span className="font-semibold">{c.name}</span>
          <span className="text-xs text-muted-foreground">
            {c.severity} · {c.status} · since {c.period}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        <FieldGrid
          items={[
            { label: 'Clinical status', value: c.clinicalStatus },
            { label: 'Verification', value: c.verificationStatus },
            { label: 'Onset', value: c.onset },
            { label: 'ICD-10', value: c.icd10 },
            { label: 'SNOMED', value: c.snomed },
            { label: 'Recorded by', value: c.recordedBy },
          ]}
        />
        <p className="text-sm leading-relaxed text-foreground/85">{c.notes}</p>
        {c.carePlan.length > 0 && (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {c.carePlan.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        <DetailLink href={`${base}/condition/${c.id}`} label="View condition details" />
      </AccordionContent>
    </AccordionItem>
  );
}

function MedicationAccordion({ medication: m, base }: { medication: MedicationDetail; base: string }) {
  return (
    <AccordionItem value={m.id}>
      <AccordionTrigger>
        <div className="flex min-w-0 flex-1 flex-col gap-1 pr-2 text-left sm:flex-row sm:items-baseline sm:justify-between">
          <span className="font-semibold">
            {m.name} <span className="font-normal text-muted-foreground">· {m.dosage}</span>
          </span>
          <span className="text-xs uppercase tracking-wide text-primary">{m.status}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        <FieldGrid
          items={[
            { label: 'Indication', value: m.indication },
            { label: 'Route', value: m.route },
            { label: 'Frequency', value: m.frequency },
            { label: 'Prescriber', value: m.prescriber },
            { label: 'RxNorm', value: m.rxNorm },
            { label: 'Pharmacy', value: m.pharmacy },
            { label: 'Start date', value: m.startDate },
            { label: 'Refills left', value: String(m.refillsRemaining) },
          ]}
        />
        <p className="text-sm leading-relaxed">{m.instructions}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {m.sideEffects.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {m.interactions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <DetailLink href={`${base}/medication/${m.id}`} label="View medication details" />
      </AccordionContent>
    </AccordionItem>
  );
}

function LabAccordion({ lab, base }: { lab: LabDetail; base: string }) {
  return (
    <AccordionItem value={lab.id}>
      <AccordionTrigger>
        <div className="flex min-w-0 flex-1 flex-col gap-1 pr-2 text-left sm:flex-row sm:items-baseline sm:justify-between">
          <span className="font-semibold">{lab.name}</span>
          <span className="tabular-nums text-sm">
            {lab.value} <span className="text-muted-foreground">· {lab.interpretation}</span>
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        <FieldGrid
          items={[
            { label: 'Date', value: lab.date },
            { label: 'Status', value: lab.status },
            { label: 'LOINC', value: lab.loinc },
            { label: 'Reference range', value: lab.referenceRange },
            { label: 'Specimen', value: lab.specimen },
            { label: 'Performing lab', value: lab.performingLab },
            { label: 'Ordered by', value: lab.orderedBy },
          ]}
        />
        <p className="text-sm text-muted-foreground">{lab.notes}</p>
        <ul className="divide-y divide-border overflow-hidden rounded-sm border border-border">
          {lab.history.map((h) => (
            <li key={`${lab.id}-${h.date}`} className="flex justify-between px-3 py-2 text-sm">
              <span className="text-muted-foreground">{h.date}</span>
              <span className="tabular-nums font-medium">{h.value}</span>
            </li>
          ))}
        </ul>
        <DetailLink href={`${base}/lab/${lab.id}`} label="View lab details" />
      </AccordionContent>
    </AccordionItem>
  );
}

function EncounterAccordion({ encounter: e, base }: { encounter: EncounterDetail; base: string }) {
  return (
    <AccordionItem value={e.id}>
      <AccordionTrigger>
        <div className="flex min-w-0 flex-1 flex-col gap-1 pr-2 text-left sm:flex-row sm:items-baseline sm:justify-between">
          <span className="font-semibold">
            {e.type} · {e.reason}
          </span>
          <span className="text-xs text-muted-foreground">{e.date}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        <FieldGrid
          items={[
            { label: 'Facility', value: e.facility },
            { label: 'Department', value: e.department },
            { label: 'Practitioner', value: e.practitioner },
            { label: 'Status', value: e.status },
            { label: 'Duration', value: e.duration },
            { label: 'Follow-up', value: e.followUp },
          ]}
        />
        <p className="text-sm">{e.chiefComplaint}</p>
        <p className="text-sm leading-relaxed text-foreground/85">{e.assessment}</p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {e.plan.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <DetailLink href={`${base}/encounter/${e.id}`} label="View encounter details" />
      </AccordionContent>
    </AccordionItem>
  );
}

function ProcedureAccordion({ procedure: p, base }: { procedure: ProcedureDetail; base: string }) {
  return (
    <AccordionItem value={p.id}>
      <AccordionTrigger>
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-2 pr-2">
          <span className="font-semibold">{p.name}</span>
          <span className="text-xs text-muted-foreground">{p.date}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        <FieldGrid
          items={[
            { label: 'Performer', value: p.performer },
            { label: 'Status', value: p.status },
            { label: 'Code', value: p.code },
            { label: 'Body site', value: p.bodySite },
            { label: 'Indication', value: p.indication },
          ]}
        />
        <p className="text-sm leading-relaxed">{p.findings}</p>
        <p className="text-sm text-muted-foreground">{p.reportSummary}</p>
        <DetailLink href={`${base}/procedure/${p.id}`} label="View procedure details" />
      </AccordionContent>
    </AccordionItem>
  );
}
