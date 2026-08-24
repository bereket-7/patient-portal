'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const FAQ = [
  {
    q: 'How do I connect my health records?',
    a: 'From your dashboard, click "Connect health records" to sign in through HealthEx. HealthEx verifies your identity and retrieves records from your care providers. TrialClinIQ never stores your HealthEx password.',
  },
  {
    q: 'What does research consent allow?',
    a: 'Consent authorizes TrialClinIQ to use your FHIR health data for clinical trial matching only (RESRCH purpose). Coordinators at research sites may view your match profile after you express interest.',
  },
  {
    q: 'How do I revoke consent?',
    a: 'Go to Consent & Privacy and click "Revoke consent." Access stops immediately and trial matching is paused until you re-authorize.',
  },
  {
    q: 'What is the Data Access Log?',
    a: 'The access log shows who accessed your health data through TrialClinIQ, when, and for what purpose. This supports your HIPAA right to an accounting of disclosures.',
  },
  {
    q: 'How does trial enrollment work?',
    a: 'After a match, you can express interest. A site coordinator reviews your profile, may schedule screening, and guides enrollment. Track progress under My Participation.',
  },
];

export function HelpDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hidden text-white/80 hover:bg-white/10 hover:text-white sm:flex">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient Portal Help</DialogTitle>
          <DialogDescription>Common questions about TrialClinIQ and your health data.</DialogDescription>
        </DialogHeader>
        <dl className="space-y-4">
          {FAQ.map((item) => (
            <div key={item.q}>
              <dt className="text-sm font-medium">{item.q}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
