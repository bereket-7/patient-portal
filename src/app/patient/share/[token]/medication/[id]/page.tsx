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
import { getConditionDetail, getLabDetail, getMedicationDetail } from '@/lib/mock/clinical-details';

export default function MedicationDetailPage() {
  const params = useParams<{ token: string; id: string }>();
  const token = decodeURIComponent(params.token ?? '');
  const medication = getMedicationDetail(params.id ?? '');

  return (
    <ProviderChartShell token={token} crumb="Medication">
      {() =>
        !medication ? (
          <DetailNotFound token={token} label="Medication" />
        ) : (
          <DetailPageFrame
            token={token}
            title={medication.name}
            subtitle={`${medication.dosage} · ${medication.status} · ${medication.indication}`}
          >
            <DetailSection title="Prescription" first>
              <DetailFieldGrid
                items={[
                  { label: 'Strength', value: medication.strength },
                  { label: 'Form', value: medication.form },
                  { label: 'Route', value: medication.route },
                  { label: 'Frequency', value: medication.frequency },
                  { label: 'Days supply', value: String(medication.daysSupply) },
                  { label: 'Refills left', value: String(medication.refillsRemaining) },
                  { label: 'Prescriber', value: medication.prescriber },
                  { label: 'Pharmacy', value: medication.pharmacy },
                  { label: 'RxNorm', value: medication.rxNorm },
                  { label: 'NDC', value: medication.ndc },
                  { label: 'Start date', value: medication.startDate },
                  { label: 'Prescribed', value: medication.prescribedDate },
                  { label: 'Last filled', value: medication.lastFilled },
                  { label: 'Next fill due', value: medication.nextFillDue },
                  { label: 'Adherence', value: medication.adherence },
                ]}
              />
            </DetailSection>

            <DetailSection title="Instructions">
              <p className="text-sm leading-relaxed">{medication.instructions}</p>
            </DetailSection>

            <DetailSection title="Provider commentary">
              <p className="rounded-sm border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed">
                {medication.providerCommentary}
              </p>
            </DetailSection>

            <DetailSection title="Counseling points">
              <DetailList items={medication.counselingPoints} />
            </DetailSection>

            <DetailSection title="Monitoring">
              <DetailList items={medication.monitoring} />
            </DetailSection>

            <div className="mt-8 grid gap-8 border-t border-border pt-8 lg:grid-cols-3">
              <div className="space-y-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Side effects
                </h2>
                <DetailList items={medication.sideEffects} />
              </div>
              <div className="space-y-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Interactions
                </h2>
                <DetailList items={medication.interactions} />
              </div>
              <div className="space-y-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Contraindications
                </h2>
                <DetailList items={medication.contraindications} />
              </div>
            </div>

            <DetailSection title="Medication timeline">
              <DetailTimeline events={medication.timeline} />
            </DetailSection>

            <DetailSection title="Related chart items">
              <DetailRelatedLinks
                token={token}
                links={[
                  ...medication.relatedConditionIds.map((id) => ({
                    label: getConditionDetail(id)?.name ?? `Condition ${id}`,
                    href: `/condition/${id}`,
                  })),
                  ...medication.relatedLabIds.map((id) => ({
                    label: getLabDetail(id)?.name ?? `Lab ${id}`,
                    href: `/lab/${id}`,
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
