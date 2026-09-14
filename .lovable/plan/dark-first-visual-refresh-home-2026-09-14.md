# Dark-first visual refresh: Home

## Goal
Give FinanceFlow the feel of a precise modern financial tool: dark by default, layered light-grey surfaces, restrained amber/gold highlights, compact geometry, and clear numeric hierarchy.

## This page
- Refresh the shared top bar and navigation drawer so Home previews the future app-wide direction consistently.
- Redesign Home’s monthly balance, income, expense, add-record action, and recent-record list.
- Keep every current workflow, calculation, local-device storage behavior, and optional account behavior unchanged.
- Add a light appearance option in Settings while keeping dark as the default; both appearances will use the same neutral-and-amber visual language.
- Preserve keyboard access, readable contrast, mobile-first behavior, and reduced-motion support.

## Visual direction
- Near-black charcoal background with subtly lighter grey overlays and crisp hairline borders.
- Warm amber reserved for primary actions, focus states, selected navigation, and positive emphasis.
- Neutral typography with tabular figures, disciplined spacing, modest corner radii, and minimal shadows.
- Avoid gradients, decorative effects, oversized cards, and unnecessary animation.

## Test and approval
- Update or add Home and shared-layout tests before completing the visual implementation.
- Verify the Home page and menu at mobile and desktop sizes, including light/dark switching and the add-record flow.
- Pause after Home for visual approval before applying the direction to Records or other pages.

## Technical details
- Define the new light and dark semantic color tokens globally and use those tokens throughout the page.
- Add a persistent appearance preference with dark as the fallback for existing users.
- Continue using the existing shared controls and finance data layer; no backend or data-schema work is included.