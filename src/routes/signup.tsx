import { createFileRoute } from "@tanstack/react-router";

import { AuthForm } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — FinanceFlow" },
      { name: "description", content: "Create a FinanceFlow account and start tracking income, expenses and purses." },
      { property: "og:title", content: "Create account — FinanceFlow" },
      { property: "og:description", content: "Create a FinanceFlow account and start tracking income, expenses and purses." },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <AuthLayout title="Create account" subtitle="Set up your account in a few seconds.">
      <AuthForm mode="signup" />
    </AuthLayout>
  );
}
