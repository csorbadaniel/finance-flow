import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...rest }: { children: React.ReactNode }) => <a {...rest}>{children}</a>,
}));

vi.mock("@/components/layout/NavDrawer", () => ({
  NavDrawer: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <nav aria-label="Main navigation" /> : null,
}));

import { AuthLayout } from "./AuthLayout";

describe("AuthLayout", () => {
  it("shows the menu button and opens the navigation drawer", async () => {
    const user = userEvent.setup();
    render(
      <AuthLayout title="Sign in" subtitle="Welcome back">
        <p>form</p>
      </AuthLayout>,
    );

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open navigation menu" }));

    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
  });
});
