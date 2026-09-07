import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const signInWithPassword = vi.fn();
const signUp = vi.fn();
const navigate = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => signInWithPassword(...args),
      signUp: (...args: unknown[]) => signUp(...args),
    },
  },
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  Link: ({ children, ...rest }: { children: React.ReactNode }) => <a {...rest}>{children}</a>,
}));

import { AuthForm } from "./AuthForm";

describe("AuthForm", () => {
  beforeEach(() => {
    signInWithPassword.mockReset().mockResolvedValue({ error: null });
    signUp.mockReset().mockResolvedValue({ error: null });
    navigate.mockReset();
  });

  it("rejects an invalid email without calling the backend", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("valid email");
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("requires at least 8 characters when signing up", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("at least 8 characters");
    expect(signUp).not.toHaveBeenCalled();
  });

  it("signs in with valid credentials and goes home", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      }),
    );
    expect(navigate).toHaveBeenCalledWith({ to: "/" });
  });

  it("shows the backend error message when sign-in fails", async () => {
    signInWithPassword.mockResolvedValue({ error: { message: "Invalid login credentials" } });
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid login credentials");
    expect(navigate).not.toHaveBeenCalled();
  });

  it("creates an account and goes home", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);

    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(signUp).toHaveBeenCalled());
    expect(navigate).toHaveBeenCalledWith({ to: "/" });
  });
});
