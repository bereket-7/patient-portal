import { AuthCard, RegistrationStepIndicator } from '@/components/auth/auth-step-indicator';
import { PhoneOtpForm } from '@/components/auth/phone-otp-form';

export default function VerifyPhonePage() {
  return (
    <>
      <RegistrationStepIndicator currentStep={3} />
      <AuthCard
        title="Verify your phone"
        description="Enter the 6-digit code sent to your mobile number. You will sign in on the next screen."
      >
        <PhoneOtpForm />
      </AuthCard>
    </>
  );
}
