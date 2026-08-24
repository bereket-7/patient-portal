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
import { getEncounterDetail } from '@/lib/mock/clinical-details';

export default function EncounterDetailPage() {
  const params = useParams<{ token: string; id: string }>();
  const token = decodeURIComponent(params.token ?? '');
  const encounter = getEncounterDetail(params.id ?? '');

  return (
    <ProviderChartShell token={token} crumb="Encounter">
      {() =>
        !encounter ? (
          <DetailNotFound token={token} label="Encounter" />
        ) : (
          <DetailPageFrame
            token={token}
            title={encounter.type}
            subtitle={`${encounter.reason} · ${encounter.date} · ${encounter.status}`}
          >
            <DetailSection title="Visit details" first>
              <DetailFieldGrid
                items={[
                  { label: 'Facility', value: encounter.facility },
                  { label: 'Location', value: encounter.location },
                  { label: 'Department', value: encounter.department },
                  { label: 'Practitioner', value: encounter.practitioner },
                  { label: 'Class', value: encounter.encounterClass },
                  { label: 'Priority', value: encounter.priority },
                  { label: 'Duration', value: encounter.duration },
                  { label: 'Follow-up', value: encounter.followUp },
                ]}
              />
            </DetailSection>

            <DetailSection title="Chief complaint">
              <p className="text-sm leading-relaxed">{encounter.chiefComplaint}</p>
            </DetailSection>

            <DetailSection title="Assessment">
              <p className="text-sm leading-relaxed">{encounter.assessment}</p>
            </DetailSection>

            <DetailSection title="Provider commentary">
              <p className="rounded-sm border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed">
                {encounter.providerCommentary}
              </p>
            </DetailSection>

            <DetailSection title="Vitals summary">
              <p className="text-sm leading-relaxed">{encounter.vitalsSummary}</p>
            </DetailSection>

            <div className="mt-8 grid gap-8 border-t border-border pt-8 lg:grid-cols-2">
              <div className="space-y-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Diagnoses
                </h2>
                <DetailList items={encounter.diagnoses} />
              </div>
              <div className="space-y-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Plan
                </h2>
                <DetailList items={encounter.plan} />
              </div>
              <div className="space-y-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Orders
                </h2>
                <DetailList items={encounter.orders} />
              </div>
              <div className="space-y-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Medications discussed
                </h2>
                <DetailList items={encounter.medicationsDiscussed} />
              </div>
            </div>

            <DetailSection title="Encounter timeline">
              <DetailTimeline events={encounter.timeline} />
            </DetailSection>

            <DetailSection title="Documents">
              <DetailKeyValueTable
                rows={encounter.documents.map((d) => ({
                  label: `${d.type} · ${d.date}`,
                  value: d.name,
                }))}
              />
            </DetailSection>

            <DetailSection title="Related chart items">
              <DetailRelatedLinks
                token={token}
                links={[
                  ...encounter.relatedConditionIds.map((id) => ({
                    label: `Condition ${id}`,
                    href: `/condition/${id}`,
                  })),
                  ...encounter.relatedProcedureIds.map((id) => ({
                    label: `Procedure ${id}`,
                    href: `/procedure/${id}`,
                  })),
                  ...encounter.relatedLabIds.map((id) => ({
                    label: `Lab ${id}`,
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
