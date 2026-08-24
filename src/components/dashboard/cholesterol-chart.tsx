'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CholesterolReading } from '@/lib/types/health-records';
import { cn } from '@/lib/utils';

export function CholesterolChart({ readings }: { readings: CholesterolReading[] }) {
  const [page, setPage] = useState(0);
  const list = Array.isArray(readings) ? readings : [];

  if (list.length === 0) {
    return (
      <Card className="h-full border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Cholesterol — HDL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg bg-muted/30 px-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">No lipid panel history yet</p>
            <p className="text-xs text-muted-foreground">
              Lab trends appear after HealthEx syncs observations.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pageSize = 5;
  const totalPages = Math.ceil(list.length / pageSize);
  const visible = list.slice(page * pageSize, (page + 1) * pageSize);
  const maxValue = Math.max(...list.map((r) => Number(r.value) || 0), 60);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Cholesterol — HDL</CardTitle>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span>
            {page + 1}/{totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end justify-around gap-2 px-2">
          {visible.map((reading) => (
            <div key={reading.year} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-10 rounded-t-sm transition-all',
                  reading.inRange ? 'bg-green-500' : 'bg-red-400',
                )}
                style={{ height: `${(reading.value / maxValue) * 120}px` }}
                title={`${reading.value} mg/dL`}
              />
              <span className="text-xs text-muted-foreground">{reading.year}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" /> In range
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-400" /> Below target
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
