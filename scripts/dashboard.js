import { computeStats, capStatus } from "./stats.js";
import { formatMoney, formatCompact, convert } from "./currency.js";

const $ = (id) => document.getElementById(id);

function setText(element, text) {
  if (element.textContent !== text) element.textContent = text;
}

export function renderDashboard(records, settings) {
  const stats = computeStats(records);
  const base = settings.baseCurrency;

  setText($("stat-count"), String(stats.count));
  setText($("stat-sum"), formatMoney(stats.sum, base));
  setText($("stat-top"), stats.top ? `${stats.top.name} (${formatMoney(stats.top.total, base)})` : "None");
  setText($("stat-week"), formatMoney(stats.weekTotal, base));


  const others = Object.entries(settings.rates)
    .map(([code, rate]) => formatMoney(convert(stats.sum, rate), code))
    .join(" | ");
  setText($("stat-converted"), `About ${others}`);

  renderTrend(stats.trend, base);
  renderCap(stats.sum, settings);
}

function renderTrend(trend, base) {
  const chart = $("trend-chart");
  const highest = Math.max(...trend.map((day) => day.total), 0);

  const columns = trend.map((day) => {
    const column = document.createElement("div");
    column.className = "bar-col";

    const value = document.createElement("span");
    value.className = "bar-value";
    value.textContent = day.total > 0 ? formatCompact(day.total) : "";

    const area = document.createElement("div");
    area.className = "bar-area";
    const bar = document.createElement("div");
    bar.className = "bar";

    const percent = highest > 0 ? Math.max((day.total / highest) * 100, day.total > 0 ? 4 : 0) : 0;
    bar.style.height = `${percent}%`;
    area.append(bar);

    const label = document.createElement("span");
    label.className = "bar-label";
    label.textContent = day.label;

    column.append(value, area, label);
    return column;
  });
  chart.replaceChildren(...columns);

  const summary = trend.map((day) => `${day.label} ${formatMoney(day.total, base)}`).join(", ");
  chart.setAttribute("aria-label", `Spending over the last 7 days: ${summary}`);
}

function renderCap(total, settings) {
  const status = capStatus(total, settings.cap, settings.baseCurrency);
  const polite = $("cap-status");
  const alert = $("cap-alert");
  if (status.state === "over") {
    setText(polite, "");
    setText(alert, status.message);      
  } else {
    setText(alert, "");
    setText(polite, status.message);     
  }
  polite.classList.toggle("cap-ok", status.state === "under");
  alert.classList.toggle("cap-over", status.state === "over");
}