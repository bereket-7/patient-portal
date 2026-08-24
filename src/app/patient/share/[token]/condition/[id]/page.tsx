'use client';

import { useParams } from 'next/navigation';
import { ProviderChartShell } from '@/components/share/provider-chart-shell';
import {
  DetailFieldGrid,
  DetailKeyValueTable,
  DetailList,
  DetailNotFound,
  DetailPageFrame,
  DetailRelatedLinks,
  DetailSection,
  DetailTimeline,
} from '@/components/share/detail-page-layout';
import { getConditionDetail, getEncounterDetail, getLabDetail, getMedicationDetail } from '@/lib/mock/clinical-details';

export default function ConditionDetailPage() {
  const params = useParams<{ token: string; id: string }>();
  const token = decodeURIComponent(params.token ?? '');
  const condition = getConditionDetail(params.id ?? '');

  return (
    <ProviderChartShell token={token} crumb="Condition">
      {() =>
        !condition ? (
          <DetailNotFound token={token} label="Condition" />
        ) : (
          <DetailPageFrame
            token={token}
            title={condition.name}
            subtitle={`${condition.severity} · ${condition.status} · onset ${condition.onset}`}
          >
            <DetailSection title="Overview" first>
              <DetailFieldGrid
                items={[
                  { label: 'Clinical status', value: condition.clinicalStatus },
                  { label: 'Verification', value: condition.verificationStatus },
                  { label: 'Category', value: condition.category },
                  { label: 'Body system', value: condition.bodySystem },
                  { label: 'ICD-10', value: condition.icd10 },
                  { label: 'SNOMED', value: condition.snomed },
                  { label: 'Recorded by', value: condition.recordedBy },
                  { label: 'Facility', value: condition.facility },
                  { label: 'Source system', value: condition.sourceSystem },
                  { label: 'Last reviewed', value: condition.lastReviewed },
                  { label: 'Next review', value: condition.nextReview },
                  { label: 'Period', value: condition.period },
                ]}
              />
            </DetailSection>

            <DetailSection title="Clinical notes">
              <p className="text-sm leading-relaxed">{condition.notes}</p>
            </DetailSection>

            <DetailSection title="Provider commentary">
              <p className="rounded-sm border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed">
                {condition.providerCommentary}
              </p>
            </DetailSection>

            <DetailSection title="Symptoms">
              <DetailList items={condition.symptoms} />
            </DetailSection>

            <DetailSection title="Differentials considered">
              <DetailList items={condition.differentials} />
            </DetailSection>

            <DetailSection title="Care plan">
              <DetailList items={condition.carePlan} />
            </DetailSection>

            <DetailSection title="Clinical timeline">
              <DetailTimeline events={condition.timeline} />
            </DetailSection>

            <DetailSection title="Documents">
              <DetailKeyValueTable
                rows={condition.documents.map((d) => ({
                  label: `${d.type} · ${d.date}`,
                  value: d.name,
                }))}
              />
            </DetailSection>

            <DetailSection title="Related chart items">
              <DetailRelatedLinks
                token={token}
                links={[
                  ...condition.relatedMedicationIds.map((id) => ({
                    label: getMedicationDetail(id)?.name ?? `Medication ${id}`,
                    href: `/medication/${id}`,
                  })),
                  ...condition.relatedLabIds.map((id) => ({
                    label: getLabDetail(id)?.name ?? `Lab ${id}`,
                    href: `/lab/${id}`,
                  })),
                  ...condition.relatedEncounterIds.map((id) => ({
                    label: getEncounterDetail(id)?.reason ?? `Encounter ${id}`,
                    href: `/encounter/${id}`,
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
