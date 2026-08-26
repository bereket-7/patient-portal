import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

function LoginFormFallback() {
  return <div className="h-40 animate-pulse rounded-lg bg-muted/50" />;
}

export default function LoginPage() {
  return (
    <>
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
          Sign in
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Continue with Google, or use the email and password from registration.
        </p>
      </div>

      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>

      <div className="mt-8 space-y-3">
        <p className="text-center text-sm text-muted-foreground">
          Need an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Register
          </Link>
        </p>
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">
              Registration and sign-in are separate.
            </span>{" "}
            New patients complete registration and verification first, then
            return here to sign in.
          </p>
        </div>
      </div>
    </>
  );
}
