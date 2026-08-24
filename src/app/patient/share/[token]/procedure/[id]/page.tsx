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
import { getProcedureDetail } from '@/lib/mock/clinical-details';

export default function ProcedureDetailPage() {
  const params = useParams<{ token: string; id: string }>();
  const token = decodeURIComponent(params.token ?? '');
  const procedure = getProcedureDetail(params.id ?? '');

  return (
    <ProviderChartShell token={token} crumb="Procedure">
      {() =>
        !procedure ? (
          <DetailNotFound token={token} label="Procedure" />
        ) : (
          <DetailPageFrame
            token={token}
            title={procedure.name}
            subtitle={`${procedure.date} · ${procedure.status} · ${procedure.performer}`}
          >
            <DetailSection title="Procedure details" first>
              <DetailFieldGrid
                items={[
                  { label: 'Code', value: procedure.code },
                  { label: 'Status', value: procedure.status },
                  { label: 'Performer', value: procedure.performer },
                  { label: 'Facility', value: procedure.facility },
                  { label: 'Body site', value: procedure.bodySite },
                  { label: 'Laterality', value: procedure.laterality },
                  { label: 'Anesthesia', value: procedure.anesthesia },
                  { label: 'Indication', value: procedure.indication },
                  { label: 'Complications', value: procedure.complications },
                  { label: 'Date', value: procedure.date },
                ]}
              />
            </DetailSection>

            <DetailSection title="Findings">
              <p className="text-sm leading-relaxed">{procedure.findings}</p>
            </DetailSection>

            <DetailSection title="Report summary">
              <p className="text-sm leading-relaxed text-muted-foreground">{procedure.reportSummary}</p>
            </DetailSection>

            <DetailSection title="Provider commentary">
              <p className="rounded-sm border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed">
                {procedure.providerCommentary}
              </p>
            </DetailSection>

            <DetailSection title="Devices">
              <DetailList items={procedure.devices} />
            </DetailSection>

            <DetailSection title="Follow-up instructions">
              <DetailList items={procedure.followUpInstructions} />
            </DetailSection>

            <DetailSection title="Procedure timeline">
              <DetailTimeline events={procedure.timeline} />
            </DetailSection>

            <DetailSection title="Documents">
              <DetailKeyValueTable
                rows={procedure.documents.map((d) => ({
                  label: `${d.type} · ${d.date}`,
                  value: d.name,
                }))}
              />
            </DetailSection>

            <DetailSection title="Related chart items">
              <DetailRelatedLinks
                token={token}
                links={[
                  ...procedure.relatedEncounterIds.map((id) => ({
                    label: `Encounter ${id}`,
                    href: `/encounter/${id}`,
                  })),
                  ...procedure.relatedConditionIds.map((id) => ({
                    label: `Condition ${id}`,
                    href: `/condition/${id}`,
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
