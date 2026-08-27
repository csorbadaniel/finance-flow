import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
} from "@tanstack/react-router";

import { AppShell } from "./AppShell";

function renderShell() {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <AppShell title="Home">Content here</AppShell>,
  });
  const otherRoutes = ["/records", "/charts", "/categories", "/purses", "/settings"].map(
    (path) =>
      createRoute({
        getParentRoute: () => rootRoute,
        path,
        component: () => <AppShell title={path}>Other</AppShell>,
      }),
  );
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, ...otherRoutes]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  // Test-only router instance; types differ from the app router.
  return render(<RouterProvider router={router as never} />);
}

describe("AppShell", () => {
  it("renders the page title and content", async () => {
    renderShell();
    expect(await screen.findByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByText("Content here")).toBeInTheDocument();
  });

  it("opens the navigation drawer with every main link", async () => {
    const user = userEvent.setup();
    renderShell();
    await user.click(await screen.findByRole("button", { name: /open navigation menu/i }));

    const nav = await screen.findByRole("navigation", { name: /main navigation/i });
    for (const label of ["Home", "Records", "Charts", "Categories", "Purses", "Settings"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(nav).toBeInTheDocument();
  });
});
