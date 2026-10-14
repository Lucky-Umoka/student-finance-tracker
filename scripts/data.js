import { getSettings, getRecords, mergeRecords, clearAll, updateSettings, normalizeSettings } from "./state.js";
import { validateRecord } from "./validators.js";
import * as ui from "./ui.js";

const MAX_BYTES = 1_000_000; 
const MAX_RECORDS = 5000;
const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const validStamp = (text) =>
  typeof text === "string" && !Number.isNaN(Date.parse(text)) ? text : new Date().toISOString();


export function parseImport(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, records: [], settings: null, errors: ["This file is not valid JSON."] };
  }


  const list = Array.isArray(data) ? data : data?.records;
  if (!Array.isArray(list)) {
    return { ok: false, records: [], settings: null, errors: ['Expected a list of records, or an object with a "records" list.'] };
  }
  if (list.length === 0) return { ok: false, records: [], settings: null, errors: ["The file has no records."] };
  if (list.length > MAX_RECORDS) {
    return { ok: false, records: [], settings: null, errors: [`Too many records (max ${MAX_RECORDS}).`] };
  }

  const errors = [];
  const records = [];
  const seenIds = new Set();

  list.forEach((item, index) => {
    const label = `Record ${index + 1}`;
    if (!isObject(item)) {
      errors.push(`${label} must be an object.`);
      return;
    }
    if (typeof item.id !== "string" || item.id.trim() === "") {
      errors.push(`${label}: id must be non-empty text.`);
    } else if (seenIds.has(item.id)) {
      errors.push(`${label}: duplicate id "${item.id}".`);
    } else {
      seenIds.add(item.id);
    }
    if (typeof item.description !== "string" || typeof item.category !== "string" || typeof item.date !== "string") {
      errors.push(`${label}: description, category and date must be text.`);
      return;
    }
    if (typeof item.amount !== "number") {
      errors.push(`${label}: amount must be a number.`);
      return;
    }
    
    const result = validateRecord({
      description: item.description,
      amount: String(item.amount),
      category: item.category,
      date: item.date,
    });
    for (const [field, message] of Object.entries(result.errors)) {
      errors.push(`${label}: ${field} - ${message}`);
    }
    if (result.ok) {
      records.push({
        id: item.id,
        ...result.value,
        createdAt: validStamp(item.createdAt),
        updatedAt: validStamp(item.updatedAt),
      });
    }
  });

  const settings = isObject(data) && isObject(data.settings) ? normalizeSettings(data.settings) : null;
  return { ok: errors.length === 0, records, settings, errors };
}


const $ = (id) => document.getElementById(id);

export function initDataControls(onChange) {
  function applyImport(text) {
    const result = parseImport(text);
    if (!result.ok) {
      const shown = result.errors.slice(0, 3).join(" ");
      const more = result.errors.length > 3 ? ` (and ${result.errors.length - 3} more problems)` : "";
      ui.setStatus("data-status", `Import failed. Nothing was changed. ${shown}${more}`);
      return;
    }
    const { added, skipped } = mergeRecords(result.records);
    if (result.settings) updateSettings(result.settings);
    const skippedText = skipped ? ` Skipped ${skipped} duplicates you already have.` : "";
    ui.setStatus("data-status", `Imported ${added} ${added === 1 ? "record" : "records"}.${skippedText}`);
    onChange();
  }

  $("export-btn").addEventListener("click", () => {
    const payload = {
      app: "student-finance-tracker",
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: getSettings(),
      records: getRecords(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `finance-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    ui.setStatus("data-status", `Exported ${payload.records.length} records.`);
  });

  $("import-file").addEventListener("change", async (event) => {
    const input = event.target;
    const file = input.files[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      ui.setStatus("data-status", "Import failed. The file is bigger than 1 MB.");
    } else {
      applyImport(await file.text());
    }
    input.value = "";   
  });

  $("seed-btn").addEventListener("click", async () => {
    try {
      const response = await fetch("seed.json");
      if (!response.ok) throw new Error(`server said ${response.status}`);
      applyImport(await response.text());
    } catch (err) {
      ui.setStatus("data-status", `Could not load sample data: ${err.message}`);
    }
  });

  $("clear-btn").addEventListener("click", async () => {
    const count = getRecords().length;
    const confirmed = await ui.askConfirm(`Delete all ${count} records and reset settings? This cannot be undone.`);
    if (!confirmed) return;
    clearAll();
    ui.resetForm();
    onChange();
    ui.setStatus("data-status", "All data deleted.");
  });
}