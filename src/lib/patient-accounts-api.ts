import type { DevPatientAccount } from '@/lib/patient-dev-accounts';

export const PATIENT_ACCOUNTS_API_BASE = '/api/v1/patient-accounts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export type PatientAccountFieldError = {
  field: string;
  code: string;
  message?: string;
};

export class PatientAccountsApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly fields: PatientAccountFieldError[] = [],
  ) {
    super(message);
    this.name = 'PatientAccountsApiError';
  }
}

export type RegisterPatientInput = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  password: string;
  gender?: string;
  address?: string;
};

export type RegisterPatientResult = {
  account: DevPatientAccount;
  healthexLinked: boolean;
  healthexError?: string;
  referenceId?: string;
};

export type LoginPatientResult =
  | {
      status: 'authenticated';
      account: DevPatientAccount;
      accessToken?: string;
      tokenType?: string;
      expiresIn?: string;
    }
  | {
      status: 'mfa_required';
      mfaToken: string;
      expiresIn?: string;
    };

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function isHttpStatusLabel(value: string): boolean {
  return (
    value === 'Bad Request' ||
    value === 'Unauthorized' ||
    value === 'Forbidden' ||
    value === 'Conflict' ||
    value === 'Not Found'
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Invalid email or password.',
  invalid_login_payload: 'Enter your email and password.',
  invalid_registration_payload: 'Please fix the highlighted fields.',
  email_already_registered: 'An account with this email already exists.',
  phone_already_registered: 'An account with this phone number already exists.',
  account_unverified: 'Finish email and phone verification before signing in.',
  account_disabled: 'This account is disabled. Contact support.',
  account_not_found: 'No account found for this email.',
  rate_limit_exceeded: 'Too many attempts. Wait a moment and try again.',
  network_error: 'Unable to reach the API. Confirm the gateway is running.',
  dev_patient_accounts_disabled:
    'Patient accounts API is disabled. Set AUTH_DEV_MODE=true on the API gateway.',
};

const FIELD_ERROR_MESSAGES: Record<string, Record<string, string>> = {
  firstName: {
    required: 'First name is required',
    too_long: 'First name is too long',
  },
  lastName: {
    required: 'Last name is required',
    too_long: 'Last name is too long',
  },
  dateOfBirth: {
    required: 'Date of birth is required',
    invalid_format: 'Date of birth must be YYYY-MM-DD',
    invalid_value: 'Date of birth is not a valid date',
  },
  email: {
    required: 'Email is required',
    too_long: 'Email is too long',
    invalid_format: 'Enter a valid email address',
  },
  phone: {
    required: 'Phone number is required',
    too_long: 'Phone number is too long',
    invalid_format: 'Phone number must contain at least 10 digits',
  },
  password: {
    required: 'Password is required',
    too_short: 'Password must be at least 8 characters',
  },
  gender: { too_long: 'Gender value is too long' },
  address: { too_long: 'Address is too long' },
};

export function patientAccountsErrorMessage(error: PatientAccountsApiError): string {
  if (error.fields.length > 0) {
    return ERROR_MESSAGES.invalid_registration_payload;
  }
  return ERROR_MESSAGES[error.code] || error.message || 'Request failed. Try again.';
}

export function patientAccountFieldMessage(field: string, code: string, fallback?: string): string {
  return FIELD_ERROR_MESSAGES[field]?.[code] || fallback || 'Invalid value';
}

function parseFields(value: unknown): PatientAccountFieldError[] {
  if (!Array.isArray(value)) return [];
  const rows: Array<PatientAccountFieldError | null> = value.map((item) => {
    const row = asRecord(item);
    if (!row || typeof row.field !== 'string') return null;
    const field: PatientAccountFieldError = {
      field: row.field,
      code: typeof row.code === 'string' ? row.code : 'invalid',
    };
    if (typeof row.message === 'string') {
      field.message = row.message;
    }
    return field;
  });
  return rows.filter((row): row is PatientAccountFieldError => row !== null);
}

export function parsePatientAccountsError(status: number, body: unknown): PatientAccountsApiError {
  const root = asRecord(body);
  const nested = asRecord(root?.message);
  const rawCode =
    (typeof nested?.error === 'string' && nested.error) ||
    (typeof root?.error === 'string' && !isHttpStatusLabel(root.error) ? root.error : '') ||
    (typeof root?.message === 'string' ? root.message : '') ||
    `http_${status}`;
  const fields = parseFields(nested?.fields ?? root?.fields);
  const code = rawCode || `http_${status}`;
  return new PatientAccountsApiError(
    code,
    ERROR_MESSAGES[code] || code.replace(/_/g, ' '),
    status,
    fields,
  );
}

async function patientAccountsFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${PATIENT_ACCOUNTS_API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(init?.headers as Record<string, string> | undefined),
      },
    });
  } catch {
    throw new PatientAccountsApiError('network_error', ERROR_MESSAGES.network_error, 0);
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw parsePatientAccountsError(res.status, body);
  }
  return body as T;
}

export async function registerPatientAccount(
  input: RegisterPatientInput,
): Promise<RegisterPatientResult> {
  const data = await patientAccountsFetch<{
    status?: string;
    account?: DevPatientAccount;
    healthex?: { linked?: boolean; error?: string; reference_id?: string };
    healthex_link_error?: string;
  }>('/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!data?.account) {
    throw new PatientAccountsApiError('invalid_registration_payload', 'Account was not created.', 500);
  }

  return {
    account: data.account,
    healthexLinked: data.healthex?.linked === true,
    healthexError: data.healthex_link_error || data.healthex?.error,
    referenceId: data.healthex?.reference_id,
  };
}

export async function loginPatientAccount(
  email: string,
  password: string,
): Promise<LoginPatientResult> {
  const data = await patientAccountsFetch<{
    status?: string;
    account?: DevPatientAccount;
    accessToken?: string;
    token?: string;
    tokenType?: string;
    expiresIn?: string;
    mfaToken?: string;
  }>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (data?.status === 'mfa_required' || data?.mfaToken) {
    if (!data.mfaToken) {
      throw new PatientAccountsApiError('mfa_required', 'Multi-factor authentication is required.', 401);
    }
    return {
      status: 'mfa_required',
      mfaToken: data.mfaToken,
      expiresIn: data.expiresIn,
    };
  }

  if (!data?.account) {
    throw new PatientAccountsApiError('invalid_credentials', ERROR_MESSAGES.invalid_credentials, 401);
  }

  return {
    status: 'authenticated',
    account: data.account,
    accessToken: data.accessToken || data.token,
    tokenType: data.tokenType,
    expiresIn: data.expiresIn,
  };
}
