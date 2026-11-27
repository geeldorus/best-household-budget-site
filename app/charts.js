// Harper Household Budget — charts, drawn as inline SVG from the family's own figures.
// No chart library, no images: every arc and bar is computed here.

/** Donut chart of spending by category. Returns SVG markup plus a legend list. */
export function spendingDonut(spent, categories, size = 200) {
  const total = categories.reduce((s, c) => s + (spent[c.id] || 0), 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const inner = r - 30;
  let angle = -Math.PI / 2;
  const arcs = [];
  for (const c of categories) {
    const value = spent[c.id] || 0;
    if (value <= 0 || total <= 0) continue;
    const sweep = (value / total) * Math.PI * 2;
    const a0 = angle;
    const a1 = angle + sweep;
    const large = sweep > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const xi1 = cx + inner * Math.cos(a1);
    const yi1 = cy + inner * Math.sin(a1);
    const xi0 = cx + inner * Math.cos(a0);
    const yi0 = cy + inner * Math.sin(a0);
    arcs.push(
      `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${xi1.toFixed(1)} ${yi1.toFixed(1)} A ${inner} ${inner} 0 ${large} 0 ${xi0.toFixed(1)} ${yi0.toFixed(1)} Z" fill="${c.color}" stroke="#faf7f0" stroke-width="2"><title>${c.name}: $${value.toFixed(2)}</title></path>`,
    );
    angle = a1;
  }
  const center = `<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="13" fill="#7a8a85" font-weight="600">Spent in Nov</text>
  <text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="21" font-weight="800" fill="#1e2b28">$${total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</text>`;
  return `<svg class="donut" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Donut chart of November spending by category">${arcs.join('')}${center}</svg>`;
}

/** Cumulative spending pace: actual cumulative spending by day against the
    straight-line plan (planned budget spread evenly over 30 days). Returns
    SVG markup. `daily` is [{ day, spent }] cumulative; `planned` is the
    total planned budget. */
export function paceChart(daily, planned) {
  const W = 560;
  const H = 190;
  const padL = 44;
  const padR = 10;
  const padT = 12;
  const padB = 24;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxV = Math.max(planned, daily[daily.length - 1]?.spent || 0, 1) * 1.05;
  const x = (day) => padL + ((day - 1) / 29) * innerW;
  const y = (v) => padT + innerH - (v / maxV) * innerH;
  const planPoints = `M ${x(1).toFixed(1)} ${y(planned / 30).toFixed(1)} L ${x(30).toFixed(1)} ${y(planned).toFixed(1)}`;
  const actual = daily.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(d.day).toFixed(1)} ${y(d.spent).toFixed(1)}`).join(' ');
  const area = `${actual} L ${x(30).toFixed(1)} ${y(0).toFixed(1)} L ${x(1).toFixed(1)} ${y(0).toFixed(1)} Z`;
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxV * f / 100) * 100);
  const grid = gridVals.map((v) => {
    if (v > maxV) return '';
    return `<line x1="${padL}" y1="${y(v)}" x2="${W - padR}" y2="${y(v)}" stroke="#efe9db" stroke-width="1" />
    <text x="${padL - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#7a8a85">$${v.toLocaleString('en-US')}</text>`;
  }).join('');
  const xLabels = [1, 8, 15, 22, 30].map((d) => {
    // The last label sits at the chart's right edge: anchor it to the end so
    // "Nov 30" is not clipped by the SVG boundary.
    const anchor = d === 30 ? 'end' : 'middle';
    const lx = d === 30 ? W - padR : x(d);
    return `<text x="${lx}" y="${H - 6}" text-anchor="${anchor}" font-size="11" fill="#7a8a85">Nov ${d}</text>`;
  }).join('');
  const end = daily[daily.length - 1];
  const endDot = end ? `<circle cx="${x(end.day)}" cy="${y(end.spent)}" r="4" fill="#14655a" stroke="#faf7f0" stroke-width="2" />` : '';
  return `<svg class="pace" width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Line chart of cumulative spending against the monthly plan">
    ${grid}
    <path d="${area}" fill="#14655a" fill-opacity="0.08" />
    <path d="${planPoints}" fill="none" stroke="#e9a13b" stroke-width="2" stroke-dasharray="6 4" />
    <path d="${actual}" fill="none" stroke="#14655a" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
    ${endDot}
    ${xLabels}
  </svg>`;
}

/** Vertical bar chart of weekly spending across the month. */
export function weeklyBars(weeks) {
  const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
  const max = Math.max(...weeks, 1);
  const top = weeks.indexOf(max);
  const cols = weeks
    .map(
      (v, i) => `<div class="bar-col${i === top ? ' top' : ''}">
      <span class="bar-val">$${Math.round(v).toLocaleString('en-US')}</span>
      <div class="bar" style="height:${Math.max(3, (v / max) * 74)}px" title="${labels[i]}: $${v.toFixed(2)}"></div>
      <span class="bar-label">${labels[i]}</span>
    </div>`,
    )
    .join('');
  return `<div class="bars" role="img" aria-label="Weekly spending bar chart">${cols}</div>`;
}
