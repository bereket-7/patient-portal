import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AllergiesCard({ allergies }: { allergies: string[] }) {
  const list = Array.isArray(allergies) ? allergies : [];
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Allergies</CardTitle>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/20 px-4 py-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">No allergies documented</p>
            <p className="mt-1 text-xs text-muted-foreground">
              AllergyIntolerance resources from HealthEx will appear here.
            </p>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">{list.join(', ')}</p>
        )}
      </CardContent>
    </Card>
  );
}
