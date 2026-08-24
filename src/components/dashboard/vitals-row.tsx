import { Card, CardContent } from '@/components/ui/card';
import type { VitalMetric } from '@/lib/types/health-records';
import { cn } from '@/lib/utils';

const VITAL_SLOTS: Pick<VitalMetric, 'id' | 'label' | 'color'>[] = [
  { id: 'bmi', label: 'BMI', color: 'bg-vital-bmi' },
  { id: 'bp', label: 'Blood Pressure', color: 'bg-vital-bp' },
  { id: 'glucose', label: 'Glucose', color: 'bg-vital-glucose' },
  { id: 'weight', label: 'Weight', color: 'bg-vital-weight' },
  { id: 'heart', label: 'Heart Rate', color: 'bg-vital-heart' },
  { id: 'spo2', label: 'SpO₂', color: 'bg-vital-spo2' },
];

function VitalCard({ vital }: { vital: VitalMetric }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-3 pb-2 sm:p-4 sm:pb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Self</span>
            <span>{vital.date}</span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            {vital.value}
            <span className="ml-1 text-sm font-normal text-muted-foreground">{vital.unit}</span>
          </p>
        </div>
        <div className={cn('px-2 py-2 text-center text-[11px] font-medium text-white sm:px-4 sm:text-xs', vital.color)}>
          {vital.label}
        </div>
      </CardContent>
    </Card>
  );
}

function VitalEmptyCard({ slot }: { slot: (typeof VITAL_SLOTS)[number] }) {
  return (
    <Card className="overflow-hidden border-dashed border-muted-foreground/25 bg-muted/10">
      <CardContent className="p-0">
        <div className="p-3 pb-2 sm:p-4 sm:pb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Self</span>
            <span>—</span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-muted-foreground/40 sm:text-2xl">—</p>
        </div>
        <div className={cn('px-2 py-2 text-center text-[11px] font-medium text-white/90 sm:px-4 sm:text-xs', slot.color)}>
          {slot.label}
        </div>
      </CardContent>
    </Card>
  );
}

export function VitalsRow({ vitals }: { vitals: VitalMetric[] }) {
  const list = Array.isArray(vitals) ? vitals : [];
  if (list.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {VITAL_SLOTS.map((slot) => (
          <VitalEmptyCard key={slot.id} slot={slot} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {list.map((vital) => (
        <VitalCard key={vital.id} vital={vital} />
      ))}
    </div>
  );
}
