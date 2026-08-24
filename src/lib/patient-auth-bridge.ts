import { mintDevToken, type AuthSession, type BackendAuthConfig } from '@trialcliniq/shared-ui';
import type { PatientAccount } from '@/lib/types/patient-account';
import { setPatientAuthenticated } from '@/lib/patient-auth';

type AuthBridgeCtx = {
  session: AuthSession;
  backendConfig: BackendAuthConfig | null;
  updateSession: (patch: Partial<AuthSession>) => void;
  resetSession: () => void;
};

/**
 * After local credential validation, mint (or stub) a gateway JWT and
 * persist the shared-ui auth session for API calls.
 */
export async function establishPatientSession(
  account: PatientAccount,
  auth: AuthBridgeCtx,
): Promise<void> {
  const sub = account.id;
  const patientId =
    account.enterprisePatientId || account.healthExPatientId || account.id;
  const scope = auth.session.scope || 'patient/*.read';
  const purpose = auth.session.purpose || 'RESRCH';

  let token = auth.session.token || 'dev-token';
  let mode: AuthSession['mode'] = auth.session.mode === 'external' ? 'external' : 'stub';

  if (auth.backendConfig?.mintEnabled) {
    token = await mintDevToken({ sub, scope, purpose });
    mode = 'jwt';
  }

  auth.updateSession({
    sub,
    role: 'patient',
    patientId,
    token,
    mode,
    scope,
    purpose,
  });
  setPatientAuthenticated(true);
}

export function clearPatientSession(auth: Pick<AuthBridgeCtx, 'resetSession'>): void {
  auth.resetSession();
  setPatientAuthenticated(false);
}
