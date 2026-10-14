import { loadRecords, saveRecords, loadSettings, saveSettings } from "./storage.js";
import { PATTERNS } from "./validators.js";
import { CURRENCIES, DEFAULT_RATES } from "./currency.js";

export const DEFAULT_CATEGORIES = ["Food", "Books", "Transport", "Entertainment", "Fees", "Other"];

let records = [];   

export function initState() {
  records = loadRecords();
  settings = normalizeSettings(loadSettings());
}

export const getRecords = () => [...records];
export const getRecord = (id) => records.find((record) => record.id === id);

function nextId() {
  const biggest = records.reduce((max, record) => {
    const number = Number(record.id.replace("txn_", "")) || 0;
    return Math.max(max, number);
  }, 0);
  return "txn_" + String(biggest + 1).padStart(4, "0"); 
}

export function addRecord(data) {
  const now = new Date().toISOString();
  const record = { id: nextId(), ...data, createdAt: now, updatedAt: now };
  records.push(record);
  saveRecords(records);                 
  return record;
}

export function updateRecord(id, data) {
  const index = records.findIndex((record) => record.id === id);
  if (index === -1) return null;
  records[index] = { ...records[index], ...data, updatedAt: new Date().toISOString() };
  saveRecords(records);
  return records[index];
}

export function deleteRecord(id) {
  const before = records.length;
  records = records.filter((record) => record.id !== id);
  saveRecords(records);
  return records.length < before;      
}

const compareValues = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

export function sortRecords(list, sortBy) {
  const [field, direction] = sortBy.split("-");
  const factor = direction === "asc" ? 1 : -1; 

   return [...list].sort((a, b) => {
    let result;
    if (field === "amount") result = compareValues(a.amount, b.amount);
    else if (field === "date") result = compareValues(a.date, b.date);
    else result = a.description.localeCompare(b.description, undefined, { sensitivity: "base" });
    return result * factor;
  });
}

export const DEFAULT_SETTINGS = Object.freeze({
  baseCurrency: "USD",
  rates: DEFAULT_RATES.USD,
  cap: 200,
  categories: DEFAULT_CATEGORIES,
});

let settings = normalizeSettings(null);

export function normalizeSettings(raw) {
  const base = CURRENCIES.includes(raw?.baseCurrency) ? raw.baseCurrency : DEFAULT_SETTINGS.baseCurrency;

  const rates = {};
  for (const [code, fallback] of Object.entries(DEFAULT_RATES[base])) {
    const value = Number(raw?.rates?.[code]);
    rates[code] = Number.isFinite(value) && value > 0 ? value : fallback;
  }

  const cap = Number(raw?.cap);
  const validCap = Number.isFinite(cap) && cap >= 0 ? cap : DEFAULT_SETTINGS.cap;

  const categories = Array.isArray(raw?.categories)
    ? raw.categories.filter((name) => typeof name === "string" && PATTERNS.category.test(name))
    : [];

  return {
    baseCurrency: base,
    rates,
    cap: validCap,
    categories: categories.length ? categories : [...DEFAULT_CATEGORIES],
  };
}

export const getSettings = () => structuredClone(settings);

export function updateSettings(changes) {
  settings = normalizeSettings({ ...settings, ...changes });
  saveSettings(settings);
  return getSettings();
}

const sameContent = (a, b) =>
  a.description === b.description && a.amount === b.amount && a.category === b.category && a.date === b.date;

export function mergeRecords(list) {
  const existing = [...records];          
  let added = 0;
  let skipped = 0;
  for (const item of list) {
    if (existing.some((record) => sameContent(record, item))) {
      skipped++;
      continue;
    }
    const idTaken = records.some((record) => record.id === item.id);
    records.push(idTaken ? { ...item, id: nextId() } : item);
    added++;
  }
  saveRecords(records);
  return { added, skipped };
}

export function clearAll() {
  records = [];
  settings = normalizeSettings(null);
  saveRecords(records);
  saveSettings(settings);
}