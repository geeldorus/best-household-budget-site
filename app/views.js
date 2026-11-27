// Harper Household Budget — page views. Each view is a function of the store that returns
// HTML; main.js renders it and wires the controls. Every figure comes from data.js.

import {
  CATEGORIES, MONTH, categoryById, cumulativeSpending, essentialMonthlySpending, goalPercent, money, money0,
  savingsRate, sortedTransactions, spentByCategory, store, totalIncome,
  totalPlannedBudget, totalSpending, totalTransfers, weeklySpending,
} from './data.js';
import { paceChart, spendingDonut, weeklyBars } from './charts.js';

export const escape = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function categoryRows(spent) {
  const rows = CATEGORIES.filter((c) => c.id !== 'savings' && c.id !== 'income')
    .map((c) => ({ ...c, spent: spent[c.id] || 0, budget: store.budgets[c.id] || 0 }))
    .sort((a, b) => b.spent - a.spent);
  return rows;
}

function budgetBar(spent, budget) {
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const cls = spent > budget ? 'bar-fill over' : pct >= 85 ? 'bar-fill warn' : 'bar-fill';
  return `<div class="bar-track" role="img" aria-label="${Math.round(pct)} percent of budget used"><div class="${cls}" style="width:${pct}%"></div></div>`;
}

// ---------------- Dashboard ----------------

export function dashboard() {
  const income = totalIncome();
  const spending = totalSpending();
  const planned = totalPlannedBudget();
  const left = planned - spending;
  const rate = savingsRate();
  const spent = spentByCategory();
  const rows = categoryRows(spent).slice(0, 7);
  const others = categoryRows(spent).slice(7).reduce((s, r) => s + r.spent, 0);
  const legend = [...rows.map((r) => ({ ...r, pct: (r.spent / spending) * 100 }))];
  if (others > 0) legend.push({ id: 'other', name: 'Everything else', color: '#d8d2c2', spent: others, pct: (others / spending) * 100 });

  const recent = sortedTransactions().filter((t) => t.type !== 'transfer').slice(0, 5);
  const topGoals = [...store.goals].sort((a, b) => goalPercent(b) - goalPercent(a)).slice(0, 2);
  const pace = cumulativeSpending();
  const planPerDay = planned / 30;
  const cross = pace.find((d) => d.spent <= planPerDay * d.day);
  const under = planned - spending;
  const paceNote = cross
    ? `The mortgage lands on Nov 1, so spending runs ahead of the plan until Nov ${cross.day} — then the plan catches up, and November ends ${money(Math.abs(under))} ${under >= 0 ? 'under' : 'over'} plan.`
    : `Spending ran ahead of the plan all month, and November ends ${money(Math.abs(under))} ${under >= 0 ? 'under' : 'over'} plan.`;

  return `
  <div class="page-head">
    <p class="kicker">Dashboard · ${escape(MONTH)}</p>
    <h1>November at a glance</h1>
    <p class="lede">The Harpers earned ${money(income)} and spent ${money(spending)} in November — a savings rate of ${rate.toFixed(1)}%. Housing is the biggest cost, groceries are on plan, and utilities are the one category over budget. The pace chart below shows how spending tracked against the plan day by day.</p>
  </div>

  <div class="tiles">
    <div class="tile"><div class="label">Income</div><div class="value">${money0(income)}</div><div class="sub">2 salaries + freelance + interest</div></div>
    <div class="tile"><div class="label">Spending</div><div class="value">${money0(spending)}</div><div class="sub">of ${money0(planned)} planned · ${((spending / planned) * 100).toFixed(0)}% of plan</div></div>
    <div class="tile accent"><div class="label">Savings rate</div><div class="value">${rate.toFixed(1)}%</div><div class="sub">${money(income - spending)} kept this month</div></div>
    <div class="tile"><div class="label">Budget left</div><div class="value ${left < 0 ? 'bad' : ''}">${money0(left)}</div><div class="sub">${left < 0 ? 'over the monthly plan' : 'left to spend before Nov 30'}</div></div>
  </div>

  <div class="grid grid-main">
    <section class="card">
      <div class="card-head"><h2>Where the money went</h2><a class="more" href="#/planner">See the full plan →</a></div>
      <div class="chart-wrap">
        ${spendingDonut(spent, CATEGORIES.filter((c) => c.id !== 'savings'), 180)}
        <ul class="legend">
          ${legend.map((r) => `<li><span class="swatch" style="background:${r.color}"></span>${escape(r.name)}<span class="amt">${money0(r.spent)}</span><span class="pct">${r.pct.toFixed(0)}%</span></li>`).join('')}
        </ul>
      </div>
    </section>

    <div class="grid">
      <section class="card">
        <div class="card-head"><h2>Spending by week</h2></div>
        ${weeklyBars(weeklySpending())}
        <p class="hint">Week 1 is the biggest — the mortgage lands on the 1st. Week 5 is short: only Nov 29–30.</p>
      </section>
      <section class="card">
        <div class="card-head"><h2>Budget health</h2><a class="more" href="#/planner">Adjust the plan →</a></div>
        <p><span class="pill coral">1 over budget</span> <span class="pill amber">3 close to the limit</span> <span class="pill green">9 on track</span></p>
        <p>Utilities are <b>${money(spent.utilities - store.budgets.utilities)}</b> over — the mobile bill came in higher than planned. Groceries are ${money(store.budgets.groceries - spent.groceries)} under and dining ${money(store.budgets.dining - spent.dining)} under, which covers it.</p>
        <p class="hint" style="margin:0">Transfers to savings (${money0(totalTransfers())}) are money moved, not money spent.</p>
      </section>
    </div>
  </div>

  <section class="card" style="margin-top:16px">
    <div class="card-head"><h2>Spending pace — day by day against the plan</h2><span class="pill">${money0(planPerDay)} a day keeps the plan</span></div>
    ${paceChart(pace, planned)}
    <p class="hint" style="margin:8px 0 0"><span class="pace-key"><span class="pace-line actual"></span>Actual spending</span> <span class="pace-key"><span class="pace-line plan"></span>Plan (${money0(planPerDay)} a day)</span> — ${escape(paceNote)}</p>
  </section>

  <div class="grid grid-main" style="margin-top:16px">
    <section class="card">
      <div class="card-head"><h2>Recent transactions</h2><a class="more" href="#/transactions">All ${store.transactions.length} →</a></div>
      <table>
        <thead><tr><th>Date</th><th>What</th><th class="hide-phone">Category</th><th class="num">Amount</th></tr></thead>
        <tbody>
          ${recent.map((t) => `<tr class="${t.type}">
            <td>${fmtDate(t.date)}</td>
            <td><span class="merchant">${escape(t.merchant)}</span><span class="note">${escape(t.note)}</span></td>
            <td class="hide-phone">${t.type === 'income' ? 'Income' : escape(categoryById(t.category).name)}</td>
            <td class="num ${t.type === 'income' ? 'amount-in' : 'amount-out'}">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </section>

    <section class="card">
      <div class="card-head"><h2>Savings goals</h2><a class="more" href="#/goals">All goals →</a></div>
      ${topGoals.map((g) => {
        const pct = goalPercent(g);
        return `<div class="goal">
          <div class="goal-top"><h3>${escape(g.name)}</h3><span class="pct">${pct.toFixed(0)}%</span></div>
          <p class="goal-amounts"><b>${money0(g.saved)}</b> saved of ${money0(g.target)} · <span class="left">${money0(g.target - g.saved)} to go</span></p>
          ${budgetBar(g.saved, g.target)}
        </div>`;
      }).join('')}
      <p class="hint" style="margin-top:12px">Total saved across all goals: <b>${money0(store.goals.reduce((s, g) => s + g.saved, 0))}</b> of ${money0(store.goals.reduce((s, g) => s + g.target, 0))}.</p>
    </section>
  </div>`;
}

// ---------------- Transactions ----------------

export function transactions(filter = 'all', query = '') {
  const spent = spentByCategory();
  const all = sortedTransactions();
  const list = filter === 'all'
    ? all
    : filter === 'income'
      ? all.filter((t) => t.type === 'income')
      : all.filter((t) => t.category === filter);
  const income = totalIncome();
  const spending = totalSpending();
  const chips = [
    { id: 'all', label: `All (${all.length})` },
    { id: 'income', label: 'Income' },
    ...CATEGORIES.filter((c) => c.id !== 'savings').map((c) => ({ id: c.id, label: `${c.name} · ${money0(spent[c.id] || 0)}` })),
  ];
  return `
  <div class="page-head">
    <p class="kicker">Transactions · ${escape(MONTH)}</p>
    <h1>Every dollar, in and out</h1>
    <p class="lede">${all.length} transactions this month: ${money(income)} in, ${money(spending)} out, plus a ${money0(totalTransfers())} transfer to savings. Add one below and every total on the site updates.</p>
  </div>

  <div class="search-row">
    <label for="txSearch">Search</label>
    <input id="txSearch" type="search" placeholder="Search merchant or note — try GreenMart" value="${escape(query)}" autocomplete="off">
  </div>

  <div class="filter-bar" role="group" aria-label="Filter transactions by category">
    ${chips.map((c) => `<button type="button" class="chip-btn${filter === c.id ? ' on' : ''}" data-action="filter" data-filter="${c.id}">${escape(c.label)}</button>`).join('')}
  </div>

  <div class="grid grid-main">
    <section class="card">
      <div class="card-head"><h2>${filter === 'all' ? 'All transactions' : filter === 'income' ? 'Income' : escape(categoryById(filter).name)}</h2><span class="pill" id="txCount">${list.length} shown</span></div>
      ${list.length === 0 ? '<p class="empty">Nothing in this category yet — add one with the form.</p>' : `
      <table>
        <thead><tr><th>Date</th><th>What</th><th class="hide-phone">Category</th><th class="num">Amount</th><th></th></tr></thead>
        <tbody id="txBody">
          ${list.map((t) => `<tr class="${t.type}" data-search="${escape((t.merchant + ' ' + (t.note || '') + ' ' + (t.type === 'income' ? 'income' : categoryById(t.category).name)).toLowerCase())}">
            <td>${fmtDate(t.date)}</td>
            <td><span class="merchant">${escape(t.merchant)}</span><span class="note">${escape(t.note)}</span></td>
            <td class="hide-phone">${t.type === 'income' ? 'Income' : t.type === 'transfer' ? 'Transfer' : escape(categoryById(t.category).name)}</td>
            <td class="num ${t.type === 'income' ? 'amount-in' : 'amount-out'}">${t.type === 'income' ? '+' : t.type === 'transfer' ? '→' : '−'}${money(t.amount)}</td>
            <td class="row-actions"><button type="button" class="icon-btn danger" data-action="delete-tx" data-id="${t.id}" title="Delete this transaction">Delete</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
      <p class="empty" id="txNoMatch" hidden>No transactions match that search — try a different word.</p>`}
    </section>

    <section class="card">
      <h2>Add a transaction</h2>
      <form class="inline-form" id="addTxForm">
        <div class="form-row">
          <div><label for="txDate">Date</label><input id="txDate" name="date" type="date" value="2026-11-26" required></div>
          <div><label for="txAmount">Amount ($)</label><input id="txAmount" name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required></div>
        </div>
        <div><label for="txMerchant">What was it?</label><input id="txMerchant" name="merchant" type="text" maxlength="80" placeholder="e.g. GreenMart weekly shop" required></div>
        <div class="form-row">
          <div><label for="txType">Type</label>
            <select id="txType" name="type"><option value="expense">Expense</option><option value="income">Income</option></select></div>
          <div><label for="txCategory">Category</label>
            <select id="txCategory" name="category">${CATEGORIES.filter((c) => c.id !== 'savings').map((c) => `<option value="${c.id}">${escape(c.name)}</option>`).join('')}</select></div>
        </div>
        <div><label for="txNote">Note (optional)</label><input id="txNote" name="note" type="text" maxlength="120" placeholder="e.g. Weekly shop"></div>
        <div class="btn-row"><button class="btn" type="submit">Add transaction</button><span class="hint">Saved in this browser only.</span></div>
      </form>
      <p class="hint" style="margin-top:14px">Tip: deleting a transaction removes it from every total — dashboard, planner bars and the savings rate all recalculate.</p>
    </section>
  </div>`;
}

// ---------------- Budget planner ----------------

const NEEDS = ['housing', 'groceries', 'transport', 'utilities', 'health', 'kids'];
const WANTS = ['dining', 'entertainment', 'clothing', 'personal', 'subscriptions', 'pets'];

export function planner() {
  const spent = spentByCategory();
  const planned = totalPlannedBudget();
  const income = totalIncome();
  const needs = NEEDS.reduce((s, id) => s + (store.budgets[id] || 0), 0);
  const wants = WANTS.reduce((s, id) => s + (store.budgets[id] || 0), 0);
  const savings = Math.max(0, income - needs - wants);
  const pct = (v) => ((v / income) * 100).toFixed(0);

  const rows = CATEGORIES.filter((c) => c.id !== 'savings').map((c) => ({
    ...c, spent: spent[c.id] || 0, budget: store.budgets[c.id] || 0,
  })).sort((a, b) => b.budget - a.budget);

  return `
  <div class="page-head">
    <p class="kicker">Budget planner · ${escape(MONTH)}</p>
    <h1>Plan the month, then live it</h1>
    <p class="lede">The Harpers plan ${money0(planned)} of spending against ${money0(income)} of income. Change any budget amount and press “Save plan” — the bars, the 50/30/20 split and the dashboard all follow.</p>
  </div>

  <section class="card" style="margin-bottom:16px">
    <div class="card-head"><h2>The 50/30/20 split</h2><span class="pill">Target: 50% needs · 30% wants · 20% savings</span></div>
    <div class="split">
      <div class="split-box"><div class="split-label">Needs</div><div class="split-value">${money0(needs)}</div><div class="split-note">${pct(needs)}% of income — housing, groceries, transport, utilities, health, kids</div></div>
      <div class="split-box"><div class="split-label">Wants</div><div class="split-value">${money0(wants)}</div><div class="split-note">${pct(wants)}% of income — dining out, fun, clothes, personal, subscriptions, pets</div></div>
      <div class="split-box"><div class="split-label">Savings</div><div class="split-value">${money0(savings)}</div><div class="split-note">${pct(savings)}% of income — everything left after needs and wants</div></div>
    </div>
    <p class="hint" style="margin:4px 0 0">The Harpers run lean on wants (${pct(wants)}%) and heavy on savings (${pct(savings)}%) — the extra goes to the emergency fund and the home deposit top-up.</p>
  </section>

  <section class="card">
    <div class="card-head"><h2>Budget by category</h2><span class="pill">${money0(totalSpending())} spent of ${money0(planned)} planned</span></div>
    <form id="plannerForm">
      ${rows.map((r) => {
        const over = r.spent - r.budget;
        const status = over > 0
          ? `<span class="over-tag">$${over.toFixed(2)} over</span>`
          : `<span class="left-tag">$${(r.budget - r.spent).toFixed(2)} left</span>`;
        return `<div class="budget-row">
          <div class="cat-name">${escape(r.name)}<small>${money0(r.spent)} spent</small></div>
          <div>${budgetBar(r.spent, r.budget)}</div>
          <div><label class="hint" for="budget-${r.id}" style="margin:0">Budget $</label><input class="budget-input" id="budget-${r.id}" name="budget:${r.id}" type="number" min="0" step="1" value="${r.budget}"></div>
          <div class="status">${status}</div>
        </div>`;
      }).join('')}
      <div class="btn-row" style="margin-top:16px">
        <button class="btn" type="submit">Save plan</button>
        <button class="btn secondary" type="button" data-action="reset-budgets">Reset to November plan</button>
        <span class="hint">Saved in this browser only.</span>
      </div>
    </form>
  </section>`;
}

// ---------------- Savings goals ----------------

export function goals() {
  const totalSaved = store.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = store.goals.reduce((s, g) => s + g.target, 0);
  const overall = Math.min(100, (totalSaved / totalTarget) * 100);
  return `
  <div class="page-head">
    <p class="kicker">Savings goals</p>
    <h1>What the family is saving for</h1>
    <p class="lede">Four goals, ${money0(totalSaved)} saved toward ${money0(totalTarget)} — ${overall.toFixed(0)}% of the way there. Add funds to any goal and its bar moves straight away.</p>
  </div>

  <section class="card" style="margin-bottom:16px">
    <div class="card-head"><h2>All goals together</h2><span class="pill">${overall.toFixed(0)}% funded</span></div>
    ${budgetBar(totalSaved, totalTarget)}
    <p class="hint" style="margin:10px 0 0">${money0(totalTarget - totalSaved)} still to save across the four goals. At the current pace of about $1,200 a month, the emergency fund is done by March 2027.</p>
  </section>

  <div class="grid grid-2">
    ${store.goals.map((g) => {
      const pct = goalPercent(g);
      const done = g.saved >= g.target;
      return `<section class="card goal-card">
        <div class="goal-top"><h3>${escape(g.name)}</h3><span class="pct">${pct.toFixed(0)}%</span></div>
        <p class="goal-amounts"><b>${money0(g.saved)}</b> saved of ${money0(g.target)} · <span class="left">${done ? 'Goal reached!' : money0(g.target - g.saved) + ' to go'}</span></p>
        ${budgetBar(g.saved, g.target)}
        <form class="goal-actions" data-goal-form="${g.id}">
          <label for="add-${g.id}" style="margin:0">Add funds $</label>
          <input id="add-${g.id}" name="amount" type="number" min="1" step="1" placeholder="100" required>
          <button class="btn small" type="submit">Add to goal</button>
        </form>
        <p class="goal-note">${escape(g.note)}</p>
      </section>`;
    }).join('')}
  </div>`;
}

// ---------------- Calculators ----------------

export function calculators() {
  const essentials = essentialMonthlySpending();
  const emergency = store.goals.find((g) => g.id === 'g1');
  return `
  <div class="page-head">
    <p class="kicker">Calculators</p>
    <h1>Do the money maths</h1>
    <p class="lede">Three calculators, all running on the Harpers’ real November figures. Change any number and the answer updates as you type.</p>
  </div>

  <div class="grid grid-2">
    <section class="card calc" id="calcEmergency">
      <h3>Emergency fund calculator</h3>
      <p>How much should the family hold for a rainy day? Essential spending this month is <b>${money(essentials)}</b> — housing, groceries, transport, utilities, health and kids.</p>
      <div><label for="efMonths">Months of cover</label>
        <div class="slider-row"><input type="range" id="efMonths" min="3" max="12" step="1" value="6" data-calc="emergency"><output id="efMonthsOut">6 months</output></div></div>
      <div style="margin-top:10px"><label for="efMonthly">Monthly essential spending ($)</label>
        <input id="efMonthly" type="number" min="100" step="10" value="${Math.round(essentials)}" data-calc="emergency"></div>
      <div class="calc-result" id="efResult" aria-live="polite"></div>
    </section>

    <section class="card calc" id="calcDebt">
      <h3>Debt payoff calculator</h3>
      <p>How long until a balance is gone — and what it really costs. Try the Harpers’ remaining car loan: <b>$4,850 at 6.9% APR</b>.</p>
      <div class="form-row">
        <div><label for="debtBalance">Balance owed ($)</label><input id="debtBalance" type="number" min="100" step="10" value="4850" data-calc="debt"></div>
        <div><label for="debtApr">Annual rate — APR (%)</label><input id="debtApr" type="number" min="0" max="40" step="0.1" value="6.9" data-calc="debt"></div>
      </div>
      <div style="margin-top:10px"><label for="debtPayment">Monthly payment ($)</label><input id="debtPayment" type="number" min="10" step="5" value="220" data-calc="debt"></div>
      <div class="calc-result" id="debtResult" aria-live="polite"></div>
    </section>

    <section class="card calc" id="calcSplit">
      <h3>50/30/20 paycheck split</h3>
      <p>Split any take-home pay into needs, wants and savings. Start with the Harpers’ combined monthly income of <b>${money0(totalIncome())}</b>.</p>
      <div><label for="splitIncome">Monthly take-home pay ($)</label><input id="splitIncome" type="number" min="100" step="50" value="${Math.round(totalIncome())}" data-calc="split"></div>
      <div class="calc-result" id="splitResult" aria-live="polite"></div>
    </section>

    <section class="card">
      <h2>Three rules the Harpers live by</h2>
      <ol class="tip-list">
        <li><b>Pay yourself first.</b> The $1,200 savings transfer leaves on payday, before any spending happens.</li>
        <li><b>One over-budget category is a warning, not a failure.</b> Utilities ran $5.60 over in November; groceries came in $87.60 under and covered it.</li>
        <li><b>Every dollar has a job.</b> Income minus planned spending minus savings should be close to zero — money with no job gets spent by accident.</li>
        <li><b>Check the plan weekly, not daily.</b> Sunday evenings, ten minutes, one look at the dashboard.</li>
      </ol>
      <div class="callout" style="margin-top:14px"><strong>November tip:</strong> the family saved ${money(totalIncome() - totalSpending())} this month. Moving half of it — ${money0((totalIncome() - totalSpending()) / 2)} — into the emergency fund would finish that goal by February 2027.</div>
    </section>
  </div>`;
}

export function notFound() {
  return `
  <div class="page-head">
    <p class="kicker">Not found</p>
    <h1>That page isn’t in the budget</h1>
    <p class="lede">There’s no page at this address. The dashboard, transactions, planner, goals and calculators are all in the menu above.</p>
  </div>
  <p><a class="btn" href="#/" style="text-decoration:none;display:inline-block">Back to the dashboard</a></p>`;
}
