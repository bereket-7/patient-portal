'use client';

import { useParams } from 'next/navigation';
import { ProviderChartShell } from '@/components/share/provider-chart-shell';
import {
  DetailFieldGrid,
  DetailList,
  DetailNotFound,
  DetailPageFrame,
  DetailRelatedLinks,
  DetailSection,
  DetailTimeline,
} from '@/components/share/detail-page-layout';
import { getVitalDetail } from '@/lib/mock/clinical-details';

export default function VitalDetailPage() {
  const params = useParams<{ token: string; id: string }>();
  const token = decodeURIComponent(params.token ?? '');
  const vital = getVitalDetail(params.id ?? '');

  return (
    <ProviderChartShell token={token} crumb="Vital">
      {() =>
        !vital ? (
          <DetailNotFound token={token} label="Vital" />
        ) : (
          <DetailPageFrame
            token={token}
            title={vital.label}
            subtitle={`${vital.value} ${vital.unit} · ${vital.date} · ${vital.trend}`}
          >
            <DetailSection title="Measurement" first>
              <DetailFieldGrid
                items={[
                  { label: 'Value', value: `${vital.value} ${vital.unit}` },
                  { label: 'Method', value: vital.method },
                  { label: 'Position', value: vital.position },
                  { label: 'Device', value: vital.device },
                  { label: 'Quality', value: vital.quality },
                  { label: 'Trend', value: vital.trend },
                  { label: 'Reference', value: vital.reference },
                  { label: 'Recorded by', value: vital.recordedBy },
                  { label: 'Location', value: vital.location },
                  { label: 'Date', value: vital.date },
                ]}
              />
            </DetailSection>

            <DetailSection title="Clinical significance">
              <p className="text-sm leading-relaxed">{vital.clinicalSignificance}</p>
            </DetailSection>

            <DetailSection title="Provider commentary">
              <p className="rounded-sm border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed">
                {vital.providerCommentary}
              </p>
            </DetailSection>

            <DetailSection title="Notes">
              <p className="text-sm leading-relaxed">{vital.notes}</p>
            </DetailSection>

            <DetailSection title="Recommendations">
              <DetailList items={vital.recommendations} />
            </DetailSection>

            <DetailSection title="History">
              <ul className="divide-y divide-border overflow-hidden rounded-sm border border-border">
                {vital.history.map((h) => (
                  <li key={h.date} className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-muted-foreground">{h.date}</span>
                    <span className="tabular-nums font-medium">{h.value}</span>
                  </li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection title="Vital timeline">
              <DetailTimeline events={vital.timeline} />
            </DetailSection>

            <DetailSection title="Related chart items">
              <DetailRelatedLinks
                token={token}
                links={[
                  ...vital.relatedConditionIds.map((id) => ({
                    label: `Condition ${id}`,
                    href: `/condition/${id}`,
                  })),
                  ...vital.relatedMedicationIds.map((id) => ({
                    label: `Medication ${id}`,
                    href: `/medication/${id}`,
                  })),
                ]}
              />
            </DetailSection>
          </DetailPageFrame>
        )
      }
    </ProviderChartShell>
  );
}
