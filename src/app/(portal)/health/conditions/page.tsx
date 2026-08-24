'use client';

import { HeartPulse, Loader2, RefreshCw } from 'lucide-react';
import { ConditionsTable } from '@/components/dashboard/conditions-table';
import { MedicationSpotlight } from '@/components/health/medication-spotlight';
import { PageCtaBanner } from '@/components/layout/page-cta-banner';
import { SoftCtaSection } from '@/components/layout/soft-cta-section';
import { useHealthRecords } from '@/lib/hooks/use-health-records';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ConditionsPage() {
  const { records, connected, refreshing, error, refreshMedicalData } = useHealthRecords();

  return (
    <div className="space-y-8">
      <PageCtaBanner
        tone="primary"
        eyebrow="Conditions"
        title="Understand the diagnoses that guide matching"
        description="Active and historical conditions from your connected HealthEx record help TrialClinIQ identify trials that fit your clinical profile."
        ctaLabel="See medications"
        ctaHref="/health/medications"
        secondaryLabel="Browse trials"
        secondaryHref="/trials"
        imageSrc="/images/doctor.jpg"
        imageAlt="Clinical consultation and care planning"
      />

      {connected && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={refreshing}
            onClick={() => void refreshMedicalData()}
          >
            {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh from HealthEx
          </Button>
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ConditionsTable conditions={records.conditions} />

      <MedicationSpotlight medications={records.medications} compact />

      <SoftCtaSection
        icon={HeartPulse}
        title="Conditions + medications work together"
        description="Matching is stronger when both your diagnoses and treatment plan are current. Refresh from HealthEx after care visits."
        points={[
          'Severity and timing inform eligibility rules',
          'Related prescriptions appear in your medication list',
          'You can revoke research access anytime',
        ]}
        ctaLabel="Refresh HealthEx connection"
        ctaHref="/connect/healthex"
      />
    </div>
  );
}
