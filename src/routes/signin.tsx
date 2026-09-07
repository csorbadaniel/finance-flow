import { createFileRoute } from "@tanstack/react-router";

import { AuthForm } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — FinanceFlow" },
      { name: "description", content: "Sign in to FinanceFlow to track your income, expenses and purses." },
      { property: "og:title", content: "Sign in — FinanceFlow" },
      { property: "og:description", content: "Sign in to FinanceFlow to track your income, expenses and purses." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  return (
    <AuthLayout title="Sign in" subtitle="Welcome back — pick up where you left off.">
      <AuthForm mode="signin" />
    </AuthLayout>
  );
}
