// Harper Household Budget — router and wiring.
// Hash routes: #/ dashboard, #/transactions, #/planner, #/goals, #/calculators.
// Every control on the site is wired here: filters, add/delete transactions, the planner
// form, goal top-ups, and the three calculators, which recompute as you type.
//
// window.__shotReady is false while a page renders and true once it is on screen, so a
// screenshot script knows when to capture.

import {
  DEFAULT_BUDGETS, addToGoal, addTransaction, deleteTransaction, essentialMonthlySpending,
  money, money0, setBudget, store, totalIncome, totalSpending,
} from './data.js';
import { calculators, dashboard, goals, notFound, planner, transactions } from './views.js';

const app = document.getElementById('app');
const monthChip = document.getElementById('monthChip');
let txFilter = 'all';
let txQuery = '';

/** Filter the visible transaction rows by the search box, without a full
    re-render (so the input keeps focus). Updates the shown count and the
    no-match note. */
function applyTxSearch() {
  const body = document.getElementById('txBody');
  const count = document.getElementById('txCount');
  const noMatch = document.getElementById('txNoMatch');
  if (!body) return;
  const q = txQuery.trim().toLowerCase();
  let shown = 0;
  for (const row of body.querySelectorAll('tr')) {
    const hit = !q || (row.dataset.search || '').includes(q);
    row.style.display = hit ? '' : 'none';
    if (hit) shown++;
  }
  if (count) count.textContent = `${shown} shown`;
  if (noMatch) noMatch.hidden = shown !== 0;
}

// ---------- calculators ----------

function emergencyResult() {
  const months = Number(document.getElementById('efMonths')?.value ?? 6);
  const monthly = Number(document.getElementById('efMonthly')?.value ?? essentialMonthlySpending());
  const out = document.getElementById('efMonthsOut');
  if (out) out.textContent = `${months} month${months === 1 ? '' : 's'}`;
  const target = monthly * months;
  const saved = store.goals.find((g) => g.id === 'g1')?.saved ?? 0;
  const gap = Math.max(0, target - saved);
  const covered = monthly > 0 ? saved / monthly : 0;
  const el = document.getElementById('efResult');
  if (!el) return;
  el.innerHTML = `
    <div class="big">Target: ${money0(target)}</div>
    <div class="result-line"><span>Already saved (emergency fund)</span><b>${money0(saved)}</b></div>
    <div class="result-line"><span>Still to save</span><b>${money0(gap)}</b></div>
    <div class="result-line"><span>Months covered right now</span><b>${covered.toFixed(1)} months</b></div>
    <div class="detail">At ${money0(monthly)} a month, ${months} months of cover needs ${money0(target)}.${gap > 0 ? ` Saving ${money0(Math.ceil(gap / 6))} a month closes the gap in 6 months.` : ' The fund already covers it.'}</div>`;
}

/** Month-by-month amortisation: returns months, total interest and total paid, or null
    when the payment never covers the interest. The final month pays only what is left. */
function amortize(balance, apr, payment) {
  const r = apr / 100 / 12;
  if (r > 0 && payment <= balance * r) return null;
  let bal = balance;
  let interest = 0;
  let months = 0;
  while (bal > 0.005 && months < 1200) {
    const thisInterest = bal * r;
    interest += thisInterest;
    bal += thisInterest;
    bal -= Math.min(payment, bal);
    months++;
  }
  return { months, interest, total: balance + interest };
}

function debtResult() {
  const balance = Number(document.getElementById('debtBalance')?.value ?? 0);
  const apr = Number(document.getElementById('debtApr')?.value ?? 0);
  const payment = Number(document.getElementById('debtPayment')?.value ?? 0);
  const el = document.getElementById('debtResult');
  if (!el) return;
  if (balance <= 0 || payment <= 0) {
    el.innerHTML = '<div class="big">Enter a balance and a payment</div><div class="detail">Both numbers need to be above zero for the maths to work.</div>';
    return;
  }
  const plan = amortize(balance, apr, payment);
  if (!plan) {
    const r = apr / 100 / 12;
    el.innerHTML = `<div class="big">It never gets paid off</div><div class="detail">A ${money0(payment)} payment does not even cover the ${money0(balance * r)} of interest added each month. Raise the payment above ${money0(Math.ceil(balance * r) + 1)}.</div>`;
    return;
  }
  const faster = amortize(balance, apr, payment + 50);
  const payoff = new Date(2026, 10 + plan.months, 1);
  const payoffLabel = payoff.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const saved = faster ? Math.max(0, plan.interest - faster.interest) : 0;
  const fasterLine = faster && faster.months < plan.months
    ? `Paying ${money0(payment + 50)} a month instead would clear it in ${faster.months} months and save ${money0(saved)} of interest.`
    : 'Raising the payment by $50 a month would clear it sooner.';
  el.innerHTML = `
    <div class="big">Debt-free in ${plan.months} month${plan.months === 1 ? '' : 's'}</div>
    <div class="result-line"><span>Total paid</span><b>${money0(plan.total)}</b></div>
    <div class="result-line"><span>Interest paid</span><b>${money0(plan.interest)}</b></div>
    <div class="result-line"><span>Paid off by</span><b>${payoffLabel}</b></div>
    <div class="detail">${fasterLine}</div>`;
}

function splitResult() {
  const income = Number(document.getElementById('splitIncome')?.value ?? totalIncome());
  const el = document.getElementById('splitResult');
  if (!el) return;
  el.innerHTML = `
    <div class="big">${money0(income)} a month</div>
    <div class="result-line"><span>Needs — 50% (rent, food, bills, transport)</span><b>${money0(income * 0.5)}</b></div>
    <div class="result-line"><span>Wants — 30% (eating out, fun, treats)</span><b>${money0(income * 0.3)}</b></div>
    <div class="result-line"><span>Savings — 20% (goals, emergency fund)</span><b>${money0(income * 0.2)}</b></div>
    <div class="detail">At this income the split sets aside ${money0(income * 0.2)} a month for savings — 20% of what comes in. The Harpers actually save more: ${money0(totalIncome() - totalSpending())} of their November income stayed unspent.</div>`;
}

function runCalculators() {
  emergencyResult();
  debtResult();
  splitResult();
}

// ---------- toast ----------

let toastTimer = null;
function toast(message) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

// ---------- render ----------

function setActiveNav(route) {
  document.querySelectorAll('.main-nav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === route);
  });
}

function render() {
  window.__shotReady = false;
  const hash = location.hash || '#/';
  const route = hash.replace(/^#\/?/, '').split('/')[0] || '';
  let html;
  let title;
  if (route === '') { html = dashboard(); title = 'Dashboard'; }
  else if (route === 'transactions') { html = transactions(txFilter, txQuery); title = 'Transactions'; }
  else if (route === 'planner') { html = planner(); title = 'Budget planner'; }
  else if (route === 'goals') { html = goals(); title = 'Savings goals'; }
  else if (route === 'calculators') { html = calculators(); title = 'Calculators'; }
  else { html = notFound(); title = 'Not found'; }
  document.title = `${title} | Harper Household Budget — November 2026`;
  app.innerHTML = html;
  // Calculators need the page in the document before their results can be written.
  if (route === 'calculators') runCalculators();
  // A search typed before a re-render (add/delete while filtering) still applies.
  if (route === 'transactions' && txQuery) applyTxSearch();
  setActiveNav(route);
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

// ---------- events (delegation on the whole page) ----------

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'filter') {
    txFilter = target.dataset.filter;
    render();
  } else if (action === 'delete-tx') {
    if (deleteTransaction(target.dataset.id)) {
      toast('Transaction deleted — totals updated.');
      render();
    }
  } else if (action === 'reset-budgets') {
    for (const [id, amount] of Object.entries(DEFAULT_BUDGETS)) setBudget(id, amount);
    toast('Budgets reset to the November plan.');
    render();
  }
});

document.addEventListener('submit', (event) => {
  const form = event.target;
  event.preventDefault();
  if (form.id === 'addTxForm') {
    const data = new FormData(form);
    const amount = Number(data.get('amount'));
    const merchant = String(data.get('merchant') ?? '').trim();
    if (!amount || amount <= 0 || !merchant) return;
    addTransaction({
      date: String(data.get('date') || '2026-11-26'),
      merchant,
      category: String(data.get('category') || 'groceries'),
      type: String(data.get('type') || 'expense'),
      amount: Math.round(amount * 100) / 100,
      note: String(data.get('note') ?? '').trim(),
    });
    toast('Transaction added — totals updated.');
    render();
  } else if (form.id === 'plannerForm') {
    const data = new FormData(form);
    for (const [key, value] of data.entries()) {
      if (String(key).startsWith('budget:')) {
        setBudget(String(key).slice(7), Number(value) || 0);
      }
    }
    toast('Budget plan saved.');
    render();
  } else if (form.dataset.goalForm) {
    const data = new FormData(form);
    const amount = Number(data.get('amount'));
    if (!amount || amount <= 0) return;
    const goal = addToGoal(form.dataset.goalForm, amount);
    if (goal) {
      toast(`${money(amount)} added to ${goal.name}.`);
      render();
    }
  }
});

document.addEventListener('input', (event) => {
  const target = event.target;
  if (target.matches?.('[data-calc]')) runCalculators();
  if (target.id === 'txSearch') {
    txQuery = target.value;
    applyTxSearch();
  }
  if (target.id === 'txType') {
    const cat = document.getElementById('txCategory');
    if (cat) cat.disabled = target.value === 'income';
  }
});

monthChip?.addEventListener('click', () => {
  toast('November 2026 — the only month this budget tracks.');
});

window.addEventListener('hashchange', render);
render();
