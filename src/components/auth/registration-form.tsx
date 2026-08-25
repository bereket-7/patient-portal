'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { syncDevAccountToLocal } from '@/lib/patient-dev-accounts';
import {
  PatientAccountsApiError,
  patientAccountFieldMessage,
  patientAccountsErrorMessage,
  registerPatientAccount,
} from '@/lib/patient-accounts-api';

function digitsInPhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  return digits;
}

const schema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(128, 'First name is too long'),
    lastName: z.string().min(1, 'Last name is required').max(128, 'Last name is too long'),
    dateOfBirth: z
      .string()
      .min(1, 'Date of birth is required')
      .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), 'Date of birth must be YYYY-MM-DD')
      .refine((value) => {
        const dob = new Date(`${value}T00:00:00.000Z`);
        if (Number.isNaN(dob.getTime())) return false;
        const now = new Date();
        if (dob > now) return false;
        const min = new Date(now);
        min.setUTCFullYear(min.getUTCFullYear() - 120);
        return dob >= min;
      }, 'Enter a valid date of birth'),
    email: z.string().email('Enter a valid email address').max(256, 'Email is too long'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .refine((value) => digitsInPhone(value).length >= 10, 'Phone number must contain at least 10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    gender: z.string().optional(),
    address: z.string().max(512, 'Address is too long').optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function RegistrationForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [healthexNote, setHealthexNote] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      gender: '',
      address: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    setHealthexNote(null);
    setSubmitting(true);

    try {
      const result = await registerPatientAccount({
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: values.dateOfBirth,
        email: values.email,
        phone: values.phone,
        password: values.password,
        gender: values.gender || undefined,
        address: values.address || undefined,
      });

      syncDevAccountToLocal(result.account, values.password);
      if (result.healthexLinked) {
        setHealthexNote(
          `Linked to HealthEx (reference ${result.referenceId || result.account.healthExReferenceId}). HealthEx will email you to grant consent — medical data stays blocked until you approve and sync.`,
        );
      } else if (result.healthexError) {
        setHealthexNote(
          `Account created, but HealthEx link failed: ${result.healthexError}. You can retry on Connect.`,
        );
      }

      router.push('/verify-email');
    } catch (err) {
      if (err instanceof PatientAccountsApiError) {
        if (err.code === 'email_already_registered') {
          form.setError('email', { message: patientAccountsErrorMessage(err) });
        } else if (err.code === 'phone_already_registered') {
          form.setError('phone', { message: patientAccountsErrorMessage(err) });
        }
        for (const fieldError of err.fields) {
          const name = fieldError.field as keyof FormValues;
          form.setError(name, {
            message: patientAccountFieldMessage(fieldError.field, fieldError.code, fieldError.message),
          });
        }
        setSubmitError(patientAccountsErrorMessage(err));
      } else {
        setSubmitError('Unable to create account. Try again.');
      }
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {(submitError || healthexNote) && (
          <p className={`text-xs ${submitError ? 'text-destructive' : 'text-muted-foreground'}`}>
            {submitError || healthexNote}
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John" disabled={submitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Smith" disabled={submitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth *</FormLabel>
              <FormControl>
                <Input type="date" disabled={submitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" disabled={submitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Phone *</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+1 (555) 000-0000" disabled={submitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password *</FormLabel>
                <FormControl>
                  <Input type="password" disabled={submitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password *</FormLabel>
                <FormControl>
                  <Input type="password" disabled={submitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender (optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={submitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Street, City, State, ZIP" rows={2} disabled={submitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full gap-2" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
