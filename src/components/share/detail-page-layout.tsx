'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { DetailBackLink, DetailField } from '@/components/share/provider-chart-shell';

export function DetailPageFrame({
  token,
  title,
  subtitle,
  children,
}: {
  token: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <DetailBackLink token={token} />
      <div className="overflow-hidden rounded-sm border border-border bg-card">
        <div className="h-1 bg-primary" />
        <div className="border-b border-border p-6 sm:p-8">
          <h1 className="font-[family-name:var(--font-chart-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="space-y-0 p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}

export function DetailSection({
  title,
  children,
  first,
}: {
  title: string;
  children: ReactNode;
  first?: boolean;
}) {
  return (
    <section className={first ? 'space-y-4' : 'mt-8 space-y-4 border-t border-border pt-8'}>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function DetailFieldGrid({
  items,
}: {
  items: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <DetailField key={item.label} label={item.label} value={item.value} />
      ))}
    </dl>
  );
}

export function DetailList({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">None recorded.</p>;
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function DetailTimeline({
  events,
}: {
  events: Array<{ date: string; title: string; detail?: string }>;
}) {
  if (!events.length) return null;
  return (
    <ol className="space-y-0 overflow-hidden rounded-sm border border-border">
      {events.map((event, i) => (
        <li
          key={`${event.date}-${event.title}-${i}`}
          className="grid gap-1 border-b border-border px-4 py-3 last:border-b-0 sm:grid-cols-[140px_1fr]"
        >
          <span className="font-mono text-[11px] text-muted-foreground">{event.date}</span>
          <div>
            <p className="text-sm font-medium">{event.title}</p>
            {event.detail && <p className="mt-0.5 text-sm text-muted-foreground">{event.detail}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function DetailKeyValueTable({
  rows,
}: {
  rows: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="overflow-hidden rounded-sm border border-border">
      <table className="w-full text-left text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border last:border-b-0">
              <th className="w-[40%] bg-muted/40 px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {row.label}
              </th>
              <td className="px-4 py-2.5">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DetailRelatedLinks({
  token,
  links,
}: {
  token: string;
  links: Array<{ label: string; href: string }>;
}) {
  if (!links.length) return null;
  const base = `/patient/share/${encodeURIComponent(token)}`;
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={`${base}${link.href}`}
          className="rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function DetailNotFound({ token, label }: { token: string; label: string }) {
  return (
    <div className="space-y-4">
      <DetailBackLink token={token} />
      <p className="text-sm text-muted-foreground">{label} not found in this share.</p>
    </div>
  );
}
