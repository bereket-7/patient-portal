import Link from 'next/link';
import { AuthCard, RegistrationStepIndicator } from '@/components/auth/auth-step-indicator';
import { RegistrationForm } from '@/components/auth/registration-form';

export default function RegisterPage() {
  return (
    <>
      <RegistrationStepIndicator currentStep={1} />
      <AuthCard
        title="Create your account"
        description="Complete registration to verify your identity. Sign-in is a separate step after verification."
        footer={
          <>
            Already registered?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        <RegistrationForm />
      </AuthCard>
    </>
  );
}
