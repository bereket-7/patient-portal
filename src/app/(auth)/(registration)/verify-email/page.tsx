import { AuthCard, RegistrationStepIndicator } from '@/components/auth/auth-step-indicator';
import { EmailVerification } from '@/components/auth/email-verification';

export default function VerifyEmailPage() {
  return (
    <>
      <RegistrationStepIndicator currentStep={2} />
      <AuthCard
        title="Verify your email"
        description="We need to confirm your email address before you can sign in."
      >
        <EmailVerification />
      </AuthCard>
    </>
  );
}
