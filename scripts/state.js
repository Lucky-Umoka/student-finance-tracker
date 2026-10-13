import { loadRecords, saveRecords } from "./storage.js";

export const DEFAULT_CATEGORIES = ["Food", "Books", "Transport", "Entertainment", "Fees", "Other"];

let records = [];   

export function initState() {
  records = loadRecords();
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