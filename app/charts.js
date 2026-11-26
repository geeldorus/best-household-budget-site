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
