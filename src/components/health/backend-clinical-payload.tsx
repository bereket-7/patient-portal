'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MOCK_BACKEND_CLINICAL_ENCOUNTERS } from '@/lib/mock/backend-encounters';

type BackendClinicalPayloadProps = {
  payload?: unknown;
  title?: string;
  description?: string;
};

export function BackendClinicalPayload({
  payload,
  title = 'Backend clinical JSON',
  description = 'Same HealthEx ingest / reporting fields the portal maps into this page.',
}: BackendClinicalPayloadProps) {
  return (
    <Accordion type="single" collapsible className="w-full min-w-0">
      <AccordionItem value="backend-clinical">
        <AccordionTrigger>
          <span className="min-w-0">
            <span className="block">{title}</span>
            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{description}</span>
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted/60 p-3 font-mono text-[11px] leading-relaxed text-foreground sm:text-xs">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/** @deprecated Prefer BackendClinicalPayload — kept for visits page compatibility. */
export function BackendEncountersPayload({
  payload = MOCK_BACKEND_CLINICAL_ENCOUNTERS,
  title = 'Backend clinical.encounters JSON',
  description = 'Same HealthEx ingest / reporting profile fields the portal maps into visit cards.',
}: BackendClinicalPayloadProps) {
  return <BackendClinicalPayload payload={payload} title={title} description={description} />;
}
