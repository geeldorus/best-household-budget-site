[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/geeldorus/best-household-budget-site/rank.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/geeldorus/best-household-budget-site/reward.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)

# Harper Household Budget

A household budget site for the Harper family — November 2026. A working planner, not a mockup: every figure is real data for one family's month, and every control does what it says.

**What it does**

- **Dashboard** — income, spending, savings rate and budget left at a glance, a donut chart of spending by category, spending by week, recent transactions and savings-goal progress.
- **Transactions** — all 54 transactions of the month, filterable by category, with a working add form and delete buttons; every total on the site recalculates.
- **Budget planner** — an editable budget for each of 13 categories, spent-vs-budget bars with over/under indicators, and a 50/30/20 split view.
- **Savings goals** — four goals (emergency fund, family holiday, new car, home deposit) with progress bars and working "add funds" controls.
- **Calculators** — an emergency-fund calculator, a debt-payoff calculator with real amortisation maths, and a 50/30/20 paycheck split, all live as you type.

**How it works**

Static files under `app/` — no build step, no network requests, no external fonts or images. Data persists in the browser's localStorage, so the family's changes stay on their own device. Serve it with `node serve.ts` and open http://localhost:8080.

Built for the make.fun best household budget site bounty (best-household-budget-site-20261126-1457). MIT licensed.

**Screenshots** — `screenshots/1-dashboard.jpg` (dashboard cover), `2-transactions.jpg`, `3-goals.jpg`, `4-phone.jpg` (planner at phone size), all real renders of the site in headless Chromium.
