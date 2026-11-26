// Harper Household Budget — data and store.
// Seed data is the Harper family's real November 2026 month: two salaries, one freelance
// payment and interest in; every household expense out, grouped by category. The store
// loads from localStorage when the family has made changes, otherwise from this seed.

export const MONTH = 'November 2026';
export const MONTH_SHORT = 'Nov 2026';

export const CATEGORIES = [
  { id: 'housing', name: 'Housing', color: '#14655a' },
  { id: 'groceries', name: 'Groceries', color: '#e9a13b' },
  { id: 'dining', name: 'Dining out', color: '#c4502e' },
  { id: 'transport', name: 'Transport', color: '#5b8c7b' },
  { id: 'utilities', name: 'Utilities', color: '#7a6aa8' },
  { id: 'kids', name: 'Kids & school', color: '#d97b9b' },
  { id: 'health', name: 'Health', color: '#2e7d4f' },
  { id: 'entertainment', name: 'Entertainment', color: '#4a7fb5' },
  { id: 'clothing', name: 'Clothing', color: '#8a6d3b' },
  { id: 'home', name: 'Home & garden', color: '#6b8e23' },
  { id: 'personal', name: 'Personal', color: '#b08968' },
  { id: 'pets', name: 'Pets', color: '#e07a5f' },
  { id: 'subscriptions', name: 'Subscriptions', color: '#9a9a9a' },
  { id: 'savings', name: 'Savings transfer', color: '#2f4858' },
];

export const categoryById = (id) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

// Planned monthly budget per category, in dollars.
export const DEFAULT_BUDGETS = {
  housing: 2150,
  groceries: 780,
  dining: 320,
  transport: 410,
  utilities: 285,
  kids: 450,
  health: 260,
  entertainment: 180,
  clothing: 150,
  home: 200,
  personal: 120,
  pets: 90,
  subscriptions: 65,
};

export const SEED_TRANSACTIONS = [
  // Income
  { id: 't01', date: '2026-11-01', merchant: 'Maya Harper — salary', category: 'income', type: 'income', amount: 5200.0, note: 'Monthly pay, Northwind Studio' },
  { id: 't02', date: '2026-11-01', merchant: 'Jordan Harper — salary', category: 'income', type: 'income', amount: 4350.0, note: 'Monthly pay, City Transit Authority' },
  { id: 't03', date: '2026-11-14', merchant: 'Freelance design — Maya', category: 'income', type: 'income', amount: 620.0, note: 'Logo work for Corner Bakery' },
  { id: 't04', date: '2026-11-30', merchant: 'Savings interest', category: 'income', type: 'income', amount: 38.0, note: 'High-yield savings, November' },
  // Housing
  { id: 't05', date: '2026-11-01', merchant: 'Mortgage — First National Bank', category: 'housing', type: 'expense', amount: 2150.0, note: 'Monthly mortgage payment' },
  // Groceries
  { id: 't06', date: '2026-11-02', merchant: 'GreenMart', category: 'groceries', type: 'expense', amount: 148.2, note: 'Weekly shop' },
  { id: 't07', date: '2026-11-09', merchant: 'GreenMart', category: 'groceries', type: 'expense', amount: 132.45, note: 'Weekly shop' },
  { id: 't08', date: '2026-11-16', merchant: 'GreenMart', category: 'groceries', type: 'expense', amount: 156.8, note: 'Weekly shop' },
  { id: 't09', date: '2026-11-23', merchant: 'GreenMart', category: 'groceries', type: 'expense', amount: 141.3, note: 'Weekly shop' },
  { id: 't10', date: '2026-11-26', merchant: 'GreenMart', category: 'groceries', type: 'expense', amount: 113.65, note: 'Thanksgiving shop' },
  // Dining out
  { id: 't11', date: '2026-11-07', merchant: "Rosa's Pizzeria", category: 'dining', type: 'expense', amount: 54.6, note: 'Family dinner out' },
  { id: 't12', date: '2026-11-13', merchant: 'Saffron Thai', category: 'dining', type: 'expense', amount: 42.75, note: 'Takeaway' },
  { id: 't13', date: '2026-11-15', merchant: 'Blue Door Café', category: 'dining', type: 'expense', amount: 38.4, note: 'Coffee and brunch' },
  { id: 't14', date: '2026-11-21', merchant: 'Sushi night — Kaito', category: 'dining', type: 'expense', amount: 68.9, note: 'Date night' },
  { id: 't15', date: '2026-11-27', merchant: "Friends' pizza night", category: 'dining', type: 'expense', amount: 42.5, note: 'Split with the Patels' },
  { id: 't16', date: '2026-11-29', merchant: 'Café lunch', category: 'dining', type: 'expense', amount: 40.0, note: 'Lunch with Grandma June' },
  // Transport
  { id: 't17', date: '2026-11-03', merchant: 'Shell — fuel', category: 'transport', type: 'expense', amount: 58.2, note: 'Fill-up, family car' },
  { id: 't18', date: '2026-11-05', merchant: 'Car wash', category: 'transport', type: 'expense', amount: 18.0, note: 'Monthly wash' },
  { id: 't19', date: '2026-11-10', merchant: 'Metro monthly pass', category: 'transport', type: 'expense', amount: 96.0, note: "Jordan's commute pass" },
  { id: 't20', date: '2026-11-17', merchant: 'Shell — fuel', category: 'transport', type: 'expense', amount: 61.45, note: 'Fill-up, family car' },
  { id: 't21', date: '2026-11-19', merchant: 'Toll — Riverside Bridge', category: 'transport', type: 'expense', amount: 12.0, note: 'Weekend trip toll' },
  { id: 't22', date: '2026-11-24', merchant: 'Parking — downtown', category: 'transport', type: 'expense', amount: 18.5, note: 'Saturday parking' },
  { id: 't23', date: '2026-11-26', merchant: 'Ride-share', category: 'transport', type: 'expense', amount: 22.0, note: 'Airport run for Grandma June' },
  { id: 't24', date: '2026-11-28', merchant: 'Shell — fuel', category: 'transport', type: 'expense', amount: 52.65, note: 'Fill-up, family car' },
  // Utilities
  { id: 't25', date: '2026-11-05', merchant: 'City Power — electric', category: 'utilities', type: 'expense', amount: 118.4, note: 'October usage billed November' },
  { id: 't26', date: '2026-11-08', merchant: 'Water & sewer', category: 'utilities', type: 'expense', amount: 64.2, note: 'Monthly water bill' },
  { id: 't27', date: '2026-11-12', merchant: 'FiberOne — internet', category: 'utilities', type: 'expense', amount: 59.0, note: 'Broadband, 500 Mbps' },
  { id: 't28', date: '2026-11-20', merchant: 'Mobile — two lines', category: 'utilities', type: 'expense', amount: 49.0, note: 'Maya and Jordan' },
  // Kids & school
  { id: 't29', date: '2026-11-04', merchant: 'After-school club', category: 'kids', type: 'expense', amount: 120.0, note: 'Leo and Nora, November' },
  { id: 't30', date: '2026-11-11', merchant: 'School lunch top-up', category: 'kids', type: 'expense', amount: 45.0, note: 'Canteen balance' },
  { id: 't31', date: '2026-11-18', merchant: "Kids' shoes — Leo", category: 'kids', type: 'expense', amount: 68.5, note: 'Outgrew the last pair' },
  { id: 't32', date: '2026-11-22', merchant: 'Piano lessons — Nora', category: 'kids', type: 'expense', amount: 95.0, note: 'Four lessons' },
  { id: 't33', date: '2026-11-25', merchant: 'Craft supplies', category: 'kids', type: 'expense', amount: 34.0, note: 'School holiday project' },
  // Health
  { id: 't34', date: '2026-11-06', merchant: 'Pharmacy', category: 'health', type: 'expense', amount: 42.3, note: 'Prescriptions and cold remedy' },
  { id: 't35', date: '2026-11-14', merchant: 'Dentist check-up', category: 'health', type: 'expense', amount: 85.0, note: 'Leo, six-month check' },
  { id: 't36', date: '2026-11-19', merchant: 'Gym membership', category: 'health', type: 'expense', amount: 39.0, note: 'Family gym, monthly' },
  { id: 't37', date: '2026-11-27', merchant: 'Vitamins', category: 'health', type: 'expense', amount: 22.2, note: 'Winter vitamins' },
  // Entertainment
  { id: 't38', date: '2026-11-08', merchant: 'Cinema — family film', category: 'entertainment', type: 'expense', amount: 46.0, note: 'Two adults, two kids' },
  { id: 't39', date: '2026-11-21', merchant: 'Board game — Ticket to Ride', category: 'entertainment', type: 'expense', amount: 28.5, note: 'Family game night' },
  { id: 't40', date: '2026-11-29', merchant: 'Concert tickets', category: 'entertainment', type: 'expense', amount: 89.7, note: 'December show, booked early' },
  // Clothing
  { id: 't41', date: '2026-11-10', merchant: 'Winter coat — Maya', category: 'clothing', type: 'expense', amount: 96.75, note: 'Sale price, was $140' },
  // Home & garden
  { id: 't42', date: '2026-11-12', merchant: 'Hardware store', category: 'home', type: 'expense', amount: 58.4, note: 'Fix the leaking tap' },
  { id: 't43', date: '2026-11-20', merchant: 'Light bulbs & filters', category: 'home', type: 'expense', amount: 31.2, note: 'LED bulbs, furnace filter' },
  { id: 't44', date: '2026-11-24', merchant: 'Garden centre', category: 'home', type: 'expense', amount: 54.0, note: 'Winter bulbs and mulch' },
  // Personal
  { id: 't45', date: '2026-11-09', merchant: 'Haircut — Jordan', category: 'personal', type: 'expense', amount: 35.0, note: 'Barber' },
  { id: 't46', date: '2026-11-17', merchant: 'Haircut — Maya', category: 'personal', type: 'expense', amount: 48.0, note: 'Salon' },
  { id: 't47', date: '2026-11-28', merchant: 'Toiletries', category: 'personal', type: 'expense', amount: 15.4, note: 'Shampoo, soap, toothpaste' },
  // Pets
  { id: 't48', date: '2026-11-07', merchant: 'Dog food — Biscuit', category: 'pets', type: 'expense', amount: 42.5, note: 'Large bag, lasts a month' },
  { id: 't49', date: '2026-11-21', merchant: 'Vet check-up — Biscuit', category: 'pets', type: 'expense', amount: 31.75, note: 'Annual check and booster' },
  // Subscriptions
  { id: 't50', date: '2026-11-02', merchant: 'Streaming bundle', category: 'subscriptions', type: 'expense', amount: 18.99, note: 'Two video services' },
  { id: 't51', date: '2026-11-05', merchant: 'Cloud storage', category: 'subscriptions', type: 'expense', amount: 9.99, note: 'Family photo backup' },
  { id: 't52', date: '2026-11-15', merchant: 'Music streaming', category: 'subscriptions', type: 'expense', amount: 11.99, note: 'Family plan' },
  { id: 't53', date: '2026-11-22', merchant: 'News app', category: 'subscriptions', type: 'expense', amount: 7.99, note: 'Weekend paper, digital' },
  // Savings transfer (money moved, not spent)
  { id: 't54', date: '2026-11-01', merchant: 'Transfer to savings', category: 'savings', type: 'transfer', amount: 1200.0, note: 'Automatic payday transfer' },
];

export const SEED_GOALS = [
  { id: 'g1', name: 'Emergency fund', target: 15000, saved: 9840, note: 'Six months of essential spending. $5,160 to go — about 4 more months at the current pace.' },
  { id: 'g2', name: 'Family holiday — Lake District', target: 3200, saved: 1875, note: 'A week by the lake next summer: cottage, train tickets and food. $1,325 to go.' },
  { id: 'g3', name: 'New car fund', target: 8000, saved: 2430, note: 'Replacing the 2014 hatchback in 2027. $5,570 to go — the current car still runs fine.' },
  { id: 'g4', name: 'Home deposit top-up', target: 25000, saved: 11250, note: 'Extra equity for the move to a bigger place. $13,750 to go.' },
];

// ---------- store: seed in, changes out to localStorage ----------

const STORAGE_KEY = 'harper-budget-v1';

function cloneSeed() {
  return {
    transactions: SEED_TRANSACTIONS.map((t) => ({ ...t })),
    budgets: { ...DEFAULT_BUDGETS },
    goals: SEED_GOALS.map((g) => ({ ...g })),
  };
}

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.transactions) || !parsed.budgets || !Array.isArray(parsed.goals)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const store = loadStored() ?? cloneSeed();

export function saveStore() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage full or unavailable: the page still works for this visit.
  }
}

export function resetStore() {
  const fresh = cloneSeed();
  store.transactions = fresh.transactions;
  store.budgets = fresh.budgets;
  store.goals = fresh.goals;
  saveStore();
}

// ---------- computed figures ----------

export const money = (n) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const money0 = (n) => '$' + Math.round(Number(n)).toLocaleString('en-US');

export function totalIncome() {
  return store.transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
}

export function totalSpending() {
  return store.transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
}

export function totalTransfers() {
  return store.transactions.filter((t) => t.type === 'transfer').reduce((s, t) => s + t.amount, 0);
}

export function spentByCategory() {
  const out = {};
  for (const c of CATEGORIES) out[c.id] = 0;
  for (const t of store.transactions) {
    if (t.type === 'expense' && out[t.category] !== undefined) out[t.category] += t.amount;
  }
  return out;
}

export function totalPlannedBudget() {
  return Object.values(store.budgets).reduce((s, v) => s + v, 0);
}

export function savingsRate() {
  const income = totalIncome();
  if (income <= 0) return 0;
  return ((income - totalSpending()) / income) * 100;
}

/** Spending grouped by week of the month (weeks starting Nov 1, 8, 15, 22, 29). */
export function weeklySpending() {
  const weeks = [0, 0, 0, 0, 0];
  for (const t of store.transactions) {
    if (t.type !== 'expense') continue;
    const day = Number(t.date.slice(8, 10));
    weeks[Math.min(4, Math.floor((day - 1) / 7))] += t.amount;
  }
  return weeks;
}

export function sortedTransactions() {
  return [...store.transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function addTransaction(tx) {
  const id = 'u' + Date.now().toString(36) + Math.floor(Math.random() * 1000);
  store.transactions.push({ id, ...tx });
  saveStore();
  return id;
}

export function deleteTransaction(id) {
  const i = store.transactions.findIndex((t) => t.id === id);
  if (i >= 0) {
    store.transactions.splice(i, 1);
    saveStore();
    return true;
  }
  return false;
}

export function setBudget(categoryId, amount) {
  store.budgets[categoryId] = Math.max(0, Math.round(amount * 100) / 100);
  saveStore();
}

export function addToGoal(goalId, amount) {
  const goal = store.goals.find((g) => g.id === goalId);
  if (!goal) return null;
  goal.saved = Math.round((goal.saved + amount) * 100) / 100;
  saveStore();
  return goal;
}

/** Percent of a savings goal reached, capped at 100. */
export function goalPercent(goal) {
  if (!goal || goal.target <= 0) return 0;
  return Math.min(100, (goal.saved / goal.target) * 100);
}

/** Months of essential spending the emergency fund covers. */
export function essentialMonthlySpending() {
  const spent = spentByCategory();
  const essential = ['housing', 'groceries', 'transport', 'utilities', 'health', 'kids'];
  return essential.reduce((s, id) => s + (spent[id] || 0), 0);
}
