import { DEFAULT_CURRENCY } from "./currency";
import type { Category, Purse, FinanceState } from "./types";

// ---- Categories ---------------------------------------------------------
// IDs are stable, human-readable slugs so demo transactions can reference them.
export const starterCategories: Category[] = [
  // Level 1
  { id: "cat-food", name: "Food", parentId: null, level: 1, icon: "🍕" },
  { id: "cat-transport", name: "Transport", parentId: null, level: 1, icon: "🚌" },
  { id: "cat-fun", name: "Fun", parentId: null, level: 1, icon: "🎉" },
  { id: "cat-health", name: "Health", parentId: null, level: 1, icon: "💊" },
  { id: "cat-housing", name: "Housing", parentId: null, level: 1, icon: "🏠" },
  { id: "cat-salary", name: "Salary", parentId: null, level: 1, icon: "💼" },

  // Level 2
  { id: "cat-food-restaurant", name: "Restaurant", parentId: "cat-food", level: 2 },
  { id: "cat-food-groceries", name: "Groceries", parentId: "cat-food", level: 2 },
  { id: "cat-transport-public", name: "Public", parentId: "cat-transport", level: 2 },
  { id: "cat-transport-fuel", name: "Fuel", parentId: "cat-transport", level: 2 },
  { id: "cat-fun-movies", name: "Movies", parentId: "cat-fun", level: 2 },
  { id: "cat-fun-events", name: "Events", parentId: "cat-fun", level: 2 },
  { id: "cat-health-pharmacy", name: "Pharmacy", parentId: "cat-health", level: 2 },
  { id: "cat-health-doctor", name: "Doctor", parentId: "cat-health", level: 2 },
  { id: "cat-housing-rent", name: "Rent", parentId: "cat-housing", level: 2 },
  { id: "cat-housing-utilities", name: "Utilities", parentId: "cat-housing", level: 2 },
  { id: "cat-salary-main", name: "Main Job", parentId: "cat-salary", level: 2 },
  { id: "cat-salary-side", name: "Side Gig", parentId: "cat-salary", level: 2 },

  // Level 3 (leaf)
  { id: "cat-food-rest-fine", name: "Fine Dining", parentId: "cat-food-restaurant", level: 3 },
  { id: "cat-food-rest-fast", name: "Fast Food", parentId: "cat-food-restaurant", level: 3 },
  { id: "cat-food-rest-cafe", name: "Café", parentId: "cat-food-restaurant", level: 3 },
  { id: "cat-transport-public-bus", name: "Bus", parentId: "cat-transport-public", level: 3 },
  { id: "cat-transport-public-metro", name: "Metro", parentId: "cat-transport-public", level: 3 },
  { id: "cat-fun-events-concert", name: "Concert", parentId: "cat-fun-events", level: 3 },
  { id: "cat-housing-util-electric", name: "Electricity", parentId: "cat-housing-utilities", level: 3 },
  { id: "cat-housing-util-internet", name: "Internet", parentId: "cat-housing-utilities", level: 3 },
];

// ---- Purses -------------------------------------------------------------
export const starterPurses: Purse[] = [
  { id: "purse-bank", name: "Bank Account", isDefault: true },
  { id: "purse-cash", name: "Cash", isDefault: false },
  { id: "purse-credit", name: "Credit Card", isDefault: false },
];

export const initialFinanceState: FinanceState = {
  transactions: [],
  categories: starterCategories,
  purses: starterPurses,
  onboardingSeen: false,
  currency: DEFAULT_CURRENCY,
};
