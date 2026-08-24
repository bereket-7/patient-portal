const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export type MemberVerifyTokenResult = {
  token: string;
  verifyUrl: string;
  expiresAt: string;
};

export async function createMemberVerifyToken(params: {
  enterprisePatientId: string;
  firstName: string;
  lastName: string;
}): Promise<MemberVerifyTokenResult> {
  const res = await fetch(`${API_BASE}/dev/member-verify/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      enterprise_patient_id: params.enterprisePatientId,
      first_name: params.firstName,
      last_name: params.lastName,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || 'member_verify_token_failed');
  }
  return (await res.json()) as MemberVerifyTokenResult;
}

export async function verifyMemberToken(token: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/dev/member-verify/${encodeURIComponent(token)}`);
  return (await res.json()) as Record<string, unknown>;
}
