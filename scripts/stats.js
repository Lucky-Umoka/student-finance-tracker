import { formatMoney } from "./currency.js";

const round2 = (n) => Math.round(n * 100) / 100;

export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function lastSevenDays(today = new Date()) {
  const days = [];
  for (let back = 6; back >= 0; back--) {
    days.push(new Date(today.getFullYear(), today.getMonth(), today.getDate() - back));
  }
  return days;
}

export function computeStats(records, today = new Date()) {
  const sum = round2(records.reduce((total, r) => total + r.amount, 0));


 const perCategory = {};
  for (const r of records) perCategory[r.category] = (perCategory[r.category] ?? 0) + r.amount;
  const ranked = Object.entries(perCategory).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const top = ranked.length ? { name: ranked[0][0], total: round2(ranked[0][1]) } : null;


const trend = lastSevenDays(today).map((day) => {
    const key = toDateKey(day);
    const total = round2(records.filter((r) => r.date === key).reduce((t, r) => t + r.amount, 0));
    return { date: key, label: day.toLocaleDateString("en", { weekday: "short" }), total };
  });
  const weekTotal = round2(trend.reduce((t, day) => t + day.total, 0));

  return { count: records.length, sum, top, trend, weekTotal };
}


export function capStatus(total, cap, base) {
  if (!cap || cap <= 0) {
    return { state: "none", message: "No spending cap set. Add one in Settings." };
  }
  const difference = round2(cap - total);
  if (difference >= 0) {
    return {
      state: "under",
      message: `You have ${formatMoney(difference, base)} left of your ${formatMoney(cap, base)} cap.`,
    };
  }
  return {
    state: "over",
    message: `Over budget! You are ${formatMoney(-difference, base)} above your ${formatMoney(cap, base)} cap.`,
  };
}