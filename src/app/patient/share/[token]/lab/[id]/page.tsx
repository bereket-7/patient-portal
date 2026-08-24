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
import { getLabDetail } from '@/lib/mock/clinical-details';

export default function LabDetailPage() {
  const params = useParams<{ token: string; id: string }>();
  const token = decodeURIComponent(params.token ?? '');
  const lab = getLabDetail(params.id ?? '');

  return (
    <ProviderChartShell token={token} crumb="Lab">
      {() =>
        !lab ? (
          <DetailNotFound token={token} label="Lab result" />
        ) : (
          <DetailPageFrame
            token={token}
            title={lab.name}
            subtitle={`${lab.value} · ${lab.interpretation} · ${lab.date}`}
          >
            <DetailSection title="Result" first>
              <DetailFieldGrid
                items={[
                  { label: 'Value', value: lab.value },
                  { label: 'Units', value: lab.units },
                  { label: 'Status', value: lab.status },
                  { label: 'Interpretation', value: lab.interpretation },
                  { label: 'Reference range', value: lab.referenceRange },
                  { label: 'Critical flag', value: lab.criticalFlag ? 'Yes' : 'No' },
                  { label: 'LOINC', value: lab.loinc },
                  { label: 'Specimen', value: lab.specimen },
                  { label: 'Fasting', value: lab.fasting ? 'Yes' : 'No' },
                  { label: 'Performing lab', value: lab.performingLab },
                  { label: 'Ordered by', value: lab.orderedBy },
                  { label: 'Analytic method', value: lab.analyticMethod },
                  { label: 'Analyzer', value: lab.analyzer },
                ]}
              />
            </DetailSection>

            <DetailSection title="Collection & reporting">
              <DetailFieldGrid
                items={[
                  { label: 'Collected', value: lab.collectionTime },
                  { label: 'Received', value: lab.receivedTime },
                  { label: 'Reported', value: lab.reportedTime },
                ]}
              />
            </DetailSection>

            <DetailSection title="Clinical significance">
              <p className="text-sm leading-relaxed">{lab.clinicalSignificance}</p>
            </DetailSection>

            <DetailSection title="Provider commentary">
              <p className="rounded-sm border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed">
                {lab.providerCommentary}
              </p>
            </DetailSection>

            <DetailSection title="Notes">
              <p className="text-sm leading-relaxed">{lab.notes}</p>
            </DetailSection>

            <DetailSection title="Recommendations">
              <DetailList items={lab.recommendations} />
            </DetailSection>

            <DetailSection title="Result history">
              <ul className="divide-y divide-border overflow-hidden rounded-sm border border-border">
                {lab.history.map((h) => (
                  <li key={`${lab.id}-${h.date}`} className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-muted-foreground">{h.date}</span>
                    <span className="tabular-nums font-medium">{h.value}</span>
                  </li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection title="Lab timeline">
              <DetailTimeline events={lab.timeline} />
            </DetailSection>

            <DetailSection title="Related chart items">
              <DetailRelatedLinks
                token={token}
                links={[
                  ...lab.relatedConditionIds.map((id) => ({
                    label: `Condition ${id}`,
                    href: `/condition/${id}`,
                  })),
                  ...lab.relatedMedicationIds.map((id) => ({
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
